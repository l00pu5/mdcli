import fs from 'node:fs';
import path from 'node:path';
import chalk from 'chalk';
import boxen from 'boxen';
import { findMarkdownFiles } from '../utils/fileScanner.js';
import { parseMarkdown } from '../utils/markdown.js';

/**
 * Escapes regex special characters.
 * @param {string} str 
 * @returns {string}
 */
function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Highlights matches of query within text.
 * @param {string} text 
 * @param {string} query 
 * @returns {string}
 */
function highlightMatch(text, query) {
  if (!query) return text;
  const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
  return text.replace(regex, (m) => chalk.bgYellow.black.bold(m));
}

/**
 * Checks frontmatter data for tag/property matches.
 * @param {Record<string, any>} data 
 * @param {string} query 
 * @returns {Array<{ key: string, value: string, snippet: string }>}
 */
function searchFrontmatterTags(data, query) {
  const matches = [];
  const lowerQuery = query.toLowerCase();

  for (const [key, val] of Object.entries(data)) {
    // Check if key or value matches
    if (Array.isArray(val)) {
      for (const item of val) {
        const itemStr = String(item);
        if (itemStr.toLowerCase().includes(lowerQuery)) {
          matches.push({
            key,
            value: itemStr,
            snippet: `${key}: [ ... ${highlightMatch(itemStr, query)} ... ]`
          });
        }
      }
    } else if (typeof val === 'string' || typeof val === 'number') {
      const valStr = String(val);
      if (valStr.toLowerCase().includes(lowerQuery)) {
        matches.push({
          key,
          value: valStr,
          snippet: `${key}: ${highlightMatch(valStr, query)}`
        });
      }
    } else if (typeof val === 'object' && val !== null) {
      const nested = searchFrontmatterTags(val, query);
      matches.push(...nested);
    }
  }

  return matches;
}

/**
 * Command: md-cli search <query> [options]
 * @param {string} query 
 * @param {object} options 
 * @param {string} [options.dir='.']
 * @param {boolean} [options.tags=false]
 */
export async function searchCommand(query, options = {}) {
  const searchDir = path.resolve(options.dir || '.');
  const onlyTags = Boolean(options.tags);

  if (!query || typeof query !== 'string' || query.trim() === '') {
    console.error(chalk.red.bold('❌ Error: please provide search term'));
    process.exitCode = 1;
    return;
  }

  const cleanQuery = query.trim();

  if (!fs.existsSync(searchDir)) {
    console.error(chalk.red.bold(`❌ Error: directory '${searchDir}' does not exist`));
    process.exitCode = 1;
    return;
  }

  const files = findMarkdownFiles(searchDir);

  if (files.length === 0) {
    console.log(chalk.yellow(`⚠️ no MD files found in directory '${searchDir}'`));
    return;
  }

  const results = [];
  let totalMatches = 0;

  for (const filePath of files) {
    let content;
    try {
      content = fs.readFileSync(filePath, 'utf8');
    } catch {
      continue;
    }

    const { data: frontmatter } = parseMarkdown(content);
    const relPath = path.relative(process.cwd(), filePath) || path.basename(filePath);

    if (onlyTags) {
      const tagMatches = searchFrontmatterTags(frontmatter, cleanQuery);
      if (tagMatches.length > 0) {
        totalMatches += tagMatches.length;
        results.push({
          filePath,
          relPath,
          title: frontmatter.title || null,
          matches: tagMatches.map(m => ({
            line: 'Frontmatter',
            snippet: m.snippet
          }))
        });
      }
    } else {
      // Full-text search
      const lines = content.split(/\r?\n/);
      const fileMatches = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.toLowerCase().includes(cleanQuery.toLowerCase())) {
          const lineNumber = i + 1;
          const trimmedLine = line.trim();
          fileMatches.push({
            line: lineNumber,
            snippet: highlightMatch(trimmedLine, cleanQuery)
          });
        }
      }

      if (fileMatches.length > 0) {
        totalMatches += fileMatches.length;
        results.push({
          filePath,
          relPath,
          title: frontmatter.title || null,
          matches: fileMatches
        });
      }
    }
  }

  const modeLabel = onlyTags ? chalk.magenta.bold('[tag search]') : chalk.cyan.bold('[text search]');
  console.log(`\n🔍 ${modeLabel} Searching for: ${chalk.yellow.bold(`"${cleanQuery}"`)} in ${chalk.blue(searchDir)}\n`);

  if (results.length === 0) {
    console.log(boxen(
      chalk.yellow(`No results found for "${cleanQuery}"`),
      { padding: 1, borderColor: 'yellow', borderStyle: 'round' }
    ));
    return;
  }

  for (const res of results) {
    const titlePart = res.title ? ` ${chalk.dim.italic(`(${res.title})`)}` : '';
    let cardContent = `${chalk.bold.cyan('📄 ' + res.relPath)}${titlePart}\n`;
    cardContent += chalk.gray('─'.repeat(50)) + '\n';

    const maxDisplay = 5;
    const displayedMatches = res.matches.slice(0, maxDisplay);

    for (const m of displayedMatches) {
      const lineBadge = chalk.dim.gray(`Line ${m.line}:`);
      cardContent += `  ${lineBadge} ${m.snippet}\n`;
    }

    if (res.matches.length > maxDisplay) {
      const remaining = res.matches.length - maxDisplay;
      cardContent += `  ${chalk.dim(`... and ${remaining} additional matches in this file`)}\n`;
    }

    console.log(boxen(cardContent.trimEnd(), {
      padding: { top: 0, bottom: 0, left: 1, right: 1 },
      borderColor: 'gray',
      borderStyle: 'round'
    }));
  }

  console.log(chalk.green.bold(
    `\n✅ Found: ${totalMatches} matches in ${results.length} file(s)\n`
  ));
}
