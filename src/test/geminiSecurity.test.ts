import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('jose', () => ({
  createRemoteJWKSet: vi.fn(() => vi.fn()),
  jwtVerify: vi.fn(),
}));

import { jwtVerify } from 'jose';
import {
  getIdentity,
  reserveUserQuota,
  verifyFirebaseIdToken,
  type RequestIdentity,
} from '../../api/gemini';

const mockedJwtVerify = vi.mocked(jwtVerify);

function fakeRequest(headers: Record<string, string>) {
  return { headers } as unknown as Parameters<typeof getIdentity>[0];
}

describe('verifyFirebaseIdToken', () => {
  it('returns the uid when the signature/issuer/audience/expiry all check out', async () => {
    mockedJwtVerify.mockResolvedValueOnce({ payload: { sub: 'user-123' } } as any);
    const uid = await verifyFirebaseIdToken('valid.token.here');
    expect(uid).toBe('user-123');
  });

  it('returns null when jose rejects (bad signature, expired, wrong issuer/audience...)', async () => {
    mockedJwtVerify.mockRejectedValueOnce(new Error('signature verification failed'));
    const uid = await verifyFirebaseIdToken('forged.token.here');
    expect(uid).toBeNull();
  });

  it('returns null when the token has no subject claim', async () => {
    mockedJwtVerify.mockResolvedValueOnce({ payload: {} } as any);
    const uid = await verifyFirebaseIdToken('tokenless-subject');
    expect(uid).toBeNull();
  });
});

describe('getIdentity', () => {
  beforeEach(() => {
    mockedJwtVerify.mockReset();
  });

  it('accepts a valid Bearer token as an authenticated user identity', async () => {
    mockedJwtVerify.mockResolvedValueOnce({ payload: { sub: 'uid-abc' } } as any);
    const result = await getIdentity(fakeRequest({ authorization: 'Bearer good.token' }));

    expect(result.identity).toMatchObject({ kind: 'user', uid: 'uid-abc', dailyLimit: 30 });
    expect(result.error).toBeUndefined();
  });

  it('rejects an invalid/expired Bearer token with a Portuguese session-expired message', async () => {
    mockedJwtVerify.mockRejectedValueOnce(new Error('exp claim timestamp check failed'));
    const result = await getIdentity(fakeRequest({ authorization: 'Bearer expired.token' }));

    expect(result.identity).toBeNull();
    expect(result.error).toMatch(/sessão expirou/i);
  });

  it('accepts a well-formed guest id header when there is no Bearer token', async () => {
    const result = await getIdentity(fakeRequest({ 'x-hermeneuta-guest-id': 'guest_abcd1234' }));

    expect(result.identity).toMatchObject({ kind: 'guest', dailyLimit: 5 });
  });

  it('rejects a malformed guest id', async () => {
    const result = await getIdentity(fakeRequest({ 'x-hermeneuta-guest-id': 'not-a-valid-id' }));

    expect(result.identity).toBeNull();
  });

  it('rejects a request with neither a Bearer token nor a guest id', async () => {
    const result = await getIdentity(fakeRequest({}));

    expect(result.identity).toBeNull();
    expect(result.error).toMatch(/identificação necessária/i);
  });
});

describe('reserveUserQuota', () => {
  const identity: Extract<RequestIdentity, { kind: 'user' }> = {
    id: 'user:uid-abc',
    kind: 'user',
    dailyLimit: 30,
    uid: 'uid-abc',
    idToken: 'token-abc',
  };

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  it('reads the current count, then commits an increment with a REQUEST_TIME transform for lastQueryAt', async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ fields: { queryCount: { integerValue: '2' } } }), { status: 200 })
      )
      .mockResolvedValueOnce(new Response('{}', { status: 200 }));

    const allowed = await reserveUserQuota(identity);

    expect(allowed).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);

    const [commitUrl, commitInit] = fetchMock.mock.calls[1];
    expect(String(commitUrl)).toContain(':commit');
    expect(commitInit?.headers).toMatchObject({ Authorization: 'Bearer token-abc' });

    const body = JSON.parse(String(commitInit?.body));
    const write = body.writes[0];
    expect(write.update.fields.queryCount).toEqual({ integerValue: '3' });
    expect(write.update.fields.uid).toEqual({ stringValue: 'uid-abc' });
    expect(write.updateTransforms).toEqual([{ fieldPath: 'lastQueryAt', setToServerValue: 'REQUEST_TIME' }]);
    expect(write.currentDocument).toEqual({ exists: true });
  });

  it('treats a missing document (404) as count 0 and uses currentDocument.exists=false on create', async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock
      .mockResolvedValueOnce(new Response('{}', { status: 404 }))
      .mockResolvedValueOnce(new Response('{}', { status: 200 }));

    const allowed = await reserveUserQuota(identity);

    expect(allowed).toBe(true);
    const [, commitInit] = fetchMock.mock.calls[1];
    const body = JSON.parse(String(commitInit?.body));
    expect(body.writes[0].update.fields.queryCount).toEqual({ integerValue: '1' });
    expect(body.writes[0].currentDocument).toEqual({ exists: false });
  });

  it('denies the request and skips the commit call once the daily limit is reached', async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ fields: { queryCount: { integerValue: '30' } } }), { status: 200 })
    );

    const allowed = await reserveUserQuota(identity);

    expect(allowed).toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('throws when Firestore returns an unexpected status on read', async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(new Response('{}', { status: 500 }));

    await expect(reserveUserQuota(identity)).rejects.toThrow();
  });
});
