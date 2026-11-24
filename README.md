# DevCodex

Interactive developer recall & learning hub.

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
```

### Regenerate Audits (Build-Time Only)

```bash
# Regenerate all lessons
npm run generate:audit

# Regenerate a single topic
npm run generate:audit -- radial-coordinates
npm run generate:audit -- parametric-star
```

## Content

DevCodex currently ships with two complete Canvas engineering modules under the **Visual Computing & Canvas** track:
1. **Radial Coordinate Math** (`radial-coordinates`): Concentric focal coordinates, gradients, and sub-pixel high-DPI scaling.
2. **Parametric Star Drawing** (`parametric-star`): Trigonometric polar-to-Cartesian vertex projection, alternating concentric radii, and closed subpaths.

### Scaling Topics
The platform is 100% data-driven. Adding a new topic requires only:
- Extending `src/data/tracks.js` with the topic metadata and `lesson` object.
- Running `npm run generate:audit -- <topicId>` (which queries DeepSeek when `DEEPSEEK_API_KEY` is present, or falls back to `scripts/seeds/<topicId>.seed.json`).
- The search index, Cmd+K palette, navigation, and audit views automatically discover the topic.

### Canonical Anchor & Slug Contracts

To maintain consistent deep-linking across the Cmd+K quick-recall palette, search index, and tab state, DevCodex enforces a canonical URL and fragment anchor contract:

- Every fragment anchor targeting an audit pitfall derives strictly from `pitfall.id` — e.g., `#pitfall-${pitfall.id}`.
- The `id` field in audit JSON is immutable once committed, to preserve permanent deep-links. Pitfall titles may be edited for clarity; the `id` must not change.
- When renaming an `id`, coordinate the change across `src/data/audits/*.json`, `src/data/searchIndex.js`, and any external references (bookmarks, docs, shared links).
- Execution steps derive strictly from `step.stepNumber` — e.g., `#step-${step.stepNumber}` (`#step-1`, `#step-2`).
- Senior interview insight card anchors strictly to `#senior-insight`.
- All anchored elements utilize Tailwind's `scroll-mt-24` utility class to ensure smooth alignment below the fixed top navbar when navigated via fragment URLs.
- Track IDs and Topic IDs are strictly lowercase kebab-case (e.g., `canvas`, `radial-coordinates`, `parametric-star`), serving as the single source of truth for routing, search indexing, and audit schema files.

## Routes

- `/` — Home page (`HomePage`)
- `/tracks` — Tracks catalog page (`TracksPage`)
- `/tracks/:trackId/:topicId` — Topic study page with tabbed views (`TopicPage`)
- `/clinic` — AI Code Clinic page (`CodeClinicPage`)
- `*` — Not Found page (`NotFoundPage`)

## Quick Recall (Cmd+K)

DevCodex features a global, unbundled quick-recall palette built with **cmdk** that functions as a "second brain" for developers.

### Key Capabilities:
- **Shortcut & Trigger**: Accessible from anywhere via `⌘K` (macOS) or `Ctrl+K` (Windows/Linux), as well as a dedicated `<button>` trigger in the top navbar.
- **Unified Search Index**: Derived as a pure function from tracks and audit data (`src/data/searchIndex.js`). It indexes topics, interactive sandboxes, execution trace steps, production pitfalls, and senior interview insights.
- **Deep Fragment Anchors**: Selecting an item from the palette immediately navigates to the exact tab and smoothly scrolls to the target anchor (`#step-X`, `#pitfall-Y`, `#senior-insight`) with top navbar offset handling (`scroll-mt-24`).
- **Cross-Tab Recall**: Handles cross-tab state switching (e.g., navigating from `?tab=concept` directly into a specific pitfall card in `?tab=audit`) using requestAnimationFrame deferrals to wait for the target tab to mount.

## Sandbox Architecture

DevCodex uses the **CodeMirror 6 fallback** (`@uiw/react-codemirror` + `@codemirror/lang-javascript`) paired with a local `<iframe>` preview generated via Blob URLs.

