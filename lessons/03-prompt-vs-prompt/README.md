# Lesson 3 — Prompt vs prompt 🎩 vs 🎭

**Goal:** compare two versions of a prompt on the same tests and let the numbers show which
one works better.

## What's new compared to lesson 2

| | Lesson 2 | Lesson 3 |
|---|---|---|
| Prompts | 1, written inside the YAML | **2**, each in its own file |
| Results table | 1 output column | **1 column per prompt**, side by side |
| Prompt names | the prompt text | readable **labels** |

## 1. Several prompts = several columns

```yaml
prompts:
  - id: file://prompts/butler.md
    label: "Polite Butler"
  - id: file://prompts/shakespeare.md
    label: "Dramatic Shakespeare"
```

**Every test runs against every prompt:** 2 prompts × 5 tests = **10 model calls**.
In the results, each prompt gets its own column with a pass rate at the top.
Reading across one row shows *the same test* answered in two styles.

The two prompts in [`prompts/`](./prompts/) are the **same except for the persona line**:

| File | Persona |
|------|---------|
| `butler.md` | a calm, very formal English butler |
| `shakespeare.md` | a theatrical actor speaking Elizabethan English (thou, thee, alas, forsooth) |

Change **one thing at a time**, just like in a science experiment. If the prompts differed in
five places, you wouldn't know which change made the difference.

## 2. Prompts in their own files

`file://prompts/butler.md` loads the prompt from a file (relative to the config).
Why this helps:
- long prompts are easier to read and edit than inside YAML
- `git diff` shows exactly what changed in a prompt
- the same prompt file can be reused in several configs

## 3. A test that only fits ONE prompt (intentional)

```yaml
- description: "INTENTIONAL: Shakespeare words only"
  assert:
    - type: icontains-any          # passes if at least ONE value appears
      value: [thou, thee, thy, alas, forsooth]
```

Expect it to be **red for the Butler, green for Shakespeare**. The same test can pass in one
column and fail in another. Be careful with style-specific checks when comparing prompts,
because this one is unfair to the Butler on purpose.

## Run it

```bash
npm run lesson:3
npm run view
```

## What we saw (3 fresh runs, real results) 🔍

| Test | 🎩 Butler | 🎭 Shakespeare | Notes |
|------|-----------|----------------|-------|
| Coffee | ✅✅✅ | ✅✅✅ | easy for both |
| Pizza | ✅✅✅ | ✅✅✅ | easy for both |
| Birthday | ✅✅❌ | ❌❌❌ | Shakespeare says *"thy special day"*, never "birthday" |
| Plant | ❌✅❌ | ✅✅✅ | Butler writes *"office succulent"*, Shakespeare *"office fern"* 🌿 |
| INTENTIONAL (wine) | ❌❌❌ | ❌✅✅ | once Shakespeare wrote *"crimson draught"* instead of "wine" 🍷 |

Not counting the intentional test, **both prompts scored 9/12**. They're equally good overall
but **fail in different places**. That's more useful than a single "winner". If the birthday
case matters to you, avoid Shakespeare mode, and so on.

Each style also has its own habits:
- **Shakespeare paraphrases** in old-style words ("thy special day", "crimson draught")
- **The Butler swaps in synonyms** ("succulent" for "plant")

Our `{{keyword}}` check is strict, so it counts paraphrases as failures.
Is that right? Sometimes it is, and sometimes the check is too narrow. Lesson 6 (LLM-as-judge)
shows a way to check *meaning* instead of exact words.

## Try it yourself 🧪

1. **Add a third style.** Create `prompts/pirate.md` (copy one file and change only the persona line),
   add it to `prompts:` with a label and run. Now there are 3 columns.
2. **Make the comparison fair.** Remove the intentional test, then compare the pass rates.
   Which style would you ship?
3. **Test one rule change.** In `butler.md` only, add *"Always use the exact noun from the
   mishap, never a synonym"*. Does the plant test get better for the Butler? Run it 2–3 times with
   `--no-cache` before deciding, because one run can mislead you.

---
Previous: [Lesson 2 — Variables & CSV](../02-variables-and-csv/) · Next: [Lesson 4 — Model vs model](../04-model-vs-model/)
