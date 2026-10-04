# Lesson 2 — Variables & CSV 📋

**Goal:** use several variables, keep test cases in a spreadsheet-like CSV file and write
shared checks once with `defaultTest`.

## What's new compared to lesson 1

| | Lesson 1 | Lesson 2 |
|---|---|---|
| Variables in the prompt | `{{mishap}}` | `{{mishap}}` + `{{audience}}` |
| Where the tests live | inside the YAML | in [`tests.csv`](./tests.csv) |
| Shared assertions | copied into each test | written once in `defaultTest` |

## 1. The CSV file: one row = one test, one column = one var

```csv
__description,mishap,audience,keyword,__expected
Late for standup,being 10 minutes late for...,my boss,standup,
Mom's birthday,forgetting my mom's birthday,my mom,birthday,not-icontains: As an AI
```

- **Normal columns** (`mishap`, `audience`, `keyword`) become `vars`. The first row
  is the same as writing:
  ```yaml
  - description: Late for standup
    vars: { mishap: "being 10 minutes late for...", audience: "my boss", keyword: "standup" }
  ```
- **Columns starting with `__` are special:**

  | Column | Meaning |
  |--------|---------|
  | `__description` | the test's name, shown in the results |
  | `__expected` | an extra assertion for **this row only**, written as `type: value` (for example `icontains: pizza`). An empty cell means no extra check |
  | `__expected1`, `__expected2`, … | use these when one row needs several extra assertions |

- A var doesn't have to appear in the prompt. `keyword` is used **only by the checks**.

Why CSV? Anyone can edit it in Excel or Google Sheets, even people who never touch YAML.
Adding a test means adding a row.

## 2. `defaultTest`: shared checks

```yaml
defaultTest:
  assert:
    - type: icontains
      value: sorry
    - type: javascript
      value: output.length <= 300
    - type: icontains
      value: "{{keyword}}"   # ← filled from each row's keyword column
```

These assertions are **added to every test**. A row with `__expected` gets the 3 shared
checks **plus** its own.

Note `"{{keyword}}"`: **assertion values are templates too**, so one shared rule checks a
different word in each row.

## Run it

```bash
npm run lesson:2
npm run view
```

8 rows × 1 prompt × 1 model = 8 calls.

## What happened when this lesson was built (real story) 🔍

**First run: 3/8 passed.** The failure reasons in `promptfoo view` showed two problems:

1. **Too long.** Two answers had 312 and 340 characters. "1-2 sentences" isn't enough when
   the model writes very long sentences.
2. **Didn't name the mishap.** The mom's-birthday excuse never said "birthday".

**Fix: improve the prompt, not the tests.** Two lines were added:
> under 250 characters. Clearly name what happened, using the same words as the mishap.

**After the fix, over 3 fresh runs:** 5/8, 6/8, 6/8. The length problem is gone.

This is the normal eval loop: **run → read the failures → change the prompt → run again.**

## Expected results now

| Test | Result | Why |
|------|--------|-----|
| INTENTIONAL FAIL | ❌ always | expects `pineapple` (the same trick as lesson 1) |
| Late for standup | ❌ almost always | **a real finding**: the model says "late", "on time" or "overslept", but never "standup" |
| Others | ✅ usually | sometimes one fails (for example `karaoke` once), because answers are random |

So **6/8 is the "good" result here**, and you understand every failure.

## Try it yourself 🧪

1. **Add a row** to `tests.csv` with your own mishap and audience. Run again, and the new test appears.
2. **Solve the standup problem.** There are three honest options. Try each one and think about which is right:
   - *Change the prompt* (for example, add "Always repeat the key noun of the mishap").
     Does it help a 3B model?
   - *Loosen the check*: change the keyword to `late`. Is that still a meaningful test?
   - *Accept it*: this model is weak at this. That's useful to know when choosing a model (lesson 4).
3. **Break a variable name on purpose.** Rename the `audience` column to `audiance` in the CSV,
   run it, then open `promptfoo view` and look at the prompt that was sent. The `{{audience}}` part is
   now **empty**, and nothing warned you.

---
Previous: [Lesson 1 — Hello eval](../01-hello-eval/) · Next: [Lesson 3 — Prompt vs prompt](../03-prompt-vs-prompt/)
