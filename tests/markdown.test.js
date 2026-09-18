import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  extractHeadings,
  buildHeadingHierarchy,
  generateToc,
  injectTocIntoMarkdown,
  slugify,
  parseMarkdown
} from '../src/utils/markdown.js';

describe('Markdown Utility Tests', () => {
  test('slugify generates correct slugs and handles duplicates', () => {
    assert.equal(slugify('Einführung in md-cli'), 'einführung-in-md-cli');
    assert.equal(slugify('Hello & World / 2026!'), 'hello-world-2026');
    assert.equal(slugify('API: Options & Config'), 'api-options-config');
  });

  test('extractHeadings correctly parses ATX headings and ignores code blocks', () => {
    const markdown = `
# Title
Some text
\`\`\`bash
# Not a heading
echo "hello"
\`\`\`
## Section 1
Text
### Sub 1.1
Text
## Section 2
`;
    const headings = extractHeadings(markdown);
    assert.equal(headings.length, 4);
    assert.equal(headings[0].cleanText, 'Title');
    assert.equal(headings[0].level, 1);
    assert.equal(headings[1].cleanText, 'Section 1');
    assert.equal(headings[1].level, 2);
    assert.equal(headings[2].cleanText, 'Sub 1.1');
    assert.equal(headings[2].level, 3);
    assert.equal(headings[3].cleanText, 'Section 2');
    assert.equal(headings[3].level, 2);
  });

  test('buildHeadingHierarchy creates nested tree structure', () => {
    const headings = [
      { level: 1, text: 'H1', cleanText: 'H1', slug: 'h1', lineNumber: 1 },
      { level: 2, text: 'H2.1', cleanText: 'H2.1', slug: 'h21', lineNumber: 5 },
      { level: 3, text: 'H3.1', cleanText: 'H3.1', slug: 'h31', lineNumber: 10 },
      { level: 2, text: 'H2.2', cleanText: 'H2.2', slug: 'h22', lineNumber: 15 },
    ];
    const tree = buildHeadingHierarchy(headings);
    assert.equal(tree.length, 1);
    assert.equal(tree[0].cleanText, 'H1');
    assert.equal(tree[0].children.length, 2);
    assert.equal(tree[0].children[0].cleanText, 'H2.1');
    assert.equal(tree[0].children[0].children.length, 1);
    assert.equal(tree[0].children[0].children[0].cleanText, 'H3.1');
    assert.equal(tree[0].children[1].cleanText, 'H2.2');
  });

  test('generateToc formats relative indentation', () => {
    const headings = [
      { level: 1, cleanText: 'Overview', slug: 'overview' },
      { level: 2, cleanText: 'Details', slug: 'details' },
      { level: 3, cleanText: 'SubDetails', slug: 'subdetails' },
    ];
    const toc = generateToc(headings);
    const expected = `* [Overview](#overview)\n  * [Details](#details)\n    * [SubDetails](#subdetails)`;
    assert.equal(toc, expected);
  });

  test('injectTocIntoMarkdown updates existing toc block', () => {
    const raw = `---
title: Test
---

# Heading
<!-- toc -->
old
<!-- /toc -->

Content`;

    const res = injectTocIntoMarkdown(raw, '* [Heading](#heading)');
    assert.equal(res.status, 'updated');
    assert.match(res.content, /<!-- toc -->\n\* \[Heading\]\(#heading\)\n<!-- \/toc -->/);
  });
});
