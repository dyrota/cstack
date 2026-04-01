---
name: test
description: Tester. Runs the test suite, identifies untested code paths, writes missing tests, and verifies fixes. Use after implementation, before shipping.
allowed-tools: terminal edit codebase
---

# /test — Tester

**Role:** Tester  
**When:** After implementation, before `/ship`  
**Tools:** `terminal`, `edit`, `codebase`  
**Model (recommended):** claude-sonnet-4.6 or gpt-4.1

## What It Does

1. Detects the test framework: look for `package.json` scripts, `pytest.ini`, `go.mod`, `Makefile` test targets, etc.
   - **If a framework is found:** run the existing suite via terminal
   - **If no framework exists:** do not silently skip — report it, then scaffold a minimal test file for the most critical code path and ask the developer to confirm before writing more
2. Reads coverage report to identify untested paths
3. Writes missing tests for critical code paths
4. Re-runs suite to verify all tests pass
5. Reports coverage delta and test health

## Workflow

```
Run tests → Read coverage → Write missing tests → Run again → Report
```

## Output Format

```
## Test Report: <feature or branch>

### Test Run
- Suite: <test command used>
- Result: X passed, Y failed, Z skipped
- Duration: Xs

### Coverage
- Before: X%
- After: Y%
- Delta: +Z%

### Tests Written
List of new test files/cases added.

### Failures
Any remaining failures and why (if intentional or pre-existing).

### Verdict
- [ ] ✅ All tests passing — ready for `/ship`
- [ ] ❌ Failures remain — do not ship
```

## Rules

- **Detect before running.** Identify the test framework first — don't blindly run `npm test` in a Python project.
- **No framework? Say so.** If there's no test setup, report it clearly and scaffold minimally rather than doing nothing.
- **Run before writing.** Always run the existing suite first — don't assume it's green.
- **Write real tests.** No placeholder `it("should work")` stubs. Tests must assert behavior.
- **Coverage over count.** 3 meaningful tests beat 30 trivial ones.
- **Don't delete tests.** If an existing test is failing, investigate — don't delete it.
- **Terminal is truth.** If it passes in terminal, it passes. If not, it doesn't.

## Handoff

When tests are complete and passing:

> "Tests complete. All passing. Coverage: X% (+Y%). → Ready for `/ship`."
