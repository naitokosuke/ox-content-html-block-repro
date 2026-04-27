# ox-content-html-block-repro

Minimum reproduction for an HTML block parsing bug in [ubugeeei/ox-content](https://github.com/ubugeeei/ox-content).

## Summary

The parser treats CommonMark **Type 6 HTML blocks** (e.g. `<details>`, `<div>`, `<section>`) as if they were **Type 1** (`<pre>`, `<script>`, `<style>`, `<textarea>`): it consumes every line until the matching closing tag, regardless of intervening blank lines.

Per [CommonMark §4.6](https://spec.commonmark.org/0.31.2/#html-blocks), Type 6 blocks must terminate at the first **blank line**, allowing inner Markdown to be parsed when the author opens with a blank line after the tag — a widely used idiom (works in cmark, cmark-gfm, markdown-it, remark, GitHub).

As a result, the following input is emitted verbatim instead of having its inner Markdown rendered:

````markdown
<details>
<summary>Click to expand</summary>

**bold**

- list item

```js
code();
```

</details>
````

## Run

```sh
npm install
npm run repro
```

Exits with code `1` and prints `Inner markdown rendered: NO` while the bug is present.

Tested against `@ox-content/napi@2.4.0`.

## Likely root cause

`crates/ox_content_parser/src/parser.rs` — `parse_html_block` loops until a line containing the closing tag is found, with no special-casing for Type 6 vs Type 1 tags:

```rust
let closing_tag = format!("</{tag_name}");
loop {
    let consumed = self.consume_line();
    if consumed.to_ascii_lowercase().contains(&closing_tag) || self.is_at_end() {
        break;
    }
}
```

A spec-compliant fix would route the small set of Type 1 tags (`pre`, `script`, `style`, `textarea`) through the current closing-tag terminator and route all other supported block tags through a blank-line terminator.
