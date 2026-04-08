---
description: How to develop, refactor, and build components for Tecof Theme Editor
---

# Tecof Theme Editor Development Workflow

This document outlines the strict guidelines and development patterns for contributing to the `tecof-theme-editor` package. **Failure to follow these rules will result in rejected code.**

## Core Principles

1. **NO INLINE STYLES**: Component layouts, structure, and spacing must NOT use React inline styles (`style={{ ... }}`). Exception: Truly dynamic styles such as `style={{ background: userColorVariable }}` are acceptable.
2. **CENTRALIZED CSS**: All CSS must be centralized in `/src/styles.css`. No local `.module.css` or CSS-in-JS libraries.
3. **STRICT NAMING CONVENTION**: All classes added to `styles.css` must adhere to the `tecof-[component]-[element]` prefix format (e.g. `.tecof-upload-btn-primary`, `.tecof-editor-spinner`).
4. **BUILD-FIRST APPROACH**: This is an NPM package exported to a host application. Any changes made to the `.tsx` or `.css` files **require** rebuilding the module to become active.

## Steps for Adding/Editing Components

1. **Locate Component**: Work in `/src/components/fields/` or `/src/components/`.
2. **Apply Class Names**: Assign `className` attributes directly to elements (`className="tecof-newfield-container"`). Do not use objects for holding styles (`const s = {}`).
3. **Update CSS**: Add the corresponding styles to `/src/styles.css` under an appropriately titled comment block `/* ─── NewField ─── */`. 
4. **Interactive States**: Use CSS pseudo-classes (`:hover`, `:focus`, `:active`) instead of Javascript state listeners wherever possible. Use root theme variables like `var(--tecof-primary-500)`.
5. **Re-build**: 
// turbo
6. Run `npm run build` in the `tecof-theme-editor` root directory to compile TypeScript and CSS mappings via `.tsup`.

## Available Helpers
The `styles.css` document includes several unified helpers you may reuse:
- `.tecof-spin`
- `.tecof-flex-1` / `.tecof-flex-none`
- `.tecof-text-center`
- `.tecof-text-muted`
- `.tecof-underline` / `.tecof-line-through`

Always aim to maintain the premium visual standard with glassmorphic borders, soft drop shadows (`0 4px 12px rgba(x)`), and smooth transitions (`all 0.2s ease`).
