---
name: c:debug:swarm
description: Swarm debugging — spawn N parallel Debugger agents to investigate hypotheses in parallel. Usage: /c:debug:swarm <N> <bug description>
tools: ['edit', 'read']
---

# /c:debug:swarm — Parallel Debugger Swarm

**Usage:** `/c:debug:swarm <N> <bug description>`

**Examples:**
- `/c:debug:swarm 3 login endpoint returns 500 on first request after deploy`
- `/c:debug:swarm 2 race condition in session store causes intermittent failures`

---

## What to do

Parse the user's prompt to extract:
1. **N** — the first token (a number 1–8). If missing or not a number, respond: "Specify number of workers: `/c:debug:swarm N <bug description>` (e.g. `/c:debug:swarm 3 login returns 500`)"
2. **bug description** — everything after N. If empty, ask: "Describe the bug:"

Validate N:
- N < 1 → error: "N must be between 1 and 8"
- N > 8 → cap at 8, note it: "Capping at 8 workers."

Then write `.cstack/runtime/swarm-trigger.json`:

```json
{
  "skill": "debug",
  "workerCount": <N>,
  "taskSource": "inline",
  "taskDescription": "<bug description>",
  "timestamp": "<current ISO 8601 timestamp>"
}
```

Create `.cstack/runtime/` if it does not exist.

After writing, respond:

> "**Swarm trigger written.** The cstack extension will generate a coordinator and `<N>` Debugger agents.
>
> Once ready, open a new Copilot Chat session and invoke `@cstack-coordinator-debug` to begin.
>
> The coordinator will generate `<N>` distinct hypotheses and dispatch one Debugger per hypothesis. Debuggers are read-only — no edits until root cause is confirmed."

## Rules
- Write ONLY `.cstack/runtime/swarm-trigger.json`
- Do not investigate the bug yourself
- A bug description is required — do not proceed without one
