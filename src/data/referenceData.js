export const SURVIVAL_RECIPES = [
  {
    id: 'git-undo',
    category: 'Git & Version Control',
    title: 'I broke my Git and need to undo',
    problem:
      'You made changes or committed something locally by mistake and need to restore your code to a clean state without losing work.',
    snippet: `# ⚠️ WARNING: This discards ALL uncommitted changes in the
# current directory. Use only if you're sure.
git checkout -- .

# Undo your last commit but KEEP your changes in your files:
# (--soft keeps changes; --hard discards them permanently)
git reset --soft HEAD~1

# Temporarily stash uncommitted changes:
git stash
# Bring them back later:
git stash pop`,
    why: 'Git commits are immutable snapshots. Moving HEAD backwards (reset) lets you redo a commit without deleting your actual code files.'
  },
  {
    id: 'git-push-safe',
    category: 'Git & Version Control',
    title: 'Push to GitHub without breaking things',
    problem:
      "Pushing code to a remote repo fails with 'non-fast-forward' or merge conflict warnings, causing panic.",
    snippet: `# Safe 5-step daily push routine:
git status
git add -p                       # Review what you're staging
git commit -m "feat: clear message"
git pull --rebase origin main    # Replay your commits
git push origin main`,
    why: "Using '--rebase' keeps your commit history linear and avoids messy 'Merge branch' commit loops."
  },
  {
    id: 'terminal-path',
    category: 'Terminal & Environment',
    title: "The terminal says 'command not found'",
    problem:
      "You installed a tool (node, npm, python) but the terminal throws 'command not found'.",
    snippet: `# Check where a command is installed:
which node           # Mac/Linux
where node           # Windows (PowerShell/CMD)

# Check your current PATH directories:
echo $PATH           # Mac/Linux
$env:Path            # Windows PowerShell`,
    why: "Your computer only checks folders listed in the PATH environment variable. If an installed binary's folder isn't in PATH, the terminal cannot locate it."
  },
  {
    id: 'center-div',
    category: 'CSS & Layout',
    title: 'How to actually center a div',
    problem:
      'Centering an element vertically and horizontally using margins fails or requires awkward hacks.',
    snippet: `/* Option 1: Modern Flexbox (most common) */
.parent {
  display: flex;
  justify-content: center; /* Horizontal */
  align-items: center;     /* Vertical */
  min-height: 100vh;
}

/* Option 2: Modern CSS Grid (shortest) */
.parent {
  display: grid;
  place-items: center;
  min-height: 100vh;
}`,
    why: "The standard CSS box model only auto-calculates horizontal margins ('margin: 0 auto'). Vertical auto margins require a flex/grid layout context."
  },
  {
    id: 'api-endpoint',
    category: 'Web & Networking',
    title: 'What is an API endpoint?',
    problem:
      "Tutorials use 'REST API', 'endpoint', and 'payload' without explaining the plain mental model.",
    snippet: `// An endpoint is a web URL that returns data (JSON),
// not a web page.

// GET (read data)
const res = await fetch('https://api.example.com/users');
const users = await res.json();
// [{ id: 1, name: 'Alice' }]

// POST (send data)
await fetch('https://api.example.com/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Bob' })
});`,
    why: "Think of an API endpoint like a drive-through window: the URL is the window, the HTTP method is whether you're asking for the menu (GET) or placing an order (POST), and JSON is the food package."
  },
  {
    id: 'fetch-cors-error',
    category: 'Web & Networking',
    title: 'My fetch call failed with a CORS error',
    problem:
      "The browser console shows 'Cross-Origin Request Blocked' or 'No Access-Control-Allow-Origin header'.",
    snippet: `// Client-side fix checklist:
// 1. Verify you are using HTTPS if your site is HTTPS
// 2. Avoid custom headers unless the backend allows them

// 3. For Vite development, configure a proxy:
export default {
  server: {
    proxy: {
      '/api': {
        target: 'https://actual-api.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\\/api/, '')
      }
    }
  }
};`,
    why: 'CORS is a browser security guardrail that blocks Webpage A from silently requesting data from Server B unless Server B explicitly allows Webpage A via headers.'
  },
  {
    id: 'project-structure',
    category: 'Architecture & Foundations',
    title: 'How to structure a web project',
    problem:
      'Uncertainty about where to put files, styles, images, and helper utilities.',
    snippet: `my-project/
├── index.html        # Main entry HTML
├── public/           # Static assets (favicon, fonts)
│   └── favicon.ico
├── src/
│   ├── assets/       # Images/SVGs imported by components
│   ├── components/   # Reusable UI pieces
│   ├── data/         # Static datasets, configs
│   ├── pages/        # Full route views
│   ├── styles/       # Global CSS / Tailwind input
│   └── main.jsx      # React/App mount entry
└── package.json`,
    why: "Separating 'pages' (routes) from 'components' (reusable Lego blocks) and 'data' (content) prevents monolithic 1,000-line files that are impossible to maintain."
  },
  {
    id: 'equality-operators',
    category: 'JavaScript Fundamentals',
    title: 'What is the real difference between == and ===?',
    problem:
      'Confusion over type coercion causing subtle bugs in conditionals.',
    snippet: `// == (Loose): converts types behind your back
0 == false;        // true
"" == false;       // true
null == undefined; // true

// === (Strict): checks BOTH type and value (preferred)
0 === false;       // false
"" === false;      // false
null === undefined;// false`,
    why: "Loose equality ('==') triggers JavaScript's implicit type coercion, which has bizarre edge cases. Always default to strict equality ('===') unless you intentionally want null and undefined to match."
  },
  {
    id: 'read-stack-trace',
    category: 'Debugging & DevTools',
    title: 'How to read an error stack trace without panicking',
    problem:
      'A 30-line red error crashes the console, creating overwhelming panic.',
    snippet: `TypeError: Cannot read properties of undefined (reading 'map')
    at UserList (UserList.jsx:14:18)  <-- YOUR FILE & LINE
    at renderWithHooks (react-dom.js:240)  <-- ignore
    at mountComponent (react-dom.js:520)   <-- ignore`,
    why: '90% of a stack trace is internal library calls. Read only line 1 (the error description) and the topmost line that points to a file YOU wrote. That line is where the bug lives.'
  },
  {
    id: 'ask-for-help',
    category: 'Professional Developer Habits',
    title: 'How to ask for help on a team or forum',
    problem:
      "Asking 'it doesn't work, please help' leads to frustrated teammates or ignored forum posts.",
    snippet: `/* Template for a 5-star bug report: */

1. Goal: "I'm trying to fetch the user profile from /api/user."
2. What happened: "Console prints: 401 Unauthorized."
3. What I expected: "To receive the user JSON object."
4. What I already tried: "I checked localStorage for the
   auth token and confirmed it exists."
5. Code snippet: (Paste only the relevant 5-10 lines)`,
    why: 'Senior developers and teammates are eager to help juniors who show what they tried. Providing the exact error and expected outcome gets you an answer in 2 minutes instead of 2 days.'
  }
];
