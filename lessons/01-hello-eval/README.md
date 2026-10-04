# Lesson 1 — Hello eval 👋

**Goal:** run your first promptfoo evaluation and understand the three building blocks
of every config.

## What is an "eval"?

An eval is an automated test for a prompt. You send a prompt to a model and receive an answer.
Then **assertions** check whether the answer is what you wanted.
It's like unit tests, except the "function" under test is an LLM.

## The config, piece by piece

Open [`promptfooconfig.yaml`](./promptfooconfig.yaml). It has three parts:

| Block | Question it answers | In this lesson |
|-------|---------------------|----------------|
| `prompts` | *What do we send?* | The Excuse-o-Matic instructions with a `{{mishap}}` variable |
| `providers` | *Which model answers?* | `ollama:chat:llama3.2:3b`, a local model |
| `tests` | *What do we check?* | 4 mishaps, each with its own assertions |

### Variables
`{{mishap}}` in the prompt is replaced by `vars.mishap` from each test,
so **one prompt × 4 tests = 4 model calls**.

### Assertions used here

| Type | Passes when… |
|------|--------------|
| `icontains` | the answer contains the text (case-insensitive) |
| `not-icontains` | the answer does **not** contain the text |
| `javascript` | the JS expression returns `true`. `output` is the answer as a string |

A test passes only when **all** of its assertions pass.

## Run it

From the repo root:

```bash
npm run lesson:1
# same as: npx promptfoo eval -c lessons/01-hello-eval/promptfooconfig.yaml
```

You'll see a table in the terminal, then a summary like:

```
✓ 3 passed (75.00%)
✗ 1 failed (25.00%)
```

**The failure is on purpose.** The last test expects the word `pineapple`, which the
model has no reason to write. This shows you what a failure looks like.

## Look at the results in the browser

```bash
npm run view
```

It opens a web UI (usually http://localhost:15500). Things to try:
- Click a **FAIL** cell to see *which* assertion failed and why
- Hover a PASS cell to see the details of each assertion
- Run the eval again and compare. The answers change, because `temperature: 0.7` adds randomness

## Things worth noticing

- **Caching:** if you run it a second time without changing anything, it finishes almost instantly.
  promptfoo caches model answers. Use `--no-cache` to force fresh answers:
  `npx promptfoo eval -c lessons/01-hello-eval/promptfooconfig.yaml --no-cache`
- **Small models don't always obey.** "Start with Sorry" usually works, but not always.
  This is exactly why we write tests.

## Try it yourself 🧪

1. Fix the intentional failure. Change `pineapple` to `bus` and run again. Now everything should pass.
2. Add a 5th test with your own mishap (for example, "breaking the office coffee machine")
   and an assertion that the answer mentions `coffee`.
3. Make the length check stricter (`output.length <= 100`) and see how many tests fail.
   What does this tell you about the prompt?

---
Next: [Lesson 2 — Variables & CSV](../02-variables-and-csv/)
