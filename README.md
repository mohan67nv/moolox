# Moolox

AI-Powered Digital Experience Operating System.

## Monorepo Structure

```
moolox/
├── apps/
│   └── web/              # Next.js 15 App Router — Primary UI
├── packages/
│   ├── types/            # @moolox/types — Shared Zod schemas & TypeScript contracts
│   ├── db/               # @moolox/db — Drizzle ORM schema & database access
│   ├── auth/             # @moolox/auth — Edge JWT authentication & RBAC
│   ├── workspace/        # @moolox/workspace — Multi-tenant workspace management
│   ├── project/          # @moolox/project — Project entity & version management
│   ├── ast-core/         # @moolox/ast-core — AST compiler & delta diffing engine
│   ├── tokens/           # @moolox/tokens — W3C design token compiler
│   ├── canvas/           # @moolox/canvas — React 19 virtualized DOM renderer
│   ├── ai/               # @moolox/ai — Multi-agent AI orchestration pipeline
│   ├── components/       # @moolox/components — Built-in component specifications
│   ├── deploy/           # @moolox/deploy — Static edge compiler & publisher
│   ├── git/              # @moolox/git — Bidirectional GitHub sync engine
│   ├── billing/          # @moolox/billing — Stripe billing & subscriptions
│   ├── analytics/        # @moolox/analytics — OpenTelemetry observability
│   ├── marketplace/      # @moolox/marketplace — Creator component marketplace
│   ├── enterprise/       # @moolox/enterprise — Enterprise governance & compliance
│   ├── plugins/          # @moolox/plugins — Web Worker plugin sandbox
│   └── sdk/              # @moolox/sdk — Headless API & developer SDK
├── turbo.json            # Turborepo task pipeline configuration
├── pnpm-workspace.yaml   # pnpm workspace definition
└── tsconfig.json         # Root TypeScript configuration (strict mode)
```

## Tech Stack

- **Runtime:** Node.js 22 LTS
- **Package Manager:** pnpm 11 with workspaces
- **Build System:** Turborepo
- **Framework:** Next.js 15 (App Router)
- **UI Library:** React 19
- **Language:** TypeScript 5.9 (strict mode)

## Development

```bash
pnpm install          # Install all dependencies
pnpm build            # Build all packages and apps
pnpm dev              # Start development server
pnpm typecheck        # Run TypeScript type checking
pnpm lint             # Run ESLint across all packages
pnpm test             # Run test suites
```

## License

Proprietary Commercial — Copyright © 2026 Moolox. All Rights Reserved.
