# Design System Document

## 1. Overview & Creative North Star: "The Editorial Archive"

This design system is built to transform a standard portfolio into a high-end digital publication. For a Junior Researcher and Technical Writer, the interface must not merely "display" content; it must "curate" it. The Creative North Star is **The Editorial Archive**—a philosophy that treats every research paper and technical brief with the reverence of a museum exhibit.

To break the "template" look, we move away from rigid, boxed grids. Instead, we utilize **Intentional Asymmetry** and **Tonal Layering**. By leveraging wide margins (using `spacing.20` and `spacing.24`) and high-contrast typography scales (the jump from `display-lg` to `body-md`), we create a rhythmic flow that guides the reader through complex information without fatigue. The layout should feel like a premium broadsheet: airy, authoritative, and meticulously structured.

---

## 2. Colors: Depth Through Tone

The palette is a sophisticated interplay of `primary` deep blues and `secondary` slates, grounded by a nearly-white `background`.

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to define sections. Layout boundaries must be established exclusively through background color shifts. A research section might sit on `surface`, while the "Experience Roadmap" transitions into `surface-container-low`. This creates a seamless, modern flow that feels engineered rather than "boxed in."

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of fine paper. 
- **Base Level:** `surface` (#f8f9fa)
- **Content Zones:** `surface-container-low` (#f1f4f6)
- **Interactive Elements/Cards:** `surface-container-lowest` (#ffffff)
This nesting creates a "soft lift" that defines importance without visual noise.

### The "Glass & Gradient" Rule
To add a signature polish, use **Glassmorphism** for navigation bars or floating "Quick Action" buttons. Use `surface-container-lowest` at 70% opacity with a `backdrop-filter: blur(12px)`. For primary CTAs, apply a subtle linear gradient from `primary` (#4c6078) to `primary_dim` (#41546c) to give the button a tactile, "weighted" feel.

---

## 3. Typography: The Writer’s Voice

The typography strategy pairs a modern geometric sans-serif (**Manrope**) for structural clarity with a sophisticated serif (**Newsreader**) for the soul of the narrative.

- **Display & Headlines (Manrope):** Used for "Wayfinding." These should be bold and unapologetically large. `display-lg` (3.5rem) should be used for hero statements to establish immediate authority.
- **Titles & Body (Newsreader):** This is where the technical writing lives. Newsreader’s elegant serifs make long-form text feel academic and high-end. `body-lg` (1rem) is the standard for research abstracts to ensure maximum legibility.
- **Labels (Inter):** Used for metadata (dates, tags, "minutes to read"). These use `label-sm` in `on-surface-variant` to stay present but secondary.

---

## 4. Elevation & Depth: Tonal Layering

Traditional drop shadows are largely prohibited. Instead, we achieve hierarchy through the **Layering Principle**.

- **Ambient Shadows:** When a card requires a floating state (e.g., a hovered portfolio item), use a shadow with a blur of `24px` and a color of `on-surface` at 4% opacity. This mimics natural light falling on paper.
- **The "Ghost Border" Fallback:** If a container lacks sufficient contrast against its background, use a "Ghost Border": `outline-variant` (#abb3b7) at **15% opacity**. It should be felt, not seen.
- **Vertical Rhythm:** Use the Spacing Scale to create "breathing rooms." Sections should be separated by a minimum of `spacing.16` (5.5rem) to signify a shift in topic.

---

## 5. Components

### Portfolio Cards
*   **Structure:** No borders. Background: `surface-container-lowest`. 
*   **Layout:** Asymmetric. Image on one side, title in `title-lg` (Newsreader) on the other. 
*   **Spacing:** `spacing.6` internal padding.
*   **Interaction:** On hover, transition the background to `surface-bright` and apply an Ambient Shadow.

### Experience Timeline (Roadmap)
*   **Visuals:** Forbid the use of a continuous vertical line. Instead, use a "dot" using `primary` and rely on the `surface-container-low` background to track the path.
*   **Typography:** Dates in `label-md` (Inter), Job Titles in `title-md` (Newsreader).

### Research Inputs & Text Fields
*   **Style:** Minimalist underline using `outline-variant` (2px). On focus, the line transitions to `primary` blue.
*   **Background:** `surface-container-low` for the input area to differentiate from the `surface` background.

### Buttons
*   **Primary:** Solid `primary` background, `on_primary` text. Radius: `md` (0.375rem).
*   **Secondary:** No background. `primary` text. Use a "Ghost Border" that only appears on hover.
*   **Tertiary/Link:** `title-sm` with a `spacing.1` bottom margin and a `primary_fixed_dim` 2px underline.

### CV Details Section
*   **Grid:** Use a 2-column asymmetric grid (1/3 for labels, 2/3 for content).
*   **Separation:** Use `spacing.8` vertical gaps instead of divider lines.

---

## 6. Do's and Don'ts

### Do
*   **Do** use white space as a structural element. If in doubt, add more padding.
*   **Do** mix your typography. A `display-sm` (Manrope) header followed by a `body-lg` (Newsreader) intro is the signature look.
*   **Do** use `primary_container` for subtle highlights in technical text (e.g., code snippets or key findings).

### Don't
*   **Don't** use 100% black text. Always use `on_surface` (#2b3437) for a softer, premium reading experience.
*   **Don't** use standard "Material Design" shadows. They are too aggressive for an editorial aesthetic.
*   **Don't** use divider lines. If content feels cluttered, increase the spacing scale or shift the background tone.
*   **Don't** use "full" rounded corners (pills) for cards; keep to `md` or `lg` to maintain a professional, architectural feel.