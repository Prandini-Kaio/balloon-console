# Balloon Web

Painel administrativo interno (React) para cadastro de empresas e eventos, consumindo a API Spring Boot do projeto Balloon.

## Pré-requisitos

- Node.js 20+ (recomendado)
- npm

## Como executar

Na pasta do projeto:

```bash
cd balloon_web
npm install
```

Copie as variáveis de ambiente e ajuste se necessário:

```bash
cp .env.example .env
```

Suba o servidor de desenvolvimento:

```bash
npm run dev
```

Abra no navegador o endereço indicado no terminal (em geral `http://localhost:5173`).

## Login

As credenciais vêm do backend Balloon (ex.: usuário admin configurado no `AuthController`). Use o e-mail e a senha válidos da sua instância da API.

## Scripts úteis

| Comando        | Descrição                          |
| -------------- | ---------------------------------- |
| `npm run dev`  | Modo desenvolvimento com hot reload |
| `npm run build` | Build de produção (`dist/`)       |
| `npm run preview` | Servir o build localmente       |
| `npm run lint` | Verificação ESLint                 |

## Variáveis de ambiente

Definidas em `.env` (prefixo `VITE_`):

| Variável | Descrição |
| -------- | --------- |
| `VITE_API_BASE_URL` | URL base da API (ex.: `https://seu-host/api/v1`). Deve incluir `/v1` se os paths do cliente forem `/evento`, `/auth/...`. |
| `VITE_COMPANIES_USE_HTTP` | `true` para usar implementação HTTP em empresas; `false` usa armazenamento local mock. |

Categorias vêm de `GET /evento/categoria` após login. Na tela **Novo evento** há importação por JSON (modelo no acordeão).

## Estrutura resumida

- `src/app` — rotas, layout admin, providers
- `src/core` — HTTP genérico, auth, config
- `src/features` — módulos por domínio (auth, events, companies, categories)
- `src/shared` — UI e utilitários compartilhados
