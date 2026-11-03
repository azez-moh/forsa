# فرصة وتمكين · Forsa w Tamkeen — redesign concept

A redesign pitch for [forsh.sa](https://forsh.sa): a new Arabic-first website and an iPhone app with the same functions, on shared data and design tokens. All content is dummy data built from the platform's public listings; nothing connects to the live API.

| Part | Where | Stack |
|---|---|---|
| Website | `apps/web` | Next.js 15, React 19, Tailwind v4, Motion, static export |
| iPhone app | `apps/ios` | Expo SDK 58, Expo Router, Reanimated |
| Mock data | `packages/data` | Typed TypeScript from real public content |
| Design tokens | `packages/tokens` | Apple HIG-aligned, verified Forsa brand |
| Design | [Figma file](https://www.figma.com/design/z5OmwOS1xhG9zONZ0FdleF) | Foundations, components, 12 web + 11 iPhone screens |

## Run

```bash
npm install
npm run web        # http://localhost:3000
npm run web:build  # static site in apps/web/out
npm run ios        # Expo (see apps/ios/README.md for iPhone steps)
```

The website deploys to GitHub Pages on every push to `main` (`.github/workflows/pages.yml`). In the repo settings, set Pages → Source to "GitHub Actions" once.

## Docs
1. `docs/00-orchestration.md` — how the work was run
2. `docs/01-current-journey.md` — today's site map, journeys and 15 pain points
3. `docs/02-design-system.md` — brand audit and the new system
4. `docs/03-screen-inventory.md` — screens S01–S14 (the contract)
5. `docs/04-user-stories.md` — 6 personas, 55 user stories with acceptance criteria
6. `docs/qa/` — independent QA reports for web and iOS
