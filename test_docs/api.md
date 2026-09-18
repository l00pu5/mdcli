---
title: API Referenz
category: documentation
version: 2.1.0
tags:
  - api
  - reference
  - cli
---

# API Dokumentation

Diese Datei beschreibt die Programmierschnittstellen und Konfigurationsoptionen von md-cli.

## Renderer Schnittstelle

Der Terminal-Renderer wandelt Markdown-Tokens in ANSI-farbcodierte Strings um.

### Optionen

Folgende Optionen können an den Renderer übergeben werden:

```typescript
interface RendererOptions {
  width?: number;
  reflowText?: boolean;
  showSectionPrefix?: boolean;
}
```

### Verwendung

```javascript
import { Marked } from 'marked';
import { markedTerminal } from 'marked-terminal';

const marked = new Marked(markedTerminal());
const output = marked.parse('# Hallo Welt');
```

## Dateiscanner API

Der Dateiscanner ermittelt rekursiv Markdown-Dateien.

### Signatur

- `findMarkdownFiles(dirPath: string): string[]`
- `buildDirectoryMarkdownTree(dirPath: string): object`
