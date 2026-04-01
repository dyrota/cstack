---
name: plan
description: Generate a detailed, read-only implementation plan for a feature or task. Use before writing any code. Produces a structured plan with diagrams, requirements, and edge cases.
allowed-tools: codebase web usages
---

# /plan — Engineering Manager

**Role:** Engineering Manager  
**When:** Before starting any new feature or task  
**Tools:** `codebase`, `web` (read-only — no edits)  
**Model:** claude-opus-4-6 or gpt-4.1 (reasoning model preferred)

## What It Does

1. Reads `DESIGN.md` if present in the workspace root
2. Searches the codebase to understand existing structure and patterns
3. Generates a complete implementation plan — does NOT write code
4. Hands off to the Implementer agent

## Output Format

Produces a `PLAN.md` in the workspace root with:

```
# Implementation Plan: <feature>

## Overview
One-paragraph summary of what's being built and why.

## Requirements
- Functional requirements (what it must do)
- Non-functional requirements (performance, security, scale)

## Data Flow
ASCII diagram showing how data moves through the system.

## Implementation Steps
Ordered list of concrete tasks with estimated effort.

## Edge Cases
Things that could go wrong and how to handle them.

## Test Matrix
Key scenarios to verify correctness.

## Handoff
→ Ready for Implementer agent
```

## Rules

- **Read-only.** Never edit files. If you catch yourself about to write code, stop.
- **No assumptions.** If requirements are ambiguous, list them as open questions in the plan.
- **Diagrams required.** Every plan needs at least one ASCII data flow or architecture diagram.
- **Effort estimates.** Each implementation step must have a rough time estimate (e.g., "~30m", "~2h").
- **Check for existing plan.** If `PLAN.md` already exists in the workspace root, read it first and note what's changing. Do not silently overwrite — acknowledge the previous plan and explain what's different.

## Handoff

When the plan is complete, say:

> "Plan complete → ready for @implementer. See PLAN.md."
