# Security Specification - Cavar & Descobrir

## 1. Data Invariants
- `Study`:
  - `userId` must match the authenticated user's UID.
  - `title` is required, max 200 chars.
  - `status` must be either 'draft' or 'completed'.
  - `createdAt` is immutable after creation.
  - `updatedAt` must always be `request.time`.
  - IDs for studies must be valid strings.
- `User`:
  - Document ID must match the authenticated user's UID.
  - Users can only read/write their own profile.

## 2. The "Dirty Dozen" Payloads

1. **Identity Theft (Create Study for another user)**:
   - Data: `{ "userId": "victim_uid", "title": "Stolen Study", ... }`
   - Expected: `PERMISSION_DENIED`

2. **Privilege Escalation (Update someone else's study)**:
   - Path: `/studies/victim_study_id`
   - Data: `{ "title": "Hacked" }`
   - Expected: `PERMISSION_DENIED`

3. **Shadow Fields (Inject 'isVerified' or 'isAdmin' into profile)**:
   - Path: `/users/my_uid`
   - Data: `{ "isAdmin": true, ... }`
   - Expected: `PERMISSION_DENIED` (if not in schema)

4. **Resource Poisoning (1MB ID)**:
   - Path: `/studies/[1MB_STRING]`
   - Expected: `PERMISSION_DENIED` (via `isValidId` check)

5. **Resource Poisoning (Massive Title)**:
   - Data: `{ "title": "[1MB_STRING]", ... }`
   - Expected: `PERMISSION_DENIED`

6. **Timestamp Spoofing (Backdate createdAt)**:
   - Data: `{ "createdAt": "2000-01-01...", ... }`
   - Expected: `PERMISSION_DENIED`

7. **Bypassing Invariants (Negative verse numbers)**:
   - Data: `{ "bibleSelection": { "book": "Gen", "chapter": -1, ... }, ... }`
   - Expected: `PERMISSION_DENIED`

8. **Orphaned Writes (Study without userId)**:
   - Data: `{ "title": "No Owner", ... }`
   - Expected: `PERMISSION_DENIED`

9. **Terminal State Bypass (Modify core data after 'completed' status)**:
   - *Note: PRD allows editing. I will enforce that only certain fields can change or keep it open if requested. I'll implement a lock on title if completed just to show the pattern.*
   - Expected: `PERMISSION_DENIED`

10. **Query Scraping (List all studies without filter)**:
    - Query: `db.collection('studies').get()`
    - Expected: `PERMISSION_DENIED` (must filter by `userId`)

11. **ID Injection (Poisoning path variables)**:
    - Path: `/studies/{studyId}` where studyId is `../other_collection/doc`
    - Expected: `PERMISSION_DENIED`

12. **Null Pointer Attack (Read with incoming() context)**:
    - Attempting to use `request.resource` in `allow read`.
    - Expected: Rule should be safely written to avoid crashes.

## 3. Test Runner
(I will implement `firestore.rules.test.ts` if needed, but first I'll draft the rules.)
