# Spec: Replace Emojis with Lucide Icons

**Date:** 2026-04-22

## Context

Several client pages use raw Unicode emoji characters (📍, 🖨️, 📷, 📦, ✕) for visual affordances. These render inconsistently across operating systems and look out of place given the project's shadcn/Tailwind design system. The goal is to replace all emoji with Lucide icons for a cohesive, platform-consistent look.

`@phosphor-icons/react` is listed in `client/package.json` but is never imported anywhere — it will be removed as part of this change. `lucide-react` is not yet installed.

## Scope

7 emoji replacements across 6 files. No structural changes — only icon substitutions and the dependency swap.

## Icon Mapping

| Emoji | Lucide Icon | Files |
|-------|-------------|-------|
| 📍 | `MapPin` (size 14) | `BinCard.tsx`, `BinDetail.tsx`, `PrintLabel.tsx`, `Search.tsx` |
| 🖨️ | `Printer` (size 16) | `BinLabel.tsx` |
| 📷 | `ScanLine` (size 16) | `Dashboard.tsx` |
| 📦 | `Package` (size 14) | `Search.tsx` |
| ✕ | `X` (size 14) | `BinDetail.tsx` |

Icons used inline with text use `size={14}` and `style={{ display: "inline", verticalAlign: "middle" }}` to sit flush with surrounding copy. Button icons use `size={16}`.

## Dependency Changes

- **Add:** `lucide-react` to `client/package.json` dependencies
- **Remove:** `@phosphor-icons/react` from `client/package.json` dependencies (unused)

## Verification

1. Run `npm install` from repo root to pick up dependency changes
2. Run `npm run dev:client` and visually confirm icons appear in:
   - Dashboard header Scan link
   - BinCard location line
   - BinDetail location + delete item button
   - Search results bin name + location
   - BinLabel print button
   - PrintLabel component location line
3. Run `npm run build --workspace=client` — must compile with no TypeScript errors
4. Run `npm run test:e2e` — full Playwright suite must pass
