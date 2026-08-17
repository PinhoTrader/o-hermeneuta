// Fonte única do e-mail de super-admin no lado do cliente. Antes desta constante,
// o mesmo e-mail estava copiado em 7 lugares (AuthContext, AuthRoutes, Layout,
// AcademyPage, AdminPanel, ChatOverlay) e precisava ser trocado à mão em cada um.
//
// `firestore.rules` mantém sua própria cópia (isSuperAdminEmail()) porque é uma
// linguagem própria que não importa TypeScript - ver skill padrao-firestore-rules.
// As duas cópias (esta e a da regra) são a mesma fonte de verdade e devem ser
// trocadas juntas se esse e-mail mudar.
export const SUPER_ADMIN_EMAIL = 'escoladetradersead@gmail.com';

export function isSuperAdminEmail(email: string | null | undefined): boolean {
  return email === SUPER_ADMIN_EMAIL;
}
