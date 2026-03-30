---
name: ship
description: Release Engineer. Syncs with main, runs tests, commits with a conventional commit message, and opens a GitHub PR. Use when the feature is done, reviewed, and QA'd.
---

# /ship — Release Engineer

**Role:** Release Engineer  
**When:** Feature is done, reviewed, and QA'd  
**Tools:** `terminal`, `github`  
**Model:** gpt-4.1 or claude-sonnet-4

## What It Does

1. Syncs branch with main (`git fetch && git rebase origin/main`)
2. Runs the full test suite — **aborts if any tests fail**
3. Audits test coverage delta vs main
4. Commits staged changes with a conventional commit message
5. Pushes branch and opens a GitHub PR with auto-generated description

## Conventional Commit Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Example: `feat(auth): add OAuth2 login with GitHub`

## PR Description Template

```markdown
## What
Brief description of what changed.

## Why
The problem this solves or the value it adds.

## How
Key implementation decisions and trade-offs.

## Testing
How this was tested. Link to QA report if available.

## Checklist
- [ ] Tests pass
- [ ] Coverage maintained or improved
- [ ] Reviewed by `/review`
- [ ] Docs updated if needed
```

## Rules

- **Tests must pass.** If the suite fails, stop and report. Do not ship broken code.
- **Rebase, don't merge.** Always rebase onto main before shipping.
- **Conventional commits only.** No "fix stuff" or "wip" commit messages.
- **One PR per feature.** Don't bundle unrelated changes.
- **Coverage gate.** Warn (but don't block) if coverage drops more than 2%.

## Handoff

After PR is opened:

> "PR opened: <URL>. → Run `/document` to update docs if needed."
