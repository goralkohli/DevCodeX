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
npm run generate:audit
```

## Routes

- `/` — Home page (`HomePage`)
- `/tracks` — Tracks catalog page (`TracksPage`)
- `/tracks/:trackId/:topicId` — Topic study page with tabbed views (`TopicPage`)
- `/clinic` — AI Code Clinic page (`CodeClinicPage`)
- `*` — Not Found page (`NotFoundPage`)

## Sandbox Architecture

DevCodex uses the **CodeMirror 6 fallback** (`@uiw/react-codemirror` + `@codemirror/lang-javascript`) paired with a local `<iframe>` preview generated via Blob URLs.

### Why the Fallback Path was Chosen:
- **Sandbox Startup Recovery**: `@codesandbox/sandpack-react` runs a remote client that halts compilation listeners if the initial starter code intentionally contains a syntax error (`/* YOUR_CODE_HERE */`), preventing hot re-evaluation when the user fills in the blanks.
- **Network Independence & Security**: Sandpack relies on loading subframes from `https://*-sandpack.codesandbox.io`. The local CodeMirror 6 + Blob URL architecture runs completely in-browser without external network dependencies, origin blocking, or third-party service latency.
- **Encapsulated Abstraction**: The entire editor and preview implementation is wrapped inside `/src/components/CodeSandbox.jsx`. No consumer page or track imports directly from the underlying editor library.

## AI Content Pipeline

DevCodex treats AI as a **build-time content production tool, NOT a runtime dependency**. The web client makes zero network calls to AI providers and requires no API keys at runtime.

### How it Works:
- **Zero-Key Fresh-Clone Experience**: Pre-generated, schema-valid audits (`src/data/audits/radial-coordinates.json`) and committed seeds (`scripts/seeds/radial-coordinates.seed.json`) are committed to the repository. The app runs completely offline out-of-the-box.
- **Manual Regeneration (`npm run generate:audit`)**:
  - If `DEEPSEEK_API_KEY` is absent and the audit file exists: preserves the existing JSON (`[INFO]`).
  - If `DEEPSEEK_API_KEY` is absent and no audit exists: copies the committed seed (`[WARN]`).
  - If `DEEPSEEK_API_KEY` is present: executes a POST request to DeepSeek (`deepseek-chat` model with mandatory `response_format: { type: "json_object" }` at `temperature: 0.3`). The response is validated against the audit schema before writing to disk, ensuring bad responses never overwrite valid files.

## Project Structure

```
devcodex/
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── scripts/
│   ├── seeds/
│   │   └── radial-coordinates.seed.json
│   └── generate-audit.mjs
├── src/
│   ├── components/
│   │   ├── AppLayout.jsx
│   │   ├── CodeSandbox.jsx
│   │   ├── Footer.jsx
│   │   └── Navbar.jsx
│   ├── data/
│   │   ├── audits/
│   │   │   ├── radial-coordinates.json
│   │   │   └── schema.json
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
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── vite.config.js
```
