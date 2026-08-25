# Soda landing page

Soda is a React and Vite landing page served by a small Express application. It is configured to use Node.js 20–22 and pnpm 10.

## Local development

Install the exact locked dependencies and start the app:

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

Before pushing a change, run the same command used in GitHub Actions:

```bash
pnpm verify
```

## Deploy on Manus

The simplest supported deployment is the built-in project hosting. Save a checkpoint from the project workspace; this project is configured to publish that checkpoint automatically. The current public domain is `https://sodalanding-p5mkur5u.manus.space`.

## Deploy from GitHub

The included GitHub Actions workflow runs a clean install, TypeScript check, and production build on every pull request and every push to `main`. A green **Verify project** workflow means the repository is ready to deploy.

For a Node-compatible host, choose Node.js 22 and use:

| Setting | Value |
|---|---|
| Install command | `pnpm install --frozen-lockfile` |
| Build command | `pnpm build` |
| Start command | `pnpm start` |
| Health-check path | `/health` |

> The current art assets are served through the project's managed storage routes. Keep the built-in hosting for the simplest deployment path. If you move to a third-party host, first replace these asset routes with your own publicly hosted image and 3D asset URLs.

## Deployment troubleshooting

If a host fails at build time, verify that it is using Node.js 20–22, pnpm 10, and the install command above. Do not commit `.env` files, `dist`, or `node_modules`; the `.gitignore` already protects them. The application listens on the hosting provider's `PORT` environment variable and exposes `/health` for readiness checks.
