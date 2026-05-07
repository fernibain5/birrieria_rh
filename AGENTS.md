# Repository Guidelines

## Project Structure & Module Organization

This is a Vite React application written in TypeScript. The active app lives at the repository root; `project-bolt-sb1-isypvxyv/project/` appears to be an older generated project and should only be edited when explicitly targeted.

- `src/main.tsx` and `src/App.tsx` define the entry point and routing shell.
- `src/pages/` contains route-level screens for calendar, login, users, minutas, and contracts.
- `src/components/` contains shared UI plus feature folders for `Calendar`, `Documents`, `Layout`, `Minutas`, and `Users`.
- `src/contratos/` contains contract form logic, generators, hooks, data, and contract-specific components.
- `src/services/`, `src/firebase/`, `src/contexts/`, `src/types/`, and `src/utils/` hold integration, state, type, and helper code.
- `public/images/` stores static public assets.

## Build, Test, and Development Commands

Run commands from the repository root.

- `npm run dev`: start the Vite development server.
- `npm run build`: create a production build in `dist/`.
- `npm run preview`: serve the production build locally for inspection.
- `npm run lint`: run ESLint across the TypeScript and React codebase.

There is currently no configured automated test command.

## Coding Style & Naming Conventions

Use TypeScript and React function components. Keep component files in PascalCase, for example `UserProfileModal.tsx`, and hooks in camelCase with a `use` prefix, for example `useContractData.ts`. Utility and service modules should use camelCase names such as `holidayGenerator.ts`.

Follow the existing style: two-space indentation, semicolons, and Tailwind CSS utility classes for styling. Prefer shared components and local helpers before adding abstractions.

## Testing Guidelines

No test framework is installed yet. For current changes, run `npm run lint` and `npm run build` before submitting. If tests are added, place them near covered code using `ComponentName.test.tsx` or `moduleName.test.ts`, and document the new command in `package.json`.

## Commit & Pull Request Guidelines

Git history uses short, imperative commit messages such as `Add config deploy files` and `baseline before codex`. Keep commits focused and describe the primary change in the subject.

Pull requests should include a concise description, issue or task link when relevant, verification steps, and screenshots for visible UI changes. Mention Firebase, deployment, or environment changes explicitly.

## Security & Configuration Tips

Do not commit secrets, local `.env` files, or generated `dist/` output. Review `updated-firestore-rules.txt`, `setup-users.md`, and `scripts/` before changing authentication, Firestore rules, or admin setup behavior.
