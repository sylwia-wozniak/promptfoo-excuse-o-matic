# Lesson 5 — Structured JSON output 🧾

**Goal:** make the model answer in JSON that code can use, check its **shape** with a JSON
Schema and check the **values** inside it.

## Why JSON?

Until now, the answer was free text meant for a human. In real apps, the answer often goes to
**code** instead: a UI shows the excuse, a badge shows the believability score, and so on. Code
needs a predictable structure:

```json
{
  "excuse": "Sorry, I accidentally knocked over the coffee machine while trying to deliver a critical memo.",
  "believability": 6,
  "blame_target": "my coworker"
}
```

If a field is missing or misspelled, **the app breaks**. So we test the structure.

## What's new compared to lesson 4

| | Lesson 4 | Lesson 5 |
|---|---|---|
| Answer format | free text | **JSON** |
| What changes between columns | the model | the **same model**, with and without `format` |
| Assertions | `icontains`, one-line `javascript` | **`is-json` + JSON Schema**, **multi-line** `javascript` |

## 1. `is-json` with a schema: checking the SHAPE

```yaml
- type: is-json
  value: *excuse_schema
```

- With **no `value`**, `is-json` only checks that the whole answer is valid JSON.
- With a **JSON Schema** as the `value`, it also checks the structure:

```yaml
type: object
properties:
  excuse:        { type: string }
  believability: { type: integer, minimum: 1, maximum: 10 }
  blame_target:  { type: string, minLength: 1 }
required: [excuse, believability, blame_target]
```

It reads like this: "an object; `believability` must be a **whole number from 1 to 10**;
all three fields are **required**."

> A related assertion is **`contains-json`**, which passes if valid JSON appears **anywhere** in the answer.
> It's useful when a model wraps JSON in text like *"Here you go: {...}"* or in ```` ```json ```` fences.
> `is-json` is stricter: the **entire** answer must be JSON.

## 2. Multi-line `javascript`: checking the VALUES

`output` is always a **string**, so parse it first:

```yaml
- type: javascript
  value: |
    const answer = JSON.parse(output);
    return answer.excuse.toLowerCase().includes(context.vars.keyword);
```

- **One-line** JS (as in earlier lessons) is an expression. Its result is used directly.
- **Multi-line** JS is a function body, so it **must `return`** true/false.
- `context.vars` gives you the test's variables, here the `keyword` from the CSV.

Now the keyword check looks **only inside `excuse`**, not at the whole answer. That's more precise:
a word that only appears in `blame_target` doesn't count.

## 3. Ollama's `format`: forcing JSON from the model side

```yaml
- id: ollama:chat:llama3.2:3b
  label: "Llama: format = schema"
  config:
    format: *excuse_schema
```

Asking for JSON in the prompt is a **request**. The model might ignore it.
With `format`, **Ollama itself** restricts which words the model may produce, so the answer
**has to** match the schema. (Other providers have the same idea, for example `response_format`
for OpenAI-compatible APIs.)

Both providers use the **same model and same prompt**. The only difference is `format`.

## 4. YAML anchors: one schema, used twice

```yaml
format: &excuse_schema      # & = give this block a name
  type: object
  ...
value: *excuse_schema       # * = paste the named block here
```

This is plain YAML, not a promptfoo feature. The provider **enforces** the exact schema that
the test **checks**, and there's only one copy to keep up to date.

## Run it

```bash
npm run lesson:5
npm run view
```

2 providers × 7 tests = 14 calls.

## What we saw (3 fresh runs, real results) 🔍

**Shape** (`is-json` + schema), 21 answers per provider:

| Provider | Schema failures |
|----------|-----------------|
| Llama: prompt only | **1** ❌ |
| Llama: format = schema | **0** ✅ |

The one failure is a great example. The model **misspelled a field name**:

```json
{
  "excuse": "Sorry for the wine spill on your sofa - I think my clumsy cat, Mr. Whiskers, jumped onto me and knocked over my glass.",
  "believeability": 4,
  "blame_target": "my cat"
}
```

`believeability` instead of `believability`. A human skimming the JSON would miss it, and an app
reading `answer.believability` would get `undefined`. The schema caught it:
*"data must have required property 'believability'"*. With `format`, this can't happen.

**Values** (keyword inside `excuse`): both providers scored **12/18**. The familiar standup
and birthday problems from lessons 2–4 are still there. `format` guarantees the **structure**,
**not the content**. Those are two separate problems.

Also noticed:
- No answer had ```` ``` ```` fences, so Llama 3.2 was good at "JSON only". Other models often
  aren't, which is when `contains-json` or `format` helps.
- `believability` values are mostly low (1–4). The model knows its excuses are absurd 😄
- The model **blamed the cat** in some answers 🐈. Remember that for lesson 7.

## The failure messages are ugly (for now)

When a `javascript` assertion returns `false`, the reason just says
*"Custom function returned false"* and repeats the code. That doesn't explain much. In
**lesson 7** we'll return `{ pass, score, reason }` instead, which gives readable messages
like *"excuse blames the cat"*.

## Try it yourself 🧪

1. **Tighten the schema.** Add `maxLength: 250` to `excuse` in the schema. Now the separate
   length check is redundant. Remove it and run again.
2. **Add a field.** Add `"apology_gift"` to the prompt and the schema, and make it `required`.
   The intentional test should turn green.
3. **Try other models.** Replace the provider ids with `qwen2.5:3b` or `gemma3:4b`
   (from lesson 4). Does any of them break the JSON without `format`?
4. **A believability rule.** Write a `javascript` check that fails when `believability` is
   above 7 for the "Roommate's pizza" test only. (Hint: put an `assert` on one test, or use
   `context.vars.keyword`.)

---
Previous: [Lesson 4 — Model vs model](../04-model-vs-model/) · Next: [Lesson 6 — LLM-as-judge](../06-llm-as-judge/)
