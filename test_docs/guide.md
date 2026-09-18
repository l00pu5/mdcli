---
title: Einführung in md-cli
author: Antigravity Team
date: 2026-09-18
tags:
  - guide
  - terminal
  - markdown
---

# Einführung in md-cli

Ein modernes CLI-Werkzeug zur mühelosen Erkundung von Markdown-Dokumentationen.

<!-- toc -->
* [Einführung in md-cli](#einführung-in-md-cli)
  * [Warum md-cli?](#warum-md-cli)
    * [Kernphilosophie](#kernphilosophie)
      * [Minimaler Overhead](#minimaler-overhead)
  * [Installation & Setup](#installation-setup)
    * [Erste Schritte](#erste-schritte)
  * [Befehlsübersicht](#befehlsübersicht)
  * [Fazit](#fazit)
<!-- /toc -->

## Warum md-cli?

Große Markdown-Repositories können unübersichtlich werden. `md-cli` bietet intuitive Befehle für das Terminal:

- **Visuelle Baumstruktur**: Schneller Überblick über die Kapitelstruktur.
- **Verzeichnis-Mapping**: Automatische Erkennung von Frontmatter-Titeln.
- **Volltextsuche**: Schnelle Suche mit Kontext-Snippets.

### Kernphilosophie

Wir glauben an:

1. Schnelligkeit im Terminal
2. Schöne, farbige Ausgabe
3. Kompatibilität mit gängigen Markdown-Standards

#### Minimaler Overhead

Keine schweren Desktop-Editoren nötig, wenn man nur schnell etwas nachschlagen möchte.

## Installation & Setup

Die Installation erfolgt bequem über npm:

```bash
npm install -g md-cli
```

### Erste Schritte

Nach der Installation steht der Befehl `md-cli` direkt zur Verfügung:

```bash
md-cli --help
```

## Befehlsübersicht

Hier ist eine kurze Übersicht der wichtigsten Befehle:

| Befehl | Beschreibung |
| :--- | :--- |
| `tree` | Zeigt die Überschriften-Hierarchie |
| `map` | Erstellt einen Dateibaum mit Titeln |
| `search` | Durchsucht Markdown-Inhalte oder Tags |
| `toc` | Generiert oder aktualisiert Inhaltsverzeichnisse |
| `view` | Rendert Dokumente mit Syntax-Highlighting |

## Fazit

Mit `md-cli` behältst du stets den Überblick über all deine Dokumentationen.
