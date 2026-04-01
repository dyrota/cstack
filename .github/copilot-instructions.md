# cstack

This project uses [cstack](https://github.com/dyrota/cstack) — a skill pack that turns GitHub Copilot into a virtual engineering team.

For the full skill reference, agent list, and workflow, see the [cstack README](https://github.com/dyrota/cstack#readme).

## Workflow

```
/plan → [implement] → /review → /test → /ship
```

## Rules

- Run `/plan` before starting any non-trivial feature
- Run `/review` before opening any PR
- Run `/test` before `/ship`
- `/ship` will abort if tests fail — don't try to sneak broken code past it
- `/debug` requires root cause before any fix (Iron Law)
