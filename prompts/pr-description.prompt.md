---
description: Generate a PR description with What/Why/How/Testing/Checklist sections
---

Look at the current branch's changes compared to `main`. Generate a pull request description using this template:

## What
Brief description of what changed.

## Why
The problem this solves or the value it adds.

## How
Key implementation decisions and trade-offs.

## Testing
How this was tested. Include test results or link to `/test` report if available.

## Checklist
- [ ] Tests pass
- [ ] Coverage maintained or improved
- [ ] Reviewed by `/review`
- [ ] Docs updated if needed

Use `codebase` to understand the changes and write a description that a reviewer can understand without reading every line of code. Be specific — no generic filler.
