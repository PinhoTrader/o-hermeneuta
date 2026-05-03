# O Hermeneuta

Ferramenta avançada de hermenêutica bíblica desenvolvida por [P1n40](https://github.com/P1n40). 
Baseado no método **Cavar & Descobrir**, este aplicativo guia estudantes e pregadores através de um processo estruturado de exegese e homilética.

> **Repositório Oficial:** [github.com/P1n40/o-hermeneuta](https://github.com/P1n40/o-hermeneuta)

## 🚀 Stack Tecnológica
- **Frontend:** React 19 + TypeScript + Vite
- **Estilização:** Tailwind CSS 4
- **Backend/Dados:** Firebase (Firestore + Auth)
- **IA:** Google Gemini 3 Flash Preview (via @google/genai)
- **Navegação:** React Router 7
- **Animações:** Motion (framer-motion)

## 📖 O Método
O aplicativo guia o usuário por um processo de 8 etapas fundamentais:
1. **Seleção:** Escolha do texto bíblico base.
2. **Observação:** Descrição objetiva do que o texto diz (repetições, conectivos, etc).
3. **Perguntas:** Levantamento de dúvidas e pontos de aprofundamento.
4. **Gênero & Estilo:** Identificação literária e estrutural.
5. **Contexto:** Análise histórica, cultural e literária.
6. **Ideia Principal:** Síntese da mensagem central em uma frase fiel.
7. **Intento Transformador:** O propósito prático do autor para os ouvintes.
8. **Esboço & Sermão:** Elaboração da homilética final.

## 🛠️ Configuração e Instalação
...

### Pré-requisitos
- Node.js moderno
- Conta no Google AI Studio (para API Key do Gemini)
- Projeto Firebase configurado

### Variáveis de Ambiente
Crie um arquivo `.env` baseado no `.env.example` para desenvolvimento local:
```env
GEMINI_API_KEY="sua_chave_aqui"
APP_URL="url_do_app"
```

`GEMINI_API_KEY` é usada apenas pela rota serverless `/api/gemini`; ela não deve ser exposta no frontend. Em produção, configure essa variável no painel da Vercel em **Project Settings > Environment Variables** e marque o ambiente **Production** antes de fazer o deploy. Para testar o Instrutor de IA localmente com a rota serverless, prefira rodar o app com `vercel dev`.

### Comandos Principais
- `npm install`: Instala as dependências.
- `npm run dev`: Inicia o servidor de desenvolvimento.
- `npm run build`: Gera a versão de produção na pasta `dist/`.
- `npm run test`: Executa a suíte de testes (Vitest).
- `npm run lint`: Valida a integridade do código TypeScript.

## 🔒 Segurança (Firestore)
As regras de segurança estão definidas em `firestore.rules` e seguem o princípio de zero-trust:
- Usuários só podem acessar seus próprios estudos.
- Validação rigorosa de tipos e tamanhos de campos.
- Imutabilidade de campos críticos como `userId` e `createdAt`.

## 📈 Evolução e Produção
Para migrar este app para um ambiente de produção em larga escala:
1. **Infraestrutura:** Manter Vercel/Cloud Run para o frontend e Firebase para dados.
2. **Banco de Dados:** Avaliar migração para PostgreSQL (Supabase) se houver necessidade de queries complexas relacionais que o Firestore não atenda com eficiência.
3. **IA:** Implementar cache de respostas frequentes e monitoramento de tokens.
4. **Offline:** Adicionar suporte a PWA (Service Workers) para garantir o requisito de funcionamento sem rede estável.

---
Desenvolvido para a glória de Deus.
