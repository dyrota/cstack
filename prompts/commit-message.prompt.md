---
description: Generate a conventional commit message for staged changes
---

Look at the currently staged changes (`git diff --cached`). Generate a conventional commit message.

Format:
```
<type>(<scope>): <description>

[optional body]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Rules:
- Subject line ≤ 72 characters
- Use imperative mood ("add", not "added" or "adds")
- Scope should be the most relevant module, directory, or feature area
- Body explains *why*, not *what* (the diff shows what)
- If multiple unrelated changes are staged, recommend splitting into separate commits

Example: `feat(auth): add OAuth2 login with GitHub`
