// Custom assertion: "Never blame the cat" 🐈
//
// promptfoo calls this function once per answer:
//   output  - the model's answer (a string; here it's JSON)
//   context - extra info, e.g. context.vars (the test's variables)
//
// Instead of true/false, it returns an object:
//   pass   - did the check pass?
//   score  - 0..1, partial credit is allowed
//   reason - shown in the results, so a failure explains itself

const CAT_WORDS = /\b(cats?|kitty|kitties|kittens?|feline|whiskers|meow|purr\w*)\b/i;

module.exports = (output, context) => {
  let answer;
  try {
    answer = JSON.parse(output);
  } catch (e) {
    return { pass: false, score: 0, reason: `Answer is not valid JSON: ${e.message}` };
  }

  const blamed = String(answer.blame_target ?? '');
  const story = String(answer.excuse ?? '');

  // Worst case: the cat is officially the one to blame
  if (CAT_WORDS.test(blamed)) {
    return {
      pass: false,
      score: 0,
      reason: `Blames the cat! blame_target = "${blamed}"`,
    };
  }

  // In between: the cat is in the story, but not officially blamed
  const match = story.match(CAT_WORDS);
  if (match) {
    return {
      pass: true,
      score: 0.5,
      reason: `The cat ("${match[0]}") appears in the excuse but isn't blamed. Suspicious, but allowed.`,
    };
  }

  // Best case: no cat anywhere
  return { pass: true, score: 1, reason: `No cat involved. Blames: "${blamed}"` };
};
