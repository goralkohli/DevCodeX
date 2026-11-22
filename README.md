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

## Project Structure

```
devcodex/
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── components/
│   │   ├── AppLayout.jsx
│   │   ├── CodeSandbox.jsx
│   │   ├── Footer.jsx
│   │   └── Navbar.jsx
│   ├── data/
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
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── vite.config.js
```
