# shadcn/ui Setup Design

**Date:** 2026-04-13  
**Scope:** Infrastructure-only — Tailwind CSS + shadcn/ui init in `client/`. No existing page migration.

## Goal

Prepare the client package so the shadcn MCP server can add components without manual CLI steps. Components will be added incrementally in future work.

## What Gets Set Up

### 1. Path alias (`@/`)

shadcn-generated components import from `@/lib/utils` and `@/components/ui`. Two files need this alias:

- **`client/vite.config.ts`** — add `resolve.alias: { "@": path.resolve(__dirname, "./src") }` so Vite resolves `@/` at build time
- **`client/tsconfig.json`** — add `"@/*": ["./src/*"]` to `paths` so TypeScript resolves `@/` at type-check time

Both must agree or you get runtime resolution but TS errors (or vice versa).

### 2. Tailwind CSS

Install `tailwindcss` and `@tailwindcss/vite` as devDependencies in `client/package.json`. The `@tailwindcss/vite` plugin wires Tailwind into the Vite build pipeline. The shadcn CLI detects this and generates the correct `tailwind.config.js`.

### 3. shadcn CLI init (interactive — run by user)

Run `npx shadcn@latest init` from inside `client/`. The CLI:
- Prompts for style (New York recommended) and base color
- Creates `components.json` — the config file the MCP server reads to know where to install components
- Creates/updates `tailwind.config.js`
- Adds CSS variables to `src/index.css`
- Creates `src/lib/utils.ts` with the `cn` helper (merges Tailwind class names)

### 4. shadcn MCP server (next step — separate prompt)

The MCP server is a Claude Code integration. It needs to be configured in Claude Code's MCP settings — likely at the **root** or **user level**, not inside `client/`, because MCP servers are editor-level tools (not project dependencies). The `components.json` in `client/` tells it where to install components. A ready-to-use setup prompt is included in the implementation plan.

## File Map After Setup

```
client/
  components.json          ← shadcn config (created by CLI)
  tailwind.config.js       ← Tailwind config (created by CLI)
  vite.config.ts           ← updated: @/ alias + @tailwindcss/vite plugin
  tsconfig.json            ← updated: @/* path
  src/
    index.css              ← updated: Tailwind directives + CSS variables
    lib/
      utils.ts             ← created by CLI: cn() helper
    components/
      ui/                  ← future home of shadcn components
```

## Out of Scope

- Migrating existing pages (`Dashboard`, `Login`, etc.) to use shadcn components
- Adding any shadcn components
- Changing existing inline styles
