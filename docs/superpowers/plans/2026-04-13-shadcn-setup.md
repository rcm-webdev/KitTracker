# shadcn/ui Setup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire up Tailwind CSS and the `@/` path alias in the client package so the shadcn CLI and MCP server can add components without manual configuration.

**Architecture:** Add the `@/` path alias to both Vite and TypeScript so generated shadcn components resolve correctly. Install Tailwind via the `@tailwindcss/vite` plugin. Then the user runs `npx shadcn@latest init` interactively — the CLI generates `components.json`, CSS variables, `tailwind.config.js`, and `src/lib/utils.ts`.

**Tech Stack:** Vite 5, TypeScript, Tailwind CSS v4, `@tailwindcss/vite`, shadcn/ui CLI

---

### Task 1: Add `@/` path alias to Vite and TypeScript

**Files:**
- Modify: `client/vite.config.ts`
- Modify: `client/tsconfig.json`

- [ ] **Step 1: Update `client/vite.config.ts`**

Replace the entire file with:

```ts
import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
        credentials: true,
      },
    },
  },
});
```

- [ ] **Step 2: Update `client/tsconfig.json`**

Add `"@/*": ["./src/*"]` to the existing `paths` object:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "paths": {
      "@strawhats/shared": ["../shared/types.ts"],
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 3: Explain what was built**

> **Two files were touched, and they must agree with each other:**
>
> - **`vite.config.ts`** is the Vite build config. It now has two new things: the `tailwindcss()` plugin (which hooks Tailwind into Vite's build pipeline) and a `resolve.alias` entry. The alias tells Vite: "whenever you see an import starting with `@/`, look in `./src/`". Without this, the app would fail to build.
>
> - **`tsconfig.json`** is TypeScript's config. It needs the same `@/*` alias in `paths` so the TypeScript compiler doesn't report errors when it sees `import { cn } from "@/lib/utils"`. Vite and TypeScript are separate tools — Vite resolves modules at build time, TypeScript checks types at compile time. They need to agree or you get one working and the other complaining.
>
> The `tailwindcss()` plugin import is also wired in here — it replaces the old `tailwind.config.js`-based setup in Tailwind v4. The plugin handles everything Tailwind needs to scan and generate CSS.

- [ ] **Step 4: Commit prompt**

> You're ready to commit. Suggested message: `feat: add @/ path alias and tailwindcss vite plugin`
> Files to stage: `client/vite.config.ts`, `client/tsconfig.json`

---

### Task 2: Install Tailwind CSS packages

**Files:**
- Modify: `client/package.json`

- [ ] **Step 1: Install the packages**

Run from the repo root:

```bash
npm install --save-dev tailwindcss @tailwindcss/vite --workspace=client
```

This adds both packages to `client/package.json` devDependencies. `tailwindcss` is the core library. `@tailwindcss/vite` is the Vite plugin that connects them.

- [ ] **Step 2: Verify the install**

```bash
cat client/package.json | grep -E "tailwind"
```

Expected output:
```
"@tailwindcss/vite": "...",
"tailwindcss": "...",
```

- [ ] **Step 3: Explain what was built**

> **`client/package.json`** now lists `tailwindcss` and `@tailwindcss/vite` as devDependencies. These are dev-only because Tailwind runs at build time — it scans your source files, generates a CSS file, and never ships itself to the browser. The actual output is a plain `.css` file.
>
> The shadcn CLI will detect `tailwindcss` in your devDependencies and know you're using Tailwind v4 via the Vite plugin. This is how it decides what to put in `tailwind.config.js` and `index.css`.

- [ ] **Step 4: Commit prompt**

> You're ready to commit. Suggested message: `feat: install tailwindcss and @tailwindcss/vite`
> Files to stage: `client/package.json`, `package-lock.json`

---

### Task 3: Run the shadcn CLI init (interactive — you run this)

**Files created by the CLI:**
- Create: `client/components.json`
- Create: `client/src/lib/utils.ts`
- Update: `client/src/index.css`
- Create/update: `client/tailwind.config.js`

- [ ] **Step 1: Run the shadcn init CLI from inside the client folder**

```bash
cd client && npx shadcn@latest init
```

**When prompted, choose:**
- Style: **New York** (more polished defaults, better for production apps)
- Base color: your preference — **Zinc** is a safe neutral
- CSS variables: **Yes**

- [ ] **Step 2: Verify the files were created**

```bash
ls client/components.json client/src/lib/utils.ts
```

Expected: both files exist without error.

- [ ] **Step 3: Explain what was built**

> **Four things the CLI just created:**
>
> - **`client/components.json`** — this is the most important file for the MCP server. It tells the shadcn tooling where your project lives: which framework (React), where to put UI components (`src/components/ui`), where `utils.ts` lives, and what import alias to use (`@/`). Every `npx shadcn add` command (and the MCP server) reads this file first.
>
> - **`client/src/lib/utils.ts`** — a tiny helper that exports a `cn()` function. It combines `clsx` (conditional class names) and `tailwind-merge` (deduplicates conflicting Tailwind classes). Every shadcn component uses `cn()` internally. You'll use it too when you need to conditionally apply Tailwind classes.
>
> - **`client/src/index.css`** — updated with Tailwind's CSS variable system. This is where shadcn stores your theme (colors, border radius, etc.) as CSS custom properties like `--background`, `--foreground`, `--primary`. Changing your theme later means editing these variables — not hunting down class names across files.
>
> - **`client/tailwind.config.js`** — Tailwind's config file, telling it which files to scan for class names. Tailwind only generates CSS for classes it finds in your source files, so this content-glob list matters.
>
> **How they connect:** The Vite plugin (from Task 1) reads `tailwind.config.js` and processes `index.css`. Components you add later import from `@/components/ui/*` (resolved by the alias from Task 1) and use `cn()` from `@/lib/utils`. `components.json` is the map that tells `shadcn add` and the MCP server where everything lives.

- [ ] **Step 4: Commit prompt**

> You're ready to commit. Suggested message: `feat: initialize shadcn/ui with New York style and CSS variables`
> Files to stage: `client/components.json`, `client/src/lib/utils.ts`, `client/src/index.css`, `client/tailwind.config.js`

---

### Task 4: Verify the dev server still starts

- [ ] **Step 1: Start the client dev server**

```bash
npm run dev:client
```

Expected: Vite starts on `http://localhost:5173` with no errors. You should see a message like `VITE vX.X.X  ready in Xms`.

- [ ] **Step 2: Open the app**

Navigate to `http://localhost:5173`. The app should load and look identical to before — nothing visual has changed yet. The existing inline styles are untouched.

- [ ] **Step 3: Stop the server**

`Ctrl+C`

- [ ] **Step 4: Commit prompt**

> No new files from this step — verification only. If you found errors, fix them before committing.

---

### Task 5: Add the shadcn MCP server to Claude Code

> **Open question on location:** MCP servers are editor-level tools, not project dependencies. They should be configured at the **user level** (`~/.claude/settings.json`) so they work across all your projects. However, if you want it scoped to just this project, use **project level** (`.claude/settings.json` at the repo root). User level is recommended.

- [ ] **Step 1: Use the following prompt in Claude Code to set up the MCP server**

Copy and paste this prompt into a new Claude Code conversation:

```
I want to add the shadcn MCP server to Claude Code. The server lets me add shadcn/ui components by chatting with you instead of running CLI commands.

Please configure it for me. I believe the command is:
  npx shadcn@latest mcp

Should this go in my user-level settings (~/.claude/settings.json) or project-level settings (.claude/settings.json at the repo root)? My project already has components.json set up in the client/ folder. Please check the shadcn docs for the correct MCP server command and configuration format, then add it to the right place.
```

- [ ] **Step 2: Verify the MCP server is available**

After configuration, start a new Claude Code session. You should see the shadcn MCP server listed when tools are available. Try: "Add a Button component using shadcn" — it should install `client/src/components/ui/button.tsx` automatically.

---

## Summary

After completing all tasks:

- `@/` resolves to `client/src/` in both Vite builds and TypeScript type-checking
- Tailwind CSS is wired into the Vite build via `@tailwindcss/vite`
- `components.json` tells the shadcn tooling where your project lives
- `cn()` is available at `@/lib/utils` for all future components
- The shadcn MCP server can add components directly from conversation
