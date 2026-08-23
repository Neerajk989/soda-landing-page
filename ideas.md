# Soda Landing Page — Ground-Truth Design Specification

## Reference-Led Approach: Kinetic Carbonation

This website is a recreation task. The supplied Soda specification is the **ground-truth visual and interaction contract**: a no-scroll, full-viewport beverage launch page with an immersive radial teal state that shifts to cobalt for the alternate flavor. Fidelity to the specified scene, hierarchy, interaction timing, and compositional tension takes priority over alternative visual directions.

### Design Movement

Contemporary **3D product-campaign art** fused with editorial glassmorphism. The central can is the hero object; all type, bubbles, fruit, and cards act as a responsive atmosphere around it.

### Core Principles

1. **Product gravity:** The oversized central can anchors every visual decision, with the two text columns visibly pulled toward but never obscuring it.
2. **Layered atmospheric depth:** A dark radial field, liquid-bubble texture, distant leaves, background fruit, product, foreground fruit, and glass controls establish a clear spatial stack.
3. **Deliberate asymmetry:** The huge cursive left headline and right-aligned carousel/headline create a balanced, tension-filled split composition rather than a centered grid.
4. **Tactile motion:** Carbonation rises continuously, the can softly bobs and tracks the cursor, fruit responds to the pointer, and flavor selection triggers a composed collapse-and-release sequence.

### Color Philosophy

Classic begins in a restrained emerald-black environment (`#0b8a78` into `#011411`) that reads as cold, clean, and botanical. Zero Lime switches to a moonlit cobalt-black environment (`#0b4f8a` into `#010c14`) that feels sharper and cooler. Pale pink `#fbcfe8` is a sparingly deployed recognition signal for selection and actions, never a broad background.

### Layout Paradigm

The site is one cinematic viewport. A fixed glass header forms the top rail; within the hero, full-height left and right editorial columns flank a centrally overlaid product stage. Decorative objects ignore the content columns and move independently across the whole field.

### Signature Elements

* An oversized 3D can that slightly rotates toward the cursor.
* A pale-pink, circular plus button as the repeatable action signature.
* Glass flavor cards whose product art breaks above their rounded containers.

### Interaction Philosophy

Interactions should feel physical rather than merely decorative. Pointer movement creates gentle camera tilt, parallax, and fruit repulsion; choosing a flavor makes every visual layer participate in the change while retaining legible content and keyboard-accessible buttons.

### Animation

The initial can reveal uses a soft fade and a slow vertical bob. Background elements drift at staggered rates. Flavor switches use a 1.5-second color morph, a fast blurred spin that swaps the can finish at its peak, and a fruit implosion/expansion. All non-essential animation must reduce under `prefers-reduced-motion`.

### Typography System

**Galada** carries the very large expressive headlines at `clamp(5rem, 10vw, 12rem)`, while **Manrope** is used for the compact navigation and **Inter** for legible product details. Headline line-height is tight (0.8) and soft, while system information uses modest scale and generous tracking.

### Brand Essence

**Soda is a zero-sugar beverage experience for design-aware refreshment seekers who expect the product ritual to feel as refined as the taste.**

Personality: **clean, kinetic, quietly bold**.

### Brand Voice

Headlines are sensory and confident; CTA labels are short, direct, and physical. Microcopy should sound like a product invitation, never generic lifestyle filler.

Examples: “Pure Zero.” and “Unleash the crisp taste.”

### Wordmark & Logo

Use a distinctive plus-in-orbit **Soda Orb** symbol in the header and favicon. The wordmark remains the cursive “Soda” lockup nearby rather than a generic default-font logo.

### Signature Brand Color

**Carbonation Pink — `#fbcfe8`**.

## Style Decisions

* The project uses the supplied public 3D model and texture URLs for the can, berries, and leaves.
* Bespoke generated atmosphere art enriches the two flavor backgrounds without competing with the 3D product center stage.
* The supplied visual contract requests a full-viewport, non-scrolling desktop composition. A compact mobile layout will prioritize the product, brand, headline, and carousel without horizontal clipping.
