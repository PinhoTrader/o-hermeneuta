# Lacunas de Teste e Recomendações

## 1. Testes Automatizados
- **Integração com Firebase:** No ambiente atual, a conexão real com o Firebase/Firestore não é testada em CI. Recomenda-se o uso de `firebase-tools` emuladores para testes de integração de ponta a ponta.
- **Interação com Gemini:** Chamadas reais à API do Gemini foram mockadas ou testadas manualmente para economizar tokens e evitar latência em testes automáticos. Recomenda-se manter mocks para testes unitários e testes manuais para qualidade de prompt.
- **Segurança Rules:** As regras do Firestore estão documentadas em `security_spec.md`, mas a execução do `firestore.rules.test.ts` requer um ambiente com emuladores Firebase ativo.

## 2. Testes de Experiência do Usuário (E2E)
- **Navegação Móvel:** Testes manuais são necessários para garantir a usabilidade do menu hambúrguer e das áreas de texto em dispositivos móveis.
- **Offline Mode:** O requisito de salvamento offline/sincronização automática precisa de validação via Service Workers em navegadores reais.

## 3. Qualidade do Instrutor de IA
- **Validação de Viés:** O tom e a precisão teológica do Instrutor de IA devem ser auditados por especialistas em hermenêutica para garantir conformidade total com o método "Cavar & Descobrir".
