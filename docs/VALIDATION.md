# Scifer Energy Field validation

Updated 17 September 2026. This extends the existing site; the hardware explorer, research/projects, contact workflow, and white/blue editorial identity remain.

## Architecture and interaction coverage

- One persistent full-viewport GPU particle buffer supplies processor fragments, explosion, wave, black atmosphere, liquid/mechanical transition fragments, future planes, descent, and footer ions.
- Actual visible processor surfaces are sampled with Three.js MeshSurfaceSampler and projected into the shared scene framing. No pre-rendered substitute is used.
- Native MarchingCubes computes merging liquid volumes (46 desktop / 34 mobile resolution). Surface raycasting drives a local metaball force, normalized ripple displacement, and a blue light; internal filaments move separately.
- Mechanical surfaces use reversible shader clipping. An articulated linkage becomes an instanced verification lattice with local interaction and outward color propagation.
- One global pointer source supplies damped position, velocity, direction, and world position. Footer offsets/velocities integrate in half-float GPU ping-pong targets with bounded attraction, tangential force, damping, and spring return.
- Footers use measured anchor geometry and GPU exclusion rectangles around navigation, the wordmark, and body text. No scrolling section uses a separate particle emitter.
- Named shots interpolate position, target, FOV, and focus metadata. The camera avoids aggressive rotation.

## Browser checks

Production TypeScript/Vite build passes. All 14 Playwright tests pass against the production preview.

The browser suites cover the existing nine regressions and five new cinematic checks: full-viewport shader coverage, reverse scrolling, black-matte rendering, liquid raycasting, mechanical picking, block interaction, future assembly, footer attraction/release, and mobile reduced motion.

Axe cannot infer contrast through a fixed WebGL background. The Understanding region therefore has a separate rendered-backdrop and foreground-color test, plus axe structural checks; the remaining page receives the complete automated WCAG A/AA ruleset. This is not a complete accessibility certification.

The screenshot matrix covers 1920x1080, 1440x900, 1366x768, and 390x844. The review identified and corrected a hero positioning regression, a globe overflowing into the final section, mobile mechanism sizing, footer anchor offsets after pinned content, and particle interference with footer links.

## Current frame-pacing measurements

Production preview in Chrome on Windows, Intel UHD Graphics 630 through ANGLE / Direct3D 11. Nine scenes, each sampled for 2.5 seconds after settling. Both 1440x900 desktop and 390x844 mobile-sized browser viewports used device pixel ratio 1, with adaptive rendering at a 1x framebuffer.

| Scene | Desktop FPS | Desktop p95 frame time | Mobile-sized FPS |
| --- | ---: | ---: | ---: |
| Processor release | 60 | 16.9 ms | 60 |
| Data wave | 60 | 16.9 ms | 60 |
| Understanding | 60 | 16.9 ms | 60 |
| Liquid AI | 60 | 16.9 ms | 60 |
| Robotics | 60 | 16.8 ms | 60 |
| Blockchain | 60 | 16.9 ms | 60 |
| Connected globe | 60 | 16.9 ms | 60 |
| Future architecture | 60 | 16.9 ms | 60 |
| Magnetic footer | 60 | 16.8 ms | 60 |

These are settled local frame-pacing samples, not GPU timer measurements, continuous-scroll stress tests, or physical-phone benchmarks. They do not guarantee universal 60 FPS. High-resolution first-entry screenshots recorded temporary lower frame rates while materials initialized; shader prewarming, adaptive DPR, and half-resolution transmission reduce that cost.

Desktop uses 24,000 particles, tablet 12,000, mobile 6,500, and reduced motion 1,800. Geometry and shaders remain real-time on mobile. Detailed results: `.artifacts/energy/performance.json`; reproduction: `scripts/energy-performance.mjs`.

The older Lighthouse numbers below describe the earlier baseline only. They have not been remeasured for this larger cinematic update.

---

# Earlier editorial baseline (before the Energy Field update)

Verified locally on 17 September 2026. This upgrades the existing site; its content, inquiry workflow, and underlying procedural hardware are retained.

## Functional and visual checks

