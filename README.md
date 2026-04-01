# cstack

A skill pack that turns GitHub Copilot into a virtual engineering team. Opinionated slash commands for every phase of a sprint — plan, review, test, debug, and ship — built on VS Code's [Agent Skills](https://agentskills.io) open standard.

## Quick Start

```bash
# Clone the repo anywhere
git clone --depth 1 https://github.com/dyrota/cstack.git
cd cstack

# Personal install (works across all projects)
./setup
# Skills → ~/.vscode/agents/skills/
# Agents → ~/.github/agents/

# OR: Project install (from within your project)
./setup --local
# Skills → <project-root>/.agents/skills/
# Agents → <project-root>/.github/agents/
```

## Skills

| Command | Role | What it does |
|---|---|---|
| `/plan` | Eng Manager | Read-only implementation plan with diagrams |
| `/review` | Staff Engineer | Find production bugs before they ship |
| `/test` | Tester | Run tests, find gaps, write missing coverage |
| `/ship` | Release Engineer | Sync, test, commit, open PR |
| `/debug` | Debugger | Systematic root-cause debugging |

## Workflow

```
/plan → [implement] → /review → /test → /ship
                                          ↑
                               /debug anytime
```

Use `/skill` to run a phase. Use `@agent` to work with a persona.

## Post-MVP Skills

These are **designed but not yet implemented** — invoking them will not work. They are included here as a roadmap:

| Command | Purpose |
|---|---|
| `/think` | Reframe the problem before writing code (forcing questions, 3 approaches) |
| `/audit` | Security review: OWASP Top 10 + STRIDE threat model |
| `/retro` | Weekly retrospective: git log summary, shipping streaks, stale branches |
| `/document` | Update README, ARCHITECTURE.md, and inline docs to match what shipped |

## Why

Copilot is powerful. cstack makes it structured. Each skill knows its role, its tools, and when to hand off to the next step.

See [SPEC.md](./SPEC.md) for the full design.

## License

MIT
