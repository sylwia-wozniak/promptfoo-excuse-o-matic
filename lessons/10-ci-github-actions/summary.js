// Turns promptfoo's results.json into a Markdown table.
// The workflow appends the output to $GITHUB_STEP_SUMMARY, so it shows up on the run page.
//
// Usage: node summary.js output/results.json

const fs = require('fs');

const file = process.argv[2];
const { results } = JSON.parse(fs.readFileSync(file, 'utf8'));
const { successes, failures, errors } = results.stats;
const total = successes + failures + errors;
const passRate = total ? ((successes / total) * 100).toFixed(1) : '0.0';

// Keep table cells on one line and short
const cell = (text) => String(text ?? '').replace(/\s+/g, ' ').replace(/\|/g, '\\|').slice(0, 160);

const lines = [
  '## 🙃 Excuse-o-Matic eval',
  '',
  `**Pass rate: ${passRate}%** (${successes} passed, ${failures} failed, ${errors} errors)`,
  '',
  '| Test | Provider | Result | Output | Reason |',
  '|------|----------|--------|--------|--------|',
];

for (const r of results.results) {
  lines.push(
    `| ${cell(r.testCase.description)} | ${cell(r.provider.label || r.provider.id)} | ${
      r.success ? '✅' : '❌'
    } | ${cell(r.response?.output ?? r.error)} | ${r.success ? '' : cell(r.gradingResult?.reason)} |`,
  );
}

console.log(lines.join('\n'));
