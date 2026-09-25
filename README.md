# Autonomous Agent for Everyday Apps

AI Build Challenge 2026 — Problem Statement 01: Autonomous Agents for Everyday Apps

## Problem

Most AI tools only talk — they tell you what to do, but a person still has to open
each app and do it. This project builds an AI agent that is given a goal and
achieves it inside the apps people already use (WhatsApp, Gmail, Calendar) —
planning the steps, executing them via browser automation, and asking a human
before any risky or irreversible action.

## Scope (Phase 1 lock)

**In scope:**
- WhatsApp message sending (Web automation)
- Email follow-up (Gmail web automation)
- Calendar event creation
- Human approval gate before any risky/irreversible action

**Out of scope (this hackathon):**
- CRM integration
- Web scraping / research agent
- Mobile/phone executor (stretch goal only)
- Multi-user auth system

## Architecture

```
Goal (user input)
      |
      v
Planner (Claude API) -- breaks goal into steps (JSON)
      |
      v
Executor (Playwright) -- performs the action in the real app
      |
      v
Risk Gate -- pauses for human approval on risky steps
      |
      v
Verifier -- confirms success/failure
      |
      v
Report -- summary shown in dashboard
```

## Folder structure

```
ai-agent-project/
  backend/     Node.js + Express + Claude API + Playwright executor
  frontend/    Agent dashboard UI (goal input, plan view, approval, report)
  mobile/      (stretch goal) Android intent-based WhatsApp executor
  docs/        Pitch deck, architecture notes, demo script
```

## Tech stack

- Planner: Claude API (Anthropic)
- Executor: Node.js + Playwright
- Backend: Node.js + Express
- Frontend: HTML/CSS/JS (or React)
- Mobile (stretch): Kotlin, Android Intents

## Success criteria

- [ ] User types a goal, agent shows a generated plan
- [ ] At least one real action executes in a real app (WhatsApp or Gmail)
- [ ] Risky step pauses and shows an Approve/Reject UI
- [ ] Final report is shown after execution
