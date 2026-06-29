---
description: How to develop, refactor, and build components for Tecof Theme Editor
---

# Tecof Theme Editor Development Workflow

This document outlines the strict guidelines and development patterns for contributing to the `tecof-theme-editor` package. **Failure to follow these rules will result in rejected code.**

## Core Principles

1. **NO INLINE STYLES**: Component layouts, structure, and spacing must NOT use React inline styles (`style={{ ... }}`). Exception: Truly dynamic styles such as `style={{ background: userColorVariable }}` are acceptable.
   - Dynamic geometry should prefer CSS variables set from React (`--tecof-outline-top`, `--tecof-layer-indent`) with the visual rules in `src/styles.css`.
2. **CENTRALIZED CSS**: All CSS must be centralized in `/src/styles.css`. No local `.module.css` or CSS-in-JS libraries.
3. **DESIGN TOKENS FIRST**: Borders, radius, focus rings, shadows, surface colors, text colors, and status colors must use the root tokens in `src/styles.css` (`--tecof-line`, `--tecof-radius`, `--tecof-focus-ring`, `--tecof-surface`, etc.). Do not add raw hex/rgb border or radius values unless defining a new token.
4. **STRICT NAMING CONVENTION**: All classes added to `styles.css` must adhere to the `tecof-[component]-[element]` prefix format (e.g. `.tecof-upload-btn-primary`, `.tecof-editor-spinner`).
5. **BUILD-FIRST APPROACH**: This is an NPM package exported to a host application. Any changes made to the `.tsx` or `.css` files **require** rebuilding the module to become active.
6. **PUCK-FREE RUNTIME**: Do not import `@puckeditor/core` or add it back to `dependencies`, `devDependencies`, or `peerDependencies`. Keep only the Puck-compatible data/config shape.
7. **PACKAGE EXPORT ACCURACY**: After build, package entry points in `package.json` must point to files that actually exist in `dist/`. Keep legacy `./puck.css` mapped to `dist/styles.css`.

## Steps for Adding/Editing Components

1. **Locate Component**: Work in `/src/components/fields/` or `/src/components/`.
2. **Apply Class Names**: Assign `className` attributes directly to elements (`className="tecof-newfield-container"`). Do not use objects for holding styles (`const s = {}`).
3. **Update CSS**: Add the corresponding styles to `/src/styles.css` under an appropriately titled comment block `/* ─── NewField ─── */`. 
4. **Interactive States**: Use CSS pseudo-classes (`:hover`, `:focus`, `:active`) instead of Javascript state listeners wherever possible. Use root theme variables like `var(--tecof-primary-500)`.
5. **Accessibility**: Use real buttons for controls. If a draggable row must remain a `div`, add `role`, `tabIndex`, keyboard handlers, and visible `:focus-visible` styling.
6. **Re-build**: 
// turbo
7. Run `npm run build` in the `tecof-theme-editor` root directory to compile TypeScript and CSS mappings via `.tsup`.

## Available Helpers
The `styles.css` document includes several unified helpers you may reuse:
- `.tecof-spin`
- `.tecof-flex-1` / `.tecof-flex-none`
- `.tecof-text-center`
- `.tecof-text-muted`
- `.tecof-underline` / `.tecof-line-through`
- Skeleton primitives: `.tecof-skeleton`, `.tecof-skeleton-text`, `.tecof-skeleton-block`, `.tecof-field-loading`, `.tecof-field-loading-compact`
- Design primitives: `--tecof-line`, `--tecof-line-subtle`, `--tecof-line-dashed`, `--tecof-radius-*`, `--tecof-focus-ring`, `--tecof-danger-ring`, `--tecof-shadow-*`, `.tecof-icon-muted`, `.tecof-icon-faint`

Studio drag-and-drop code should reuse `/src/studio/canvas/dndUtils.ts` for drag MIME keys, default node creation, root/zone drop handling, and auto-scroll wiring. Drag previews should use `/src/studio/canvas/dragGhost.ts`.

Inline canvas editing happens inside an iframe. Always use `target.ownerDocument` and `target.ownerDocument.defaultView` for ranges, selection, and DOM-specific operations.

The host bridge must accept both `puck:save` and legacy `puck:publish`; outgoing events are `puck:changed`, `puck:saved`, `puck:saveError`, `puck:itemSelected`, and `puck:itemDeselected`.

Always aim to maintain the premium visual standard with glassmorphic borders, soft drop shadows (`0 4px 12px rgba(x)`), and smooth transitions (`all 0.2s ease`).
