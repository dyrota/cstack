# cstack — Specification

A skill pack for GitHub Copilot in VS Code. Turns Copilot from a general-purpose autocomplete into a virtual engineering team with specialized roles.

---

## What is cstack?

cstack is an opinionated, open-source set of **Agent Skills**, **Custom Agents**, and **Prompt Files** for GitHub Copilot in VS Code. Install it once and gain `/plan`, `/review`, `/test`, `/ship`, `/debug`, and more — all wired to the right Copilot tools, models, and handoffs.

---

## Core Principles

1. **Markdown-first.** Everything is a `.agent.md`, `SKILL.md`, or `.prompt.md`. No compiled binaries, no build step required.
2. **Portable.** Skills follow the [Agent Skills open standard](https://agentskills.io) and work across VS Code Copilot, Copilot CLI, and the Copilot coding agent.
3. **Opinionated defaults, easy overrides.** Each skill ships with sensible defaults. Fork and customize without touching the core.
4. **Think → Plan → Build → Review → Test → Ship.** Skills map to sprint phases and feed into each other.
5. **GitHub Copilot-native.** Uses Copilot's built-in tools (`codebase`, `edit`, `web`, `terminal`, etc.) — no MCP dependency required (MCP is opt-in).

---

## Directory Structure

```
cstack/
├── README.md
├── SPEC.md                        ← this file
├── setup                          ← install script (bash)
├── .github/
│   └── copilot-instructions.md    ← cstack meta-instructions
├── skills/                        ← Agent Skills (SKILL.md standard)
│   ├── plan/                      ← Generate implementation plan (read-only)
│   ├── review/                    ← Staff-level code review
│   ├── test/                      ← QA with real terminal + test runner
│   ├── ship/                      ← Run tests, commit, open PR
│   └── debug/                     ← Systematic root-cause debugging
├── agents/                        ← Custom Agents (.agent.md)
│   ├── planner.agent.md           ← Read-only planning persona
│   ├── reviewer.agent.md          ← Code review persona
│   ├── implementer.agent.md       ← Full-edit implementation persona
│   └── qa.agent.md                ← QA persona with terminal access
└── prompts/                       ← Reusable prompt files (.prompt.md)
    ├── pr-description.prompt.md
    ├── commit-message.prompt.md
    └── test-coverage.prompt.md
```

---

## Skills

### `/plan`
**Role:** Engineering Manager  
**When:** Before starting any new feature or task  
**What it does:**
- Reads `DESIGN.md` if present
- Generates implementation plan with: overview, requirements, data flow diagrams (ASCII), edge cases, test matrix
- Does NOT make code edits (read-only tools only)
- Handoff → @implementer agent

**Tools:** `codebase`, `usages`, `web`  
**Model:** claude-opus-4-5 or gpt-4.1 (reasoning model preferred)

---

### `/review`
**Role:** Staff Engineer  
**When:** After a feature branch is done, before PR  
**What it does:**
- Reviews diff vs main for logic bugs, edge cases, missing error handling
- Auto-flags issues with severity (CRITICAL / WARN / NOTE)
- Does NOT auto-fix — reports only, developer approves
- Handoff → `/test`

**Tools:** `codebase`, `usages`  
**Model:** claude-sonnet-4-5 or gpt-4.1

---

### `/test`
**Role:** QA Lead  
**When:** After implementation, before ship  
**What it does:**
- Runs existing test suite via terminal
- Identifies untested paths from coverage report
- Writes missing tests
- Verifies fixes
- Handoff → `/ship`

**Tools:** `terminal`, `edit`, `codebase`  
**Model:** claude-sonnet-4-5 or gpt-4.1

---

### `/ship`
**Role:** Release Engineer  
**When:** Feature is done, reviewed, and tested  
**What it does:**
- Syncs with main
- Runs tests (fails if tests fail)
- Audits test coverage delta
- Commits with conventional commit message
- Opens GitHub PR with auto-generated description

**Tools:** `terminal`, `github`  
**Model:** gpt-4.1 or claude-sonnet-4-5

---

### `/debug`
**Role:** Debugger  
**When:** Facing a bug with unknown root cause  
**What it does:**
- Forces systematic investigation before any fix
- Traces data flow, surfaces hypotheses, tests each one
- Stops after 3 failed fix attempts and escalates
- Iron Law: no fix without root cause

**Tools:** `codebase`, `usages`, `terminal`  
**Model:** claude-opus-4-5 (deep reasoning required)

---

## Post-MVP Skills

These are planned and designed, but not yet implemented:

### `/think`
**Role:** Facilitator  
**Purpose:** Reframe the problem before writing code. Asks 6 forcing questions, pushes back on feature requests, generates 3 implementation approaches with effort estimates, produces a `DESIGN.md`.  
**Model:** claude-opus-4-5

### `/audit`
**Role:** Chief Security Officer  
**Purpose:** OWASP Top 10 scan + STRIDE threat model. Confidence gate: only surfaces 8/10+ findings. Each finding includes a concrete exploit scenario. Zero noise policy.  
**Model:** claude-opus-4-5

### `/retro`
**Role:** Engineering Manager  
**Purpose:** Weekly retrospective. Reads recent git log and PR history. Summarizes: commits, lines changed, test health, open PRs. Identifies shipping streaks and stale branches.  
**Model:** gpt-4.1 or claude-haiku (fast/cheap)

### `/document`
**Role:** Technical Writer  
**Purpose:** Diffs what changed vs current docs. Updates README, ARCHITECTURE.md, and stale inline docs. Commits doc changes.  
**Model:** gpt-4.1

---

## Custom Agents

### `planner.agent.md`
Read-only planning persona. Tools: `web`, `codebase`, `usages`.  
Handoffs → @implementer.

### `reviewer.agent.md`
Code review persona. Tools: `codebase`, `usages`.  
No edit access. Handoffs → @implementer or @qa.

### `implementer.agent.md`
Full edit persona. Tools: `edit`, `terminal`, `codebase`.  
Handoffs → @reviewer, @qa.

### `qa.agent.md`
QA persona. Tools: `terminal`, `edit`, `codebase`.  
Handoffs → `/ship`.

---

## Installation

### Install globally (personal skills)
```bash
git clone --depth 1 https://github.com/dyrota/cstack.git ~/.copilot/skills/cstack
cd ~/.copilot/skills/cstack && ./setup
```

### Install to a project
```bash
git clone --depth 1 https://github.com/dyrota/cstack.git .github/skills/cstack
cd .github/skills/cstack && ./setup --local
```

The `setup` script:
- Copies agents to `.github/agents/`
- Copies prompts to `.github/prompts/`
- Optionally appends a cstack block to `.github/copilot-instructions.md`

---

## Workflow

```
/plan                 ← generate implementation plan
                      ← [implement via Copilot agent mode]
/review               ← staff engineer review
/test                 ← run tests, fix gaps
/ship                 ← commit + open PR

/debug                ← anytime a bug needs root-cause analysis
```

---

## Tech Stack

- **Format:** Markdown (SKILL.md, .agent.md, .prompt.md)
- **Standard:** [agentskills.io](https://agentskills.io) open standard
- **Install:** Bash setup script
- **Language:** None (pure Markdown config, no runtime)
- **License:** MIT

---

## MVP Scope (v0.1)

- [x] `skills/plan/SKILL.md`
- [x] `skills/review/SKILL.md`
- [x] `skills/test/SKILL.md`
- [x] `skills/ship/SKILL.md`
- [x] `skills/debug/SKILL.md`
- [x] `agents/planner.agent.md`
- [x] `agents/reviewer.agent.md`
- [x] `agents/implementer.agent.md`
- [x] `agents/qa.agent.md`
- [x] `setup` script
- [x] `README.md`
- [ ] GitHub repo public at `dyrota/cstack`

## Post-MVP

- [ ] `skills/think/SKILL.md`
- [ ] `skills/audit/SKILL.md`
- [ ] `skills/retro/SKILL.md`
- [ ] `skills/document/SKILL.md`
- [ ] `agents/security.agent.md`
- [ ] VS Code Marketplace extension (contributes skills via `chatSkills` contribution point)
- [ ] `prompts/` directory with reusable prompt files
- [ ] `/create-cstack` command that generates customization files with AI
