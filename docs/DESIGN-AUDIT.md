# Cinematic Energy Field update

The latest direction preserves the editorial site and adds one intentional black interlude. The shared GPU material now connects the processor release, data wave, Understanding aperture, liquid intelligence, physical mechanism, distributed verification network, future blueprint, and magnetic footer. The liquid has genuine merging topology, an ice-blue transmissive material, independently moving internal paths, and localized raycast interaction. The connected globe now uses spherical routes, shader-driven signal motion, a soft Fresnel rim, and restrained camera-relative movement.

The twelve-column technology composition keeps copy on the left and the evolving exhibit on the right. Mobile keeps all WebGL states with a dedicated central visual area between tabs and explanatory copy. The final type shares the field, with a glyph-derived exclusion texture to keep letterforms readable. Actual footer text rectangles protect link readability as ions move.

The original audit below is retained as project history.

---

# SCIFER: editorial experience upgrade

## Existing implementation, inspected before changes

The existing Vite / React / TypeScript application is a single page. `App.tsx` owns navigation, five engineering-story sections, three technology cards, the product explorer, filtered research projects, the connected globe, the final CTA, and accessible dialogs. `Scene.tsx` owns procedural Three.js geometry, studio lighting, instanced parts, shader particles, camera controls, and the globe. No GLBs, video backgrounds, or large image textures are used.

The current scroll state runs from 0 to 4, with GSAP ScrollTrigger scrubbing a ref consumed by React Three Fiber. Lenis advances through the GSAP ticker. Typography uses DM Sans with IBM Plex Mono metadata. Spacing is controlled by a responsive page gutter, but most sections repeat the same two-column composition. Mobile keeps WebGL and stacks content. Reduced motion stops ambient movement but still interpolates some dramatic model transformations.

The explorer, six hotspots, reset, research filters, project dialogs, form validation, downloadable inquiry, and email draft are working features to retain. The seven existing browser tests establish the regression baseline.

## Art-direction findings

- The hero separates the text and model into predictable columns. Type should establish depth around the actual device.
- The same heading / paragraph / visual rhythm repeats. Add a typographic pause, a technology exhibition, a quiet research index, and a large project gallery.
- Small type and uniform card treatments flatten hierarchy. Give display typography, metadata, and project imagery distinct scales and roles.
- Most reveals share a fade-and-slide behavior. Use line masks for statements, restrained clipping for visuals, and progressive annotations.
- Navigation and loading provide little sense of place. Add an accessible index menu, readiness-based opening sequence, and chapter progress.

## Technical findings

- Preserve existing lazy scene imports, instancing, buffer geometries, adaptive DPR, and offscreen frame-loop pausing.
- Three technology canvases can become one persistent exhibition canvas, reducing WebGL context and lighting overhead.
- Keep scroll and pointer values in refs/shared mutable state. React state should update only for semantic changes.
- Separate scene timelines from presentation and keep ScrollTrigger cleanup and responsive pinning explicit.
- Preserve the local contact workflow; no submission service or verified company profile was supplied.
- Measure the production build, layout shifts, browser frame pacing, accessibility, and interaction regressions. Do not claim a universal 60 FPS guarantee.

## Implementation order

1. Editorial grid, display type, and distinct section compositions.
2. Readiness-based intro and integrated hero layers.
3. Normalized story choreography, physical device presentation, and structured particles.
4. Research index and desktop horizontal project gallery; vertical mobile/reduced-motion fallback.
5. Accessible full-screen navigation, restrained pointer interactions, shared project transitions.
6. Interactive final scene, responsive refinement, production and browser verification.

Design research considered Awwwards' storytelling / typography categories and GSAP's official ScrollTrigger and matchMedia guidance. No individual website was cloned.
