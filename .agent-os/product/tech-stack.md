# Technical Stack

> Last Updated: 2026-02-04
> Version: 1.0.0

## Core Technologies

### Application Framework
- **Framework:** React
- **Version:** 18.2.0
- **Language:** TypeScript 5.3.3 (strict mode with all safety flags enabled)

### Build Tooling
- **Bundler:** Vite 5.0.8
- **Transpilation:** TypeScript compiler + Vite plugin-react
- **Code Splitting:** Configured via Vite rollupOptions

## Frontend Stack

### JavaScript Framework
- **Framework:** React 18.2.0
- **Build Tool:** Vite 5.0.8
- **Type Checking:** TypeScript with strictest settings

### Import Strategy
- **Strategy:** ES Modules (type: "module" in package.json)
- **Package Manager:** npm
- **Path Aliases:** @ → src/ via tsconfig paths

### CSS Framework
- **Approach:** Component-scoped styles (to be determined during UI migration)
- **Theme:** Light mode default with potential dark mode support

### UI Components
- **Icons:** Lucide React 0.294.0
- **PDF Generation:** jsPDF 2.5.1

## Testing

### Test Framework
- **Runner:** Vitest 1.1.0
- **UI:** @vitest/ui 1.1.0
- **Coverage:** @vitest/coverage-v8 1.1.0

### Test Strategy
- Unit tests for core business logic
- Integration tests for search workflows
- Tests co-located in `tests/` directory

## Code Quality

### Linting
- **Linter:** ESLint 8.55.0
- **TypeScript Plugin:** @typescript-eslint 6.14.0
- **React Plugins:** eslint-plugin-react-hooks, eslint-plugin-react-refresh

### TypeScript Configuration
- **Strict Mode:** Enabled with all safety flags
- **No Implicit Any:** true
- **Strict Null Checks:** true
- **No Unchecked Indexed Access:** true
- **Target:** ES2020

## Infrastructure

### Application Hosting
- **Platform:** Vercel
- **Deployment:** Automated via npm run deploy

### Production URL
- **v2 Production:** axisx-dev.vercel.app
- **v3 Target:** Same deployment pipeline

### Data Storage
- **Approach:** Static JSON files bundled with app
- **Files:** crossref_data.json, axis_msrp_data.json

## Development Workflow

### Scripts
```bash
npm run dev          # Development server (port 5173)
npm run build        # Production build (tsc + vite build)
npm run preview      # Preview production build
npm test             # Run tests
npm run test:ui      # Visual test UI
npm run test:coverage # Coverage report
npm run typecheck    # TypeScript validation
npm run lint         # ESLint
npm run deploy       # Build + Vercel deploy
```

### Repository
- **Git:** https://github.com/oneshot2001/AxisX-dev
- **License:** MIT
- **Author:** Matthew Visher
