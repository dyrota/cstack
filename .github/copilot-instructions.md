# cstack

This project uses [cstack](https://github.com/dyrota/cstack) — a skill pack that turns GitHub Copilot into a virtual engineering team.

For the full skill reference, agent list, and workflow, see the [cstack README](https://github.com/dyrota/cstack#readme).

## Workflow

```
/c:plan → /c:implement → /c:review → /c:test → /c:ship → /c:document
```

Use `/c:checkpoint` to save/resume context between sessions. Use `/c:retro` for weekly retrospectives.

Use `/skill` to run a phase. Use `@agent` to work with a persona.

## Rules

- Run `/c:plan` before starting any non-trivial feature (it will ask clarifying questions if needed)
- Run `/c:review` before opening any PR
- Run `/c:test` before `/c:ship`
- `/c:ship` will abort if tests fail — don't try to sneak broken code past it
- `/c:debug` requires root cause before any fix (Iron Law)
- Run `/c:document` after `/c:ship` to sync docs with what changed
- Use `/c:checkpoint save` at end of session, `/c:checkpoint resume` at start
