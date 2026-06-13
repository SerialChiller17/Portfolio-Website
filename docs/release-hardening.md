# Release Hardening Notes

## Runtime

- The project standard runtime is Node 22 with npm 10.
- `.nvmrc` and `package.json#engines` are the source of truth for local and CI environments.
- CI reads `.nvmrc` through `actions/setup-node`.

## Deployment Gate

Run the full local release gate before deployment:

```sh
npm run release:check
```

The gate runs:

- strict TypeScript checking with unused locals and parameters enabled
- Vitest
- production build
- high-and-above production dependency audit

## Dev-Tool Vulnerability Strategy

The remaining npm audit finding was in the dev/build chain:

- `vite@6.4.3`
- `@vitejs/plugin-react@4.7.0`
- transitive `esbuild@0.25.12`

Production dependencies audit clean with:

```sh
npm audit --omit=dev --audit-level=high
```

Decision:

- Do not force an `esbuild` override on the current Vite 6 stack.
- A trial override to `esbuild@0.28.1` clears npm audit, but it breaks Vite 6 production builds in `vite:esbuild-transpile`.
- Keep `npm audit --omit=dev --audit-level=high` as the deploy-blocking security gate because production dependencies are clean.
- Treat the dev-tool advisory as a planned tooling upgrade, not a rushed release blocker.

Recommended follow-up:

- Plan a dedicated Vite 8 and `@vitejs/plugin-react` 6 upgrade.
- Re-run full `npm audit --audit-level=high` during that upgrade.
- Keep the production audit as the deploy-blocking security gate unless dev tooling is promoted into the runtime deployment surface.
