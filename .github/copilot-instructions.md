# cstack

This project uses [cstack](https://github.com/dyrota/cstack) — a skill pack that turns GitHub Copilot into a virtual engineering team.

## Skills

Use these slash commands in Copilot Chat:

| Command | Role | When |
|---|---|---|
| `/plan` | Engineering Manager | Before writing code |
| `/review` | Staff Engineer | Before any PR |
| `/qa` | QA Lead | After implementation |
| `/ship` | Release Engineer | When ready to merge |
| `/investigate` | Debugger | When facing unknown bugs |

## Agents

Use these custom agents via `@agent-name` in Copilot Chat:

| Agent | Role |
|---|---|
| `@planner` | Read-only planning |
| `@reviewer` | Code review (reports only) |
| `@implementer` | Full-edit implementation |
| `@qa` | QA and test coverage |

## Workflow

```
/plan → [implement] → /review → /qa → /ship
```

## Rules

- Run `/plan` before starting any non-trivial feature
- Run `/review` before opening any PR
- Run `/qa` before `/ship`
- `/ship` will abort if tests fail — don't try to sneak broken code past it
- `/investigate` requires root cause before any fix (Iron Law)
