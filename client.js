/**
 * HDD skin for the dsh web shell — Client only.
 *
 * Look and palette follow the reference the user supplied:
 *   「可能是全网最还原的Fairy（动画」— BV1SD4C63EZz, project Fairy-DSH
 *   (github.com/Chengzhibense/Fairy-DSH, Apache-2.0). Colour values and layout
 *   proportions are taken from that project's published stylesheet as design
 *   reference; the markup, SVG geometry, CSS and animation here are written
 *   from scratch. No third-party artwork is copied.
 *
 * Layout rules learned the hard way:
 *   1. `shell.overlay` sits ABOVE every column, so nothing painted there may be
 *      a full-frame background — it would draw over the transcript. The grid
 *      and glows therefore live on `body` (behind all content, attachment
 *      fixed), and the overlay contributes styles only.
 *   2. `conversation.hero.brand.mark` is a brand SEAT, not a stage: it takes a
 *      square `size` and must not push the shell's own headline around. It gets
 *      the emblem and nothing else.
 *   3. Typography belongs to the host. This skin re-tints surfaces and never
 *      changes the reading face.
 *
 * Slots contributed:
 *   shell.overlay                 – styles only (no painted frame layer)
 *   conversation.hero.brand.mark  – emblem, sized by the host
 *   sidebar.brand.mark            – emblem, sized by the host
 *   sidebar.brand.name            – "Fairy" + role line
 *   sidebar.footer.action         – H.D.D status chip (also the version probe)
 */
