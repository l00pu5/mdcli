---
title: Comprehensive manual for MD architecture
author: Documentation Guild
version: 3.0
date: 2026-09-18
tags:
  - architecture
  - handbook
  - manual
  - guide
  - guideline
  - standards
---

# Comprehensive manual for the Markdown architecture

Welcome to this manual covering creation, maintenance and organization of technical documentation in Markdown.

<!-- toc -->
<!-- /toc -->

## 1. Introduction and motivation

Documentation is a critical aspect and building block of modern software development. Code is being read more than it is written - this is even more valid for accompanying documentation.

Markdown has been established as a de-facto standard for the following reasons:

1. It is platform-independent and easily readable (even as raw text / unprocessed)
2. It can be versioned alongside the source code (`documentation as code`)
3. It can be processed easily in CI/CD pipelines

### 1.1 Target audience of this document

This document is primarily targeting the following audience:

- Software architects
- Backend and frontend developers
- Technical writers and product managers

---

## 2. Best pratices for documentation structuring

A wel-planned folder structure avoids redundancies and makes it easier for team menbers tzo find their way around the documentation.

### 2.1 Directory layout

We recommend the following structure for documentation repositories:

```
docs/
├── architecture/
│   ├── adr/
│   │   ├── 0001-use-nodejs.md
│   │   └── 0002-cli-framework.md
│   └── system-overview.md
├── api/
│   ├── rest-endpoints.md
│   └── events.md
└── guides/
    ├── getting-started.md
    └── troubleshooting.md
```

### 2.2 Frontmatter conventions

Every document shall contain a standardized YAML frontmatter:

```yaml
---
title: expressive document title
author: first name, last name
date: YYYY-MM-DD
tags: [tag1, tag2]
version: 1.0.0
---
```

---

## 3. Formatting guidelines

Consistency is a key aspect to ensure a professional appearance and to facilitate automated analysis / evaluation.

### 3.1 Heading hierarchy

- There must only be one **H1 heading** per document
- Heading layers must **not be skipped** (e.g. H2 -> H4)
- Accessible and expressive language shall be used

### 3.2 Cose blocks with synatx highlighting

Always specify the language for code blocks:

```python
def calculate_metric(values: list[float]) -> float:
    """Calculates the average"""
    if not values:
        return 0.0
    return sum(values) / len(values)
```

```javascript
// example for async loading
async function loadDocument(filePath) {
  const content = await fs.promises.readFile(filePath, 'utf-8');
  return parseMarkdown(content);
}
```

```bash
# invocation via terminal
md-cli view docs/getting-started.md
```

### 3.3 Tables and comparisons

Tables should be created with clear column definitions:

| Feature | md-cli | Pandoc | glow |
| :--- | :---: | :---: | :---: |
| Native Tree View | Yes | No | No |
| Frontmatter Map | Yes | No | No |
| Auto-TOC Injection | Yes | No | No |
| Fast Terminal Pager | Yes | No | Yes |

---

## 4. Workflows and automation

Automated validation via Git hooks prevents errors in documents.

### 4.1 Git pre-commit hooks

A typical pre-commit hook could execute the following:

```bash
#!/bin/sh
md-cli toc docs/**/*.md --inject
git add docs/**/*.md
```

### 4.2 CI/CD integration

Via GitHub actions or GitLab CI:

```yaml
name: Docs Validation
on: [push, pull_request]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npm ci
      - run: npx md-cli map docs/
```

---

## 5. Frequently askes questions (FAQ)

### Can I use md-cli in in scripts without pager?
Yes, simply use the flag `--no-pager` to write the output directly to `stdout`.

### How does the tag search work?
The parameter `--tags` will search the YAML frontmatter for matching key-value pairs.

### Will `.git` and `node_modules` be ignored?
Yes, project-internal directories will be skipped / ignored accordingly.

---

## 6. Summary / next steps

By using clean conventions and proper tooling, documentation can serve as a catalyst.