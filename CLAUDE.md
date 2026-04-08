# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personalized static portfolio site builder. Users chat with an AI, optionally upload a resume, and get a themed portfolio site generated and hosted. Pre-implementation phase — start with `planning/`.

## Tech Stack (Planned)

- **Framework**: Next.js (App Router)
- **Database**: SQLite + Drizzle ORM
- **AI**: Claude API (Sonnet) with tool_use for structured extraction
- **Resume parsing**: mammoth (docx) + pdf-parse (pdf)
- **Templates**: Handlebars
- **Hosting**: Generated sites served via catch-all Next.js route for MVP

## Build & Dev Commands

Once the Next.js project is scaffolded:
```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # Lint
npx drizzle-kit push # Apply DB schema changes
```

## Architecture

Three-phase AI conversation flow:
1. **Discovery** — AI interviews user (3-8 messages), skips factual Qs if resume uploaded
2. **Theme Proposal** — AI proposes 2-3 themed directions, user picks/iterates
3. **Generation** — Extract `ProfileData` JSON via tool_use, generate site

Site generation is a **hybrid approach**: Handlebars templates guarantee layout structure, then an LLM "personality pass" modifies CSS details and adds creative touches without breaking layout. Template-only fallback if validation fails.

Key directories (planned):
- `lib/ai/` — system prompts, profile extraction schema, personality pass logic
- `lib/generation/` — Handlebars templates + orchestration
- `lib/parsing/` — docx/pdf resume parsing
- `lib/db/` — Drizzle schema (users, conversations, messages, sites, resumes)
- `planning/` — project docs, specs, status tracking

## Rolling Context

- **Project status**: `planning/PROJECT_STATUS.md` — keep this updated after every implementation session
- **Specs**: `planning/specs/SPEC.md`

## Project Rules

- ALWAYS update `planning/PROJECT_STATUS.md` with current implementation status
- ALWAYS create handoff notes for the next agent after completing work
- Leave the codebase and documentation cleaner than you found it
- When orchestrating sub-agents, wait for them to complete — don't do their work for them