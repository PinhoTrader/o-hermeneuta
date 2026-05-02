# Infraestrutura e Deploy - Cavar & Descobrir

## 1. Ambiente de Execução
O aplicativo foi desenvolvido para rodar em arquitetura de Cloud Run (através do Google AI Studio Build) e utiliza serviços gerenciados para backend.

## 2. Componentes de Infraestrutura
- **Hospedagem Frontend:** Cloud Run (Docker Container).
- **Persistência (NoSQL):** Firebase Firestore (Região configurada: `us-west1`).
- **Autenticação:** Firebase Auth (Google Identity Provider).
- **Provedor de IA:** Google AI Studio (Model: `gemini-3-flash-preview`).

## 3. Fluxo de Publicação no AI Studio
1. **Segredos:** É obrigatório configurar o segredo `GEMINI_API_KEY` nas configurações de projeto.
2. **Build:** O comando `npm run build` é executado automaticamente pelo sistema de CI do AI Studio.
3. **Static Serving:** O servidor static do AI Studio serve os arquivos gerados no diretório `dist/`.

## 4. Guia de Rollback
O controle de versão via Git é a fonte primária para rollbacks. Em caso de falha catastrófica no banco:
- As regras do Firestore podem ser restauradas via comando `deploy_firebase` após edição do arquivo `firestore.rules`.
- Backups pontuais do Firestore (se configurados na Cloud Console) podem ser utilizados para restaurar documentos de usuários.

## 5. Estratégia de Custos (Free Tier)
O projeto prioriza limites gratuitos:
- **Firestore:** Spark Plan (limites de leitura/escrita diários).
- **Gemini:** Acesso gratuito via API Key para desenvolvedores.
- **Auth:** Gratuito até os primeiros 50.000 usuários (MAU).

Para migração para produção paga, recomenda-se habilitar o faturamento no projeto Google Cloud e monitorar as cotas em `console.cloud.google.com`.
