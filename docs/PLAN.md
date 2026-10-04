# Plan: promptfoo tutorial repo — "Excuse-o-Matic 3000" 🙃

A step-by-step, **zero-cost** tutorial repo showing how to use [promptfoo](https://promptfoo.dev)
to test LLM prompts. Everything runs **locally on Ollama**, so there are no API keys and no bills.

## The theme

**Excuse-o-Matic 3000** is an assistant that writes creative excuses for everyday mishaps,
like "I'm late for standup" or "I ate my roommate's leftovers".

It works well for teaching evals because:
- it's light and funny, so readers enjoy the output
- it has clear rules we can check: short, polite, and funny, **never blames the cat**,
  and refuses anything shady (such as fake doctor's notes)
- we can ask for structured output (JSON with `excuse`, `believability`, `blame_target`)

## Prerequisites (Lesson 0)

- Node 22.22+ (`npx promptfoo@latest`, no global install needed)
- Ollama + small local models:
  ```bash
  ollama pull llama3.2:3b
  ollama pull qwen2.5:3b
  ollama pull gemma3:4b
  ```
- Provider ids used in configs: `ollama:chat:llama3.2:3b` and so on

## Repo layout

```
README.md                  # intro, setup, lesson index
lessons/
  01-hello-eval/
  02-variables-and-csv/
  03-prompt-vs-prompt/
  04-model-vs-model/
  05-structured-json/
  06-llm-as-judge/
  07-custom-assertions/
  08-guardrails-refusals/
  09-flakiness-and-repeats/
  10-ci-github-actions/
```
Each lesson folder holds `promptfooconfig.yaml`, a short `README.md` (what you'll learn,
the command to run, what to look for in `promptfoo view`), and any prompt, data, or assertion files.

## Lessons

| # | Lesson | promptfoo concept | Excuse-o-Matic twist |
|---|--------|-------------------|----------------------|
| 1 | Hello eval | `prompts`, `providers`, `tests`, `icontains`, `javascript` length check | "Give me an excuse for being late" and check that it's under 280 chars |
| 2 | Variables & CSV | `{{vars}}`, `tests: file://tests.csv`, `defaultTest` | 15 mishaps × audience (boss, mom, cat) |
| 3 | Prompt A vs B | multiple prompts side-by-side | "Polite butler" vs "Dramatic Shakespeare" style. Which one wins? |
| 4 | Model vs model | multiple providers | llama vs qwen vs gemma on the same tests, plus latency (`latency` assertion) |
| 5 | Structured output | `is-json`, JSON schema, `javascript` on parsed output | `believability` must be an int from 1 to 10 and `blame_target` must not be empty |
| 6 | LLM-as-judge | `llm-rubric`, local grader via `defaultTest.options.provider` | "Is it funny? Is it kind?" Notes on how weak small local judges are |
| 7 | Custom assertions | `file://assertions/no_cat_blame.js` (and a Python variant) | The **"Never blame the cat" rule** 🐈 with a partial score + reason |
| 8 | Guardrails | `not-icontains`, `llm-rubric` for refusal, `weight`, `metric` | Must refuse "fake doctor's note" and "excuse for skipping court" |
| 9 | Flakiness | `--repeat 3`, temperature, `--no-cache`, caching explained | Same prompt 3×: how stable is the pass rate? |
| 10 | CI | GitHub Action with `promptfoo eval` + threshold; `echo` provider fallback | Shows the workflow; notes that Ollama in CI is slow, so it uses a tiny model or the echo provider |

Optional bonus lessons:
- **11 · Classifier accuracy**: a "Excuse Believability Classifier" (`believable`/`suspicious`/`absurd`) using `equals` and named metrics, so the tutorial also covers deterministic evals
- **12 · Red teaming intro**: `promptfoo redteam init` against the Excuse-o-Matic, run locally

## Conventions

- Every lesson is runnable with **one command**: `npx promptfoo@latest eval -c lessons/0X-.../promptfooconfig.yaml`
- Then `npx promptfoo@latest view` to inspect the results
- Keep each lesson small (5–15 tests) so it runs in under 1–2 minutes on a laptop
- Each lesson README ends with **"Try it yourself"**: 1–2 exercises (for example, "make the cat test fail on purpose")
- Include one **intentionally failing test** per lesson so readers see what a failure looks like
- `.gitignore`: `.promptfoo/`, `output/`, `node_modules/`
- Optional root `package.json` scripts: `npm run lesson:1`, …

## Work order

1. Root `README.md`, `.gitignore`, `package.json` scripts, Ollama setup check
2. Lessons 1–4 (core mechanics), verified by running them locally
3. Lessons 5–8 (assertions & quality)
4. Lessons 9–10 (reliability & CI)
5. Bonus lessons 11–12 if time allows
6. Final pass: screenshots of `promptfoo view` in the READMEs, consistent tone, links between lessons
