# Lesson 6 — LLM-as-judge ⚖️

**Goal:** let one model **grade** another model's answers using rules written in plain
English, and then **test the judge itself**, because a judge can be wrong too.

## Why a judge?

Lessons 2–5 kept running into the same wall. Word checks can't see **meaning**:

- *"office succulent"* is clearly about a plant, but `icontains: plant` fails
- *"thy special day"* is clearly a birthday, but `icontains: birthday` fails

And some qualities can't be checked with code at all: **Is it funny? Is it kind?**

`llm-rubric` sends the answer plus your rule to a second model and asks it to decide
**pass or fail, with a reason**.

## What's new compared to lesson 5

| | Before | Lesson 6 |
|---|---|---|
| Who checks | code (`icontains`, `javascript`, schema) | code **+ a judge model** |
| Rules written as | code | **plain English** (a "rubric") |
| Results | one pass rate | **named metrics**, one score per kind of check |
| Configs in the lesson | 1 | 2: the eval + a **judge check** |

## Part 1: the eval ([`promptfooconfig.yaml`](./promptfooconfig.yaml))

### `llm-rubric`

```yaml
- type: llm-rubric
  value: >-
    The excuse is polite and kind. It does not insult, mock or
    blame {{audience}}.
  metric: kind_judge
```

The judge reads the answer and the rubric, then returns `pass`, a `score` (0–1) and a
`reason`. You can see all three by clicking a cell in `promptfoo view`.
The rubric is a **template**, so `{{audience}}` becomes "my boss", "my mom" and so on.

### Choosing the judge

```yaml
defaultTest:
  options:
    provider:
      id: ollama:chat:gemma3:4b
      config:
        temperature: 0
```

- **Writer:** Llama 3.2 (3B). **Judge:** Gemma 3 (4B), the most reliable model in lesson 4.
- **Without this setting, promptfoo uses a paid OpenAI model as the judge** and fails if there's no API key.
- `temperature: 0` gives the judge the same verdict each run for the same answer.

### `metric`: named scores

Each assertion has a `metric` name (`keyword_strict`, `names_mishap_judge`, `kind_judge`,
`funny_judge`). The viewer then shows **a separate score per metric**, so you can put the
strict word check next to the judge's meaning check.

### Run it

```bash
npm run lesson:6
npm run view
```

## What we saw in part 1 (3 fresh runs, real results) 🔍

| Metric | Passed |
|--------|--------|
| `keyword_strict` | 16/18 |
| `names_mishap_judge` | **18/18** |
| `kind_judge` | **18/18** |
| `funny_judge` | **18/18** |

The judge **fixed the standup problem**. The excuse *"Sorry I'm late, it was a bit of a morning
rush hour traffic jam in my apartment building's elevator"* fails the strict check (no word
"standup"), but the judge accepts it because it's clearly about being late.

But **every judge check passed every time.** Are the excuses really that good, or does the judge
just say "yes" to everything? From these results alone, **you can't tell.** That's part 2.

## Part 2: who judges the judge? ([`judge-check.yaml`](./judge-check.yaml))

Here, **no model writes excuses.** We write them by hand, choosing excuses where **we know the
correct verdict**, and check whether the judge agrees.

```yaml
providers:
  - id: echo          # returns the prompt unchanged, so the "answer" is our {{excuse}}

tests:
  - description: "Insults the roommate → judge should say NOT kind"
    vars:
      audience: "my roommate"
      excuse: "Sorry I ate your pizza, but honestly, only a slob leaves food lying around like that."
    assert:
      - type: not-llm-rubric       # not- = we expect the judge to say FAIL
        value: *kind_rubric
```

New pieces:
- **`echo` provider:** a built-in fake model that returns its input. It's handy for testing assertions.
- **`not-llm-rubric`:** any assertion can be flipped with `not-`. It passes when the judge says *fail*.
- **The rubric text is copied** from the main config, so we're testing the exact same rules.

```bash
npm run lesson:6:judge
```

## What we saw in part 2 (3 runs, identical each time) 🔍

**The judge got 5 of 8 right.**

| Hand-written excuse | Correct verdict | Judge |
|---|---|---|
| Cat demands tuna as ransom | funny | ✅ |
| "The bus was delayed. It will not happen again." | not funny | ✅ |
| Ate pizza, offers to buy a new one | kind | ✅ |
| "Only a slob leaves food lying around" | not kind | ✅ |
| "If you scheduled meetings at a normal hour…" (to the boss) | **not kind** | ❌ says kind |
| "Office succulent has gone to the big greenhouse in the sky" | names "plant dies" | ✅ |
| Coffee machine excuse for **"forgetting my mom's birthday"** | **wrong situation** | ❌ says it's fine |
| "It was one of those days. You know how it is!" | **too vague** | ❌ says it's fine |

The judge's **reasons** show *why* it fails. For the vague excuse, it wrote:

> The text explicitly references being 'late for the morning standup', fulfilling the rubric's criteria.

The excuse says nothing about a standup. The judge **mixed up the words in the rubric with
the words in the answer.** Small judges do this often.

### So what do the 18/18 scores from part 1 mean?

- **`funny_judge`:** the judge spotted a boring apology, so "funny" results are believable.
- **`kind_judge`:** it catches open insults, but **misses passive-aggressive blame**.
- **`names_mishap_judge`:** it accepts even the **wrong situation**, so this 18/18 is
  **worth very little**. The strict keyword check is dumb but honest. This judge is smart but lenient.

**The main lesson: never trust a judge you haven't tested.** A judge check like part 2 is
cheap: 8 tests and about 10 seconds.

## 🐛 Two gotchas found while building this lesson

1. **Rubrics from files aren't templated.** We first moved the rubrics to `rubrics/*.txt`
   (`value: file://rubrics/kind.txt`) so both configs could share them. promptfoo loads the file
   but **doesn't fill in `{{audience}}` or `{{mishap}}`**, so the judge literally saw "{{mishap}}".
   Only **inline** text is templated. That's why the rubric text is duplicated in both configs.
2. **Assertion files must be `.txt`, `.json` or `.yaml`.** A `.md` rubric gives
   *"Unsupported file type"*. This is the opposite of lesson 3, where `.md` was the better choice
   for **prompts**.

## Try it yourself 🧪

1. **Make the judge stricter.** Rewrite the names-mishap rubric in **both** configs, for example:
   *"First, quote the exact words in the TEXT that describe the situation. If no words in the
   TEXT describe '{{mishap}}', fail."* Run `npm run lesson:6:judge`. Does it score better than 5/8?
2. **Try a different judge.** Swap `gemma3:4b` for `qwen2.5:3b` or `llama3.2:3b`. Is a judge of the
   same model family as the writer more lenient?
3. **Add your own judge test.** Write an excuse that's funny but rude, and add two tests: one
   expecting `funny`, one expecting `not kind`.
4. **Run the judge check without `temperature: 0`.** Does the verdict change between runs?

---
Previous: [Lesson 5 — Structured JSON](../05-structured-json/) · Next: [Lesson 7 — Custom assertions 🐈](../07-custom-assertions/)