- Production TypeScript / Vite build passes.
- All nine Playwright browser tests pass against the production preview.
- Tests cover actual WebGL rendering, engineering scroll scenes, mesh raycasting, component selection and Escape reset, bounded product exploration, project filtering and shared details, inquiry validation and download, keyboard discipline selection, gallery / index switching, responsive resizing, mobile navigation, reduced motion, and visible shader output.
- Automated WCAG A / AA checks pass. These complement keyboard and responsive checks; they do not constitute a full accessibility certification.
- Desktop and mobile screenshots were reviewed for the hero, exploded hardware, processor close-up, data, disciplines, explorer, research, projects, globe, and final CTA. Additional 320, 768, and 1024 px viewport checks found no page-width overflow. No runtime errors were recorded during the walkthrough.
- A clipped-heading reveal bug and a selection reset during scroll easing were found and fixed during verification.

## Rendering measurements

Chrome 153, Windows, Intel UHD Graphics 630 through ANGLE / Direct3D 11, 1440 × 960 viewport, device pixel ratio 1.

| Sample | Average frame rate | 95th-percentile frame time |
| --- | ---: | ---: |
| Hero | 60 FPS | 16.9 ms |
| Exploded engineering | 60 FPS | 16.9 ms |
| Data particles | 60 FPS | 16.9 ms |
| Technology exhibition | 60 FPS | 16.9 ms |
| Product explorer | 60 FPS | 16.9 ms |
| Connected globe | 60 FPS | 16.9 ms |
| Identity finale | 60 FPS | 16.9 ms |

These are 2.5-second local frame-pacing samples after settling each scene, not continuous-scroll or physical-phone benchmarks. They do not guarantee 60 FPS on all hardware. The raw report and reproduction script are `.artifacts/performance.json` and `scripts/performance.mjs`.

Four canvases now serve the whole site, down from seven. Offscreen animation loops pause. Rounded hardware geometry was simplified from about 18,900 to 10,200 visible hero triangles. Shader warm-up uses `compileAsync`; repeated parts and neural nodes are instanced, and particle morphing runs in GLSL.

The original runtime studio-environment convolution was the largest startup bottleneck. Its three lighting panels are now baked into a 24,296-byte CubeUV reflection atlas. Materials still respond to live lights and camera movement; only the reflection lookup is precomputed. `scripts/bake-environment.mjs` reproduces the texture.

## Loading audit

Lighthouse 13.4.1 against the production preview, using its desktop preset and default mobile simulation:

| Metric | Desktop | Simulated mobile |
| --- | ---: | ---: |
| Performance | 97 | 62 |
| Accessibility | 100 | 100 |
| Best practices | 100 | 100 |
| SEO | 100 | 100 |
| Largest contentful paint | 1.0 s | 4.9 s |
| Total blocking time | 0 ms | 440 ms |
| Cumulative layout shift | 0.014 | 0.003 |

Before the reflection-atlas optimization, performance scores were 72 desktop / 49 mobile, with 550 ms / 2,830 ms of blocking time. Mobile remains more expensive to initialize under CPU and network throttling. Its reported largest element is the preloader's changing percentage. The desktop frame-rate results above measure settled rendering, not mobile loading or real-device field performance.

## Reproduction

```sh
npm run build
npm run preview -- --host 127.0.0.1 --port 5174
```

Set `PLAYWRIGHT_BASE_URL=http://127.0.0.1:5174` to run `npm test` against the production build. Set `SCIFER_PREVIEW_URL` for `scripts/inspect.mjs` and `scripts/performance.mjs`.

Lighthouse JSON reports are written to `.artifacts/lighthouse-desktop.json` and `.artifacts/lighthouse-mobile.json`. They measure local loading conditions with Lighthouse throttling, rather than deployed-server or field performance.

## Deployment details

- Configure approved contact and social URLs using `.env.example`. The inquiry remains a local downloadable brief / email draft; it does not silently send data.
- Project content is explicitly presented as research concepts, without invented clients, results, or performance claims.
- Main visual scenes are genuine Three.js. Secondary project previews use lightweight, pointer-responsive SVG compositions.
- A Tailwind build-plugin warning concerns CSS source-map accuracy. Type checking, generated application code, and JavaScript source maps complete successfully.
