"""Custom assertion in Python: the Excuse-o-Matic checklist.

Lesson 5 needed four separate javascript assertions, and each failure said only
"Custom function returned false". This one checks everything at once and
says exactly which items failed.

promptfoo calls get_assert(output, context) once per answer:
  output  - the model's answer (a string; here it's JSON)
  context - a dict, e.g. context["vars"] holds the test's variables
"""

import json

PASS_SCORE = 0.75  # pass if at least 3 of the 4 items are OK


def get_assert(output, context):
    try:
        answer = json.loads(output)
    except json.JSONDecodeError as e:
        return {"pass": False, "score": 0, "reason": f"Answer is not valid JSON: {e}"}

    excuse = str(answer.get("excuse", ""))
    keyword = context["vars"]["keyword"]

    checklist = {
        "starts with 'Sorry'": excuse.lower().startswith("sorry"),
        f"mentions '{keyword}'": keyword.lower() in excuse.lower(),
        "under 250 characters": len(excuse) <= 250,
        "believability is 1-10": answer.get("believability") in range(1, 11),
    }

    passed = [item for item, ok in checklist.items() if ok]
    failed = [item for item, ok in checklist.items() if not ok]
    score = len(passed) / len(checklist)

    if failed:
        reason = f"{len(passed)}/{len(checklist)} OK. Missing: {', '.join(failed)}"
    else:
        reason = "All checklist items OK"

    return {"pass": score >= PASS_SCORE, "score": score, "reason": reason}
