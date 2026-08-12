# Balloon Console

Painel administrativo (React) para gestão de empresas, eventos, licenças e métricas, consumindo a API Spring Boot do projeto Balloon.

## Pré-requisitos

- Node.js 20+ (recomendado)
- npm

## Como executar

```bash
cd balloon-console
npm install
cp .env.example .env
npm run dev
```

## GitHub Pages + domínio próprio

O deploy usa GitHub Actions ([`.github/workflows/pages.yml`](.github/workflows/pages.yml)) com `VITE_BASE=/` e o arquivo [`public/CNAME`](public/CNAME) apontando para **`console.balloon.app.br`**.

### 1. DNS (onde o domínio `balloon.app.br` é gerenciado)

Crie um registro **CNAME**:

| Host / Nome | Tipo  | Destino / Valor              |
|-------------|-------|------------------------------|
| `console`   | CNAME | `prandini-kaio.github.io`    |

TTL pode ficar no padrão (ex. 300–3600).

### 2. GitHub → Settings → Pages

1. Source: **GitHub Actions**
2. Em **Custom domain**, confirme `console.balloon.app.br` (o `CNAME` do repo já preenche isso após o deploy)
3. Marque **Enforce HTTPS** (pode levar alguns minutos após o DNS propagar)

### 3. Backend (CORS)

Na API de produção:

```text
BALLOON_CORS_ALLOWED_ORIGINS=https://console.balloon.app.br
```

(Se ainda acessar via `github.io`, inclua as duas origens separadas por vírgula.)

### 4. URLs finais

- Console: `https://console.balloon.app.br/`
- API: `https://api.balloon.app.br/api/v1`

## Variáveis de ambiente

| Variável | Descrição |
| -------- | --------- |
| `VITE_API_BASE_URL` | URL base da API |
| `VITE_COMPANIES_USE_HTTP` | `true` para HTTP em empresas |
| `VITE_BASE` | Em domínio próprio use `/`; no path do repo use `/balloon-console/` |

## Estrutura

- `src/app` — rotas, layout, providers
- `src/core` — HTTP, auth, config, theme
- `src/features` — módulos por domínio
- `src/shared` — UI compartilhada
