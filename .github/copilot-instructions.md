# cstack

This project uses [cstack](https://github.com/dyrota/cstack) — a skill pack that turns GitHub Copilot into a virtual engineering team.

For the full skill reference, agent list, and workflow, see the [cstack README](https://github.com/dyrota/cstack#readme).

## Workflow

```
/plan → [implement] → /review → /test → /ship → /document
```

Use `/checkpoint` to save/resume context between sessions. Use `/retro` for weekly retrospectives.

Use `/skill` to run a phase. Use `@agent` to work with a persona.

## Rules

- Run `/plan` before starting any non-trivial feature (it will ask clarifying questions if needed)
- Run `/review` before opening any PR
- Run `/test` before `/ship`
- `/ship` will abort if tests fail — don't try to sneak broken code past it
- `/debug` requires root cause before any fix (Iron Law)
- Run `/document` after `/ship` to sync docs with what changed
- Use `/checkpoint save` at end of session, `/checkpoint resume` at start
