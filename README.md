# md-cli

A CLI tool for handling MD files

## Features

- 🌲 **Tree (`tree`)**: shows the hierarchic structure of the document headers as a tree
- 🗺️ **Directory Overview (`map`)**: scans folder recursively for MD files and displays YAML frontmatter
- 🔍 **Fulltext and front matter search (`search`)**: search with hughlighted snippets; supports tag search (`--tags`)
- 📋 **Table of contents (`toc`)**: automatically generates TOCs based on headings; supports injection into file (`--inject`) -> (under `<!-- toc -->`).
- 📖 **Viewer (`view`)**: renders MD with syntax highlighting and pipes long files into `less -R`

## Installation

From project directory:
```bash
npm link
```

## Usage

### 1. header tree (`tree`)
```bash
md-cli tree <file>
# example:
md-cli tree test_docs/guide.md
```

### 2. directory structure (`map`)
```bash
md-cli map [directory]
# example:
md-cli map test_docs
```

### 3. search (`search`)
```bash
# full-text search with snippet highlighting:
md-cli search "Terminal" --dir test_docs

# targeted search in YAML frontmatter tags:
md-cli search "cli" --tags --dir test_docs
```

### 4. generate table of contents (`toc`)
```bash
# output TOC to console:
md-cli toc test_docs/guide.md

# inject TOC directly to file at section <!-- toc -->:
md-cli toc test_docs/guide.md --inject
```

### 5. view MD in terminal (`view`)
```bash
# pipes output to pager (less -R) automatically:
md-cli view test_docs/long_document.md

# direct output without pager:
md-cli view test_docs/guide.md --no-pager
```

## License

MIT