window.__ModuleLoader__.load({
  id: '@local/dsh-hdd-overlay',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    /* Display face for Latin runs: Poppins Black, subset to Latin and embedded
       as a data URI so the browser never fetches anything. SIL Open Font
       License 1.1 — embedding is permitted. It was chosen because the reference
       art has the single-storey geometric `a` that Archivo Black and every
       Windows face lack. Chinese still falls through to the system face. */
    const HDD_FONT_BASE64 = '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';

    /* The launch backdrop is no longer drawn in CSS: the user replaced it with
       their own image, which the host half streams from ./boot-field.png. The
       vector field that used to live here was removed with it. */

    const CSS = [
      '@font-face {',
      "  font-family: 'Poppins Black';",
      '  font-style: normal;',
      '  font-weight: 100 900;',
      "  src: url(data:font/woff2;base64," + HDD_FONT_BASE64 + ') format("woff2");',
      '  font-display: swap;',
      '}',

      /* ---- boot splash (cold load only) ---- */
      '[data-hdd-boot] {',
      '  position: fixed; inset: 0; z-index: 2147483000;',
      '  display: grid; place-items: center;',
      /* Plain black, no pattern: anything drawn here is a frame the user sees
         before the clip's own first frame, and a hatched backdrop read as a
         separate screen instead of as the animation starting. */
      '  background-color: #05080e;',
      '  animation: hdd-boot-in 0.18s ease-out;',
      '}',
      '[data-hdd-boot][data-hdd-boot-out="true"] { animation: hdd-boot-out 0.5s ease-in forwards; }',
      '@keyframes hdd-boot-in { from { opacity: 0; } to { opacity: 1; } }',
      '@keyframes hdd-boot-out { to { opacity: 0; transform: scale(1.03); } }',
      /* Visible from the first paint, not gated on `loadeddata`: the element's own
         background is the same black, so the gap before the first decoded frame is
         black rather than a different-looking screen. */
      '[data-hdd-boot-video] {',
      '  position: absolute; inset: 0; width: 100%; height: 100%;',
      '  object-fit: cover; background: #05080e;',
      '}',
      '[data-hdd-boot-plate] {',
      '  width: min(440px, 80vw); padding: 18px 20px 14px;',
      '  border: 2px solid #ffffff; border-radius: 12px;',
      '  background: rgba(6, 14, 24, 0.74);',
      '  box-shadow: 0 0 42px rgba(98, 212, 255, 0.16);',
      '}',
      '[data-hdd-boot-head] { display: flex; align-items: center; gap: 10px; }',
      '[data-hdd-boot-rec] {',
      '  flex: none; width: 8px; height: 8px; border-radius: 50%; background: #ff263b;',
      '  box-shadow: 0 0 8px #ff263b;',
      '  animation: hdd-boot-rec 1s steps(1, end) infinite;',
      '}',
      '@keyframes hdd-boot-rec { 50% { opacity: 0.25; } }',
      '[data-hdd-boot-title] {',
      '  color: #ffffff; font-size: 26px; line-height: 1;',
      '  font-family: "Poppins Black", "Century Gothic", "Arial Black", sans-serif;',
      '  letter-spacing: 0.06em;',
      '}',
      '[data-hdd-boot-tag] { margin-left: auto; color: var(--hdd-cyan); font-size: 9px; letter-spacing: 0.2em; }',
      '[data-hdd-boot-log] { display: flex; flex-direction: column; gap: 3px; margin: 13px 0; }',
      '[data-hdd-boot-log] > span {',
      '  font-size: 11px; color: rgba(232, 242, 250, 0.42);',
      '  transition: color 0.12s linear;',
      '}',
      '[data-hdd-boot-log] > span[data-on="true"] { color: rgba(232, 242, 250, 0.94); }',
      '[data-hdd-boot-log] > span[data-on="true"]::before { content: "▸ "; color: var(--hdd-cyan); }',
      '[data-hdd-boot-bar] { display: flex; gap: 3px; height: 10px; }',
      '[data-hdd-boot-bar] > i { flex: 1; background: rgba(126, 220, 255, 0.14); }',
      '[data-hdd-boot-bar] > i[data-on="true"] { background: var(--hdd-cyan); box-shadow: 0 0 6px rgba(98, 212, 255, 0.55); }',
      '[data-hdd-boot-foot] {',
      '  display: flex; justify-content: space-between; margin-top: 9px;',
      '  font-size: 10px; letter-spacing: 0.16em; color: rgba(232, 242, 250, 0.55);',
      '}',
      /* ---- dark palette: values from the reference stylesheet ---- */
      /* ---- substrate colours ----
         The host's palette is NOT touched: an earlier revision replaced the
         alias tokens wholesale (cyan brand, cyan borders, blue surfaces) and
         that was rejected — the application's own neutral theme is what the
         user wants to keep. What remains ours is the substrate only: its base
         colour is the host's own dark base (#151517, light #ffffff) so the
         window still reads as the application, with the grid and glows on top. */
      /* ---- HDD palette ----
         Values from the reference the user supplied. Declared on `body` (and on
         the dark-theme attribute) because the application declares its palette
         there, and a declaration on body cannot be overridden from :root. */
      /* ---- HDD palette: always dark ----
         Values from the reference the user supplied. Declared on `body` as well
         as on the root because the application declares its palette on body,
         and a body-level declaration cannot be overridden from :root.
         No light variant: declaring a light `color-scheme` on the root made the
         application flip to its own light theme (its theme detection follows the
         page's used scheme), which turned the whole window white. HDD is a dark
         surface, so the scheme is pinned dark here. */
      ':root, body, [data-ds-dark-theme], [data-ds-dark-theme] body {',
      '  color-scheme: dark;',
      '  --hdd-base: #07101c;',
      '  --hdd-grid-color: rgba(100, 210, 255, 0.075);',
      /* Same grid, pre-dimmed by the panel veil's alpha (0.42). Used where the
         grid is painted straight onto a surface instead of being seen through
         the veil, so both ends of the column read at one brightness. */
      '  --hdd-grid-color-veiled: rgba(100, 210, 255, 0.044);',
      '  --hdd-glow-a: rgba(96, 212, 255, 0.17);',
      '  --hdd-glow-a-fade: rgba(54, 184, 255, 0.085);',
      '  --hdd-glow-b: rgba(157, 132, 255, 0.14);',
      '  --hdd-glow-b-fade: rgba(119, 91, 255, 0.07);',
      '  --hdd-glow-c: rgba(174, 112, 255, 0.14);',
      '  --hdd-glow-c-fade: rgba(143, 94, 255, 0.07);',
      '  --hdd-cyan: #62d4ff;',
      '  --hdd-brand-row-height: 72px;',
      '  --hdd-nav-shift: 0px;',
      '  --hdd-chip-bg: rgba(10, 24, 40, 0.72);',
      '  --hdd-chip-fg: #cfe8f7;',
      '  --hdd-chip-border: rgba(126, 220, 255, 0.30);',
      /* Effect dials. Small numbers on purpose: the first attempt was loud
         enough to read as a broken screen rather than as a machine idling. */
      '  --hdd-fx-vignette: 0.5;',
      '  --hdd-fx-scan: 0.03;',
      /* Separation between the transcript surface and the frame behind it:
         a thin translucent veil plus a hairline, both tunable. */
      '  --hdd-panel-veil: rgba(10, 24, 40, 0.42);',
      '  --hdd-divider: rgba(126, 220, 255, 0.10);',
      '  --dsw-alias-bg-base: #07101c !important;',
      '  --dsw-alias-bg-layer-1: #0a1828 !important;',
      '  --dsw-alias-bg-layer-2: #0e243d !important;',
      '  --dsw-alias-bg-overlay: #102944 !important;',
      '  --dsw-alias-border-l1: rgba(126, 220, 255, 0.30) !important;',
      '  --dsw-alias-border-l2: rgba(126, 220, 255, 0.20) !important;',
      '  --dsw-alias-brand-primary: #62d4ff !important;',
      '  --dsw-alias-label-primary: #e8f2fa !important;',
      '  --dsw-alias-label-secondary: #a8bac9 !important;',
      '  --dsw-alias-state-idle-primary: #7f93a5 !important;',
      /* Sidebar fill goes transparent so the substrate reads through it, and
         the nav states take the reference's blue steps. */
      '  --dsw-specific-sidebar-fill: transparent !important;',
      '  --dsw-specific-sidebar-nav-item-hover: #0e243d !important;',
      '  --dsw-specific-sidebar-nav-item-active: #143553 !important;',
      '  --dsw-specific-sidebar-nav-item-active-accent: #267fc4 !important;',
      '  --dsw-specific-input-major: #0a1c30 !important;',
      /* Menu surfaces are translucent on purpose: every popover paints
         `background: var(--dsw-specific-menu)` over `backdrop-filter:
         var(--dsw-menu-backdrop-filter)`, and the application derives that token
         from `--dsw-menu-surface-fill` (58% in light, 45% in dark). An opaque
         value here does not tint the glass, it removes it — the blur has nothing
         to show through. Keep a real alpha on all three. */
      '  --dsw-menu-surface-fill: rgba(10, 24, 40, 0.60) !important;',
      '  --dsw-specific-menu: rgba(10, 24, 40, 0.60) !important;',
      '  --dsw-specific-selector: rgba(10, 24, 40, 0.60) !important;',
      '  --dsw-specific-bubble: #103052 !important;',
      '  --dsw-specific-tip: rgba(12, 30, 50, 0.78) !important;',
      '  --dsw-alias-button-elevated-fill: #103052 !important;',
      '  --dsw-alias-button-floating-fill: #103052 !important;',
      '  --dsw-alias-markdown-code-block: #0a1c30 !important;',
      '  --dsw-alias-markdown-code-block-banner: #0a1c30 !important;',
      '  --dsw-alias-markdown-inline-code: #103052 !important;',
      /* Scrollbar. The application binds the thumb to an l1 base-surface token on
         body and rebinds it per elevated surface; leaving those alone left the
         default grey-blue rail sitting against the HDD navy, which read as a strip
         that does not belong to the panel. Both bind points are named so the rail
         matches the surface it rides on: the flat column and the elevated surfaces
         (menus, dialogs) get their own step. */
      '  --dsh-scrollbar-thumb: rgba(126, 200, 255, 0.22);',
      '  --dsh-scrollbar-thumb-hover: rgba(126, 200, 255, 0.42);',
      '  --dsw-alias-scrollbar-bg-l1: rgba(126, 200, 255, 0.18) !important;',
      '  --dsw-alias-scrollbar-bg-l2: rgba(126, 200, 255, 0.24) !important;',
      '  --dsw-alias-scrollbar-hover-l1: rgba(126, 200, 255, 0.34) !important;',
      '  --dsw-alias-scrollbar-hover-l2: rgba(126, 200, 255, 0.44) !important;',
      '  scrollbar-color: rgba(126, 200, 255, 0.22) transparent;',
      '}',
      /* The same rail stated directly on the pseudo elements: the token path is how
         the application styles it, this is the belt to that braces, and it is also
         what colours the corner, which the tokens never reach. Track and corner are
         transparent so the column's own surface shows through — that is what makes
         the rail line up with the dark panel instead of banding against it. */
      '::-webkit-scrollbar { width: var(--dsh-scrollbar-width, 10px); height: var(--dsh-scrollbar-width, 10px); }',
      '::-webkit-scrollbar-track { background: transparent !important; }',
      '::-webkit-scrollbar-thumb {',
      '  background-color: rgba(126, 200, 255, 0.24) !important;',
      '  border: var(--dsh-scrollbar-thumb-border, 2px) solid transparent !important;',
      '  border-radius: 999px !important;',
      '  background-clip: content-box !important;',
      '}',
      '::-webkit-scrollbar-thumb:hover { background-color: rgba(126, 200, 255, 0.46) !important; }',
      '::-webkit-scrollbar-corner { background: transparent !important; }',

      /* ---- substrate: painted by the root element, behind every column ----
         `body` still carries the theme's own `background-color`, which would
         hide the substrate, so it is turned off here — that is the ONLY thing
         this skin does to the host's own surfaces. Everything else about the
         application's appearance is left exactly as shipped. */
      'html {',
      '  background-color: var(--hdd-base) !important;',
      '  background-image:',
      '    radial-gradient(ellipse 50vmax 26vh at 5.4vmax 17.65vh, var(--hdd-glow-c), var(--hdd-glow-c-fade) 53%, transparent 100%),',
      '    radial-gradient(ellipse 53vmax 37vh at calc(100vw - 7.15vmax) 73.2vh, var(--hdd-glow-b), var(--hdd-glow-b-fade) 53%, transparent 100%),',
      '    radial-gradient(ellipse 56vmax 29vh at calc(100vw - 13.26vmax) 12.8vh, var(--hdd-glow-a), var(--hdd-glow-a-fade) 52%, transparent 100%),',
      '    linear-gradient(var(--hdd-grid-color) 1.5px, transparent 1.5px),',
      '    linear-gradient(90deg, var(--hdd-grid-color) 1.5px, transparent 1.5px) !important;',
      '  background-repeat: no-repeat, no-repeat, no-repeat, repeat, repeat !important;',
      '  background-size: auto, auto, auto, 48px 48px, 48px 48px !important;',
      '  background-attachment: fixed !important;',
      '  background-position: 0 0 !important;',
      '}',
      'html body {',
      '  background-color: transparent !important;',
      '  background-image: none !important;',
      '}',
      /* The application frame and its centre column paint their own opaque
         base colour, which is what kept the grid hidden no matter where the
         substrate was drawn. Clearing those two lets the pattern through;
         their colours come back through the surfaces inside them.
         The class names are the ones this build ships. */
      '.BynINW_frame, .BynINW_centerCol {',
      '  background: transparent !important;',
      '}',
      /* One surface, one mechanism. The transcript paints the veil AND the grid
         on top of it; everything nested inside (the composer seat, the status
         strip under it) is cleared so it simply shows that same surface. Two
         regions can no longer disagree about grid brightness, because there is
         only one place the grid is drawn. */
      '.Dc7zOa_root, .Dc7zOa_embeddedBody, .BynINW_rightbarCol {',
      '  background-color: var(--hdd-panel-veil) !important;',
      /* No scan lines. One 1px bright line every 4px ran a white bar across the mark
         and across empty space; lowering its alpha never made it pleasant, so the layer
         is gone. The vignette and the fixed grid remain. */
      '  background-image:',
      '    radial-gradient(130% 100% at 50% 45%, rgba(0, 0, 0, 0) 55%, rgba(4, 10, 20, var(--hdd-fx-vignette)) 100%),',
      '    linear-gradient(var(--hdd-grid-color-veiled) 1.5px, transparent 1.5px),',
      '    linear-gradient(90deg, var(--hdd-grid-color-veiled) 1.5px, transparent 1.5px) !important;',
      '  background-size: auto, 48px 48px, 48px 48px !important;',
      '  background-repeat: no-repeat, repeat, repeat !important;',
      '  background-attachment: scroll, fixed, fixed !important;',
      '  background-position: 0 0, 0 0, 0 0 !important;',
      '}',
      '.BynINW_centerCol {',
      '  box-shadow: inset 1px 0 0 var(--hdd-divider) !important;',
      '}',
      /* The seat hides whatever scrolls under it with a gradient in its own
         background — NOT with a ::before (that element does not exist; an earlier
         guess here disabled one and changed nothing). Clearing the background
         removed the fade, so transcript text showed through below the composer.
         The plate therefore moves to a pseudo element, which lets the grid be
         drawn on top of it: a plain background cannot hold both, because the fade
         would swallow the grid and the composer row would read as a hole. The grid
         uses the panel's own pitch, colour and fixed attachment, so it lines up
         with the grid around it instead of looking like a patch. */
      '.Dc7zOa_root[data-phase="active"] .Dc7zOa_composerSeat,',
      '.Dc7zOa_embeddedBody[data-content-phase="active"] .Dc7zOa_composerSeat {',
      '  background: none !important;',
      '}',
      '.Dc7zOa_root[data-phase="active"] .Dc7zOa_composerSeat::after,',
      '.Dc7zOa_embeddedBody[data-content-phase="active"] .Dc7zOa_composerSeat::after {',
      "  content: ''; position: absolute; inset: 0; z-index: -1; pointer-events: none;",
      '  background-color: rgba(7, 16, 28, 0.94);',
      '  background-image:',
      '    linear-gradient(var(--hdd-grid-color-veiled) 1.5px, rgba(0, 0, 0, 0) 1.5px),',
      '    linear-gradient(90deg, var(--hdd-grid-color-veiled) 1.5px, rgba(0, 0, 0, 0) 1.5px);',
      '  background-size: 48px 48px, 48px 48px;',
      '  background-repeat: repeat, repeat;',
      '  background-attachment: fixed, fixed;',
      '  background-position: 0 0, 0 0;',
      '  -webkit-mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0) 0px, #000 40px);',
      '  mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0) 0px, #000 40px);',
      '}',
      /* No scrollbar on the transcript. The rail is the last thing on the screen
         that is not part of the HDD surface, so it is removed outright rather than
         re-tinted; wheel, trackpad, keyboard and drag-scrolling all still work. The
         reserved gutter goes with it — leaving `scrollbar-gutter: stable` on while
         hiding the rail would keep an empty strip down the right edge, which is the
         same band by another name. */
      '.Dc7zOa_scrollBody {',
      '  scrollbar-width: none !important;',
      '  scrollbar-gutter: auto !important;',
      '}',
      '.Dc7zOa_scrollBody::-webkit-scrollbar {',
      '  width: 0 !important; height: 0 !important; display: none !important;',
      '}',

      /* ---- ambient only: vignette, scan lines, slow sweep ----
         A slice-tear (the game's torn-screen transition, BV1k8jf6yELy) was built
         here and then dropped by request: on a surface people read text on it
         read as a malfunction. What remains never moves the transcript. */
      '.Dc7zOa_root::before {',
      "  content: ''; position: absolute; left: 0; right: 0; height: 26%; top: -26%; z-index: 5; pointer-events: none;",
      '  background-image: linear-gradient(to bottom, rgba(126, 220, 255, 0), rgba(126, 220, 255, 0.03) 45%, rgba(126, 220, 255, 0.065) 50%, rgba(126, 220, 255, 0.03) 55%, rgba(126, 220, 255, 0));',
      '  animation: hdd-sweep-down 16s linear infinite;',
      '}',
      '@keyframes hdd-sweep-down { from { top: -26%; } to { top: 100%; } }',
      '@media (prefers-reduced-motion: reduce) {',
      '  .Dc7zOa_root::after, .Dc7zOa_root::before { animation: none; }',
      '  .Dc7zOa_root::before { display: none; }',
      '}',
      /* Windows caption band. The window buttons are drawn natively by Electron,
         but their colours are NOT fixed: the Desktop preload measures
         `--dsw-specific-sidebar-fill` (background) and `--dsw-alias-label-primary`
         (symbol) and pushes them to the main process. This skin sets the sidebar
         fill transparent, so once that sync runs the caption goes transparent
         too and the buttons sit directly on the HDD substrate. Nothing is
         forced here — the band keeps the application's own value so it follows
         whatever the sync computes. */

      /* ---- type ----
         The game sets everything in an ultra-bold condensed face. That face
         (印品鸿蒙体) is miHoYo's licensed font and is deliberately NOT embedded
         here; the stack leans on the heaviest condensed faces Windows already
         ships, and Chinese falls through to YaHei, which synthesises weight at
         these settings. Weight and tightening carry the impression.
         The host's own face is restated rather than inherited because an
         earlier revision of this plugin forced monospace on the shell and a
         stale sheet from it can outlive a module swap. */
      'html body, html body button, html body input, html body textarea, html body select,',
      'html body [contenteditable="true"] {',
      '  font-family: "Bahnschrift SemiCondensed", Bahnschrift, "Arial Narrow", "Microsoft YaHei UI", "Microsoft YaHei", system-ui, sans-serif !important;',
      '  font-weight: 600 !important;',
      '  letter-spacing: -0.004em !important;',
      '}',
      /* Chrome reads heavier still: navigation, buttons and captions. */
      'html body button, html body [role="button"], html body [role="tab"],',
      'html body [role="menuitem"], html body summary {',
      '  font-weight: 800 !important;',
      '}',

      /* ---- sidebar brand ----
         Shell structure, read from ui-sidebar's own render code:
             div.logoRow > span.brandIdentity > span.brandName > [data-slot]
         The row (and its two wrappers) are fixed-height and clipped, and the
         New Session button sits below the row in normal flow. So the height
         knob goes on ALL THREE ancestors, not on the text cell: raising only
         the cell just spills text over the button instead of moving it.
         Growing the row is what reflows the button downwards. */
      '[data-hdd-brand-mark] { display: block; }',
      /* The top-left mark: the Fairy vector, static. Sized to the seat, and with every
         animation suppressed by rule as well as by construction — a static icon must
         stay static even if a shared motion selector is ever widened. */
      '[data-hdd-brand-mark][data-hdd-brand-static="true"] {',
      '  flex: none; line-height: 0;',
      '}',
      '[data-hdd-brand-mark][data-hdd-brand-static="true"] svg {',
      '  width: 100%; height: 100%; display: block;',
      /* The same faint blue lift the seat had before, so the icon still reads as a lit
         object on the dark substrate rather than as a flat sticker. */
      '  filter: drop-shadow(0 0 6px rgba(90, 160, 255, 0.55));',
      '}',
      '[data-hdd-brand-mark][data-hdd-brand-static="true"] *,',
      '[data-hdd-brand-mark][data-hdd-brand-static="true"] {',
      '  animation: none !important;',
      '}',
      '*:has(> [data-slot="sidebar.brand.name"]),',
      '*:has(> * > [data-slot="sidebar.brand.name"]),',
      '*:has(> * > * > [data-slot="sidebar.brand.name"]) {',
      '  height: auto !important;',
      '  min-height: var(--hdd-brand-row-height, 72px) !important;',
      '  max-height: none !important;',
      '  overflow: visible !important;',
      '  white-space: normal !important;',
      '  text-align: left !important;',
      '}',
      '[data-hdd-brand-name] {',
      '  display: flex; flex-direction: column; align-items: flex-start;',
      '  justify-content: center; gap: 2px; min-width: 0; line-height: 1;',
      '  text-align: left;',
      '}',
      /* Second knob: extra downward push on whatever the shell renders directly
         after the brand row (the New Session button and the nav stack below
         it). 0 by default — the row's own height does the work; this only
         exists so a single number can fine-tune the gap on request. */
      '*:has(> * > * > [data-slot="sidebar.brand.name"]) + * {',
      '  margin-top: var(--hdd-nav-shift, 0px) !important;',
      '}',
      '[data-hdd-brand-title] {',
      '  color: var(--dsw-alias-label-primary); font-size: 16px; font-weight: 900;',
      '  font-family: "Poppins Black", "Century Gothic", "Arial Black", "Microsoft YaHei UI", sans-serif;',
      '  letter-spacing: 0.01em; line-height: 1.15; white-space: nowrap;',
      '}',
      '[data-hdd-brand-sub] {',
      '  color: var(--dsw-alias-label-secondary); font-size: 10px; font-weight: 700;',
      '  letter-spacing: 0.01em; line-height: 1.15;',
      '  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;',
      '  transform: scaleX(1.06); transform-origin: left center;',
      '}',

      /* ---- 电费卡（侧栏底部）----
         Shape borrowed from the game's module plate (the「GIFTS」screenshot):
         rounded plate, caption flanked by dot-matrix fields, warning triangle
         overhanging the corner.
         Surface borrowed from THIS shell instead of from the game: a
         translucent dark-blue panel under a soft cyan edge. The first version
         used the game's solid grey plate and read as a foreign object in the
         sidebar. The warning is still not decoration — it appears only when the
         balance falls below the alert threshold. */
      '[data-hdd-meter] {',
      '  position: relative; flex: 1 1 100%; width: 100%; box-sizing: border-box;',
      '  margin: 6px 0; padding: 8px 10px 9px;',
      '  display: flex; flex-direction: column; gap: 5px;',
      '  border-radius: 10px;',
      '  background: linear-gradient(180deg, rgba(12, 30, 50, 0.72) 0%, rgba(8, 20, 34, 0.78) 100%);',
      '  border: 1px solid rgba(126, 220, 255, 0.20);',
      '  box-shadow: inset 0 1px 0 rgba(126, 220, 255, 0.10), 0 2px 8px rgba(0, 0, 0, 0.32);',
      '}',
      '[data-hdd-meter-head] { display: flex; align-items: center; justify-content: center; gap: 8px; }',
      '[data-hdd-meter-dots] {',
      '  flex: none; width: 15px; height: 8px;',
      '  background-image: radial-gradient(circle at 1px 1px, rgba(126, 220, 255, 0.55) 1px, rgba(0, 0, 0, 0) 1.2px);',
      '  background-size: 4px 4px;',
      '  background-repeat: repeat;',
      '  opacity: 0.8;',
      '}',
      '[data-hdd-meter-title] {',
      '  color: var(--hdd-cyan); font-size: 14px; font-weight: 900;',
      '  font-family: "Poppins Black", "Century Gothic", "Arial Black", "Microsoft YaHei UI", sans-serif;',
      '  letter-spacing: 0.1em; white-space: nowrap;',
      '}',
      '[data-hdd-meter-alert] {',
      '  position: absolute; left: 9px; top: -9px;',
      '  width: 22px; height: 19px; padding-bottom: 2px;',
      '  display: inline-flex; align-items: flex-end; justify-content: center;',
      '  background: #d8202a;',
      '  clip-path: polygon(50% 0%, 100% 100%, 0% 100%);',
      '  color: #16161a; font-size: 11px; font-weight: 900; line-height: 1;',
      '}',
      '[data-hdd-meter-row] {',
      '  display: flex; align-items: baseline; justify-content: space-between; gap: 8px;',
      '  padding: 3px 2px 0; line-height: 1.3;',
      '  border-top: 1px solid rgba(126, 220, 255, 0.14);',
      '}',
      '[data-hdd-meter-label] { color: var(--dsw-alias-label-secondary); font-size: 11px; font-weight: 800; white-space: nowrap; }',
      '[data-hdd-meter-value] {',
      '  color: var(--dsw-alias-label-primary); font-size: 15px; font-weight: 900; white-space: nowrap;',
      '  font-family: "Poppins Black", "Century Gothic", "Arial Black", "Microsoft YaHei UI", sans-serif;',
      '  letter-spacing: 0;',
      '  font-variant-numeric: tabular-nums;',
      '}',
      /* Collapsed rail: plate and caption go, the two figures stay. */
      '[data-hdd-meter][data-rail="true"] {',
      '  padding: 4px 0; margin: 0; gap: 2px; align-items: center;',
      '  background: none; border: 0; border-radius: 0; box-shadow: none;',
      '}',
      '[data-hdd-meter][data-rail="true"] [data-hdd-meter-head],',
      '[data-hdd-meter][data-rail="true"] [data-hdd-meter-label],',
      '[data-hdd-meter][data-rail="true"] [data-hdd-meter-alert] { display: none; }',
      '[data-hdd-meter][data-rail="true"] [data-hdd-meter-row] {',
      '  padding: 0; border: 0; justify-content: center;',
      '}',
      '[data-hdd-meter][data-rail="true"] [data-hdd-meter-value] {',
      '  margin-left: 0; font-size: 10px; color: var(--dsw-alias-label-secondary);',
      '}',
      /* Corner form: the figures as a pill pinned to the window's bottom-right,
         lifted clear of the status strip's text. It no longer needs to dodge a
         scrollbar, because the transcript's rail is hidden. */
      /* Inline form: sits in the composer row immediately left of the read-aloud
         control, and is built to read as its sibling — the same 26px height, the
         same stadium radius (forced, because the composer's own button rules
         otherwise win), the same hairline border and the same dark capsule surface.
         Width is free: this one carries words, that one carries bars. One family and
         one size for every glyph inside it, so 「剩余电费」 and its figure no longer
         look like two different labels. `corner-shape: round` is required for the
         same reason as everywhere else in this skin: the build's default corner
         shape is a superellipse, so the ends would not be true semicircles without
         it. */
      '[data-hdd-meter][data-compact="true"] {',
      '  flex: 0 0 auto !important; width: auto !important; margin: 0 !important;',
      '  display: inline-flex !important; flex-direction: row !important;',
      '  align-items: center !important; gap: 5px !important;',
      '  height: 26px !important; min-height: 26px !important; max-height: none !important;',
      '  align-self: center !important; vertical-align: middle !important;',
      '  padding: 0 12px !important; box-sizing: border-box !important;',
      '  border-radius: 999px !important;',
      '  clip-path: inset(0 round 999px);',
      '  corner-shape: round;',
      '  border: 1px solid rgba(255, 255, 255, 0.14) !important;',
      '  background: linear-gradient(180deg, #2c2c30 0%, #191919 100%) !important;',
      '  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 1px 3px rgba(0, 0, 0, 0.45);',
      '  white-space: nowrap;',
      '  font-family: inherit !important; font-size: 12px !important; line-height: 1 !important;',
      '}',
      /* Each piece of text is its own centred flex box rather than a run on the row
         baseline: Chinese and Latin have different vertical metrics, and letting them
         share a baseline is what made the line look off-centre in a 26px capsule.
         The warning plate is excluded: `height: 100% !important` here used to win
         over its own 13px, so the triangle grew to the full 26px capsule height
         while keeping its 15px width — a stretched, elongated triangle. */
      '[data-hdd-meter][data-compact="true"] > span:not([data-hdd-meter-alert]) {',
      '  display: inline-flex !important; align-items: center !important; justify-content: center !important;',
      '  height: 100% !important; line-height: 1 !important;',
      '}',
      '[data-hdd-meter][data-compact="true"] [data-hdd-meter-alert] {',
      '  position: static !important;',
      '  flex: 0 0 auto !important;',
      '  width: 15px !important; height: 13px !important; min-height: 0 !important;',
      '  aspect-ratio: 15 / 13;',
      '  padding-bottom: 1px; font-size: 9px;',
      '  align-self: center !important;',
      '  box-sizing: border-box !important;',
      '}',
      '[data-hdd-meter-c-label] {',
      '  color: rgba(186, 216, 240, 0.85); font-size: 12px; font-weight: 600;',
      '  font-family: inherit; line-height: 1;',
      '}',
      '[data-hdd-meter-c-value] {',
      '  color: #eaf4ff; font-size: 12px; font-weight: 800;',
      '  font-family: inherit; line-height: 1; font-variant-numeric: tabular-nums;',
      '}',

      /* ---- 朗读电平条（输入框右侧）----
         A dark pill with a red lamp and a bar waveform, following the game's
         audio strip. The lamp greys out and the bars dim when reading is off,
         and the bars move while a reply is being played. */
      '[data-hdd-voice] {',
      '  display: inline-flex; align-items: center; gap: 6px;',
      '  height: 24px; padding: 0 10px 0 9px; box-sizing: border-box;',
      '  border: 1px solid rgba(255, 255, 255, 0.14) !important;',
      '  background: linear-gradient(180deg, #2c2c30 0%, #191919 100%);',
      '  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.10), 0 1px 3px rgba(0, 0, 0, 0.45);',
      '  cursor: pointer; overflow: hidden;',
      '}',
      /* Stadium ends, three times defended. The pill was reading as a flat bar
         because the composer row squeezed its height — which also caps the corner
         radius, since a stadium radius is half the height. So height is forced as
         well, the button may not shrink in the flex row, and the clip-path shape
         says nothing about border-radius at all. */
      '[data-hdd-voice][data-hdd-voice] {',
      '  height: 26px !important;',
      '  min-height: 26px !important;',
      '  max-height: none !important;',
      '  flex: 0 0 auto !important;',
      '  align-self: center !important;',
      '  border-radius: 999px !important;',
      '  clip-path: inset(0 round 999px);',
      '  corner-shape: round;',
      '}',
      '[data-hdd-voice-dot] {',
      '  flex: none; width: 7px; height: 7px; border-radius: 50%;',
      '  corner-shape: round;',
      '  background: #ff3b30; box-shadow: 0 0 6px rgba(255, 59, 48, 0.8);',
      '}',
      '[data-hdd-voice-bars] { display: flex; align-items: center; gap: 2px; height: 16px; }',
      '[data-hdd-voice-bars] > i {',
      '  width: 2px; border-radius: 1px;',
      '  background: rgba(255, 255, 255, 0.88);',
      '  transform-origin: center;',
      '}',
      '[data-hdd-voice="off"] { opacity: 0.5; }',
      /* Engine state, spelled out: 未加载 / 加载中 / 就绪 / 释放中. The dot carries
         the same colour, and 加载中 pulses so a 30-second model load does not look
         like a dead button. */
      '[data-hdd-voice-engine-label] {',
      '  flex: none; font-size: 10px; line-height: 1; letter-spacing: 0.06em;',
      '  color: rgba(232, 242, 250, 0.72); white-space: nowrap;',
      '  font-variant-numeric: tabular-nums;',
      '}',
      '[data-hdd-voice-engine="ready"] [data-hdd-voice-dot] {',
      '  background: var(--hdd-cyan); box-shadow: 0 0 7px var(--hdd-cyan);',
      '}',
      '[data-hdd-voice-engine="starting"] [data-hdd-voice-dot] {',
      '  background: #ffc861; box-shadow: 0 0 7px rgba(255, 200, 97, 0.85);',
      '  animation: hdd-engine-pulse 1.1s ease-in-out infinite;',
      '}',
      '[data-hdd-voice-engine="starting"] [data-hdd-voice-engine-label] { color: #ffd98a; }',
      '[data-hdd-voice-engine="stopping"] [data-hdd-voice-dot] { background: #7f93a5; box-shadow: none; }',
      '[data-hdd-voice-engine="error"] [data-hdd-voice-dot] { background: #ff6b6b; box-shadow: 0 0 6px rgba(255, 107, 107, 0.8); }',
      '[data-hdd-voice-engine="error"] [data-hdd-voice-engine-label] { color: #ff9b9b; }',
      '[data-hdd-voice-engine="stopped"] [data-hdd-voice-dot] {',
      '  background: #6b7280; box-shadow: none;',
      '}',
      '@keyframes hdd-engine-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }',
      '@media (prefers-reduced-motion: reduce) {',
      '  [data-hdd-voice-engine="starting"] [data-hdd-voice-dot] { animation: none; }',
      '}',

      /* ---- Fairy's mark in the sidebar foot ----
         No frame: the container is transparent and only the mark and the light it
         gives off remain, so it blends into whatever sits behind it. The launch
         animation reuses the same mark and the same animations (shared
         `data-hdd-mark-scope`). */
      '[data-hdd-mascot] {',
      '  flex: 1 1 100%; display: flex; justify-content: center; align-items: center;',
      /* Bottom padding lifts the mark off the sidebar's lower edge, as asked. */
      '  position: relative; padding: 12px 0 26px; box-sizing: border-box;',
      '  overflow: visible !important;',
      '  transition: opacity 0.25s ease-out;',
      '}',
      /* Only one Fairy on screen at a time. The sidebar keeps its own mark behind the
         launch overlay, and the flying copy lands exactly on top of it — which read as
         two Fairies. So the sidebar's copy is hidden for the whole launch and faded
         back in on the frame the flying one arrives. Hidden by OPACITY, never by
         `display`: the flight aims at this element's measured rectangle, and a
         display:none element has none. */
      'html[data-hdd-boot-active="true"] [data-hdd-mascot] {',
      '  opacity: 0 !important;',
      '}',
      /* Always square, and 260px across. As a flex item this used to be free to
         shrink: a narrow sidebar squeezed its WIDTH while the height stayed fixed, so
         the box became a rectangle. The mark is an SVG and keeps its own aspect
         ratio, which is why the emblem still looked round — but the ring is a CSS
         border and followed the box, so it came out a rounded rectangle. width plus
         aspect-ratio pins it, and flex: 0 0 auto stops the squeeze in the first place.
         Height is deliberately NOT declared: declaring it is what allowed the
         mismatch. */
      '[data-hdd-mascot-stage] {',
      '  position: relative; flex: 0 0 auto !important;',
      '  width: min(224px, 100%); aspect-ratio: 1 / 1; height: auto;',
      '  max-width: 260px;',
      '}',
      /* A wider, softer bloom than the panel had, since it is now the only thing
         separating the mark from the sidebar behind it. Measured from the inscribed
         circle: a bare `circle` sizes itself to the farthest CORNER, which pushed
         the end of the gradient outside the element. `corner-shape: round` is not
         decoration either — this build's default corner shape is a superellipse, so
         a 50% radius renders as a rounded square unless it is stated. */
      '[data-hdd-mascot-bloom] {',
      '  position: absolute; inset: -14%; border-radius: 50%;',
      '  corner-shape: round;',
      '  background: radial-gradient(circle closest-side, rgba(150, 200, 255, 0.34) 0%, rgba(80, 150, 255, 0.22) 32%, rgba(56, 116, 255, 0.09) 55%, rgba(0, 0, 0, 0) 74%);',
      '  animation: hdd-mascot-bloom 3s ease-in-out infinite;',
      '}',
      /* One ring at a time: a pale white halo with its own glow, thrown outward from
         the mark and fading as it goes. Three things here were measured, not guessed.
         `corner-shape: round` is required or the ring renders as a rounded square.
         The box is inset 15% so the ring at full scale stays inside the stage — a
         larger one ran past the sidebar's width, was clipped left and right and read
         as a rounded rectangle all over again. And the blur is deliberate: a hard
         ring looked like a drawn outline rather than light, so the border is a touch
         stronger to survive it. The start scale is 1.08 rather than 0.6 so the wave
         emerges from under the mark instead of appearing behind it. */
      '[data-hdd-mascot-stage]::before {',
      "  content: ''; position: absolute; inset: 17%; border-radius: 50%;",
      '  corner-shape: round;',
      '  border: 5px solid rgba(236, 246, 255, 0.85);',
      '  box-shadow: 0 0 24px rgba(198, 230, 255, 0.72), inset 0 0 18px rgba(198, 230, 255, 0.5);',
      '  filter: blur(3px);',
      /* 0.38 rather than 0. The halo is lit by its animation, so anything that stops it —
         a stale module, a paused document, a reduced-motion setting — made it vanish
         outright instead of merely standing still. Faintly visible at rest, and the pulse
         brightens it to full. */
      '  opacity: 0.52;',
      '  animation: hdd-mascot-ripple 3.4s ease-out infinite;',
      '}',
      '[data-hdd-mascot-mark] { position: absolute; inset: 11%; }',
      /* One band per strip, each with its own displacement. Frame-by-frame study of
         the cutscene settled the details: every slice jumps AT THE SAME INSTANT and
         each moves by its own amount, the whole thing lasts about one frame at
         30fps, and it recurs roughly every 3.6s. So there is no delay stagger here
         (that produced a travelling wave instead of a shatter) — the per-band offset
         comes from --hdd-shift, and the keyframes leave only ~2.4% of the cycle for
         the burst, which is 86ms. */
      /* The whole mark: always visible, never sliced, so it can never show a seam. */
      '[data-hdd-mascot-whole] {',
      '  position: absolute; inset: 0;',
      '  animation: hdd-mascot-whole 3.6s steps(1, end) infinite;',
      '}',
      '[data-hdd-mascot-whole] svg { width: 100%; height: 100%; display: block; }',
      '@keyframes hdd-mascot-whole {',
      '  0%, 96% { opacity: 1; }',
      '  96.2%, 98.3% { opacity: 0; }',
      '  98.5%, 100% { opacity: 1; }',
      '}',
      '@keyframes hdd-mascot-slices {',
      '  0%, 96% { opacity: 0; }',
      '  96.2%, 98.3% { opacity: 1; }',
      '  98.5%, 100% { opacity: 0; }',
      '}',      '[data-hdd-mascot-band] {',
      '  position: absolute; inset: 0;',
      '  opacity: 0;',
      '  animation: hdd-mascot-slice 3.6s steps(1, end) infinite, hdd-mascot-slices 3.6s steps(1, end) infinite;',
      '  will-change: transform;',
      '}',
      '[data-hdd-mascot-band] svg { width: 100%; height: 100%; display: block; }',
      '@keyframes hdd-mascot-bloom {',
      '  0%, 100% { opacity: 0.7; transform: scale(1); }',
      '  50% { opacity: 1; transform: scale(1.06); }',
      '}',
      '@keyframes hdd-mascot-ripple {',
      '  0% { transform: scale(1.02); opacity: 0.38; }',
      '  18% { opacity: 1; }',
      '  66% { opacity: 0.58; }',
      '  100% { transform: scale(1.72); opacity: 0.15; }',
      '}',
      /* The tear: one frame of shattered picture, then one of recovery. */
      '@keyframes hdd-mascot-slice {',
      '  0%, 96% { transform: translateX(0); filter: none; }',
      '  96.2% { transform: translateX(var(--hdd-shift, 0px)); filter: brightness(1.5) saturate(1.5); }',
      '  97.4% { transform: translateX(calc(var(--hdd-shift, 0px) * -0.35)); filter: brightness(1.12); }',
      '  98.4%, 100% { transform: translateX(0); filter: none; }',
      '}',
      '[data-hdd-mark-scope] #hddFairyCorners {',
      '  transform-box: view-box; transform-origin: 80px 80px;',
      '  animation: hdd-mascot-turn 3s linear infinite;',
      '}',
      '[data-hdd-mark-scope] #hddFairySclera,',
      '[data-hdd-mark-scope] #hddFairyIrisOuter,',
      '[data-hdd-mark-scope] #hddFairyIrisBlue,',
      '[data-hdd-mark-scope] #hddFairyPupil,',
      '[data-hdd-mark-scope] #hddFairyHighlight {',
      '  transform-box: view-box; transform-origin: 80px 80px;',
      '  animation-duration: 1.5s; animation-iteration-count: infinite;',
      '  animation-timing-function: cubic-bezier(0.72, 0, 0.28, 1);',
      '}',
      '[data-hdd-mark-scope] #hddFairySclera { animation-name: hdd-mascot-sclera; }',
      '[data-hdd-mark-scope] #hddFairyIrisOuter { animation-name: hdd-mascot-iris-outer; animation-delay: -47ms; }',
      '[data-hdd-mark-scope] #hddFairyIrisBlue { animation-name: hdd-mascot-iris-blue; animation-delay: -94ms; }',
      '[data-hdd-mark-scope] #hddFairyHighlight { animation-name: hdd-mascot-iris-blue; animation-delay: -94ms; }',
      '[data-hdd-mark-scope] #hddFairyPupil { animation-name: hdd-mascot-pupil; animation-delay: -188ms; }',
      /* Quarter turn: the corner brackets are 90-degree symmetric, so 12000ms reads
         as a 3000ms cycle. Breath values come from the published motion file. */
      '@keyframes hdd-mascot-turn { from { transform: rotate(0deg); } to { transform: rotate(90deg); } }',
      '@keyframes hdd-mascot-sclera { 0%, 100% { transform: scale(0.985); } 50% { transform: scale(0.91); } }',
      '@keyframes hdd-mascot-iris-outer { 0%, 100% { transform: scale(1); } 50% { transform: scale(0.90); } }',
      '@keyframes hdd-mascot-iris-blue { 0%, 100% { transform: scale(1); } 50% { transform: scale(0.87); } }',
      '@keyframes hdd-mascot-pupil { 0%, 100% { transform: scale(1); } 50% { transform: scale(0.85); } }',
      '[data-hdd-mascot][data-rail="true"] [data-hdd-mascot-stage] {',
      '  width: min(96px, 100%); aspect-ratio: 1 / 1; height: auto;',
      '}',

      /* ---- launch animation: the mark takes over from the video ----
         The clip is stopped right after its white flash and before its black tail
         (black starts at 13.00s). What replaces it is the backdrop the user drew,
         served from disk by the host half, with the mark enlarged over the bright
         part of it. That highlight's centre was measured off the image (centroid of
         the brightest 8%): 48.9% across, 50.4% down — so the mark sits there rather
         than wherever felt right.
         The order is what the user asked for: the backdrop fades out first, and only
         then does the mark gather, shrink and glide to exactly where the sidebar
         keeps its own copy. The overlay's black leaves with the image, so the flight
         finishes over the live interface instead of over a black screen. */
      '[data-hdd-boot-fairy] {',
      '  position: absolute; inset: 0; opacity: 0; pointer-events: none;',
      '}',
      /* Hidden until the hand-off, then faded in over the frozen frame. */
      '[data-hdd-boot-fairy][data-hdd-boot-visible="true"] {',
      '  animation: hdd-boot-fairy-in 0.5s ease-out forwards;',
      '}',
      '[data-hdd-boot-field] {',
      '  position: absolute; inset: 0; width: 100%; height: 100%;',
      '  object-fit: cover; display: block;',
      /* A dark blue base under the image: if the route ever fails, the hand-off
         still happens on a lit field instead of on bare black. */
      '  background-color: #07121f;',
      '  transition: opacity 1.15s ease-out;',
      '}',
      '[data-hdd-boot-field][data-hdd-boot-field-out="true"] { opacity: 0; }',
      /* The mark's seat inside the backdrop: pinned to the measured highlight. */
      '[data-hdd-boot-center] {',
      '  position: absolute; left: 48.9%; top: 50.4%;',
      '  width: min(34vw, 48vh); aspect-ratio: 1 / 1;',
      '  transform: translate(-50%, -50%);',
      '}',
      '[data-hdd-boot-holder] {',
      '  position: absolute; inset: 0;',
      '  transition: transform 0.42s cubic-bezier(0.4, 0, 0.3, 1);',
      '}',
      /* Stage one: gather slightly. Stage two: glide, on a long, soft curve. */
      '[data-hdd-boot-holder][data-hdd-boot-gather="true"] { transform: scale(0.86); }',
      '[data-hdd-boot-holder][data-hdd-boot-glide="true"] {',
      '  transition: transform 1.35s cubic-bezier(0.33, 0, 0.15, 1);',
      '}',
      '[data-hdd-boot-holder] svg { width: 100%; height: 100%; display: block; }',
      /* The flying copy carries the sidebar mark's own bloom, at the same size and
         colour, so the glow is already there when the hand-off happens. */
      '[data-hdd-boot-bloom] {',
      '  position: absolute; inset: -14%; border-radius: 50%;',
      '  corner-shape: round;',
      '  background: radial-gradient(circle closest-side, rgba(150, 200, 255, 0.34) 0%, rgba(80, 150, 255, 0.22) 32%, rgba(56, 116, 255, 0.09) 55%, rgba(0, 0, 0, 0) 74%);',
      '  animation: hdd-mascot-bloom 3s ease-in-out infinite;',
      '}',
      '[data-hdd-boot-fairy][data-hdd-boot-depart="true"] { animation: none; opacity: 1; }',
      /* The overlay's black leaves with the image so the flight happens over the
         interface itself. */
      '[data-hdd-boot][data-hdd-boot-clear="true"] {',
      '  background-color: transparent !important;',
      '  transition: background-color 1.15s ease-out;',
      '}',
      '@keyframes hdd-boot-fairy-in { from { opacity: 0; } to { opacity: 1; } }',
      '@media (prefers-reduced-motion: reduce) {',
      '  [data-hdd-boot-fairy][data-hdd-boot-visible="true"] { animation: none; opacity: 1; }',
      '  [data-hdd-boot-holder] { transition: none; }',
      '}',
      '@media (prefers-reduced-motion: reduce) {',
      '  [data-hdd-mascot] [data-hdd-mascot-bloom],',
      '  [data-hdd-mascot] [data-hdd-mascot-stage]::before,',
      '  [data-hdd-mascot] [data-hdd-mascot-band],',
      '  [data-hdd-mark-scope] #hddFairyCorners { animation: none; }',
      '  [data-hdd-mark-scope] #hddFairySclera, [data-hdd-mark-scope] #hddFairyIrisOuter,',
      '  [data-hdd-mark-scope] #hddFairyIrisBlue, [data-hdd-mark-scope] #hddFairyPupil,',
      '  [data-hdd-mark-scope] #hddFairyHighlight { animation: none; }',
      '}',
      '[data-hdd-voice="off"] [data-hdd-voice-dot] {',
      '  background: #7c7c82; box-shadow: none;',
      '}',
      '[data-hdd-voice-speaking="true"] [data-hdd-voice-bars] > i {',
      '  animation: hdd-voice-level 0.85s ease-in-out infinite;',
      '}',
      /* Staggered delays turn the pulse into a travelling wave. */
      '[data-hdd-voice-bars] > i:nth-child(3n) { animation-delay: 0.12s; }',
      '[data-hdd-voice-bars] > i:nth-child(3n + 1) { animation-delay: 0.24s; }',
      '[data-hdd-voice-bars] > i:nth-child(4n) { animation-delay: 0.36s; }',
      '@keyframes hdd-voice-level {',
      '  0%, 100% { transform: scaleY(0.45); }',
      '  50% { transform: scaleY(1); }',
      '}',
      '@media (prefers-reduced-motion: reduce) {',
      '  [data-hdd-voice-speaking="true"] [data-hdd-voice-bars] > i { animation: none; }',
      '}',

      /* ---- H.D.D pill in the session header ---- */
      '[data-hdd-pill] {',
      '  display: inline-flex; align-items: center; gap: 6px;',
      '  height: 24px; padding: 0 10px; box-sizing: border-box;',
      '  border: 1px solid var(--hdd-chip-border); border-radius: 999px;',
      '  background: var(--hdd-chip-bg); color: var(--hdd-chip-fg);',
      '  font-size: 11px; font-weight: 600; letter-spacing: 0.09em; white-space: nowrap;',
      '}',
      '[data-hdd-pill]::before {',
      "  content: ''; flex: none; width: 6px; height: 6px; border-radius: 50%;",
      '  background: var(--hdd-cyan); box-shadow: 0 0 7px var(--hdd-cyan);',
      '}',

      /* ---- emblem ---- */
      '[data-hdd-emblem] { display: block; }',
      '[data-hdd-emblem-plain] { filter: drop-shadow(0 0 6px rgba(64, 102, 240, 0.35)); }',
      '[data-hdd-emblem-hero] {',
      '  filter: drop-shadow(0 0 18px rgba(64, 102, 240, 0.32)) drop-shadow(0 6px 22px rgba(0, 0, 0, 0.28));',
      '  animation: hdd-float 5.2s ease-in-out infinite;',
      '}',
      '.hdd-emblem-rotor { transform-origin: 80px 80px; animation: hdd-spin 72s linear infinite; }',
      '.hdd-emblem-lid { transform-origin: 80px 80px; animation: hdd-blink 7.4s steps(1, end) infinite; }',
      '@keyframes hdd-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }',
      '@keyframes hdd-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }',
      '@keyframes hdd-blink {',
      '  0%, 92% { transform: scaleY(0); }',
      '  93%, 96% { transform: scaleY(1); }',
      '  97%, 100% { transform: scaleY(0); }',
      '}',
      '@media (prefers-reduced-motion: reduce) {',
      '  [data-hdd-emblem-hero], .hdd-emblem-rotor, .hdd-emblem-lid { animation: none; }',
      '}',

      /* ---- dark floor ----
         The application ships a light and a dark token pack and switches them by
         toggling `data-ds-dark-theme` on <body> (theme setting: light / dark /
         system). On a light machine none of the pack above covered the surfaces:
         the labels were already pale while everything this sheet does not name
         stayed white, so text vanished into the paper. The skin is a dark
         interface, so it asserts the dark pack in script (see forceDarkTheme)
         and hard-codes the few surfaces that paint their own light fill. */
      ':root, body, body[data-ds-dark-theme] { color-scheme: dark !important; }',
      '::selection { background: rgba(98, 212, 255, 0.38) !important; color: #06121f !important; }',
      '::selection * { color: #06121f !important; -webkit-text-fill-color: #06121f !important; }',
      /* Popovers, menus, dialogs, toasts: the elevated surfaces. Only the ink is
         asserted here — the fill belongs to the application's menu material,
         which is translucent and blurred (see the note on
         --dsw-menu-surface-fill). Painting a fill here would flatten that
         material back into a plain panel. */
      '[role="dialog"], [role="alertdialog"], [role="menu"], [role="listbox"], [role="tooltip"], [role="status"], [data-sonner-toast] {',
      '  color: var(--dsw-alias-label-primary) !important;',
      '}',
      /* Keep the glass, even if a component or a platform stylesheet dropped the
         blur: the menu material is what makes the popovers read as glass. */
      '[data-menu-material], [data-menu-material] > div[aria-hidden="true"],',
      '[role="menu"], [role="listbox"], [role="tooltip"], [data-sonner-toast], [role="dialog"][data-menu-material] {',
      '  -webkit-backdrop-filter: var(--dsw-menu-backdrop-filter, blur(40px) saturate(150%)) !important;',
      '  backdrop-filter: var(--dsw-menu-backdrop-filter, blur(40px) saturate(150%)) !important;',
      '}',
      '[role="menuitem"], [role="option"] { color: var(--dsw-alias-label-primary) !important; }',
      '[role="menuitem"]:hover, [role="option"]:hover, [role="option"][aria-selected="true"] {',
      '  background-color: var(--dsw-alias-interactive-bg-hover) !important;',
      '}',
      /* Code and tables are the classic hard-coded light surfaces. */
      'pre, pre code, .shiki, .shiki code {',
      '  background-color: var(--dsw-alias-markdown-code-block) !important;',
      '  color: var(--dsw-alias-label-primary) !important;',
      '}',
      'table th { background-color: var(--dsw-alias-bg-layer-3) !important; color: var(--dsw-alias-label-primary) !important; }',
      'table td { border-color: var(--dsw-alias-border-l2) !important; }',
      /* Anchors keep the palette link colour even where a component would use the
         browser default (dark blue on navy). */
      'a { color: var(--dsw-alias-link, var(--hdd-cyan)); }',

    ].join('\n');

    /* Emblem: blue outer disc, four rotating notches, white sclera, blue iris,
       pupil, glint, and a lid that blinks. Geometry is my own. */
    function Emblem(props) {
      const edge = props && Number(props.size) > 0 ? Number(props.size) : 128;
      const hero = Boolean(props && props.hero);
      const notches = [0, 90, 180, 270].map((deg) =>
        h('rect', {
          key: 'n' + deg,
          x: 66, y: 2, width: 28, height: 13, rx: 3,
          fill: '#2b3388',
          transform: 'rotate(' + deg + ' 80 80)',
        }),
      );
      return h(
        'svg',
        Object.assign(
          {
            'data-hdd-emblem': 'true',
            viewBox: '0 0 160 160',
            width: edge,
            height: edge,
            role: 'img',
            'aria-label': 'H.D.D',
          },
          hero ? { 'data-hdd-emblem-hero': 'true' } : { 'data-hdd-emblem-plain': 'true' },
        ),
        h(
          'defs',
          { key: 'defs' },
          h(
            'linearGradient',
            { id: 'hdd-outer', x1: '0', y1: '0', x2: '0.4', y2: '1' },
            h('stop', { offset: '0', stopColor: '#4053f0' }),
            h('stop', { offset: '.54', stopColor: '#3045dc' }),
            h('stop', { offset: '1', stopColor: '#3d50c8' }),
          ),
        ),
        h('g', { key: 'rotor', className: 'hdd-emblem-rotor' }, notches),
        h('circle', { key: 'disc', cx: 80, cy: 80, r: 70, fill: 'url(#hdd-outer)', stroke: '#f2fbff', strokeWidth: 3 }),
        h('circle', { key: 'sclera', cx: 80, cy: 80, r: 53, fill: '#eef0f5' }),
        h('circle', { key: 'iris-outer', cx: 80, cy: 80, r: 42, fill: '#9daee0' }),
        h('circle', { key: 'iris', cx: 80, cy: 80, r: 33, fill: '#317bcf' }),
        h('circle', { key: 'iris-edge', cx: 80, cy: 80, r: 24, fill: 'none', stroke: '#f5f8fd', strokeWidth: 1.2, opacity: 0.9 }),
        h('circle', { key: 'pupil', cx: 80, cy: 80, r: 17, fill: '#3b3d8a' }),
        h('circle', { key: 'glint', cx: 67, cy: 66, r: 6.5, fill: '#f5f8fd', opacity: 0.92 }),
        h('circle', { key: 'lid', className: 'hdd-emblem-lid', cx: 80, cy: 80, r: 54, fill: '#2b3388' }),
      );
    }

    /* Styles-only occupant: `shell.overlay` floats above the columns, so it
       must not paint a frame-wide background here.
       `href` + `precedence` make React hoist this sheet into <head>. That is
       not cosmetic: the Desktop preload re-syncs the native caption colours
       only when <head> mutates, so a sheet rendered in place leaves the window
       buttons painted with the palette from before this skin existed. */
    function StyleHost() {
      return h('style', { href: 'dsh-hdd-skin', precedence: 'hdd' }, CSS);
    }

    /* The brand seat asks for a square edge and sits inline in the hero. */
    function HeroMark(props) {
      const edge = props && Number(props.size) > 0 ? Number(props.size) : 96;
      return h(Emblem, { size: edge, hero: true });
    }

    function BrandMark(props) {
      /* The host asks for 24px; the mark is drawn a little larger on request. */
      const asked = props && Number(props.size) > 0 ? Number(props.size) : 24;
      const edge = Math.max(asked, 30);
      /* The same Fairy vector the sidebar mascot and the launch animation use, at
         last: this seat used to draw a different, older emblem, which is why the
         top-left icon did not match the mark everywhere else. Deliberately NOT given
         `data-hdd-mark-scope`, so none of the shared motion (corner rotation, eye
         breathing) applies here — this one is a static icon. The rotor and lid
         animations went with the old drawing. */
      return h('span', {
        'data-hdd-brand-mark': 'true',
        'data-hdd-brand-static': 'true',
        style: { width: edge + 'px', height: edge + 'px' },
        dangerouslySetInnerHTML: { __html: FAIRY_SVG },
      });
    }

    /* The brand-name cell clips to one line; the CSS above opens it so the role
       line can sit under the name as a second line. */
    const BRAND_ROLE = 'Ⅲ型总序式集成泛用人工智能';

    function BrandName() {
      return h(
        'span',
        { 'data-hdd-brand-name': 'true', title: BRAND_ROLE },
        h('span', { key: 'title', 'data-hdd-brand-title': 'true' }, 'Fairy'),
        h('span', { key: 'sub', 'data-hdd-brand-sub': 'true' }, BRAND_ROLE),
      );
    }

    /* The 电费 card. The host route owns both numbers; this only formats them
       and polls while the document is visible. */
    const METER_ENDPOINT = '/hdd-meter';
    const METER_REFRESH_MS = 30000;

    function formatCny(value) {
      if (!Number.isFinite(value)) return '—';
      const digits = Math.abs(value) >= 100 ? 1 : 2;
      return '¥' + value.toFixed(digits);
    }

    function MeterCard(props) {
      const rail = !(props && props.wide);
      const [data, setData] = React.useState(null);
      const [failed, setFailed] = React.useState(false);

      React.useEffect(() => {
        let live = true;
        let timer;

        const load = () => {
          fetch(METER_ENDPOINT, { headers: { accept: 'application/json' } })
            .then((response) => (response.ok ? response.json() : Promise.reject(new Error(String(response.status)))))
            .then((payload) => {
              if (!live) return;
              setData(payload);
              setFailed(false);
            })
            .catch(() => {
              if (live) setFailed(true);
            });
        };
        const stop = () => {
          if (timer !== undefined) {
            window.clearInterval(timer);
            timer = undefined;
          }
        };
        const start = () => {
          if (timer === undefined) timer = window.setInterval(load, METER_REFRESH_MS);
        };
        const onVisibility = () => {
          if (document.visibilityState === 'visible') {
            load();
            start();
          } else {
            stop();
          }
        };

        load();
        start();
        document.addEventListener('visibilitychange', onVisibility);
        return () => {
          live = false;
          stop();
          document.removeEventListener('visibilitychange', onVisibility);
        };
      }, []);

      const wallets = data && Array.isArray(data.balance) ? data.balance : [];
      const wallet = wallets.find((entry) => entry && entry.currency === 'CNY') || wallets[0];
      const balanceText = wallet ? formatCny(Number(wallet.balance)) : failed ? '—' : '读取中';
      const todayText = data ? formatCny(Number(data.today && data.today.costCny)) : failed ? '—' : '读取中';

      const row = (key, label, value) =>
        h(
          'div',
          { key, 'data-hdd-meter-row': 'true' },
          h('span', { key: 'label', 'data-hdd-meter-label': 'true' }, label),
          h('span', { key: 'value', 'data-hdd-meter-value': 'true' }, value),
        );

      const walletValue = wallet ? Number(wallet.balance) : NaN;
      /* The red triangle is the game's warning plate: shown only when the
         balance is actually low, never as decoration. */
      const low = Number.isFinite(walletValue) && walletValue < 10;

      /* Compact: the pill that rides beside the read-aloud control. Both figures
         carry their own label, and every glyph in the pill uses one family and one
         size. */
      if (props && props.compact) {
        return h(
          'div',
          {
            'data-hdd-meter': 'true',
            'data-compact': 'true',
            title: '剩余电费 ' + balanceText + '　今日电费 ' + todayText,
          },
          low ? h('span', { key: 'alert', 'data-hdd-meter-alert': 'true' }, '!') : null,
          h('span', { key: 'balance-label', 'data-hdd-meter-c-label': 'true' }, '剩余电费'),
          h('span', { key: 'balance-value', 'data-hdd-meter-c-value': 'true' }, balanceText),
          h('span', { key: 'today-label', 'data-hdd-meter-c-label': 'true' }, '今日电费'),
          h('span', { key: 'today-value', 'data-hdd-meter-c-value': 'true' }, todayText),
        );
      }

      return h(
        'div',
        {
          'data-hdd-meter': 'true',
          'data-rail': rail ? 'true' : 'false',
          title: 'HOLLOW DEEP DIVE METER',
        },
        low ? h('span', { key: 'alert', 'data-hdd-meter-alert': 'true' }, '!') : null,
        h(
          'div',
          { key: 'head', 'data-hdd-meter-head': 'true' },
          h('span', { key: 'dots-left', 'data-hdd-meter-dots': 'true' }),
          h('span', { key: 'title', 'data-hdd-meter-title': 'true' }, 'H.D.D'),
          h('span', { key: 'dots-right', 'data-hdd-meter-dots': 'true' }),
        ),
        row('balance', '电费余额', balanceText),
        row('today', '今日电费', todayText),
      );
    }

    /* Reference image: a small H.D.D pill sits at the right end of the session
       header row. Pure status chip — it carries no action. */
    function HddPill() {
      return h(
        'span',
        { 'data-hdd-pill': 'true', title: 'HOLLOW DEEP DIVE SYSTEM' },
        'H.D.D',
      );
    }

    /* ---- boot splash ----
       The desktop shell has no native splash phase of its own, so the Client
       module paints one over the app and takes it away again. It runs only on a
       genuine cold load (a module swap must never flash it), it can be skipped
       with a click or a key, and reduced-motion users never see it at all. */
    const BOOT_SEGMENTS = 24;
    const BOOT_DURATION_MS = 1700;
    const BOOT_HOLD_MS = 260;
    const BOOT_OUT_MS = 520;
    /* The clip is 14.5s; this only stops a stalled load from trapping anyone. */
    const BOOT_VIDEO_MAX_MS = 40000;
    /* Served by this bundle's host half, straight off disk. */
    const BOOT_VIDEO_URL = '/hdd-boot.mp4';
    /* The launch backdrop: the image the user drew, also served from disk. */
    const BOOT_FIELD_URL = '/hdd-boot-field';
    /* The clip's white flash ends here; its black tail runs from 13.00s to the end. */
    const BOOT_FAIRY_AT = 12.9;
    const BOOT_FAIRY_HOLD_MS = 1700;
    /* How long the backdrop takes to fade before the mark starts moving. */
    const BOOT_FAIRY_FIELD_OUT_MS = 1150;
    const BOOT_FAIRY_GATHER_MS = 430;
    const BOOT_FAIRY_FLY_MS = 1400;

    /* ---- the launch greeting ----
       Composed at launch time rather than stored, so it is never the same twice, but
       kept short on purpose: three sentences, or four when a closing remark fits.
       The shape is always the same — greet by the hour, report that the system is
       ready, then offer to take orders:
         主人，晚上好。系统已准备就绪。随时等待您的指令。 */
    function composeGreeting() {
      const hour = new Date().getHours();
      const pick = (list) => list[Math.floor(Math.random() * list.length)];

      const hello =
        hour < 5
          ? pick(['主人，夜深了。', '主人，这么晚还没休息。', '主人，深夜好。'])
          : hour < 11
            ? pick(['主人，早上好。', '主人，早安。', '早上好，主人。'])
            : hour < 14
              ? pick(['主人，中午好。', '主人，午安。', '中午好，主人。'])
              : hour < 18
                ? pick(['主人，下午好。', '主人，午后好。', '下午好，主人。'])
                : pick(['主人，晚上好。', '主人，晚上好呀。', '晚上好，主人。']);

      const ready = pick([
        '系统已准备就绪。',
        '全部模块自检完成，系统已就绪。',
        '各项服务均已就绪。',
        '初始化已经完成，一切正常。',
      ]);

      const offer = pick([
        '随时等待您的指令。',
        'Fairy 在此待命。',
        '听候主人吩咐。',
        '有什么需要，主人吩咐一声就好。',
      ]);

      const sentences = [hello, ready, offer];
      /* A fourth sentence occasionally, so the rhythm is not identical every time. */
      if (Math.random() < 0.5) {
        sentences.push(
          pick([
            '今天也由我陪着主人。',
            '电费与任务我都会盯着。',
            '主人尽管忙，这边交给我。',
          ]),
        );
      }
      return sentences.join('');
    }

    /* Preparing the greeting while the clip is still playing. Synthesis is not
       instant, so firing the request only at the hand-off would make Fairy start
       talking after the moment she is supposed to greet from. The audio is fetched
       early, and DECODED into an audio buffer rather than left as a blob. A decoded
       buffer played on the shared context starts on the frame it is asked to start:
       no element start-up, no decode, no scheduling slip. If preparation fails the
       normal path is used at the cue, which still speaks, just later. */
    const greeting = { text: '', buffer: null, url: null, busy: false, ready: false };

    function prepareGreeting() {
      if (greeting.ready || greeting.busy) return;
      greeting.busy = true;
      if (!greeting.text) greeting.text = composeGreeting();
      fetchPart(greeting.text)
        .then((response) => (response && response.ok ? response.arrayBuffer() : null))
        .then((bytes) => {
          if (!bytes) return null;
          /* Keep the raw bytes playable as a blob as well as decoded. If the shell
             refuses to give this skin an AudioContext, the blob still starts on cue
             through an <audio> element instead of falling back to synthesising the
             line again — which is what made the earlier attempts feel late. */
          greeting.url = URL.createObjectURL(new Blob([bytes], { type: 'audio/wav' }));
          const context = streamContext();
          if (!context) return null;
          /* decodeAudioData also resamples the service's 32kHz output to the device
             rate, which is exactly the work that must not happen at the cue. */
          return new Promise((resolve) => {
            const done = (buffer) => resolve(buffer || null);
            try {
              const pending = context.decodeAudioData(bytes.slice(0), done, () => done(null));
              if (pending && typeof pending.then === 'function') pending.then(done, () => done(null));
            } catch (error) {
              done(null);
            }
          });
        })
        .then((buffer) => {
          if (buffer) greeting.buffer = buffer;
          if (buffer || greeting.url) greeting.ready = true;
        })
        .catch(() => {
          /* Falls through to the on-cue path, which does its own fetching. */
        })
        .then(() => {
          greeting.busy = false;
        });
    }

    function playGreeting() {
      if (!greeting.text) greeting.text = composeGreeting();
      const context = streamContext();
      if (greeting.buffer && context) {
        const node = context.createBufferSource();
        node.buffer = greeting.buffer;
        node.connect(context.destination);
        /* Scheduled a hair ahead on the audio clock: still immediate to the ear, but
           not late, which is what a zero lead can produce. */
        node.start(context.currentTime + 0.02);
        streamer.nodes.push(node);
        setVoiceSpeaking(true);
        setVoiceDiag('greet-ready');
        window.setTimeout(
          () => setVoiceSpeaking(false),
          (greeting.buffer.duration + 0.2) * 1000,
        );
        return;
      }
      if (greeting.url) {
        const audio = new Audio(greeting.url);
        voiceAudio = audio;
        audio.addEventListener('ended', () => setVoiceSpeaking(false));
        setVoiceSpeaking(true);
        setVoiceDiag('greet-blob');
        const playback = audio.play();
        if (playback && typeof playback.catch === 'function') {
          playback.catch(() => speakNow(greeting.text, 'hdd-boot-greeting', true));
        }
        return;
      }
      speakNow(greeting.text, 'hdd-boot-greeting', true);
    }

    function mountBootSplash(ctx) {
      if (typeof document === 'undefined' || typeof window === 'undefined') return;
      if (window.__hddBootShown === true) return;
      /* A cold load reaches this within a second; a swapped module does not. */
      if (window.performance && window.performance.now() > 4000) return;
      const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduced) return;
      window.__hddBootShown = true;

      const root = document.createElement('div');
      root.setAttribute('data-hdd-boot', 'true');

      const video = document.createElement('video');
      video.setAttribute('data-hdd-boot-video', 'true');
      /* Sound ON. This shell is an Electron client and does not set
         autoplayPolicy, so Electron's default (no-user-gesture-required) lets a
         clip start with audio. `play()` is still guarded below: if some future
         build does enforce a gesture, the animation continues silently rather
         than not at all. */
      video.autoplay = true;
      video.volume = 1;
      video.playsInline = true;
      video.setAttribute('playsinline', '');
      video.preload = 'auto';
      video.src = BOOT_VIDEO_URL;
      root.appendChild(video);

      /* The mark takes over where the clip stops: enlarged over the backdrop's
         highlight, then shrinking into the sidebar's own mark. */
      const fairy = document.createElement('div');
      fairy.setAttribute('data-hdd-boot-fairy', 'true');
      const field = document.createElement('img');
      field.setAttribute('data-hdd-boot-field', 'true');
      field.setAttribute('alt', '');
      field.setAttribute('aria-hidden', 'true');
      field.src = BOOT_FIELD_URL;
      const center = document.createElement('div');
      center.setAttribute('data-hdd-boot-center', 'true');
      const holder = document.createElement('div');
      holder.setAttribute('data-hdd-boot-holder', 'true');
      holder.setAttribute('data-hdd-mark-scope', 'true');
      holder.innerHTML = FAIRY_SVG;
      /* The same bloom the sidebar's mark has, inside the flying copy: without it the
         glow appears out of nowhere the moment the overlay is dropped, which reads as
         another small jump even when the two marks are the same size. */
      const bloom = document.createElement('span');
      bloom.setAttribute('data-hdd-boot-bloom', 'true');
      holder.insertBefore(bloom, holder.firstChild);
      center.appendChild(holder);
      fairy.appendChild(field);
      fairy.appendChild(center);
      root.appendChild(fairy);

      document.body.appendChild(root);

      /* From here until the flight lands, the sidebar's own mark stays hidden, so the
         launch shows exactly one Fairy. The attribute lives on the root element so a
         single rule covers the mark, its bloom and its ring. */
      const bootHost = document.documentElement;
      bootHost.setAttribute('data-hdd-boot-active', 'true');

      /* The greeting is requested the moment the splash exists, not seconds into the
         clip. Its synthesis may have to wait for the voice service to finish loading
         its model — up to a minute on a cold start — so the earlier the request is
         queued, the more likely the decoded buffer is sitting ready when the mark
         appears in the middle of the screen. */
      prepareGreeting();

      let closed = false;
      let departed = false;
      let greeted = false;
      let stopPlate = null;
      const timers = [];
      const close = () => {
        if (closed) return;
        closed = true;
        video.pause();
        root.setAttribute('data-hdd-boot-out', 'true');
        timers.push(window.setTimeout(() => root.remove(), BOOT_OUT_MS));
      };

      /* Hand the screen to the mark: stop the clip on its white flash (black runs
         from 13.00s), hold the mark centred, then fly it to wherever the sidebar
         keeps its own mark and drop the overlay there. The two marks coincide at
         that moment, so removing the overlay is invisible. */
      const depart = () => {
        if (departed || closed) return;
        departed = true;
        video.pause();
        /* The frozen frame must not reappear once the backdrop fades, since the
           backdrop is now an opaque image over it rather than a solid colour. */
        video.style.display = 'none';
        fairy.setAttribute('data-hdd-boot-visible', 'true');
        /* The clip has stopped and the mark is appearing in the middle of the screen:
           this is the cue, as asked. The greeting's audio was prepared and decoded
           when the splash mounted, so this moment is the sound itself rather than the
           start of a request. The line is composed fresh each launch and is forced:
           the greeting belongs to the launch rather than to reading replies, so it
           plays even with read-aloud switched off. */
        if (!greeted) {
          greeted = true;
          try {
            playGreeting();
          } catch (error) {
            setVoiceDiag('greet-err');
          }
        }
        timers.push(
          window.setTimeout(() => {
            /* Backdrop first, exactly as asked: it fades, and the overlay's black
               goes with it so the flight happens over the live interface. */
            field.setAttribute('data-hdd-boot-field-out', 'true');
            root.setAttribute('data-hdd-boot-clear', 'true');
            timers.push(
              window.setTimeout(() => {
                /* Only now does the mark gather and go home. */
                holder.setAttribute('data-hdd-boot-gather', 'true');
                timers.push(
                  window.setTimeout(() => {
                    /* Land on the sidebar's own mark, not on its stage: the mark sits
                       inset inside the stage (78% of it), so matching the stage would
                       make the flying copy visibly larger and then snap smaller the
                       moment the overlay is dropped. */
                    const target =
                      document.querySelector('[data-hdd-mascot-mark]') ||
                      document.querySelector('[data-hdd-mascot-stage]');
                    if (target) {
                      const from = holder.getBoundingClientRect();
                      const to = target.getBoundingClientRect();
                      /* offsetWidth, NOT from.width. The gather step has already
                         scaled this element to 86%, and getBoundingClientRect reports
                         the TRANSFORMED box, so dividing by it made the flying copy
                         land roughly 16% too large and then snap the instant the
                         overlay was dropped. The layout width is transform-free. The
                         centre is still read from the rect, which the gather does not
                         move because the transform origin is the element's own centre. */
                      const fromWidth = holder.offsetWidth || from.width;
                      if (fromWidth > 0 && to.width > 0) {
                        const scale = to.width / fromWidth;
                        const shiftX = to.left + to.width / 2 - (from.left + from.width / 2);
                        const shiftY = to.top + to.height / 2 - (from.top + from.height / 2);
                        holder.setAttribute('data-hdd-boot-glide', 'true');
                        holder.style.transform =
                          'translate(' + shiftX.toFixed(1) + 'px, ' + shiftY.toFixed(1) + 'px) scale(' + scale.toFixed(4) + ')';
                      }
                    }
                    fairy.setAttribute('data-hdd-boot-depart', 'true');
                    timers.push(
                      window.setTimeout(() => {
                        if (closed) return;
                        closed = true;
                        /* The flying copy has landed on the sidebar's mark, so the
                           sidebar's copy may come back — released in the same frame
                           that the overlay starts fading, which makes the hand-off a
                           cross-fade between two identical marks. */
                        bootHost.removeAttribute('data-hdd-boot-active');
                        root.style.transition = 'opacity 0.4s ease-out';
                        root.style.opacity = '0';
                        timers.push(window.setTimeout(() => root.remove(), 440));
                      }, BOOT_FAIRY_FLY_MS),
                    );
                  }, BOOT_FAIRY_GATHER_MS),
                );
              }, BOOT_FAIRY_FIELD_OUT_MS),
            );
          }, BOOT_FAIRY_HOLD_MS),
        );
      };

      video.addEventListener('timeupdate', () => {
        if (!departed && video.currentTime >= BOOT_FAIRY_AT) depart();
      });

      /* The animation is not skippable: it plays to its end, and the only other
         ways out are the clip ending or the backstop below, which exists so a
         stalled load can never leave the user staring at a black screen. */
      timers.push(window.setTimeout(close, BOOT_VIDEO_MAX_MS));

      video.addEventListener('loadeddata', () => root.setAttribute('data-hdd-boot-ready', 'true'));
      video.addEventListener('ended', close);
      video.addEventListener('error', () => {
        /* No route, no file, or a codec the shell refuses: draw the plate
           instead of showing an empty screen. */
        if (stopPlate) return;
        video.remove();
        stopPlate = paintBootPlate(root, close, timers);
      });

      const playback = video.play();
      if (playback && typeof playback.catch === 'function') {
        playback.catch(() => {
          /* A stricter shell refused audio: keep the animation, drop the sound. */
          video.muted = true;
          const retry = video.play();
          if (retry && typeof retry.catch === 'function') retry.catch(() => {});
        });
      }

      ctx.effect(
        () => () => {
          timers.forEach((id) => window.clearTimeout(id));
          if (stopPlate) stopPlate();
          root.remove();
          /* Never leave the sidebar's mark hidden if the launch is torn down early. */
          bootHost.removeAttribute('data-hdd-boot-active');
        },
        'hdd-boot-cleanup',
      );
    }

    /* Drawn fallback for when the clip cannot play. Returns its own cleanup. */
    function paintBootPlate(root, close, timers) {
      const plate = document.createElement('div');
      plate.setAttribute('data-hdd-boot-plate', 'true');
      plate.innerHTML =
        '<div data-hdd-boot-head>' +
        '<span data-hdd-boot-rec></span>' +
        '<span data-hdd-boot-title>H.D.D</span>' +
        '<span data-hdd-boot-tag>HOLLOW DEEP DIVE SYSTEM</span>' +
        '</div>' +
        '<div data-hdd-boot-log>' +
        '<span>初始化空洞深潜系统</span>' +
        '<span>校验代理人生体特征</span>' +
        '<span>建立以太链路</span>' +
        '<span>同步历史数据库</span>' +
        '</div>' +
        '<div data-hdd-boot-bar></div>' +
        '<div data-hdd-boot-foot><span data-hdd-boot-pct>0%</span><span>FAIRY Ⅲ</span></div>';
      root.appendChild(plate);

      const bar = plate.querySelector('[data-hdd-boot-bar]');
      const lines = plate.querySelectorAll('[data-hdd-boot-log] > span');
      const pct = plate.querySelector('[data-hdd-boot-pct]');
      const cells = [];
      for (let index = 0; index < BOOT_SEGMENTS; index += 1) {
        const cell = document.createElement('i');
        cells.push(cell);
        bar.appendChild(cell);
      }

      const started = Date.now();
      const timer = window.setInterval(() => {
        const progress = Math.min(1, (Date.now() - started) / BOOT_DURATION_MS);
        const filled = Math.round(BOOT_SEGMENTS * progress);
        for (let index = 0; index < cells.length; index += 1) {
          cells[index].setAttribute('data-on', index < filled ? 'true' : 'false');
        }
        for (let index = 0; index < lines.length; index += 1) {
          const at = (index + 0.5) / (lines.length + 0.5);
          lines[index].setAttribute('data-on', progress >= at ? 'true' : 'false');
        }
        pct.textContent = Math.round(progress * 100) + '%';
        if (progress >= 1) {
          window.clearInterval(timer);
          timers.push(window.setTimeout(close, BOOT_HOLD_MS));
        }
      }, 60);

      return () => window.clearInterval(timer);
    }

    /* ---- read every reply aloud ----
       The text comes from the host half, which already sees every committed
       `assistant/message`, and reaches the browser over `/hdd-voice`.
       An earlier revision tried to reconstruct the reply from the rendered DOM
       via the `conversation.chat.assistant-actions` seat; it was abandoned
       because the action row and the message body do not share the ancestor that
       extractor assumed, which read either nothing or the whole transcript.
       Markdown and code are stripped, and speech goes through the OS voice
       (`speechSynthesis`) — local, no API cost.
       History is never read: the first poll only records the current reply, and a
       session switch restarts that priming. */
    const VOICE_KEY = 'hdd.voice';
    const VOICE_SETTLE_MS = 2500;
    /* Served by this bundle's host half. */
    const VOICE_FEED_URL = '/hdd-voice';
    const spoken = new Set();

    /* Stage record for the read-aloud path. It has no UI: the header chip that
       displayed it was removed once reading was confirmed, and this sink stays
       because it costs nothing and gives a place to look during a future
       regression. */
    const voiceDiag = { value: 'v?', trail: [], listeners: new Set() };

    /* Keep a short trail instead of the latest value only: overwriting hid the
       intermediate failure and left just `sys`, which says nothing about why. */
    function shortenVoiceDiag(value) {
      return String(value)
        .replace('http', 'h')
        .replace('errNotAllowedError', 'eNA')
        .replace('errAbortError', 'eAB')
        .replace('errNotSupportedError', 'eNS')
        .replace('errTypeError', 'eTY')
        .replace('err', 'e')
        .replace('fairy', 'f')
        .replace('retry', 'rt')
        .replace('empty', 'em');
    }

    function setVoiceDiag(value) {
      const short = shortenVoiceDiag(value);
      const last = voiceDiag.trail[voiceDiag.trail.length - 1];
      if (short !== last) {
        voiceDiag.trail.push(short);
        if (voiceDiag.trail.length > 4) voiceDiag.trail.shift();
      }
      voiceDiag.value = voiceDiag.trail.join('>');
      voiceDiag.listeners.forEach((listener) => listener(voiceDiag.value));
    }

    /* Chromium refuses programmatic audio until the document has been interacted
       with, which is exactly how an automatic read-aloud ends up on the OS voice
       without any error the user can see. One silent play on the first gesture
       unlocks the document for the rest of the session. */
    function installVoiceUnlock(ctx) {
      let unlocked = false;
      const unlock = () => {
        if (unlocked) return;
        unlocked = true;
        try {
          const silence = new Audio(
            'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAgD4AAAB9AAACABAAZGF0YQAAAAA=',
          );
          silence.volume = 0;
          const started = silence.play();
          if (started && typeof started.catch === 'function') started.catch(() => {});
        } catch (error) {
          /* nothing to unlock */
        }
        document.removeEventListener('pointerdown', unlock, true);
        document.removeEventListener('keydown', unlock, true);
      };
      document.addEventListener('pointerdown', unlock, true);
      document.addEventListener('keydown', unlock, true);
      ctx.effect(
        () => () => {
          document.removeEventListener('pointerdown', unlock, true);
          document.removeEventListener('keydown', unlock, true);
        },
        'hdd-voice-unlock',
      );
    }

    function voiceEnabled() {
      try {
        /* Explicit opt-in: flipping this switch is what loads a multi-gigabyte
           model, so "no preference yet" must mean off. */
        return window.localStorage.getItem(VOICE_KEY) === 'on';
      } catch (error) {
        return false;
      }
    }

    function setVoiceEnabled(next) {
      try {
        window.localStorage.setItem(VOICE_KEY, next ? 'on' : 'off');
      } catch (error) {
        /* Storage unavailable: the choice simply does not persist. */
      }
      if (!next) {
        stopVoice();
        if (typeof window.speechSynthesis !== 'undefined') window.speechSynthesis.cancel();
        releaseEngine();
      } else {
        ensureEngine();
      }
    }

    /* ---- voice engine ----
       The model is not resident any more. Enabling the reader asks the host to
       load it (POST /hdd-engine?action=start), disabling it asks the host to
       release it (?action=stop), and a GET mirrors the host's answer so the pill
       can say what is actually happening instead of guessing. Loading takes tens
       of seconds; the pill shows 加载中 for as long as the host says "starting",
       and replies that arrive in that window are skipped rather than read in the
       wrong voice. */
    const ENGINE_URL = '/hdd-engine';
    const engineState = { value: { state: 'stopped', port: false }, listeners: new Set() };
    let enginePoll = null;

    function setEngineState(next) {
      const previous = engineState.value;
      if (previous && previous.state === next.state) {
        engineState.value = next;
        return;
      }
      engineState.value = next;
      engineState.listeners.forEach((listener) => listener(next));
    }

    async function engineStatus() {
      try {
        const response = await fetch(ENGINE_URL, { headers: { accept: 'application/json' } });
        if (!response.ok) return null;
        const data = await response.json();
        setEngineState(data);
        return data;
      } catch (error) {
        return null;
      }
    }

    function watchEngine() {
      if (enginePoll) return;
      enginePoll = window.setInterval(async () => {
        const data = await engineStatus();
        if (!data || (data.state !== 'starting' && data.state !== 'stopping')) {
          window.clearInterval(enginePoll);
          enginePoll = null;
        }
      }, 2000);
    }

    async function ensureEngine() {
      if (engineState.value.state === 'ready') return engineState.value;
      /* Optimistic: the host takes a moment to answer, and the pill should say
         加载中 the instant the switch is flipped. */
      setEngineState({ ...engineState.value, state: 'starting' });
      watchEngine();
      try {
        const response = await fetch(ENGINE_URL + '?action=start', { method: 'POST' });
        if (!response.ok) return null;
        const data = await response.json();
        setEngineState(data);
        return data;
      } catch (error) {
        setEngineState({ state: 'error', error: String(error) });
        return null;
      }
    }

    async function releaseEngine() {
      setEngineState({ ...engineState.value, state: 'stopping' });
      try {
        const response = await fetch(ENGINE_URL + '?action=stop', { method: 'POST' });
        if (!response.ok) return null;
        const data = await response.json();
        setEngineState(data);
        return data;
      } catch (error) {
        setEngineState({ state: 'error', error: String(error) });
        return null;
      }
    }

    function pickVoice() {
      const synth = window.speechSynthesis;
      if (!synth) return null;
      const voices = synth.getVoices() || [];
      const preferred = ['Xiaoxiao', 'Huihui', 'Yaoyao', 'Kangkang', 'Yunxi', 'zh-CN', 'zh_CN', 'Chinese'];
      for (let index = 0; index < preferred.length; index += 1) {
        const needle = preferred[index];
        const hit = voices.find((voice) => (voice.name + ' ' + voice.lang).indexOf(needle) >= 0);
        if (hit) return hit;
      }
      return voices.find((voice) => (voice.lang || '').toLowerCase().indexOf('zh') === 0) || null;
    }

    /* Markdown and code are noise once spoken, and so are Roman numerals: the engine
       reads Ⅲ as letters or skips it, while the persona uses it as a class number.
       Spelling it out is what makes "Ⅲ型" come back as "三型". */
    function speakableText(raw) {
      return String(raw)
        .replace(/Ⅲ/g, '三')
        .replace(/Ⅱ/g, '二')
        .replace(/Ⅰ/g, '一')
        .replace(/Ⅳ/g, '四')
        .replace(/Ⅴ/g, '五')
        .replace(/Ⅵ/g, '六')
        .replace(/```[\s\S]*?```/g, ' ')
        .replace(/`[^`]*`/g, ' ')
        .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
        .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
        .replace(/^\s*\|.*$/gm, ' ')
        .replace(/^\s*[-*+]\s+/gm, '')
        .replace(/^\s*#{1,6}\s*/gm, '')
        .replace(/^\s*>\s?/gm, '')
        .replace(/[*_~|]/g, '')
        .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}]/gu, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }

    /* Hybrid splitting: the opening clause alone, then everything else as one piece.
       Cutting at every comma made the opening fast but changed the voice — each tiny
       fragment restarts the intonation and re-anchors the timbre. Measured on one
       sentence (tools/compare-chunking.py):
         whole take  5.02s of speech, one request
         by commas   5.48s of speech, four requests, log-spectral distance 1.98
       One cut buys the fast start; a dozen of them buy a different-sounding Fairy. So
       the opening piece is short, and the body is synthesised in context, cut only at
       sentence ends when it is long. */
    const VOICE_HEAD_CHARS = 18;
    const VOICE_BODY_CHARS = 150;

    function chunkSpeech(text) {
      const clean = String(text).trim();
      if (!clean) return [];
      /* The opening piece ends at the first punctuation mark, or at the cap if that
         first clause is long. */
      const first = /^[^，、,。！？!?；;：:\n]*[，、,。！？!?；;：:]/.exec(clean);
      let head = first ? first[0] : clean;
      if (head.length > VOICE_HEAD_CHARS) head = head.slice(0, VOICE_HEAD_CHARS);
      let rest = clean.slice(head.length).trim();
      const parts = [head];
      while (rest.length > VOICE_BODY_CHARS) {
        let cut = rest.lastIndexOf('。', VOICE_BODY_CHARS);
        if (cut < 40) cut = rest.lastIndexOf('，', VOICE_BODY_CHARS);
        if (cut < 40) cut = VOICE_BODY_CHARS;
        parts.push(rest.slice(0, cut + 1));
        rest = rest.slice(cut + 1).trim();
      }
      if (rest) parts.push(rest);
      return parts;
    }

    /* Fairy's own voice first: the host half proxies to the local GPT-SoVITS
       service, which holds the fine-tuned model in VRAM. Only if that service is
       down does the OS voice take over, so the feature degrades instead of going
       silent. Parts are requested one at a time and played back to back, which
       gets the first words out long before a long reply finishes synthesising. */
    const SPEAK_URL = '/hdd-speak';
    /* The host half owns the reference clip, the prompt and the service address,
       so the browser asks it instead of calling GPT-SoVITS directly. That keeps
       one path to configure and keeps absolute paths out of a shared package. */
    const TTS_DIRECT = '';
    const SPEAK_REFERENCE = '';
    const SPEAK_PROMPT = '了解我会如同主人使唤我一般使唤它，并且让它不敢有怨言。';

    /* One synthesis request for one piece of text, at module scope on purpose.
       It used to live inside speakNow, and the launch greeting — which is prepared
       from the splash, a different scope — called it anyway. That threw a
       ReferenceError which the greeting's own catch swallowed, so no greeting was ever
       prepared and every launch fell back to synthesising at the cue. That is exactly
       the slowness that was reported: nothing was wrong with the timing, the
       preparation had never run. */
    const fetchPart = async (text) => {
      const viaHost = await fetch(SPEAK_URL + '?text=' + encodeURIComponent(text)).catch(() => null);
      if (viaHost && viaHost.ok) {
        setVoiceDiag('host');
        return viaHost;
      }
      return viaHost;
    };
    /* ---- progressive playback ----
       Kept, correct, and OFF by default. Measured against this service it cannot be
       gapless: the stream hands over a crumb of audio (about 128ms) early and then
       goes quiet for two to four and a half seconds while the rest is computed, so a
       progressive player runs dry mid-sentence — which is exactly the stalling that
       was reported. The code stays for a service that streams evenly; the blob path
       below is what this one needs. Numbers from tools/probe-gaps.py:
         45 characters -> 4.77s of audio in 5.14s, largest arrival silence 2129ms
         35 characters -> 7.58s of audio in 5.74s, largest arrival silence 4541ms */
    const VOICE_STREAMING = false;
    const streamer = { ctx: null, cursor: 0, nodes: [], rate: 32000, frame: 2, scheduled: 0, end: null };

    function streamStop() {
      streamer.nodes.forEach((node) => {
        try {
          node.stop();
        } catch (error) {
          /* already finished */
        }
      });
      streamer.nodes = [];
      streamer.cursor = 0;
      if (streamer.end) {
        window.clearTimeout(streamer.end);
        streamer.end = null;
      }
    }

    function streamContext() {
      if (streamer.ctx) return streamer.ctx;
      const Ctor = window.AudioContext || window.webkitAudioContext;
      if (!Ctor) return null;
      try {
        streamer.ctx = new Ctor();
      } catch (error) {
        return null;
      }
      return streamer.ctx;
    }

    function schedulePcm(bytes) {
      const ctx = streamer.ctx;
      const frames = Math.floor(bytes.byteLength / 2);
      if (!frames) return;
      const buffer = ctx.createBuffer(1, frames, streamer.rate);
      const channel = buffer.getChannelData(0);
      const view = new DataView(bytes.buffer, bytes.byteOffset, frames * 2);
      for (let index = 0; index < frames; index += 1) {
        channel[index] = view.getInt16(index * 2, true) / 32768;
      }
      const node = ctx.createBufferSource();
      node.buffer = buffer;
      node.connect(ctx.destination);
      /* A small lead so the first block is scheduled slightly ahead rather than late,
         then the running cursor keeps every later block butted against the previous. */
      const startAt = Math.max(ctx.currentTime + 0.12, streamer.cursor);
      node.start(startAt);
      streamer.cursor = startAt + buffer.duration;
      streamer.nodes.push(node);
      streamer.scheduled += 1;
      if (streamer.nodes.length > 64) streamer.nodes.splice(0, 32);
      setVoiceSpeaking(true);
      if (streamer.end) window.clearTimeout(streamer.end);
      streamer.end = window.setTimeout(
        () => setVoiceSpeaking(false),
        Math.max(0, (streamer.cursor - ctx.currentTime) * 1000) + 150,
      );
    }

    /* Streams one part and schedules its audio. Resolves when the stream has been
       consumed; the sound itself continues from the context clock. */
    async function streamPart(text, run) {
      /* Progressive playback is off by default and this build has no direct
         service address (the host owns it), so the path stays unreachable. */
      if (!TTS_DIRECT) throw new Error('stream-direct-disabled');
      const response = await fetch(TTS_DIRECT, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          text,
          text_lang: 'zh',
          ref_audio_path: SPEAK_REFERENCE,
          prompt_text: SPEAK_PROMPT,
          prompt_lang: 'zh',
          text_split_method: 'cut0',
          batch_size: 1,
          media_type: 'wav',
          /* 2 = streaming, WAV header first and raw PCM after it. */
          streaming_mode: 2,
        }),
      });
      if (!response.ok || !response.body) throw new Error('stream-http');
      const reader = response.body.getReader();
      let head = new Uint8Array(0);
      let carry = new Uint8Array(0);
      for (;;) {
        if (run !== voiceRun) {
          try {
            await reader.cancel();
          } catch (error) {
            /* the stream is closing anyway */
          }
          return;
        }
        const step = await reader.read();
        if (step.done) break;
        let bytes = step.value;
        if (head.length < 44) {
          const merged = new Uint8Array(head.length + bytes.length);
          merged.set(head);
          merged.set(bytes, head.length);
          if (merged.length < 44) {
            head = merged;
            continue;
          }
          /* Canonical WAV layout: channels at 22, sample rate at 24. */
          const channels = merged[22] | (merged[23] << 8);
          const rate = merged[24] | (merged[25] << 8) | (merged[26] << 16) | (merged[27] << 24);
          if (rate > 0) streamer.rate = rate;
          streamer.frame = Math.max(2, (channels || 1) * 2);
          head = merged.subarray(0, 44);
          bytes = merged.subarray(44);
        }
        if (!bytes.length) continue;
        const merged = new Uint8Array(carry.length + bytes.length);
        merged.set(carry);
        merged.set(bytes, carry.length);
        const usable = merged.length - (merged.length % streamer.frame);
        if (usable > 0) schedulePcm(new Uint8Array(merged.subarray(0, usable)));
        carry = merged.subarray(usable);
      }
    }

    /* Reads the reply from the host feed and speaks it, in the fine-tuned voice. */
    let voiceAudio = null;
    /* Bumped whenever a read-aloud run is replaced, so in-flight synthesis for the
       old one cannot play over the new one. */
    let voiceRun = 0;

    function stopVoice() {
      setVoiceSpeaking(false);
      voiceRun += 1;
      streamer.scheduled = 0;
      streamStop();
      if (voiceAudio) {
        try {
          voiceAudio.pause();
        } catch (error) {
          /* already gone */
        }
        voiceAudio = null;
      }
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    }

    function systemSpeak(clean) {
      const synth = window.speechSynthesis;
      if (!synth) return;
      synth.cancel();
      const voice = pickVoice();
      const parts = chunkSpeech(clean);
      for (let index = 0; index < parts.length; index += 1) {
        const utterance = new SpeechSynthesisUtterance(parts[index]);
        utterance.lang = 'zh-CN';
        utterance.rate = 1.05;
        if (voice) utterance.voice = voice;
        synth.speak(utterance);
      }
      setVoiceDiag('sys' + clean.length + (voice ? '' : '/novoice'));
    }

    function speakNow(text, messageId, force) {
      /* `force` bypasses the read-aloud switch. The launch greeting uses it: that line
         belongs to the launch itself rather than to reading a reply back, so a user
         who has turned reading off still hears Fairy say hello on a cold start. */
      if (!force && !voiceEnabled()) {
        setVoiceDiag('off');
        return;
      }
      /* Reading is on but the model is still loading (or was released): skip this
         reply instead of reading it in the OS voice, and make sure the load is on
         its way. The pill already says 加载中, so the silence is explained. */
      if (engineState.value.state !== 'ready') {
        setVoiceDiag('voiceload');
        ensureEngine();
        return;
      }
      spoken.add(messageId);
      const clean = speakableText(text);
      if (clean.length < 2) {
        setVoiceDiag('empty');
        return;
      }
      stopVoice();
      const parts = chunkSpeech(clean);
      setVoiceDiag('q' + parts.length);
      let attempts = 0;
      /* Every read-aloud run gets a token. `stopVoice` (a new reply, or the switch
         being turned off) bumps it, so a part that was already being synthesised for
         the previous run can no longer start playing over the new one. */
      voiceRun += 1;
      const run = voiceRun;
      /* Fetch first, then play the bytes from a blob URL. That separates "the
         request failed" from "the element refused to play", and each outcome is
         named in the probe instead of being guessed at. */
      /* Direct first: in this build the host process cannot open a socket to the
         local voice service (its proxy route answered 503 while curl on the same
         machine succeeded). The service now allows this origin, so the browser
         asks it directly and only falls back to the host route. */

      const play = async (index) => {
        if (index >= parts.length) return;
        if (run !== voiceRun) return;
        /* Ask for the NEXT TWO parts now, while this one is still synthesising or
           playing. Fetching each part only after the previous one finished is what put
           a second or two of silence between parts of a long reply, and with
           comma-sized parts the margin per part is small, so two are kept in flight. */
        if (typeof request === 'function') {
          request(index + 1);
          request(index + 2);
        }
        let url = '';
        try {
          const result = typeof request === 'function' ? await request(index) : null;
          if (!result || result.error) {
            setVoiceDiag(result && result.error ? result.error : 'unreachable');
            failed();
            return;
          }
          if (run !== voiceRun) {
            if (result.url) URL.revokeObjectURL(result.url);
            return;
          }
          url = result.url;
          const audio = new Audio(url);
          voiceAudio = audio;
          audio.addEventListener('ended', () => {
            URL.revokeObjectURL(url);
            setVoiceDiag('fairy' + (index + 1) + '/' + parts.length);
            if (index + 1 >= parts.length) setVoiceSpeaking(false);
            play(index + 1);
          });
          await audio.play();
          setVoiceSpeaking(true);
        } catch (error) {
          if (url) URL.revokeObjectURL(url);
          setVoiceSpeaking(false);
          const name = error && error.name ? error.name : 'unknown';
          setVoiceDiag('err' + name);
          failed();
        }
      };

      /* One request per part, shared between the player and the prefetcher, so a part
         is never synthesised twice. */
      const jobs = new Map();
      const request = (index) => {
        if (index >= parts.length) return Promise.resolve(null);
        if (jobs.has(index)) return jobs.get(index);
        const job = (async () => {
          const response = await fetchPart(parts[index]);
          if (!response) return { error: 'unreachable' };
          if (!response.ok) return { error: 'http' + response.status };
          const blob = await response.blob();
          return { url: URL.createObjectURL(blob) };
        })();
        jobs.set(index, job);
        return job;
      };
      /* One retry — the local service may still be loading its model — and only
         then the OS voice. A later part failing just stops the reading. */
      const failed = () => {
        attempts += 1;
        if (attempts === 1) {
          setVoiceDiag('retry');
          window.setTimeout(() => play(0), 2500);
          return;
        }
        setVoiceDiag('sys');
        setVoiceSpeaking(false);
        systemSpeak(clean);
      };
      /* Streaming first, because it is what makes Fairy start talking in about a
         second instead of three. Anything that stops it working — no AudioContext, a
         context the shell refuses to start, a refused request — falls through to the
         blob path below, which still speaks. Parts are streamed one after another;
         because every block is scheduled against one running cursor, the next part
         begins exactly where the previous one ends, with no silence between them. */
      /* Streaming is off by default for the reason recorded at VOICE_STREAMING: this
         service pauses for seconds mid-stream, which stutters. The blob path below is
         gapless — each part is synthesised whole, and later parts are requested while
         earlier ones play, so nothing is ever scheduled against missing audio. */
      if (!VOICE_STREAMING) {
        play(0);
        return;
      }
      const streamAll = async () => {
        const context = streamContext();
        if (!context) throw new Error('no-context');
        if (context.state === 'suspended') {
          try {
            await context.resume();
          } catch (error) {
            /* fall through to the check below */
          }
        }
        if (context.state === 'suspended') throw new Error('blocked');
        streamer.cursor = 0;
        streamer.scheduled = 0;
        for (let index = 0; index < parts.length; index += 1) {
          if (run !== voiceRun) return;
          await streamPart(parts[index], run);
        }
        if (run === voiceRun) setVoiceDiag('stream' + parts.length);
      };
      streamAll().catch(() => {
        if (run !== voiceRun) return;
        /* Already audible? Then do not speak the same reply twice. */
        if (streamer.scheduled > 0) return;
        setVoiceDiag('blob');
        play(0);
      });
    }


    /* The reply comes from the host half over `/hdd-voice`, which already sees
       every committed `assistant/message`. Nothing is reconstructed from the
       rendered DOM. The first successful poll only records the current reply, so
       history and a session switch stay silent; everything after that is read. */
    /* Polled every 400ms. At 1500ms the listener waited up to a second and a half for
       the client to even notice a reply had landed, which was the largest single
       slice of the delay and cost nothing to remove: the route is local. */
    const VOICE_POLL_MS = 400;

    /* Shared speaking flag so the meter can react to playback. */
    const voiceSpeaking = { value: false, listeners: new Set() };

    function setVoiceSpeaking(next) {
      if (voiceSpeaking.value === next) return;
      voiceSpeaking.value = next;
      voiceSpeaking.listeners.forEach((listener) => listener(next));
    }

    function VoiceToggle(props) {
      const [on, setOn] = React.useState(() => voiceEnabled());
      const [speaking, setSpeaking] = React.useState(() => voiceSpeaking.value);
      const [engine, setEngine] = React.useState(() => engineState.value);
      const sessionId = props && props.sessionId;

      React.useEffect(() => {
        const listener = (next) => setSpeaking(next);
        voiceSpeaking.listeners.add(listener);
        return () => voiceSpeaking.listeners.delete(listener);
      }, []);

      React.useEffect(() => {
        const listener = (next) => setEngine(next);
        engineState.listeners.add(listener);
        return () => engineState.listeners.delete(listener);
      }, []);

      /* Bring the pill in line with the host on mount: an engine left running by
         a previous session is released when reading is off, loaded when it is on. */
      React.useEffect(() => {
        let live = true;
        engineStatus().then((data) => {
          if (!live) return;
          if (voiceEnabled()) {
            if (!data || data.state !== 'ready') ensureEngine();
          } else if (data && data.port) {
            releaseEngine();
          }
        });
        return () => {
          live = false;
        };
      }, []);

      React.useEffect(() => {
        let live = true;
        let primed = false;
        const seen = new Set();

        const tick = () => {
          fetch(VOICE_FEED_URL, { headers: { accept: 'application/json' } })
            .then((response) => (response.ok ? response.json() : Promise.reject(new Error(String(response.status)))))
            .then((payload) => {
              if (!live) return;
              const reply = payload && payload.last;
              if (sessionId && reply && reply.sessionId && reply.sessionId !== sessionId) return;
              if (!primed) {
                /* Prime on the first successful poll whatever it holds: an
                   existing reply must stay silent, while an empty feed means
                   there is nothing to skip and the next reply should be read. */
                primed = true;
                if (reply && reply.messageId) seen.add(reply.messageId);
                setVoiceDiag(reply && reply.messageId ? 'prime' : 'ready');
                return;
              }
              if (!reply || !reply.messageId) return;
              if (seen.has(reply.messageId)) return;
              seen.add(reply.messageId);
              speakNow(reply.text, reply.messageId);
            })
            .catch(() => {
              if (live) setVoiceDiag('feed');
            });
        };

        tick();
        const timer = window.setInterval(tick, VOICE_POLL_MS);
        return () => {
          live = false;
          window.clearInterval(timer);
        };
      }, [sessionId]);

      /* The level-meter pill: a red lamp and a bar waveform, matching the game's
         audio strip. It doubles as the state read-out — the lamp is grey and the
         bars dim when reading is off, and the bars move while a reply is playing. */
      const VOICE_BARS = [
        6, 11, 8, 14, 9, 12, 7, 13, 10, 15, 8, 12, 6, 11, 9, 13,
        7, 12, 10, 14, 8, 11, 6, 13, 9, 12, 7, 10,
      ];
      const bars = [];
      for (let index = 0; index < VOICE_BARS.length; index += 1) {
        bars.push(h('i', { key: index, style: { height: VOICE_BARS[index] + 'px' } }));
      }

      /* The pill carries the engine state as text, because "no sound" has two
         very different causes here: reading is off, or the model is still
         loading. Saying which one is cheaper than a support round-trip. */
      const ENGINE_LABEL = {
        stopped: '未加载',
        starting: '加载中',
        ready: '就绪',
        stopping: '释放中',
        unconfigured: '未配置',
        error: '不可用',
      };
      const engineStateName = engine && engine.state ? engine.state : 'stopped';
      const engineLabel = ENGINE_LABEL[engineStateName] || engineStateName;
      /* Name the weights behind "就绪": the tooltip is the only surface where the
         user can see which model the pill is about to hold in VRAM. */
      const model = (engine && engine.model) || null;
      const modelLine = model && (model.sovits || model.gpt)
        ? ' · ' + (model.name || 'Fairy') + ' ' + (model.version || '')
          + '（SoVITS ' + (model.sovits || '?') + ' + GPT ' + (model.gpt || '?')
          + '，' + (model.device || 'cuda') + (model.half === false ? '/fp32' : '/fp16') + '）'
        : '';
      /* An unconfigured or failed engine is the one case where "why" matters more
         than "what": surface the host's reason instead of a dead label. */
      const engineNote = (engineStateName === 'unconfigured' || engineStateName === 'error') && engine && engine.error
        ? '：' + engine.error
        : '';

      return h(
        'button',
        {
          type: 'button',
          'data-hdd-voice': on ? 'on' : 'off',
          'data-hdd-voice-speaking': speaking ? 'true' : 'false',
          'data-hdd-voice-engine': engineStateName,
          title: (on ? '朗读：开（点击关闭）' : '朗读：关（点击开启）')
            + ' · 语音模型：' + engineLabel + engineNote + modelLine
            + (engineStateName === 'ready' ? '（关闭后释放显存）' : ''),
          'aria-label': on ? '关闭朗读' : '开启朗读',
          onClick: () => {
            const next = !on;
            setOn(next);
            setVoiceEnabled(next);
          },
        },
        h('span', { key: 'dot', 'data-hdd-voice-dot': 'true' }),
        h('span', { key: 'bars', 'data-hdd-voice-bars': 'true' }, bars),
        h('span', { key: 'engine', 'data-hdd-voice-engine-label': 'true' }, engineLabel),
      );
    }

    /* ---- Fairy's mark ----
       Vector from the pi-fairy project (Apache-2.0), inlined so it stays crisp at
       any size. Its motion is reproduced in CSS from the published parameters:
       the corners turn a quarter every 3000ms (the square is 90-degree symmetric,
       so the 12000ms rotation reads as 3000ms), and the four eye layers breathe on
       a 1500ms cycle with staggered leads — sclera 0ms, iris-outer 47ms,
       iris-blue 94ms, pupil 188ms — through the same cubic-bezier(0.72, 0, 0.28, 1)
       the original sampler uses. */
    const FAIRY_SVG = [
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-1 -1 162 162" role="img" aria-label="Fairy">',
      '<defs>',
      '<linearGradient id="hddFairyOuter" x1=".2" y1="0" x2=".8" y2="1">',
      '<stop stop-color="#4053f0"/><stop offset=".54" stop-color="#3045dc"/><stop offset="1" stop-color="#3d50c8"/>',
      '</linearGradient>',
      '<radialGradient id="hddFairyScleraHalo" gradientUnits="userSpaceOnUse" cx="80" cy="80" r="56" color-interpolation="linearRGB">',
      '<stop offset=".82" stop-color="#fff" stop-opacity="0"/><stop offset=".875" stop-color="#fff" stop-opacity=".28"/>',
      '<stop offset=".91" stop-color="#fff" stop-opacity=".11"/><stop offset=".96" stop-color="#fff" stop-opacity=".035"/>',
      '<stop offset="1" stop-color="#fff" stop-opacity="0"/>',
      '</radialGradient>',
      '<radialGradient id="hddFairyOuterHalo" gradientUnits="userSpaceOnUse" cx="80" cy="80" r="79" color-interpolation="linearRGB">',
      '<stop offset=".80" stop-color="#fff" stop-opacity="0"/><stop offset=".868" stop-color="#fff" stop-opacity=".28"/>',
      '<stop offset=".90" stop-color="#fff" stop-opacity=".18"/><stop offset=".95" stop-color="#fff" stop-opacity=".06"/>',
      '<stop offset="1" stop-color="#fff" stop-opacity="0"/>',
      '</radialGradient>',
      '<radialGradient id="hddFairyCatchHalo" gradientUnits="userSpaceOnUse" cx="98" cy="100.5" r="18" color-interpolation="linearRGB">',
      '<stop offset=".53" stop-color="#f5f8fd" stop-opacity="0"/><stop offset=".611" stop-color="#f5f8fd" stop-opacity=".43"/>',
      '<stop offset=".72" stop-color="#f5f8fd" stop-opacity=".19"/><stop offset=".83" stop-color="#f5f8fd" stop-opacity=".055"/>',
      '<stop offset="1" stop-color="#f5f8fd" stop-opacity="0"/>',
      '</radialGradient>',
      '</defs>',
      '<circle cx="80" cy="80" r="79" fill="url(#hddFairyOuterHalo)"/>',
      '<circle cx="80" cy="80" r="68" fill="none" stroke="#dceaff" stroke-width="1.8"/>',
      '<circle cx="80" cy="80" r="68" fill="url(#hddFairyOuter)" stroke="#f2fbff" stroke-width="1.2"/>',
      '<g id="hddFairyCorners" fill="#2b3388" transform="rotate(0 80 80)">',
      '<circle cx="80" cy="80" r="51.75"/><rect x="37" y="37" width="86" height="86" rx="2" transform="rotate(3 80 80)"/>',
      '</g>',
      '<g id="hddFairySclera" transform="translate(80 80) scale(1) translate(-80 -80)">',
      '<circle cx="80" cy="80" r="48" fill="#eef0f5"/><circle cx="80" cy="80" r="56" fill="url(#hddFairyScleraHalo)"/>',
      '<circle cx="80" cy="80" r="48" fill="none" stroke="#fff" stroke-width=".8" stroke-opacity=".16"/>',
      '</g>',
      '<g id="hddFairyIrisOuter" transform="translate(80 80) scale(1) translate(-80 -80)"><circle cx="80" cy="80" r="33" fill="#9daee0"/></g>',
      '<g id="hddFairyIrisBlue" transform="translate(80 80) scale(1) translate(-80 -80)">',
      '<circle cx="80" cy="80" r="24.15" fill="#eef0f5"/><circle cx="80" cy="80" r="23.5" fill="#317bcf"/></g>',
      '<g id="hddFairyPupil" transform="translate(80 80) scale(1) translate(-80 -80)">',
      '<circle cx="80" cy="80" r="16.6" fill="none" stroke="#f5f8fd" stroke-width=".1"/><circle cx="80" cy="80" r="16" fill="#3b3d8a"/></g>',
      '<g id="hddFairyHighlight" transform="translate(80 80) scale(1) translate(-80 -80)">',
      '<circle cx="98" cy="100.5" r="18" fill="url(#hddFairyCatchHalo)"/><circle cx="98" cy="100.5" r="11" fill="#f5f8fd"/></g>',
      '</svg>',
    ].join('');

    /* Fairy's mark is drawn as horizontal bands of the same vector, not as one
       image: at rest the bands line up into the whole mark, and during a tear every
       band jumps sideways at once, each by its own amount — which is what shatters
       the circle into the stepped edge the cutscene shows at 65.83s and 69.43s.
       20 bands are used because that is the slice density those frames show. */
    const MASCOT_BANDS = 20;
    /* Deterministic per-band offsets in px, mixed in magnitude and sign so the
       shatter reads as damage rather than as one clean shift. */
    const MASCOT_SHIFTS = [0, -22, 11, -13, 25, -7, 16, -25, 5, -16, 20, -11, 9, -20, 14, -5, 23, -14, 7, -27];

    function FairyMascot(props) {
      const rail = !(props && props.wide);
      const bands = [];
      for (let index = 0; index < MASCOT_BANDS; index += 1) {
        const top = (index * 100) / MASCOT_BANDS;
        const bottom = ((MASCOT_BANDS - 1 - index) * 100) / MASCOT_BANDS;
        bands.push(
          h('div', {
            key: index,
            'data-hdd-mascot-band': 'true',
            style: {
              '--hdd-shift': MASCOT_SHIFTS[index % MASCOT_SHIFTS.length] + 'px',
              /* Each band is grown by 0.7px on both sides. Abutting exactly left a
                 hairline between neighbours — the percentage insets round to
                 sub-pixels — and on the bright ring that hairline showed as white
                 horizontal bars across the mark, one every 12px (20 bands over 260px).
                 Because every band paints the same vector, a small overlap is invisible
                 and the seams disappear. */
              clipPath: `inset(calc(${top}% - 0.7px) 0 calc(${bottom}% - 0.7px) 0)`,
            },
            dangerouslySetInnerHTML: { __html: FAIRY_SVG },
          }),
        );
      }
      return h(
        'div',
        {
          'data-hdd-mascot': 'true',
          'data-hdd-mark-scope': 'true',
          'data-rail': rail ? 'true' : 'false',
          title: 'FAIRY Ⅲ',
        },
        h(
          'div',
          { key: 'stage', 'data-hdd-mascot-stage': 'true' },
          h('span', { key: 'bloom', 'data-hdd-mascot-bloom': 'true' }),
          /* One whole copy, plus the twenty slices that exist only for the tear.
             The slices are what shatters the mark, but they are also why faint white
             bars ran across it: twenty abutting clip-path slices leave hairline seams
             wherever the percentage insets round to sub-pixels, and where they land
             changes with the rendered size. So the whole copy is what you see; the
             slices sit on top of it, invisible, and switch on only for the ~86ms of
             the tear. */
          h('div', {
            key: 'whole',
            'data-hdd-mascot-whole': 'true',
            dangerouslySetInnerHTML: { __html: FAIRY_SVG },
          }),
          h('div', { key: 'mark', 'data-hdd-mascot-mark': 'true' }, bands),
        ),
      );
    }

    return {
      inject: ['slots'],
      apply(ctx) {
        /* Install the skin sheet here, at the very start, rather than only from the
           slot component below. A sheet rendered inside the component tree arrives
           after the application has already painted once, so on a cold start the
           window showed the unskinned interface for a moment before the launch
           animation covered it. A plain <head> <style> is in place while the tree
           is still mounting. The component-tree sheet is kept as well so the skin
           still has a React-managed owner. */
        if (typeof document !== 'undefined' && document.head) {
          const skin = document.createElement('style');
          skin.setAttribute('data-hdd-skin', 'true');
          skin.textContent = CSS;
          document.head.appendChild(skin);
          ctx.effect(() => () => skin.remove());
        }
        /* The skin is dark; the application is not necessarily. Its theme setting
           (light / dark / system) selects one of two token packs and applies it by
           toggling `data-ds-dark-theme` on <body>. On a light machine the labels
           this sheet sets stay pale while every surface it does not name keeps the
           light pack, which is exactly the pale-text-on-paper report. Asserting the
           dark pack is the fix; the observer re-asserts it after the theme service
           rewrites the attribute on a settings change or a system-theme flip. */
        const forceDarkTheme = () => {
          if (typeof document === 'undefined') return;
          const body = document.body;
          const root = document.documentElement;
          /* Feature-detected because the load smoke test runs against a stub
             document whose nodes only carry the handful of methods it uses. */
          const lacks = (el, attribute) => Boolean(el) && (typeof el.hasAttribute === 'function'
            ? !el.hasAttribute(attribute)
            : el.getAttribute(attribute) === null);
          if (lacks(body, 'data-ds-dark-theme')) body.setAttribute('data-ds-dark-theme', '');
          if (root) {
            if (lacks(root, 'data-ds-dark-theme')) root.setAttribute('data-ds-dark-theme', '');
            if (root.style && root.style.colorScheme !== 'dark') root.style.colorScheme = 'dark';
          }
        };
        forceDarkTheme();
        ctx.effect(() => {
          if (typeof MutationObserver === 'undefined' || typeof document === 'undefined') return () => {};
          const observer = new MutationObserver(forceDarkTheme);
          if (document.body) observer.observe(document.body, { attributes: true, attributeFilter: ['data-ds-dark-theme'] });
          observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-ds-dark-theme'] });
          return () => observer.disconnect();
        }, 'hdd-dark-theme');
        ctx.slots.inject('shell.overlay', () =>
          ctx.slots.register({ name: 'shell.overlay', id: 'hdd-style-host', order: 900 }, StyleHost),
        );
        /* The Desktop preload re-measures the native caption colours only when
           <head> mutates (it observes head childList/subtree). A sheet rendered
           inside the component tree never does that, so the window buttons keep
           whatever palette was measured before this plugin loaded. Inserting one
           empty <style> node into <head> is the signal that makes the preload
           re-read `--dsw-specific-sidebar-fill` and `--dsw-alias-label-primary`
           — both owned by this skin — and push them to the caption. The node is
           removed when the plugin unloads. */
        ctx.effect(() => {
          const timers = [];
          const fire = () => {
            const trigger = document.createElement('style');
            trigger.setAttribute('data-hdd-caption-trigger', '');
            document.head.appendChild(trigger);
            timers.push(window.setTimeout(() => trigger.remove(), 60));
          };
          /* Once immediately, then again after the sheet has been applied. */
          fire();
          timers.push(window.setTimeout(fire, 400));
          timers.push(window.setTimeout(fire, 1500));
          return () => {
            timers.forEach((id) => window.clearTimeout(id));
          };
        }, 'hdd-caption-trigger');
        /* Speak only what arrives from now on: the transcript already on screen
           at load must stay silent. */
        window.setTimeout(() => {
          window.__hddVoiceReady = true;
        }, VOICE_SETTLE_MS);
        mountBootSplash(ctx);
        installVoiceUnlock(ctx);
        ctx.slots.inject('conversation.hero.brand.mark', () =>
          ctx.slots.register({ name: 'conversation.hero.brand.mark' }, HeroMark),
        );
        ctx.slots.inject('sidebar.brand.mark', () =>
          ctx.slots.register({ name: 'sidebar.brand.mark' }, BrandMark),
        );
        ctx.slots.inject('sidebar.brand.name', () =>
          ctx.slots.register({ name: 'sidebar.brand.name' }, BrandName),
        );
        /* Fairy's mark sits above the electricity card in the sidebar foot. */
        ctx.slots.inject('sidebar.footer.action', () =>
          ctx.slots.register(
            { name: 'sidebar.footer.action', id: 'hdd-mascot', order: 40, label: 'Fairy' },
            FairyMascot,
          ),
        );
        /* The meter rides the composer row immediately left of the read-aloud
           control, as a pill built to match it. */
        ctx.slots.inject('conversation.input.right', () =>
          ctx.slots.register(
            { name: 'conversation.input.right', id: 'hdd-meter', order: 5, label: '电费' },
            (props) => h(MeterCard, Object.assign({}, props, { compact: true })),
          ),
        );
        /* The read-aloud meter lives at the right end of the composer tool row,
           immediately before the submit action. */
        ctx.slots.inject('conversation.input.right', () =>
          ctx.slots.register(
            { name: 'conversation.input.right', id: 'hdd-voice', order: 10, label: '朗读' },
            VoiceToggle,
          ),
        );
        ctx.slots.inject('conversation.session.header.utilities', () =>
          ctx.slots.register(
            { name: 'conversation.session.header.utilities', id: 'hdd-pill', order: 10, label: 'H.D.D' },
            HddPill,
          ),
        );
      },
    };
  },
});
