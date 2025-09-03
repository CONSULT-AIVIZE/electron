# Repository Guidelines

## Project Structure & Module Organization
- `src/app`: Next.js routes, layouts, API routes (e.g., `src/app/api/...`).
- `src/components`: Reusable UI (e.g., `VoiceAssistant.tsx`, `dashboard/`, `realtime/`).
- `src/core/store`: Zustand stores (`*Store.ts`).
- `src/lib/realtime`: Realtime/agent helpers.
- `src/main-nextjs.cjs`: Electron main process; `src/preload.{cjs,js}`: preload.
- `public/`: Static assets. `out/` and `.next/`: build outputs.
- Config: `next.config.js`, `tailwind.config.js`, `tsconfig.json`.

## Build, Test, and Development Commands
- `npm run dev`: Runs Next.js dev and launches Electron after `wait-on :3000`.
- `npm run next-dev`: Next.js dev server only.
- `npm run dev-nextjs`: Electron dev pointing at Next dev (`ELECTRON_MAIN` honored).
- `npm run build-for-electron`: Production Next build + fix asset paths.
- `npm run build`: Package app via `electron-builder`.
- `npm start`: Run Electron in production (expects prior `build-for-electron`).

Example: develop locally
```
npm install
npm run dev
```

## Coding Style & Naming Conventions
- TypeScript, React, Next 15, TailwindCSS. Use 2-space indentation.
- Prettier + `prettier-plugin-tailwindcss`; ESLint with `eslint-config-next`.
- Components: `PascalCase.tsx`; hooks: `useThing.ts`; stores: `ThingStore.ts`.
- Files colocated near usage; avoid large “utils” catch-alls; prefer named exports.

## Testing Guidelines
- No formal test suite yet. If adding tests, colocate as `src/**/__tests__/*.{ts,tsx}` with Vitest/Jest. Prioritize `core/store` logic and critical UI state.

## Commit & Pull Request Guidelines
- Commits: imperative, concise, and descriptive. Example: `Refactor Next config for prod export`.
- Prefer focused commits over large batches; reference issues with `#id`.
- PRs must include: purpose, changes, test/validation steps, screenshots for UI, and any security/CSP notes. Keep diffs small and scoped.

## Security & Configuration Tips
- Never commit secrets. Use `.env.local`; load with `@t3-oss/env-nextjs` as needed.
- Review/adjust CSP and navigation guards in `src/main-nextjs.cjs` when integrating new domains.
- When packaging, run `npm run build-for-electron` before `npm run build` to ensure correct asset paths.
