import { parseAndRender, version } from "@ox-content/napi";

const input = `<details>
<summary>Click to expand</summary>

**This bold text should be rendered as markdown.**

- list item 1
- list item 2

\`\`\`js
console.log("code block");
\`\`\`

</details>
`;

const expected = `<details>
<summary>Click to expand</summary>
<p><strong>This bold text should be rendered as markdown.</strong></p>
<ul>
<li>list item 1</li>
<li>list item 2</li>
</ul>
<pre><code class="language-js">console.log("code block");
</code></pre>
</details>`;

const { html, errors } = parseAndRender(input, { gfm: true });

console.log(`@ox-content/napi version: ${version()}`);
console.log("\n=== INPUT ===");
console.log(input);
console.log("=== ACTUAL OUTPUT ===");
console.log(html);
console.log("=== EXPECTED (per CommonMark §4.6 HTML blocks, Type 6) ===");
console.log(expected);

if (errors.length) {
  console.log("\n=== PARSE/RENDER ERRORS ===");
  console.log(errors);
}

const innerMarkdownRendered =
  html.includes("<strong>") && html.includes("<ul>") && html.includes("<pre>");

console.log(
  `\n=== RESULT ===\nInner markdown rendered: ${innerMarkdownRendered ? "YES (spec-compliant)" : "NO (BUG: HTML block consumes everything until </details>)"}`,
);

process.exit(innerMarkdownRendered ? 0 : 1);
