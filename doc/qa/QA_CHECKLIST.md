# Checklist de QA - Cavar & Descobrir

## 1. Autenticação e Gestão de Conta
- [ ] O usuário consegue entrar via Google.
- [ ] O usuário consegue "Continuar como Convidado".
- [ ] No Modo Convidado, um banner de aviso é exibido no Dashboard.
- [ ] O logout limpa corretamente o estado e o localStorage (no caso de convidados).

## 2. Dashboard
- [ ] A lista de estudos é carregada corretamente do Firestore (usuários logados).
- [ ] A lista de estudos está vazia para convidados (salvamento apenas em memória no contexto).
- [ ] O botão "Iniciar Novo Estudo" cria um estudo e redireciona para a interface.

## 3. Fluxo de Estudo
- [ ] **Seleção Bíblica:** O usuário consegue escolher Livro, Capítulo e Versículos.
- [ ] **Etapas de Interpretação:** O usuário consegue navegar entre Observação, Perguntas, Gênero, Contexto, Ideia Principal, Intento, Esboço e Sermão.
- [ ] **Salvamento Automático:** O progresso é salvo ao clicar em "Próximo Passo" ou manualmente.
- [ ] **Modo Convidado:** O progresso é mantido durante a sessão (via StudyContext).

## 4. Instrutor de IA
- [ ] O botão "Revisar com IA" envia o contexto correto e exibe o feedback em Markdown.
- [ ] O estado de carregamento do IA é exibido corretamente.
- [ ] O feedback do IA é pedagógico e não revela a resposta final (validado via prompt system).

## 5. Finalização
- [ ] A tela de Revisão Final exibe um resumo de todas as etapas.
- [ ] O botão "Finalizar Estudo" marca o status como "completed".
- [ ] O redirecionamento final para o Dashboard funciona.

## 6. Segurança e Performance (Não Funcionais)
- [ ] Rotas `/dashboard` e `/study/:id` são protegidas (redirecionam para home se deslogado).
- [ ] Tempos de carregamento via Firestore e Gemini estão dentro dos limites estipulados (RNF-PERF-001/002).
- [ ] Regras do Firestore impedem acesso a estudos de outros usuários (validado via security_spec.md).
