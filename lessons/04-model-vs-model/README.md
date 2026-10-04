# Lesson 4 — Model vs model 🦙 vs 🐉 vs 💎

**Goal:** run the same prompt and tests on three different models, and compare quality
**and** speed.

## What's new compared to lesson 3

| | Lesson 3 | Lesson 4 |
|---|---|---|
| What changes between columns | the **prompt** | the **model** (provider) |
| Checks | text only | text + **speed** (`latency`) |
| Run settings | defaults | `maxConcurrency: 1`, `--no-cache` |

## Setup: two more models

```bash
ollama pull qwen2.5:3b   # ~1.9 GB
ollama pull gemma3:4b    # ~3.3 GB
```

## 1. Several providers = several columns

```yaml
providers:
  - id: ollama:chat:llama3.2:3b
    label: "Llama 3.2 (3B)"
    config: { temperature: 0.7 }
  - id: ollama:chat:qwen2.5:3b
    label: "Qwen 2.5 (3B)"
    config: { temperature: 0.7 }
  - id: ollama:chat:gemma3:4b
    label: "Gemma 3 (4B)"
    config: { temperature: 0.7 }
```

This is the mirror image of lesson 3. There, one model got two prompts. Here, **one prompt
goes to three models**. All three have the same `temperature`, so **the only difference is the model**.

You can combine both: 2 prompts × 3 models gives 6 columns. promptfoo runs every
**prompt × provider × test** combination.

## 2. The `latency` assertion: checking speed

```yaml
- type: latency
  threshold: 15000   # milliseconds
```

It passes if the answer arrived within `threshold` ms. Two things to know:

- **It needs `--no-cache`.** A cached answer has no real response time, and promptfoo
  reports an error: *"Latency assertion does not support cached results"*. That's why
  `npm run lesson:4` always adds `--no-cache`.
- **The limit is `threshold`, not `value`.** Most assertions use `value`. A few that
  measure numbers (like `latency`) use `threshold`.

## 3. `maxConcurrency: 1`: fair speed numbers

```yaml
evaluateOptions:
  maxConcurrency: 1
```

By default, promptfoo sends 4 requests at once. With a cloud API that's fine. With Ollama on
**one laptop**, parallel requests share the same CPU/GPU and slow each other down, and Ollama
keeps swapping models in and out of memory. The latency numbers would measure the traffic jam,
not the model. With one request at a time, the comparison is fair.

## 4. Cold start: why the first answers are slow

On the very first run, the first answer from each model took **3–11 seconds**, and every answer
after that took **under 1 second**. Ollama has to **load the model into memory** the first time.
That's why the shared limit is a generous 15 s. Run the lesson twice, and the second run is much
faster because the models are already loaded.

## Run it

```bash
npm run lesson:4     # 21 calls, ~15–40 s
npm run view
```

In the viewer, each model is a column, and each cell shows the answer **and its latency**.

## What we saw (3 fresh runs, real results) 🔍

**Quality:** 6 real tests × 3 runs = 18 per model (the intentional speed test is not counted):

| Model | Passed | Typical length | Typical speed* | Personality |
|-------|--------|----------------|----------------|-------------|
| 💎 Gemma 3 (4B) | **18/18** | ~95 chars | ~750 ms | follows the rules most closely |
| 🦙 Llama 3.2 (3B) | 16/18 | ~150 chars | ~850 ms | talkative, sometimes skips "standup" |
| 🐉 Qwen 2.5 (3B) | 13/18 | ~50 chars | **~500 ms** | fastest and shortest, loves synonyms |

<sub>* after the model is loaded. Your numbers depend on your laptop.</sub>

The same test, answered by each model:

> **🐉 Qwen:** Sorry, the pothos decided to go on vacation instead of me watering it.
> *(❌ "pothos" is a real plant, but the check wanted the word "plant")*
>
> **🦙 Llama:** Sorry, team, I'm afraid my neglect led to the demise of our office plant. It seems I forgot to water it for an entire week, resulting in its untimely passing under my care.
>
> **💎 Gemma:** Sorry, the office plant sadly passed away. My watering schedule was…challenging.

**Which model is "best"?** It depends on what you need:
- **Most reliable at following rules:** Gemma. It's a bit bigger (4B) and a bit slower than Qwen.
- **Fastest and cheapest to run:** Qwen. But it paraphrases, so it fails strict word checks.
- **Llama** sits in between, with the wordiest answers.

This is the real value of this lesson: **you choose a model from data, not from hype.**
Everything costs the same here (zero), but with paid APIs you'd also compare **cost** in the same table.

## Try it yourself 🧪

1. **Change the speed limit.** Set the intentional test's `threshold` to `600`. Which models
   pass now? Run twice, because latency changes run to run.
2. **Watch the cold start.** Run `ollama stop gemma3:4b`, then run the lesson. Find the slow
   first Gemma answer in the viewer.
3. **Combine lessons 3 and 4.** Add the Shakespeare prompt from lesson 3 as a second prompt
   (`file://../03-prompt-vs-prompt/prompts/shakespeare.md`). You'll get 6 columns.
   Which model is the best Shakespeare? 🎭
4. **Try a bigger model** if your laptop can handle it (for example, `ollama pull llama3.1:8b`).
   Is it better? Is it slower?

---
Previous: [Lesson 3 — Prompt vs prompt](../03-prompt-vs-prompt/) · Next: [Lesson 5 — Structured JSON](../05-structured-json/)
