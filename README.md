# Excuse-o-Matic 3000 — a promptfoo tutorial 🙃

Learn [promptfoo](https://promptfoo.dev) step by step by testing a silly assistant that writes
excuses for everyday mishaps.

**Zero cost:** everything runs locally on [Ollama](https://ollama.com). You need no API keys.

**New here?** Start with the [beginner's guide](https://sylwia-wozniak.github.io/promptfoo-excuse-o-matic/): what evals are, the key words, and what each lesson teaches.

## Setup

1. Install **Node.js 22.22+** and **Ollama**
2. Download the model (about 2 GB):
   ```bash
   ollama pull llama3.2:3b
   ```
   Lessons 4, 8 and 9 also use `qwen2.5:3b` (~1.9 GB), and lessons 4 and 8 use `gemma3:4b` (~3.3 GB).
3. Install dependencies (this installs promptfoo locally):
   ```bash
   npm install
   ```
4. Check that Ollama is running:
   ```bash
   curl http://localhost:11434/api/version
   ```

## Lessons

| # | Lesson | You'll learn |
|---|--------|--------------|
| 1 | [Hello eval](lessons/01-hello-eval/) | prompts, providers, tests, basic assertions, `promptfoo view` |
| 2 | [Variables & CSV](lessons/02-variables-and-csv/) | several vars, tests from CSV, `defaultTest`, templated assertions |
| 3 | [Prompt vs prompt](lessons/03-prompt-vs-prompt/) | comparing prompts side by side, prompt files, labels, `icontains-any` |
| 4 | [Model vs model](lessons/04-model-vs-model/) | comparing models, provider labels, `latency`, `maxConcurrency` |
| 5 | [Structured JSON](lessons/05-structured-json/) | `is-json` + JSON Schema, multi-line `javascript`, Ollama `format`, YAML anchors |
| 6 | [LLM-as-judge](lessons/06-llm-as-judge/) | `llm-rubric`, choosing a judge, `metric`, `echo` provider, testing the judge |
| 7 | [Custom assertions](lessons/07-custom-assertions/) | assertions in `.js` and `.py` files, `{ pass, score, reason }`, partial scores |
| 8 | [Guardrails & refusals](lessons/08-guardrails-refusals/) | under- vs over-refusal, refusal marker, `weight` + `threshold`, `is-refusal` pitfall |
| 9 | [Flakiness & repeats](lessons/09-flakiness-and-repeats/) | `repeat`, temperature 0 vs 1, the cache and `--no-cache`, telling flaky from broken |
| 10 | [CI with GitHub Actions](lessons/10-ci-github-actions/) | a manual `workflow_dispatch` workflow, Ollama in CI, pass-rate bar, `echo` smoke test |

All 10 core lessons are done. Bonus lessons may follow: see the [plan](docs/PLAN.md).
