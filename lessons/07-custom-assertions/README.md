# Lesson 7 — Custom assertions 🐈

**Goal:** write your own checks in **JavaScript and Python files**, and make them return
**readable reasons** and **partial scores** instead of a bare true/false.

## The rule of the day: never blame the cat

In lessons 2 and 5, the model kept blaming the cat for everything, often a cat named
**Mr. Whiskers**. Excuse-o-Matic now has a house rule: **the cat is innocent.** 🐈

No built-in assertion knows that rule, so we write our own.

## What's new compared to lesson 6

| | Before | Lesson 7 |
|---|---|---|
| Where code checks live | short inline `javascript` | **separate `.js` and `.py` files** |
| What a code check returns | `true` / `false` | **`{ pass, score, reason }`** |
| Failure message | *"Custom function returned false"* | *"Blames the cat! blame_target = "my cat""* |
| Score | 0 or 1 | **any value from 0 to 1** (partial credit) |

## 1. A JavaScript file: [`assertions/no-cat-blame.js`](./assertions/no-cat-blame.js)

```yaml
- type: javascript
  value: file://assertions/no-cat-blame.js
  metric: no_cat_blame
```

The file exports **one function**. promptfoo calls it once per answer:

```js
module.exports = (output, context) => {
  // output  = the model's answer (string)
  // context = extra info; context.vars holds the test's variables
  return { pass: false, score: 0, reason: 'Blames the cat! ...' };
};
```

It gives three possible verdicts:

| Situation | pass | score |
|-----------|------|-------|
| `blame_target` is the cat | ❌ | **0** |
| the cat appears in the excuse, but isn't blamed | ✅ | **0.5**, "suspicious, but allowed" |
| no cat anywhere | ✅ | **1** |

Since the answer is JSON (with Ollama's `format`, as in lesson 5), the check can look at
`blame_target` specifically instead of guessing from free text.

## 2. A Python file: [`assertions/excuse_checklist.py`](./assertions/excuse_checklist.py)

```yaml
- type: python
  value: file://assertions/excuse_checklist.py
  metric: checklist
```

promptfoo calls the function **`get_assert(output, context)`** (that exact name).
`context` is a dict, so variables are in `context["vars"]`.

This file replaces the **four separate assertions from lesson 5** with one checklist:

```python
checklist = {
    "starts with 'Sorry'":   ...,
    "mentions 'pizza'":      ...,
    "under 250 characters":  ...,
    "believability is 1-10": ...,
}
score = passed / 4              # e.g. 3 of 4 → 0.75
return {"pass": score >= 0.75, "score": score,
        "reason": "3/4 OK. Missing: mentions 'pizza'"}
```

The reason **lists exactly what's missing**, and the score shows **how close** the answer came.

> Why have both languages? Use whichever your team knows. Python is handy when the check needs a
> Python library (NLP, data tools). promptfoo needs a Python 3 installed. On this Mac it found
> `python3` automatically. If it can't, set `PROMPTFOO_PYTHON=/path/to/python3`.

## 3. Inline JavaScript can return objects too

```yaml
- type: javascript
  value: |
    const blamed = JSON.parse(output).blame_target;
    const selfBlame = /^(me|myself|i)$/i.test(blamed.trim());
    return {
      pass: !selfBlame,
      score: selfBlame ? 0 : 1,
      reason: selfBlame ? `Blames "${blamed}". An excuse should blame something else!` : `Blames "${blamed}"`,
    };
```

For short checks you don't need a file. Returning an object is what gives readable messages.
**Use a file once the check grows beyond a few lines** or is shared by several configs.

## Run it

```bash
npm run lesson:7
npm run view
```

In the viewer, click any cell to see each check's **reason** and **score**.

## What we saw (3 fresh runs, real results) 🔍

The cat was blamed in **8 of 21 answers**:

| Test | Run 1 | Run 2 | Run 3 |
|------|-------|-------|-------|
| Roommate's pizza | Gary the snail 🐌 | my own clumsiness | my stomach |
| Office plant | the office spider 🕷️ | my alarm clock | my caffeine habit |
| Red wine | my artistic interpretation of cinema | **🐈 my clumsy cat, Mr. Whiskers** | my own clumsiness |
| Typo email | **🐈 my cat** | **🐈 my mischievous cat** | **🐈 My cat** |
| Broken vase | my friend | a squirrel 🐿️ | **🐈 my cat** |
| Ruined sweater | **🐈 my mischievous cat** | my hair | a freak weather event |
| INTENTIONAL (cookie jar) | **🐈 my cat** | **🐈 my mischievous cat, Mr. Whiskers** | **🐈 Whiskers** |

- **Typo email: 3 of 3 blame the cat.** The cat on the keyboard is the model's go-to excuse.
- **"Whiskers" alone** is caught too, because the check's word list includes `whiskers`.
- **The sweater mix-up:** the excuse says *"I... couldn't help but shed all over your new sweater"*
  but `blame_target` says *"my mischievous cat"*. The fields **contradict each other**, and only
  `blame_target` reveals the cat.
- **`checklist` and `not_self_blame` passed every time.** The 0.5 "suspicious cat" case didn't
  appear in these runs either.

### Limits of code checks (honest notes)

- **`not_self_blame` misses "my own clumsiness".** It only catches the exact words me / myself / I.
  Code checks are precise, but they only catch what you thought of.
- **A cat named "Luna"** would get past `no-cat-blame.js` completely. A word list can't know every
  cat name. For that, you'd add an `llm-rubric` (lesson 6), and then test that judge too.

**Rule of thumb:** use **code** for anything you can define exactly (fields, lengths, word lists,
numbers) and a **judge** for meaning. Many real evals use both.

## Try it yourself 🧪

1. **Fix the prompt, not the test.** Add *"Never blame a pet."* to
   `prompts/excuse-json.md` and run 2–3 times. How many cats are blamed now?
   (The cookie-jar test is designed to tempt the model. Does it still give in?)
2. **Catch "my own clumsiness".** Improve `not_self_blame` so it also fails when
   `blame_target` starts with "my own". Is that a fair rule?
3. **Give partial credit for honesty.** In `no-cat-blame.js`, return `score: 0.25` (still a
   fail) when the excuse *admits* the cat is innocent ("not the cat's fault"). Hint: check
   `story` for "not" near the cat word.
4. **Change the pass bar.** Set `PASS_SCORE = 1.0` in the Python file. Do any tests start
   failing? What would that tell you?

---
Previous: [Lesson 6 — LLM-as-judge](../06-llm-as-judge/) · Next: [Lesson 8 — Guardrails & refusals](../08-guardrails-refusals/)
