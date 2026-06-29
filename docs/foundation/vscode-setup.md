# HomeHero - VS Code Environment Setup & IDE Standards

**Prepared by**: Senior Full Stack Developer  
**Target Audience**: Frontend, Backend, & Full-Stack Engineers  
**Focus**: Workspace settings, formatting rules, linting, & debugging profiles

---

## 1. Recommended Extensions

To maintain consistent formatting, code quality, and debugging efficiency across the team, install these extensions:

*   **Linter & Formatter**:
    *   *ESLint* (`dbaeumer.vscode-eslint`): Enforces JavaScript styling and catches code smells.
    *   *Prettier - Code Formatter* (`esbenp.prettier-vscode`): Standardizes layout syntax.
*   **Framework Support**:
    *   *Tailwind CSS IntelliSense* (`bradlc.vscode-tailwindcss`): Auto-completes utility classes.
    *   *Simple React Snippets* (`burkeholland.simple-react-snippets`): Accelerates React functional component development.
*   **Git & Utilities**:
    *   *GitLens — Git supercharged* (`eamodio.gitlens`): In-line blame annotations and commits history mapping.
    *   *Thunder Client* (`rangav.vscode-thunder-client`): Clean GUI REST API testing client inside the IDE.

---

## 2. Workspace Configurations (`.vscode/settings.json`)

Create a `.vscode/settings.json` file in the monorepo root to synchronize compiler formatting rules automatically:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "javascript.validate.enable": false,
  "files.trimTrailingWhitespace": true,
  "files.insertFinalNewline": true,
  "tailwindCSS.experimental.classRegex": [
    "class:\\s*\"([^\"]*)\""
  ]
}
```

---

## 3. Recommended Extensions List (`.vscode/extensions.json`)

Expose these recommendations directly in the team's editor workspace:

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "eamodio.gitlens",
    "rangav.vscode-thunder-client"
  ]
}
```

---

## 4. Debugger Profiles (`.vscode/launch.json`)

Configure standard debug targets to debug Express and React controllers:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Express Backend",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "cwd": "${workspaceFolder}/backend",
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "type": "chrome",
      "request": "launch",
      "name": "Debug Vite Frontend",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/frontend"
    }
  ]
}
```

---

## 5. Terminal & Shell Integrations

For Windows workspaces, PowerShell is recommended. Add the following aliases to your shell profile to speed up monorepo development:

```powershell
# Quick monorepo task runners
function run-backend { cd backend; npm run dev }
function run-frontend { cd frontend; npm run dev }
function run-test-all { npm run install:all; npm run lint }
```

---

## 6. Developer Productivity Tips

- **Format on Save**: Enabled via `editor.formatOnSave`. No more manually resolving whitespace conflicts in pull requests.
- **Multiline Cursor Editing**: Hold `Alt + Click` (Windows) to edit code in multiple locations simultaneously.
- **Command Palette**: Press `Ctrl + Shift + P` to access all VS Code commands.
- **File Switcher**: Press `Ctrl + P` to quickly search and switch between project files.
