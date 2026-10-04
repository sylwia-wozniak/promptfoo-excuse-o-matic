# Lesson 10 — CI with GitHub Actions 🤖

**Goal:** run the Excuse-o-Matic eval on GitHub's servers with one click, with a **pass-rate bar**
that turns the run red when quality drops. It still costs nothing: the model runs with Ollama
**inside** the GitHub runner.

## What's new compared to lesson 9

| | Lesson 10 |
|---|---|
| Where it runs | a **GitHub Actions** workflow: [`.github/workflows/promptfoo-eval.yml`](../../.github/workflows/promptfoo-eval.yml) |
| When it runs | **only when you click "Run workflow"** (`workflow_dispatch`) |
| Pass/fail | a **pass-rate bar** (`PROMPTFOO_PASS_RATE_THRESHOLD`), not "every test must pass" |
| Settings | **temperature 0**, so CI is stable (lesson 9) |
| Smoke test | the **`echo` provider**: test the workflow in seconds, without a model |
| Results | a **summary table** on the run page + a downloadable **artifact** |

## 1. The workflow, step by step

GitHub only reads workflows from `.github/workflows/` at the **root of the repo**, so the
workflow file lives there, not in this folder. What it does:

| Step | What happens |
|---|---|
| `checkout`, `setup-node`, `npm ci` | get the code, Node 22, and promptfoo from `package-lock.json` |
| Cache Ollama models | reuse the model from the last run (saves a ~2 GB download) |
| Install and start Ollama | the official install script, then `ollama serve` in the background |
| Pull model | `ollama pull llama3.2:3b` (instant when cached) |
| Run promptfoo eval | the same `promptfoo eval` you run locally (no `--no-cache` needed: each run starts on a fresh machine, so the cache is empty) |
| Write summary | `summary.js` turns `results.json` into a table on the run page |
| Upload results | `results.json` + `results.html` as a downloadable artifact |

The last two steps use `if: always()`, so they **also run when the eval fails**. A red run
without results would tell you nothing.

## 2. Manual trigger: `workflow_dispatch`

```yaml
on:
  workflow_dispatch:
    inputs:
      provider:
        type: choice
        options: [ollama, echo]
      threshold:
        type: string
        default: "80"
```

No `push` or `pull_request` trigger, so it **never runs by itself**. In the **Actions** tab you get a
"Run workflow" button with a dropdown and a text field for these inputs.

Why manual here? Each run takes a few minutes of CPU time. In a real project you'd often add
`pull_request` with a `paths:` filter, so the eval runs when someone changes a prompt.

## 3. The pass-rate bar

By default, `promptfoo eval` fails (exit code **100**) if **any** test fails. For LLMs that's too
strict: lesson 9 showed even good prompts fail sometimes. So the workflow sets:

```yaml
env:
  PROMPTFOO_PASS_RATE_THRESHOLD: 80   # fail only if fewer than 80% of tests pass
```

| Passed | Pass rate | Exit code | Run |
|---|---|---|---|
| 7/7 | 100% | 0 | ✅ green |
| 6/7 | 86% | 0 | ✅ green (this config: the pineapple test fails on purpose) |
| 5/7 | 71% | **100** | ❌ red |

Try it locally:

```bash
PROMPTFOO_PASS_RATE_THRESHOLD=80 npm run lesson:10; echo "exit code: $?"
```

## 4. Temperature 0 in CI

```yaml
config:
  temperature: 0
```

A CI check should only turn red when **something changed**: the prompt, the model, the tests.
At temperature 1 it could turn red because of bad luck (lesson 9). Temperature 0 gives the same answer
every run, so a red run means something.

## 5. The `echo` smoke test

The first runs of a new workflow usually fail for boring reasons: a wrong path, a missing
permission, a typo. Waiting minutes for a model each time is painful. The **echo** option runs:

```bash
npx promptfoo eval -c ... --providers echo
```

