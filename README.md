# cstack

A skill pack that turns GitHub Copilot into a virtual engineering team. Opinionated slash commands for every phase of a sprint — plan, review, test, debug, and ship — built on VS Code's [Agent Skills](https://agentskills.io) open standard.

## Installation

### Option 1: VS Code Extension (recommended)

The extension bundles everything and auto-installs skills on activation.

**Install from VSIX (local build):**

```bash
git clone --depth 1 https://github.com/dyrota/cstack.git
cd cstack
npm install
npm run package        # produces cstack-<version>.vsix
code --install-extension cstack-*.vsix
```

Once installed, open VS Code — skills and agents are available immediately. Use `cstack: Doctor` from the Command Palette to verify.

> A Marketplace release is planned. Until then, install from VSIX.

### Option 2: Script Install (no extension)

Copies skills and agents directly into VS Code's discovery paths without installing the extension. Useful if you just want the slash commands without the extension overhead.

**macOS / Linux**

```bash
git clone --depth 1 https://github.com/dyrota/cstack.git
cd cstack

# Personal install (works across all projects)
./setup
# Skills → ~/.vscode/agents/skills/
# Agents → ~/.github/agents/

# OR: Project install (run from within your project)
./setup --local
# Skills → <project-root>/.agents/skills/
# Agents → <project-root>/.github/agents/
```

**Windows (PowerShell)**

```powershell
git clone --depth 1 https://github.com/dyrota/cstack.git
cd cstack

# Personal install (works across all projects)
.\setup.ps1
# Skills → %APPDATA%\Code\User\agents\skills\
# Agents → %USERPROFILE%\.github\agents\

# OR: Project install (run from within your project)
.\setup.ps1 -Local
# Skills → <project-root>\.agents\skills\
# Agents → <project-root>\.github\agents\
```

> **Note (Windows):** If you get an execution policy error, run:
> `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`

### What's the difference?

| | Extension | Script install |
|---|---|---|
| Skills & agents | ✅ | ✅ |
| Swarm orchestration | ✅ | ❌ |
| Status bar + Doctor | ✅ | ❌ |
| Auto-install on activation | ✅ | ❌ |
| No build step required | ❌ | ✅ |

## Skills

| Command | Role | What it does |
|---|---|---|
| `/c:plan` | Engineering Manager | Interactive implementation plan with diagrams |
| `/c:implement` | Senior Engineer | Execute PLAN.md step-by-step, verify as you go |
| `/c:review` | Staff Engineer | Find production bugs before they ship |
| `/c:test` | Tester | Run tests, find gaps, write missing coverage |
| `/c:ship` | Release Engineer | Sync, test, commit, open PR |
| `/c:debug` | Debugger | Systematic root-cause debugging |
| `/c:checkpoint` | Staff Engineer | Save and resume working context across sessions |
| `/c:retro` | Engineering Manager | Weekly retrospective from git history |
| `/c:document` | Documenter | Sync docs after shipping |

## Workflow

```
/c:plan → /c:implement → /c:review → /c:test → /c:ship
                                          ↑
                               /c:debug anytime
                        /c:checkpoint to save/resume
                         /c:retro for weekly review
                     /c:document to sync docs after ship
```

Use `/skill` to run a phase. Use `@agent` to work with a persona.

## Agents

| Agent | Role | Model |
|---|---|---|
| `@planner` | Read-only planning | claude-opus-4.6 → claude-sonnet-4.6 |
| `@reviewer` | Code review (reports only) | claude-opus-4.6 → claude-sonnet-4.6 |
| `@implementer` | Full-edit implementation | claude-opus-4.6 → claude-sonnet-4.6 |
| `@tester` | Test coverage and verification | claude-opus-4.6 → claude-sonnet-4.6 |

> `@chronicler` is used internally by `/c:checkpoint` and does not appear in the agents dropdown.

## Post-MVP Skills

These are **designed but not yet implemented** — invoking them will not work. They are included here as a roadmap:

| Command | Purpose |
|---|---|
| `/c:think` | Reframe the problem before writing code (forcing questions, 3 approaches) |
| `/c:audit` | Security review: OWASP Top 10 + STRIDE threat model |

## Why

Copilot is powerful. cstack makes it structured. Each skill knows its role, its tools, and when to hand off to the next step.

See [SPEC.md](./SPEC.md) for the full design.

## License

MIT
