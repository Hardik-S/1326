# Repository Guidelines

## Project Overview
This repository currently contains a single planning document for a private “tree + ornaments” website. There is no application code yet; treat this repo as a source of truth for scope, requirements, and sequencing.

## Project Structure & Module Organization
- `Plan.txt`: Primary product/engineering plan. Use it as the baseline for features, dates, and deliverables.
- No source, tests, or assets directories exist yet. When scaffolding code, add a conventional layout (e.g., `src/`, `public/`, `tests/`) and update this guide.

## Build, Test, and Development Commands
No build or test tooling is configured yet. Once a framework is chosen, document the primary commands here. Example patterns:
- `npm run dev`: start local development server.
- `npm test`: run unit tests.
- `npm run build`: produce production assets.

## Coding Style & Naming Conventions
- Prefer clear, descriptive names aligned with the domain: `ornaments`, `unlockDate`, `days.json`.
- Use consistent file naming (e.g., `kebab-case` for files, `camelCase` for variables).
- Add lint/format tooling when code is introduced (e.g., ESLint/Prettier) and document the rules here.

## Testing Guidelines
No tests are present. When added:
- Place unit tests alongside code or in `tests/` using the chosen framework (e.g., Vitest/Jest).
- Name tests after behavior (e.g., `unlock-logic.spec.ts`).
- Document any coverage expectations once agreed.

## Commit & Pull Request Guidelines
There is no commit convention established yet. Until one is chosen:
- Use short, imperative commit messages (e.g., `Add date-based unlock logic`).
- PRs should include a concise description, linked issues (if any), and screenshots for UI changes.

## Agent-Specific Notes
- Keep `Plan.txt` in sync with any implementation decisions.
- Do not add external network calls or analytics without explicit approval.
- When adding content data, prefer a single source of truth (e.g., `content/days.json`).
