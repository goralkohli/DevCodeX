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

## Project Structure

```
devcodex/
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── components/
│   │   ├── AppLayout.jsx
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
