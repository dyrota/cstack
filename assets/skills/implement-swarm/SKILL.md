---
name: c:implement:swarm
description: Swarm implementation — spawn N parallel Builder agents to execute PLAN.md steps. Usage: /c:implement:swarm <N> [description]
tools: ['edit', 'read']
---

# /c:implement:swarm — Parallel Builder Swarm

**Usage:** `/c:implement:swarm <N> [description]`

**Examples:**
- `/c:implement:swarm 4` — 4 Builders execute PLAN.md
- `/c:implement:swarm 3 implement the auth module from PLAN.md steps 3-7`

---

## What to do

Parse the user's prompt to extract:
1. **N** — the first token (a number 1–8). If missing or not a number, respond: "Specify number of workers: `/c:implement:swarm N` (e.g. `/c:implement:swarm 4`)"
2. **description** — everything after N (may be empty)

Validate N:
- N < 1 → error: "N must be between 1 and 8"
- N > 8 → cap at 8, note it: "Capping at 8 workers."

Then write `.cstack/runtime/swarm-trigger.json` with exactly this structure:

```json
{
  "skill": "implement",
  "workerCount": <N>,
  "taskSource": "inline",
  "taskDescription": "<description, or empty string if none>",
  "timestamp": "<current ISO 8601 timestamp>"
}
```

Create `.cstack/runtime/` if it does not exist.

After writing the file, respond:

> "**Swarm trigger written.** The cstack extension will generate a coordinator and `<N>` Builder agents.
>
> If this is your first swarm, run **cstack: Initialize Workspace** from the command palette first.
>
> Once the agents are ready, open a new Copilot Chat session and invoke `@cstack-coordinator-implement` to begin.
>
> Task: *<description or 'Execute PLAN.md'>*"

## Rules
- Write ONLY `.cstack/runtime/swarm-trigger.json`
- Do not start implementing — that is the coordinator's job
- If no PLAN.md exists and no description was given, ask: "No PLAN.md found and no description provided. Describe the implementation task:"
