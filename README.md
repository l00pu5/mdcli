# md-cli

A CLI tool for handling MD files

## Features

- 🌲 **Tree (`tree`)**: Zeigt die hierarchische Überschriften-Struktur (H1 bis H6) als farbigen Unicode-Baum mit Zeilennummern.
- 🗺️ **Directory Overview (`map`)**: Scannt Ordner rekursiv nach `.md`-Dateien und zeigt YAML-Frontmatter-Titel neben den Dateinamen an.
- 🔍 **Fulltext and front matter search (`search`)**: Schnelle Suche mit hervorgehobenen Snippets. Unterstützt gezielte Tag-Suche (`--tags`).
- 📋 **Table of contents (`toc`)**: Automatische Generierung von TOCs basierend auf Überschriften. Mit `--inject` direkt in Dateien einbettbar (unter `<!-- toc -->`).
- 📖 **Viewer (`view`)**: Rendert Markdown mit Syntax-Highlighting und pipe-t lange Dokumente automatisch in den System-Pager (`less -R`).

## Installation

```bash
npm link
```

## Verwendung & Befehle

### 1. Überschriften-Baum (`tree`)
```bash
md-cli tree <file>
# Beispiel:
md-cli tree test_docs/guide.md
```

### 2. Verzeichnis-Übersicht (`map`)
```bash
md-cli map [verzeichnis]
# Beispiel:
md-cli map test_docs
```

### 3. Suche (`search`)
```bash
# Volltextsuche mit Snippet-Highlighting:
md-cli search "Terminal" --dir test_docs

# Gezielte Suche in YAML-Frontmatter-Tags:
md-cli search "cli" --tags --dir test_docs
```

### 4. Inhaltsverzeichnis generieren (`toc`)
```bash
# TOC in Konsole ausgeben:
md-cli toc test_docs/guide.md

# TOC direkt in die Datei an der Stelle <!-- toc --> injizieren:
md-cli toc test_docs/guide.md --inject
```

### 5. Markdown im Terminal lesen (`view`)
```bash
# Öffnet bei langen Dateien automatisch den Pager (less -R):
md-cli view test_docs/long_document.md

# Direkte Ausgabe ohne Pager:
md-cli view test_docs/guide.md --no-pager
```

## Lizenz

MIT
