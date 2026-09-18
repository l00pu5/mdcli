---
title: Ausführliches Handbuch für Markdown-Architektur
author: Documentation Guild
version: 3.0
date: 2026-09-18
tags:
  - architecture
  - handbook
  - guide
  - standards
---

# Ausführliches Handbuch für Markdown-Architektur

Willkommen beim umfassenden Handbuch zur Erstellung, Pflege und Organisation von technischen Dokumentationen in Markdown.

<!-- toc -->
<!-- /toc -->

## 1. Einleitung und Motivation

Dokumentation ist ein kritischer Bestandteil moderner Softwareentwicklung. Code wird häufiger gelesen als geschrieben – für Dokumentation gilt dies in noch viel stärkerem Maße.

Markdown hat sich als De-facto-Standard etabliert, weil es:

1. Plattformunabhängig lesbar ist (auch als Rohtext).
2. Direkt neben dem Quellcode versioniert werden kann (`Docs as Code`).
3. Einfach in CI/CD-Pipelines verarbeitet werden kann.

### 1.1 Zielgruppe dieses Dokuments

Dieses Dokument richtet sich an:

- Software-Architekten
- Backend- und Frontend-Entwickler
- Technical Writers und Produktmanager

---

## 2. Best Practices für Dokumentationsstrukturen

Eine gut durchdachte Ordnerstruktur verhindert Redundanzen und erleichtert neuen Teammitgliedern den Einstieg.

### 2.1 Standard-Verzeichnisaufbau

Wir empfehlen folgende Struktur für Repositories:

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

### 2.2 Frontmatter-Konventionen

Jedes Dokument sollte standardisierte YAML-Frontmatter-Felder beinhalten:

```yaml
---
title: Aussagekräftiger Titel
author: Vorname Nachname
date: YYYY-MM-DD
tags: [tag1, tag2]
version: 1.0.0
---
```

---

## 3. Formatierungsrichtlinien

Konsistenz sorgt für ein professionelles Erscheinungsbild und erleichtert automatisierte Auswertungen.

### 3.1 Überschriftenhierarchie

- Es darf pro Dokument genau eine **H1-Überschrift** geben.
- Überschriften-Ebenen dürfen **nicht übersprungen** werden (z.B. von H2 direkt zu H4).
- Verwende verständliche Verben und Substantive.

### 3.2 Codeblöcke mit Syntax-Highlighting

Gib immer die Sprache für Code-Blöcke an:

```python
def calculate_metric(values: list[float]) -> float:
    """Berechnet den Durchschnittswert."""
    if not values:
        return 0.0
    return sum(values) / len(values)
```

```javascript
// Beispiel für asynchrones Laden
async function loadDocument(filePath) {
  const content = await fs.promises.readFile(filePath, 'utf-8');
  return parseMarkdown(content);
}
```

```bash
# Terminal-Aufruf
md-cli view docs/getting-started.md
```

### 3.3 Tabellen und Vergleiche

Tabellen sollten mit klaren Spaltendefinitionen erstellt werden:

| Feature | md-cli | Pandoc | glow |
| :--- | :---: | :---: | :---: |
| Native Tree View | Ja | Nein | Nein |
| Frontmatter Map | Ja | Nein | Nein |
| Auto-TOC Injection | Ja | Nein | Nein |
| Fast Terminal Pager | Ja | Nein | Ja |

---

## 4. Workflows und Automatisierung

Automatisierte Validierung in Git-Hooks verhindert fehlerhafte Dokumente.

### 4.1 Git Pre-Commit Hooks

Ein typischer Pre-Commit Hook könnte folgendes ausführen:

```bash
#!/bin/sh
md-cli toc docs/**/*.md --inject
git add docs/**/*.md
```

### 4.2 CI/CD Integration

In GitHub Actions oder GitLab CI:

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

## 5. Häufig gestellte Fragen (FAQ)

### Kann ich md-cli in Skripten ohne Pager nutzen?
Ja, verwende einfach das Flag `--no-pager`, um den Output direkt nach `stdout` zu schreiben.

### Wie funktioniert die Tag-Suche?
Der Parameter `--tags` durchsucht die YAML-Frontmatter Properties nach passenden Schlüssel-Werte-Paaren.

### Werden `.git` und `node_modules` automatisch ignoriert?
Ja, interne Verzeichnisse werden beim Scannen automatisch übersprungen.

---

## 6. Zusammenfassung und nächste Schritte

Mit sauberen Konventionen und den richtigen Terminal-Werkzeugen wird Dokumentation vom ungeliebten Stiefkind zum wertvollen Beschleuniger im Entwickleralltag.
