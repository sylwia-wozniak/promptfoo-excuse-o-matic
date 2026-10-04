# AGENTS.md

Instructions for AI coding agents working in this repo.

## What this is

**Excuse-o-Matic 3000**: a step-by-step [promptfoo](https://promptfoo.dev) tutorial. Each lesson
tests a silly excuse-writing assistant. Everything runs locally on Ollama, at zero cost.
The roadmap is in [docs/PLAN.md](docs/PLAN.md).
A one-page guide for newcomers is in `docs/index.html` (styles in `docs/styles.css`), published
with GitHub Pages. Keep its lesson results in sync with the lesson READMEs.

## Setup and commands

- Node 22.22+ (promptfoo 0.123 requires it), Ollama with `llama3.2:3b`, `qwen2.5:3b`, `gemma3:4b`
- `npm install`, then `npm run lesson:N` (see `package.json`) and `npm run view`
- CI: `.github/workflows/promptfoo-eval.yml` runs **only lesson 10**, manually (`workflow_dispatch`)

## Lesson conventions

- One folder per lesson: `lessons/NN-name/` with `promptfooconfig.yaml`, `README.md`,
  and any `prompts/`, `tests.csv` or `assertions/` files
- Each config starts with a comment listing what's new compared to the previous lesson
- Each lesson runs with one command, has 5–15 tests and finishes in about 1–2 minutes
- Each lesson has one intentionally failing (or flaky) test, so readers see a failure
- Each README has: goal, "What's new" table, how to run it, "What we saw" with real results,
  "Try it yourself" exercises, and Previous/Next links
- Add a `lesson:N` script to `package.json` and a row to the lesson table in `README.md`
- Write in simple, plain English: short sentences, tables, a light tone

## How to work

- Build **one lesson at a time**, then stop and let the owner review it
- Run every lesson on Ollama before documenting it. Quote only real model outputs and real
  numbers in READMEs; never invent results
- Before putting a test in CI, run it a few times: it must not fail every time
- CI stays **Ollama-only**: no hosted models, API keys or secrets

## Commits

Use [Conventional Commits](https://www.conventionalcommits.org/): `type(scope): summary`

- Types: `feat` (new lesson or feature), `fix`, `docs`, `ci`, `chore`, `refactor`, `test`
- Scope is optional, for example `lesson-11`, `ci`, `readme`
- Summary: lowercase, imperative, no period, under 72 characters
- Examples: `feat(lesson-11): add believability classifier`, `fix(readme): correct node version`
