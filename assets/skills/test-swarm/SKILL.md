---
name: c:test:swarm
description: Swarm testing — spawn N parallel Tester agents covering different test domains. Usage: /c:test:swarm <N> [description]
tools: ['edit', 'read']
---

# /c:test:swarm — Parallel Tester Swarm

**Usage:** `/c:test:swarm <N> [description]`

**Examples:**
- `/c:test:swarm 3` — 3 Testers cover different test domains
- `/c:test:swarm 2 focus on auth and session modules`

---

## What to do

Parse the user's prompt to extract:
1. **N** — the first token (a number 1–8). If missing or not a number, respond: "Specify number of workers: `/c:test:swarm N` (e.g. `/c:test:swarm 3`)"
2. **description** — everything after N (may be empty)

Validate N:
- N < 1 → error: "N must be between 1 and 8"
- N > 8 → cap at 8, note it: "Capping at 8 workers."

Then write `.cstack/runtime/swarm-trigger.json`:

```json
{
  "skill": "test",
  "workerCount": <N>,
  "taskSource": "inline",
  "taskDescription": "<description, or empty string if none>",
  "timestamp": "<current ISO 8601 timestamp>"
}
```

Create `.cstack/runtime/` if it does not exist.

After writing, respond:

> "**Swarm trigger written.** The cstack extension will generate a coordinator and `<N>` Tester agents.
>
> Once ready, open a new Copilot Chat session and invoke `@cstack-coordinator-test` to begin.
>
> The coordinator will do a read-only scout pass to identify test domains before dispatching workers."

## Rules
- Write ONLY `.cstack/runtime/swarm-trigger.json`
- Do not run any tests yourself — that is the Tester workers' job
