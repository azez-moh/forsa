# Forsa w Tamkeen redesign: how the work is run

Concept pitch for فرصة وتمكين (forsh.sa). Dummy data built from real public content; no access to api.forsh.sa.

## Pipeline

| Phase | Output | Agents (parallel) |
|---|---|---|
| 1. Discover | Current journey map, pain points, mock data, brand audit and tokens | Journey & Content · Brand & Design System |
| 2. Define | Personas, epics, user stories with acceptance criteria, screen inventory | Product (stories) |
| 3. Design | Figma file: foundations, web screens, iPhone screens | Figma Web · Figma iOS |
| 4. Build | `apps/web` (Next.js) · `apps/ios` (Expo) on `packages/data` + `packages/tokens` | Web Core · Web Wow/Motion · iOS App |
| 5. Verify | Builds, typecheck, screenshots, HIG checklist, push | Independent QA (has not seen the build work) |

The lead (this session) owns the contracts between phases: the data types in `packages/data`, the tokens in `packages/tokens`, and the story IDs every screen and component traces back to.

## Standards
- Apple Human Interface Guidelines for buttons: filled / tinted / gray / plain / destructive, 44pt minimum hit target, 50pt large buttons, radius 12, semibold 17.
- Arabic first (RTL), English second, logical CSS properties only.
- Motion is purposeful, honours `prefers-reduced-motion`.

## Links
- Figma: https://www.figma.com/design/z5OmwOS1xhG9zONZ0FdleF
- GitHub: forsa (pending: empty repo to be created by Azez)
