---
name: c:retro
description: Weekly engineering retrospective from git history. Summarizes commits, LOC changes, shipping streaks, and hotspots. Saves snapshot to .context/retros/.
tools: ['execute', 'read', 'search/codebase', 'search/changes']
---

# /c:retro — Engineering Manager

**Role:** Engineering Manager  
**When:** End of week, end of sprint, or anytime you want a pulse check  
**Tools:** `terminal`, `codebase`  
**Model (recommended):** gpt-4.1 or claude-haiku (fast/cheap)

## Usage

- `/c:retro` — last 7 days (default)
- `/c:retro 14d` — last 14 days
- `/c:retro 30d` — last 30 days

## What It Does

1. Run these git commands in `terminal`:

```bash
# Commit log with stats
git log origin/main --since="N days ago" --format="%H|%aN|%ai|%s" --shortstat

# Contributor summary
git shortlog origin/main --since="N days ago" -sn --no-merges

# Most-changed files
git log origin/main --since="N days ago" --format="" --name-only | sort | uniq -c | sort -rn | head -10
```

2. Compute from the output:
   - **Commit count** (total, excluding merges)
   - **LOC added / deleted** (from shortstat)
   - **Active days** (unique dates with commits)
   - **Top 10 files changed** (hotspot analysis)
   - **Commit type breakdown** — categorize by conventional commit prefix (`feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `other`)
   - **Shipping streak** — longest run of consecutive days with at least one commit

3. Use `codebase` to add context if needed (e.g., understanding what a hotspot file does).

## Output Format

### 1. Tweetable One-Liner
Start with a single sentence summary. Example:
> "7 days: 23 commits, +1,204/-389 lines, 5 features shipped, 3-day streak 🔥"

### 2. Summary Table

```
Period:          last 7 days
Commits:         23
LOC added:       1,204
LOC deleted:     389
Active days:     5/7
Shipping streak: 3 days
```

### 3. Commit Type Breakdown

```
feat:     12 (52%)
fix:       5 (22%)
refactor:  3 (13%)
test:      2 (9%)
docs:      1 (4%)
```

### 4. Hotspot Analysis
Top 5 most-changed files with brief context on why they're hot.

### 5. Top 3 Wins
Highlight the most impactful things that shipped.

### 6. 3 Things to Improve
Honest observations — long-lived branches, low test commits, etc.

### 7. 3 Habits for Next Week
Actionable suggestions based on the data.

## Save Snapshot

After generating the retro, save it:

1. Create `.context/retros/` directory if it doesn't exist (use `terminal`: `mkdir -p .context/retros/`)
2. Write the full retro output to `.context/retros/YYYY-MM-DD.md` (today's date)

## Rules

- **Data-driven.** Every claim must trace back to a git command output. No vibes.
- **No cross-project analysis.** One repo at a time.
- **No per-author breakdown.** This is a team retro, not a performance review.
- **No files outside the project.** Only writes to `.context/retros/` within the project directory.
- **Keep it honest.** If nothing shipped, say so. Don't sugarcoat a zero-commit week.
