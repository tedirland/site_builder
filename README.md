# Site Builder

A personalized portfolio site builder. Chat with an AI, optionally upload your resume, and get a themed portfolio site generated and hosted -- all in minutes.

## Quick Start

### Prerequisites

- Node.js 18+
- An [Anthropic API key](https://console.anthropic.com/)

### Setup

```bash
# Install dependencies
npm install

# Create your environment file
cp .env.local.example .env.local
# Edit .env.local and add your Anthropic API key

# Initialize the database
npx drizzle-kit push

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

Create a `.env.local` file in the project root:

```
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

Without a valid API key (starting with `sk-ant-`), the app falls back to stub responses for development.

## How It Works

1. **Chat** -- An AI interviews you about your work, skills, and personality (3-8 messages)
2. **Upload Resume** (optional) -- Upload a `.pdf` or `.docx` to skip factual questions
3. **Pick a Theme** -- The AI proposes 2-3 themed portfolio directions based on your conversation
4. **Get Your Site** -- A portfolio site is generated and served at a unique URL

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Database | SQLite + Drizzle ORM |
| AI | Claude API (Sonnet) with tool_use |
| Resume Parsing | mammoth (docx), pdf-parse (pdf) |
| Templates | Handlebars (3 base layouts) |
| Frontend | React, Tailwind CSS |

## Project Structure

```
src/
  app/
    api/
      conversations/    # Chat endpoints
      resume/           # Resume upload + parsing
      sites/            # Site generation
    [site]/             # Catch-all route serving generated sites
  components/
    chat/               # ChatContainer, MessageBubble, ChatInput
    theme/              # ThemeCard, ThemeSelector
    preview/            # SitePreview (iframe + toolbar)
    ui/                 # Button, FileUpload, LoadingSpinner
  lib/
    ai/                 # Claude API client, prompts, tool schemas
    db/                 # Drizzle schema, connection, queries
    generation/         # Handlebars engine, orchestrator, templates
    parsing/            # PDF + DOCX resume extraction
    hooks/              # useConversation, useResumeUpload
    types/              # Shared type contracts
```

## Available Scripts

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # Lint
npm run test         # Run unit tests (vitest)
npm run test:watch   # Run tests in watch mode
npm run test:e2e     # Run Playwright E2E tests
npx drizzle-kit push # Apply DB schema changes
```

## Templates

Three base portfolio layouts, customized per-user by an AI personality pass:

- **modern-minimal** -- Clean single-column, sans-serif, muted colors
- **bold-creative** -- Dark theme, gradient headings, card-based grid
- **classic-professional** -- Serif headings, conservative colors, bordered sections

## Testing

102 unit tests + 16 E2E tests.

```bash
# Unit tests
npm run test

# E2E tests (starts dev server automatically)
npm run test:e2e
```

## License

MIT