### Why the Fallback Path was Chosen:
- **Sandbox Startup Recovery**: `@codesandbox/sandpack-react` runs a remote client that halts compilation listeners if the initial starter code intentionally contains a syntax error (`/* YOUR_CODE_HERE */`), preventing hot re-evaluation when the user fills in the blanks.
- **Network Independence & Security**: Sandpack relies on loading subframes from `https://*-sandpack.codesandbox.io`. The local CodeMirror 6 + Blob URL architecture runs completely in-browser without external network dependencies, origin blocking, or third-party service latency.
- **Encapsulated Abstraction**: The entire editor and preview implementation is wrapped inside `/src/components/CodeSandbox.jsx`. No consumer page or track imports directly from the underlying editor library.

## AI Content Pipeline

DevCodex treats AI as a **build-time content production tool, NOT a runtime dependency**. The web client makes zero network calls to AI providers and requires no API keys at runtime.

### How it Works:
- **Zero-Key Fresh-Clone Experience**: Pre-generated, schema-valid audits (`src/data/audits/radial-coordinates.json`, `src/data/audits/parametric-star.json`) and committed seeds (`scripts/seeds/radial-coordinates.seed.json`, `scripts/seeds/parametric-star.seed.json`) are committed to the repository. The app runs completely offline out-of-the-box.
- **Manual Regeneration (`npm run generate:audit`)**:
  - If `DEEPSEEK_API_KEY` is absent and the audit file exists: preserves the existing JSON (`[INFO]`).
  - If `DEEPSEEK_API_KEY` is absent and no audit exists: copies the committed seed (`[WARN]`).
  - If `DEEPSEEK_API_KEY` is present: executes a POST request to DeepSeek (`deepseek-chat` model with mandatory `response_format: { type: "json_object" }` at `temperature: 0.3`). The response is validated against the audit schema before writing to disk, ensuring bad responses never overwrite valid files.

## Deployment

DevCodex is a static Vite SPA. Netlify configuration lives in `netlify.toml` and `public/_redirects`.

To deploy:
1. `npm run build`
2. Drag the `dist/` folder to https://app.netlify.com/drop, OR connect the repo to Netlify for Git-triggered deploys.
3. The SPA fallback serves index.html for all client-side routes, so deep-links like `/tracks/canvas/parametric-star?tab=audit#pitfall-polar-radian-inversion` work on direct paste.

### Netlify Configuration Details

The repository includes both `/public/_redirects` and `/netlify.toml` preconfigured for client-side SPA routing (`/* -> /index.html 200`), guaranteeing that direct deep-links and page refreshes resolve without 404 errors.

#### Option 1: Git Continuous Deployment (Recommended)
1. Push the repository to GitHub, GitLab, or Bitbucket.
2. Link the repository in Netlify via **Add new site > Import an existing project**.
3. Netlify automatically reads `netlify.toml`:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
4. Trigger the deployment. Direct URL navigation and client-side routes will be served via the configured 200 rewrite rule.

#### Option 2: Drag and Drop (Manual Deploy)
1. Run the production build locally:
   ```bash
   npm run build
   ```
2. Navigate to the Netlify team dashboard and drag the generated `dist/` directory into the Netlify Drop target area.
3. The copied `dist/_redirects` ensures all deep paths route correctly.

## Project Structure

```
devcodex/
├── public/
│   ├── _redirects
│   ├── favicon.svg
│   └── icons.svg
├── scripts/
│   ├── seeds/
│   │   ├── parametric-star.seed.json
│   │   └── radial-coordinates.seed.json
│   └── generate-audit.mjs
├── src/
│   ├── components/
│   │   ├── AppLayout.jsx
│   │   ├── CodeSandbox.jsx
│   │   ├── CommandPalette.jsx
│   │   ├── Footer.jsx
│   │   └── Navbar.jsx
│   ├── data/
│   │   ├── audits/
│   │   │   ├── parametric-star.json
│   │   │   ├── radial-coordinates.json
│   │   │   └── schema.json
│   │   ├── searchIndex.js
│   │   └── tracks.js
│   ├── pages/
│   │   ├── CodeClinicPage.jsx
│   │   ├── Home.jsx
│   │   ├── NotFoundPage.jsx
│   │   ├── TopicPage.jsx
│   │   └── TracksPage.jsx
│   ├── styles/
│   │   └── index.css
│   ├── App.jsx
│   └── main.jsx
├── env.example
├── index.html
├── netlify.toml
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── vite.config.js
```
