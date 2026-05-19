# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Run all commands from the repository root.

```bash
npm run dev       # Start Vite dev server
npm run build     # Production build → dist/
npm run preview   # Serve the production build locally
npm run lint      # ESLint over the full codebase
```

No test framework is installed. Before submitting changes, run `npm run lint` and `npm run build`.

## Architecture

**Stack:** React 18 + TypeScript, Vite, Tailwind CSS, Firebase (Auth + Firestore + Storage).

**Entry points:** `src/main.tsx` → `src/App.tsx`. All routes live inside a `<ProtectedRoute>` + `<DashboardLayout>` shell, with `/dashboard/usuarios` additionally gated to `adminOnly`.

**Auth model:** `src/contexts/AuthContext.tsx` wraps Firebase Auth. On login, a Firestore document at `users/{uid}` is fetched for the `UserProfile`, which carries `role` (`admin | user | mesero | tortillero | losero | cocinero`) and `branch` (`San Pedro | Las Quintas`). Downstream role/branch checks flow from `useAuth()`. The `ProtectedRoute` component handles redirect-to-login and admin gating.

**Feature modules:**

- `src/pages/` — route-level screens (Calendar, Minutas, HistorialMinutas, Recursos, Reglamento, Contratos, Usuarios, Login).
- `src/services/` — Firestore data access: `eventService`, `minutaService`, `resourceService`, `userService`, `whatsappService`. Services own all Firestore queries; pages/components call services, not `db` directly.
- `src/contratos/` — self-contained contract subsystem:
  - `types/contract.ts` — `ContractType` union and `ContractData` interface.
  - `data/` — per-contract-type multi-step form definitions (`formSteps.ts`, `trialFormSteps.ts`, etc.).
  - `hooks/useContractData.ts` — form state management.
  - `utils/` — one generator per contract type that builds a `.docx` file via the `docx` library (e.g., `contractGenerator.ts`, `finiquitoLetterGenerator.ts`).
  - `components/` — `ContractSelectionCard`, `ContractPreview`, `StepContent`, form field components.
- `src/components/Minutas/` — three-step wizard (Step1GeneralInfo, Step2Attendance, Step3TopicsDetails) used by `MinutasPage`.
- `src/utils/` — standalone generators: `minutaDocxGenerator.ts`, `attendanceListGenerator.ts`, `holidayGenerator.ts`.
- `src/data/reglamentoDocuments.ts` — static list of regulations documents.

**Minutas flow:** Creating a minuta via `minutaService.createMinuta` also calls `eventService.addEvent` (calendar integration) and `whatsappService.sendMinutaNotification` (WhatsApp deep-link notifications). WhatsApp failure is non-fatal — the minuta is still saved.

**Firestore collections:** `users`, `events`, `minutas`, `resources`. Current security rules are in `updated-firestore-rules.txt`. Non-admin users can update only `areas`, `status`, and `responsibleUids` on minutas where their UID is in `responsibleUids`.

**Deployment:** Multi-stage Dockerfile (node:20-alpine build → nginx:alpine serve). `nginx.conf` includes the SPA fallback rule required for React Router.

**Admin scripts:** `scripts/create-admin.js` and `scripts/setup-holidays.js` are one-off Node scripts for bootstrapping; review before re-running.

## Conventions

- Components: PascalCase files, function components, Tailwind for styling.
- Hooks: camelCase with `use` prefix (`useContractData.ts`).
- Services/utils: camelCase (`minutaService.ts`, `holidayGenerator.ts`).
- Two-space indentation, semicolons.
- `project-bolt-sb1-isypvxyv/project/` is a legacy scaffold — do not edit unless explicitly targeted.
