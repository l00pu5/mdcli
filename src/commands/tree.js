import fs from 'node:fs';
import path from 'node:path';
import chalk from 'chalk';
import boxen from 'boxen';
import { extractHeadings, buildHeadingHierarchy, parseMarkdown } from '../utils/markdown.js';
import { formatHeadingTree } from '../utils/treeFormatter.js';

/**
 * Command: md-cli tree <filepath>
 * @param {string} filePath 
 */
export async function treeCommand(filePath) {
  const resolvedPath = path.resolve(filePath);

  if (!fs.existsSync(resolvedPath)) {
    console.error(chalk.red.bold(`❌ Fehler: Datei '${filePath}' existiert nicht.`));
    process.exitCode = 1;
    return;
  }

  const stat = fs.statSync(resolvedPath);
  if (!stat.isFile()) {
    console.error(chalk.red.bold(`❌ Fehler: '${filePath}' ist keine Datei.`));
    process.exitCode = 1;
    return;
  }

  let rawContent;
  try {
    rawContent = fs.readFileSync(resolvedPath, 'utf8');
  } catch (err) {
    console.error(chalk.red.bold(`❌ Fehler beim Lesen der Datei: ${err.message}`));
    process.exitCode = 1;
    return;
  }

  const { data: frontmatter } = parseMarkdown(rawContent);
  const headings = extractHeadings(rawContent);

  const titleHeader = frontmatter.title 
    ? `${path.basename(resolvedPath)} ${chalk.dim.italic(`(${frontmatter.title})`)}`
    : path.basename(resolvedPath);

  if (headings.length === 0) {
    console.log(boxen(
      `${chalk.cyan.bold('📄 ' + titleHeader)}\n\n${chalk.yellow('⚠️ Keine Markdown-Überschriften (H1-H6) in dieser Datei gefunden.')}`,
      { padding: 1, borderColor: 'yellow', borderStyle: 'round' }
    ));
    return;
  }

  const hierarchy = buildHeadingHierarchy(headings);
  const treeOutput = formatHeadingTree(hierarchy);

  const stats = chalk.gray(
    `📊 Überschriften: ${headings.length} | Ebenen: ${[...new Set(headings.map(h => 'H' + h.level))].sort().join(', ')}`
  );

  console.log(
    boxen(
      `${chalk.cyan.bold('📄 ' + titleHeader)}\n\n${treeOutput}\n${stats}`,
      {
        padding: 1,
        borderColor: 'cyan',
        borderStyle: 'round',
        title: chalk.bold(' Überschriften-Struktur '),
        titleAlignment: 'left'
      }
    )
  );
}
