---
name: checkpoint
description: Save and resume working context across sessions. Captures git state, decisions, and remaining work into CHECKPOINT.md so you can pick up exactly where you left off.
allowed-tools: codebase terminal edit
---

# /checkpoint — Staff Engineer

**Role:** Staff Engineer  
**When:** End of a work session, or start of a new one  
**Tools:** `codebase`, `terminal`, `edit`

## Subcommands

- `/checkpoint` or `/checkpoint save` — capture current state
- `/checkpoint resume` — read checkpoint and brief the user
- `/checkpoint list` — show if a checkpoint exists

---

## /checkpoint save

1. Run these in `terminal`:
   - `git branch --show-current`
   - `git status --short`
   - `git log --oneline -10`
   - `git diff --stat`
2. Use `codebase` to understand what was being worked on (recent changes, open files context)
3. Write `CHECKPOINT.md` to the workspace root using `edit`. Format:

```markdown
---
branch: <current-branch>
timestamp: <ISO 8601 with timezone>
status: in-progress
---

## Working On
[one paragraph: what feature/task is in progress and current state]

## Decisions Made
- [key decisions and why]

## Remaining Work
1. [highest priority next step]
2. [subsequent steps in order]

## Notes
[gotchas, blocked items, open questions, anything future-you needs to know]
```

### Rules for save

- **Read-only on source files.** Only write `CHECKPOINT.md` — never touch source code.
- **Be specific.** "Working on auth" is useless. "Implementing OAuth2 token refresh in `src/auth/refresh.ts`, have the happy path done, need error handling for expired refresh tokens" is useful.
- **Capture decisions.** If you chose approach A over B, say why. Future-you won't remember.
- **Overwrite previous checkpoint.** There's only one `CHECKPOINT.md` — no versioned history.

---

## /checkpoint resume

1. Read `CHECKPOINT.md` from the workspace root
2. Run `git status --short` and `git log --oneline -5` to see if anything changed since the checkpoint
3. Brief the user:
   - What they were working on
   - Key decisions already made
   - What's left to do (in priority order)
   - Any notes or blockers
4. If the git state diverged from the checkpoint (different branch, new commits), note what changed
5. Ask: "Ready to continue, or want to adjust the plan?"

---

## /checkpoint list

1. Check if `CHECKPOINT.md` exists in the workspace root
2. If yes: show the branch, timestamp, status, and first line of "Working On"
3. If no: say "No checkpoint found. Run `/checkpoint save` to create one."

---

## Handoff

After saving: "Checkpoint saved to CHECKPOINT.md. Safe to close."

After resuming: Brief the user and offer to continue or hand off to the appropriate skill.
