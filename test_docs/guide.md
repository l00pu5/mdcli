---
title: Introduction to md-cli
author: Sebastian Block
date: 2026-09-18
tags:
  - guide
  - terminal
  - markdown
---

# Introduction to md-cli

A simple CLI tool for exploring MD documentation repositories.

<!-- toc -->
* [Introduction to md-cli](#introduction-to-md-cli)
  * [Why md-cli?](#why-md-cli)
    * [Core philiosophy](#core-philosophy)
      * [Minimal overhead](#minimal-overhead)
  * [Installation & setup](#installation-setup)
    * [First steps](#first-steps)
  * [Command overview](#command-overview)
  * [Summary](#summary)
<!-- /toc -->

## Why md-cli?

Large MD document repositories can become overwhelming easily. `md-cli` offers intuitive terminal commands:

- **Visual tree structure**: quick overview of file and directory structure
- **Directory mapping**: automatic recognition of frontmatter titles
- **Full text search**: quick search with context snippets

### Core philosophy

We believe in the following goals as necessities:

1. Fast operation within the terminal
2. Colored output
3. Compatibility with MD standards / common practices

#### Minimum overhead

No heavy desktop editors are necessary if you would simply like to look up something real quick.

## Installation & setup

```bash
npm link
```

### First steps

After installation the `md-cli` command can be executed directly from the terminal:

```bash
md-cli --help
```

## Command overview

This is a brief overview of the most important commands:

| Command | Description |
| :--- | :--- |
| `tree` | Displays the heading hierarchy |
| `map` | Display a file tree with titles |
| `search` | Searches MD content or tags |
| `toc` | Generates or updates TOCs |
| `view` | Renders MD document with syntax highlighting |

## Summary

With `md-cli` you'll be able to keep track of your MD documentation.
