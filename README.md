# Balloon Console

Painel administrativo (React) para gestão de empresas, eventos, licenças e métricas, consumindo a API Spring Boot do projeto Balloon.

## Pré-requisitos

- Node.js 20+ (recomendado)
- npm

## Como executar

Na pasta do projeto:

```bash
cd balloon-console
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

As credenciais vêm do backend Balloon. Use o e-mail e a senha válidos da sua instância da API.

## Scripts úteis

| Comando | Descrição |
| ------- | --------- |
| `npm run dev` | Modo desenvolvimento com hot reload |
| `npm run build` | Build de produção (`dist/`) |
| `npm run preview` | Servir o build localmente |
| `npm run lint` | Verificação ESLint |

## Variáveis de ambiente

Definidas em `.env` (prefixo `VITE_`):

| Variável | Descrição |
| -------- | --------- |
| `VITE_API_BASE_URL` | URL base da API (ex.: `https://seu-host/api/v1`). |
| `VITE_COMPANIES_USE_HTTP` | `true` para HTTP em empresas; `false` usa mock local. |
| `VITE_BASE` | Base path do Vite (ex.: `/balloon-console/` no GitHub Pages). |

## GitHub Pages

1. Publique este repositório e habilite **Pages** (source: GitHub Actions).
2. O workflow [`.github/workflows/pages.yml`](.github/workflows/pages.yml) faz build com `VITE_BASE=/<repo>/` e publica `dist/`.
3. No backend, configure `BALLOON_CORS_ALLOWED_ORIGINS=https://prandini-kaio.github.io`.
4. URL esperada: `https://prandini-kaio.github.io/balloon-console/`.

## Estrutura resumida

- `src/app` — rotas, layout admin, providers
- `src/core` — HTTP, auth, config, theme
- `src/features` — módulos por domínio
- `src/shared` — UI e utilitários compartilhados
