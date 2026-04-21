# Study Grader

Flask web app that grades free-recall study sessions against textbook chapter content using a local LLM. Select a chapter, write everything you remember, get a scored breakdown with flashcards for what you missed.

## What It Does

- A JS bookmarklet extracts chapter text from Cengage (MindTap) or McGraw-Hill (Connect), bypassing their clipboard blocks, and downloads it as a `.md` file
- The web app loads those files into a dropdown, accepts a free-recall dump, and sends both to the grading model
- Output: a score (0–100), concepts split into Got It / Partial / Missed, written feedback on each partial, and a flashcard for every partial or missed concept
- Results auto-save to a local Markdown session file with the same breakdown
- Flashcard table has a one-click copy in Quizlet import format (tab-separated, one card per line)

## Architecture

| File | Role |
|------|------|
| `grader.py` | Pure grading logic — prompt construction, LLM routing, JSON parsing, retry. No Flask dependency. |
| `sessions.py` | Session formatting and disk save with date-based deduplication |
| `app.py` | Flask routes only — index, grade, error handling |
| `bookmarklet.js` | DOM extraction script for Cengage and McGraw-Hill chapter pages |
| `config.py` | Env var loading with defaults |

`grader.py` has no Flask or SQLite imports — unit tests import it directly without an app context.

## Setup

```bash
git clone <repo>
cd study-grader-web
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Requires [Ollama](https://ollama.com) running locally:

```bash
ollama pull deepseek-r1:7b
ollama serve
python app.py
# → http://localhost:5000
```

Set `ANTHROPIC_API_KEY` in `.env` to use the Anthropic API instead of Ollama. The two are not a fallback pair — whichever is configured runs.

## Bookmarklet

See `bookmarklet.md` for install instructions. Open a chapter, scroll to the bottom so all content loads, click the bookmarklet, enter a slug. Move the downloaded `.md` to the textbooks directory. Run once per chapter page — paginated chapters need one run per page.

## Config

| Variable | Default | Description |
|----------|---------|-------------|
| `OLLAMA_MODEL` | `deepseek-r1:7b` | Ollama model |
| `OLLAMA_URL` | `http://localhost:11434` | Ollama base URL |
| `ANTHROPIC_API_KEY` | — | Use Anthropic API instead of Ollama |
| `TEXTBOOKS_DIR` | `~/obsidians/vaulting/school-related/textbooks` | Chapter source folder |
| `SESSIONS_DIR` | `~/obsidians/vaulting/school-related/sessions` | Session save folder |
| `MAX_WORDS` | `6000` | Chapter word cap before truncation |

## Tests

```bash
python -m pytest tests/ -v
```

30 tests: 15 grading logic tests (truncation, JSON parsing, think-tag stripping, retry behavior), 9 session formatting and save tests, 6 Flask route tests.

## Design Decisions

- **Why local LLM?** Textbook chapter content is copyrighted. Routing it through a cloud API sends that content to a third-party server. Ollama runs inference locally so chapter text stays on the machine.
- **Why retry on bad JSON?** `deepseek-r1:7b` occasionally wraps its output in `<think>` reasoning blocks before the JSON. The retry appends the malformed response and asks for a clean JSON-only correction. Two failures in a row surface an error page rather than silently returning partial data.
- **Why a bookmarklet instead of a scraper?** Cengage and McGraw-Hill both block programmatic access. The bookmarklet runs as the logged-in user's browser session, reads the rendered DOM, and doesn't touch the network — nothing to block.
- **Why Markdown output?** Session files open in Obsidian alongside the chapter notes they came from. No separate app to check.