`--providers echo` replaces the model with promptfoo's `echo` provider, which just returns the
prompt (lesson 6). The run takes seconds, and if it gets to the summary table, the workflow itself works.
Its test results mean nothing (the prompt is not an excuse), so for echo the workflow sets the bar to 0.

## Run it locally

```bash
npm run lesson:10        # same config the workflow uses, ~10 s
npm run view
```

## Run it on GitHub

This project folder needs to be a **GitHub repo** first:

```bash
git init
git add .
git commit -m "Excuse-o-Matic promptfoo tutorial"
gh repo create promptfoo-excuse-o-matic --private --source . --push   # or create the repo on github.com and push
```

Then:

1. Open the repo on GitHub → **Actions** tab → **promptfoo eval**
2. Click **Run workflow**, pick **echo** first, and click the green button
3. When that's green, run it again with **ollama**
4. Open the run: the summary table is on the run page; `results.html` is under **Artifacts**

Or from the terminal: `gh workflow run promptfoo-eval.yml -f provider=ollama`

**Cost:** GitHub Actions minutes are free for public repos. Private repos get a monthly free
allowance; one Ollama run uses a few minutes of it.

## What we checked 🔍

We ran the workflow's eval command locally, with the same settings:

| Run | Result | Exit code |
|---|---|---|
| ollama, bar 80% | 6/7 (86%): only the pineapple test failed | **0** ✅ |
| ollama, bar 80%, again | the same 6/7, word for word (temperature 0) | **0** ✅ |
| echo, bar 0% | 0/7 (echo results mean nothing) | **0** ✅ |

### A stable failure, caught before CI

The first version had a "late for standup" test. At temperature 0, Llama failed it **every time**:

> Sorry, boss! I'm running a bit behind because I got stuck in a "Late- Arrival Loop" [...]

It never wrote the word "standup", so `icontains: standup` failed. Together with the intentional
failure, that made 5/7 = 71%, and the run would have been red on **every** run. We swapped it for
"spilling coffee on my keyboard", which passed reliably.

**The lesson:** before adding a test to CI, run it a few times locally (lesson 9). A test that
always fails is a bug in the test, the prompt or the model. Fix it before it turns every run red.

### Expect CI to differ a little from your laptop

The runner uses the **CPU**; your Mac probably uses its GPU. Temperature 0 makes answers stable
**on one machine**, but different hardware can still pick a different word now and then
(lesson 9 saw this even on one machine). That's one more reason for an 80% bar instead of 100%.

## Why not a hosted model in CI?

- **promptfoo's official GitHub Action** ([docs](https://www.promptfoo.dev/docs/integrations/github-action/))
  is built for pull requests and needs an `openai-api-key`. Its `github-token` input only posts
  a comment on the PR; it gives no access to models.
- **GitHub Models**, which let Actions call models with the built-in `GITHUB_TOKEN`, was
  [retired on July 30, 2026](https://docs.github.com/en/github-models).
- **GitHub Copilot** can run in Actions through the Copilot SDK/CLI, using a token with the
  "Copilot Requests" permission. promptfoo has no built-in Copilot provider, so you'd write a small
  custom provider. It's a possible next step, but it uses your plan's AI credits.

Ollama inside the runner keeps the whole tutorial at **zero cost, with no secrets**.

## Try it yourself 🧪

1. **Break the build on purpose.** Run the workflow with threshold `100`. The pineapple test fails,
   so the run turns red. Find the failure in the summary table.
2. **Run on prompt changes.** Add a `pull_request` trigger with
   `paths: ["lessons/10-ci-github-actions/**"]`, open a PR that edits `prompts/excuse.md`, and watch
   the eval run by itself.
3. **Repeat in CI.** Add `--repeat 3` to the eval command. How does the pass rate change, and how
   much longer does the run take?
4. **A faster model.** Set `MODEL: llama3.2:1b` in the workflow (and the provider id in the
   config). Is it faster? Does it still clear the bar?

---
Previous: [Lesson 9 — Flakiness & repeats 🎲](../09-flakiness-and-repeats/) · Back to the [lesson index](../../README.md)
