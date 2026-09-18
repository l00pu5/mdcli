import fs from 'node:fs';
import path from 'node:path';
import chalk from 'chalk';
import boxen from 'boxen';
import { buildDirectoryMarkdownTree, findMarkdownFiles } from '../utils/fileScanner.js';
import { formatDirectoryTree } from '../utils/treeFormatter.js';

/**
 * Command: md-cli map [directory]
 * @param {string} [dirPath='.']
 */
export async function mapCommand(dirPath = '.') {
  const resolvedDir = path.resolve(dirPath);

  if (!fs.existsSync(resolvedDir)) {
    console.error(chalk.red.bold(`❌ Fehler: Verzeichnis '${dirPath}' existiert nicht.`));
    process.exitCode = 1;
    return;
  }

  const stat = fs.statSync(resolvedDir);
  if (!stat.isDirectory()) {
    console.error(chalk.red.bold(`❌ Fehler: '${dirPath}' ist kein Verzeichnis.`));
    process.exitCode = 1;
    return;
  }

  const allMdFiles = findMarkdownFiles(resolvedDir);
  const tree = buildDirectoryMarkdownTree(resolvedDir);

  if (!tree || allMdFiles.length === 0) {
    console.log(boxen(
      `${chalk.bold.blue('📁 ' + path.basename(resolvedDir))}\n\n${chalk.yellow('⚠️ Keine Markdown-Dateien (.md, .markdown) gefunden.')}`,
      { padding: 1, borderColor: 'yellow', borderStyle: 'round' }
    ));
    return;
  }

  const treeOutput = formatDirectoryTree(tree, '', true);

  // Count subdirectories containing markdown
  const dirSet = new Set(allMdFiles.map(f => path.dirname(f)));
  const dirCount = dirSet.size;

  const stats = chalk.gray(
    `📊 Gefunden: ${chalk.bold(allMdFiles.length)} Markdown-Dateien in ${chalk.bold(dirCount)} Verzeichnis(sen)`
  );

  console.log(
    boxen(
      `${treeOutput}\n${stats}`,
      {
        padding: 1,
        borderColor: 'blue',
        borderStyle: 'round',
        title: chalk.bold(' Verzeichnis-Übersicht '),
        titleAlignment: 'left'
      }
    )
  );
}
