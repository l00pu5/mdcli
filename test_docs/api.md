---
title: API reference
category: documentation
version: 2.1.0
tags:
  - api
  - reference
  - cli
---

# API documentation

This file describes the API and configuration options of `md-cli`.

## Renderer interface

The terminal renderer converts MD tokens into ANSI-encoded strings.

### Options

The following options can be passed to the renderer:

```typescript
interface RendererOptions {
  width?: number;
  reflowText?: boolean;
  showSectionPrefix?: boolean;
}
```

### Usage

```javascript
import { Marked } from 'marked';
import { markedTerminal } from 'marked-terminal';

const marked = new Marked(markedTerminal());
const output = marked.parse('# Hallo Welt');
```

## File scanner API

The file scanner finds and identifies MD files recursively.

### Signature

- `findMarkdownFiles(dirPath: string): string[]`
- `buildDirectoryMarkdownTree(dirPath: string): object`
