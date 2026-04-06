---
description: Analyze test coverage and identify untested code paths
---

Analyze test coverage for the current file or feature area.

Steps:
1. Identify the test framework in use (check `package.json`, `pytest.ini`, `go.mod`, `Makefile`, etc.)
2. Run the test suite with coverage enabled via `terminal`
3. Parse the coverage report to find untested code paths
4. Focus on the currently open file or the feature area the user specifies

Report:
- **Current coverage** — percentage and which lines/branches are covered
- **Untested paths** — list specific functions, branches, or error handlers that lack tests
- **Risk assessment** — which untested paths are most likely to cause production issues
- **Suggested tests** — concrete test cases (description + expected behavior) for the highest-risk gaps

Prioritize paths that handle errors, edge cases, and external inputs over happy-path code that's already well-covered.
