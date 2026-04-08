# Site Builder Specification

## Overview
Personalized static portfolio site builder. Users chat with an AI, optionally upload a resume, and get a themed portfolio site generated and hosted.

## User Flow
1. User lands on homepage, clicks "Start Building"
2. AI conversation begins (Discovery phase, 3-8 messages)
3. User can optionally upload a resume (docx/pdf) during chat
4. AI proposes 2-3 themed directions (Theme Proposal phase)
5. User picks a theme (or iterates)
6. AI extracts ProfileData and generates site (Generation phase)
7. User sees preview, can open generated site at unique slug

## Tech Stack
- Next.js 15 (App Router), TypeScript, Tailwind CSS
- SQLite + Drizzle ORM
- Claude API (Sonnet) with tool_use
- mammoth (docx) + pdf-parse (pdf)
- Handlebars templates

## Conversation Phases

### Discovery
- AI interviews user about work, projects, personality, design preferences
- If resume uploaded, skip factual questions, focus on personality/preferences
- AI signals readiness by calling `ready_for_themes` tool

### Theme Proposal
- AI proposes 2-3 themed directions using `propose_themes` tool
- Each proposal includes: name, description, template ID, color palette, personality vibe
- User selects one (or asks for modifications)

### Generation
- AI extracts full `ProfileData` using `save_profile` tool
- Handlebars template renders base HTML/CSS
- LLM personality pass modifies CSS for creative touches
- Validator checks output; falls back to template-only if pass fails
- Site stored and served at catch-all route `/[slug]`

## Data Model
See `src/lib/types/index.ts` for complete type definitions.

Tables: conversations, messages, resumes, sites

## API Endpoints
- `POST /api/conversations` - Create conversation
- `GET /api/conversations/[id]` - Get conversation with messages
- `POST /api/conversations/[id]/messages` - Send message (core chat)
- `POST /api/resume` - Upload and parse resume
- `POST /api/sites` - Trigger site generation
- `GET /api/sites/[id]` - Get site data
- `GET /[slug]` - Serve generated site (catch-all)
