# Repro Result

Captured against:

- `@ox-content/napi@2.4.0`
- `@ox-content/vite-plugin@2.4.0`
- Node.js 24, vite-plus `0.1.19`

## Input

`src/content/index.md`:

````markdown
# HTML block bug repro

<details>
<summary>Click to expand</summary>

**This bold text should be rendered as markdown.**

- list item 1
- list item 2

```js
console.log("code block");
```

</details>
````

## Mode 1 — `npm run repro` (direct N-API call)

Runs `parseAndRender(input, { gfm: true })` from `@ox-content/napi`.

```
@ox-content/napi version: 2.4.0

=== INPUT ===
<details>
<summary>Click to expand</summary>

**This bold text should be rendered as markdown.**

- list item 1
- list item 2

```js
console.log("code block");
```

</details>

=== ACTUAL OUTPUT ===
<details>
<summary>Click to expand</summary>

**This bold text should be rendered as markdown.**

- list item 1
- list item 2

```js
console.log("code block");
```

</details>


=== EXPECTED (per CommonMark §4.6 HTML blocks, Type 6) ===
<details>
<summary>Click to expand</summary>
<p><strong>This bold text should be rendered as markdown.</strong></p>
<ul>
<li>list item 1</li>
<li>list item 2</li>
</ul>
<pre><code class="language-js">console.log("code block");
</code></pre>
</details>

=== RESULT ===
Inner markdown rendered: NO (BUG: HTML block consumes everything until </details>)
```

`process.exit(1)` is returned because the inner Markdown is not parsed.

## Mode 2 — `npm run dev` (`@ox-content/vite-plugin` SSG dev server)

Visiting `http://localhost:5175/` in a browser shows the same bug. The `<article class="content">` body that ox-content's SSG layout produces from `src/content/index.md` contains:

```html
<article class="content">
<h1>HTML block bug repro</h1>
<details>
<summary>Click to expand</summary>

**This bold text should be rendered as markdown.**

- list item 1
- list item 2

```js
console.log("code block");
```

</details>
</article>
```

`**bold**`, `- list`, and the fenced code block are all delivered to the browser as **raw Markdown text** instead of rendered HTML, confirming that the bug is not specific to one entry point — it lives in the shared Rust parser core (`crates/ox_content_parser/src/parser.rs::parse_html_block`).

## Spec Reference

- [CommonMark 0.31.2 §4.6 HTML blocks](https://spec.commonmark.org/0.31.2/#html-blocks): Type 6 HTML blocks (which include `<details>`, `<div>`, `<section>`, etc.) end at the **first blank line**, not at the matching closing tag.
- Reference implementations following this rule: cmark, cmark-gfm, markdown-it, remark, GitHub.
