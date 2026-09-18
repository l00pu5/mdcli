import fs from 'node:fs';
import path from 'node:path';
import chalk from 'chalk';
import boxen from 'boxen';
import { extractHeadings, generateToc, injectTocIntoMarkdown } from '../utils/markdown.js';

/**
 * Command: md-cli toc <filepath> [options]
 * @param {string} filePath 
 * @param {object} options 
 * @param {boolean} [options.inject=false]
 * @param {string} [options.minLevel='1']
 * @param {string} [options.maxLevel='6']
 */
export async function tocCommand(filePath, options = {}) {
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

  const minLevel = parseInt(options.minLevel, 10) || 1;
  const maxLevel = parseInt(options.maxLevel, 10) || 6;

  const headings = extractHeadings(rawContent);

  if (headings.length === 0) {
    console.log(boxen(
      `${chalk.cyan.bold('📄 ' + path.basename(resolvedPath))}\n\n${chalk.yellow('⚠️ Keine Überschriften für ein Inhaltsverzeichnis gefunden.')}`,
      { padding: 1, borderColor: 'yellow', borderStyle: 'round' }
    ));
    return;
  }

  const tocMarkdown = generateToc(headings, minLevel, maxLevel);

  if (!tocMarkdown) {
    console.log(chalk.yellow(`⚠️ Keine Überschriften zwischen H${minLevel} und H${maxLevel} gefunden.`));
    return;
  }

  if (options.inject) {
    const { content: updatedContent, status } = injectTocIntoMarkdown(rawContent, tocMarkdown);
    try {
      fs.writeFileSync(resolvedPath, updatedContent, 'utf8');
      const actionText = status === 'updated' 
        ? 'Inhaltsverzeichnis im vorhandenen <!-- toc --> Block aktualisiert.' 
        : 'Inhaltsverzeichnis mit <!-- toc --> Block erfolgreich eingefügt.';

      console.log(boxen(
        `✅ ${chalk.green.bold(actionText)}\n\n${chalk.cyan('📄 Datei:')} ${resolvedPath}\n${chalk.gray(`Einträge: ${headings.length} Überschriften`)}`,
        { padding: 1, borderColor: 'green', borderStyle: 'round', title: chalk.bold(' TOC Injected ') }
      ));
    } catch (err) {
      console.error(chalk.red.bold(`❌ Fehler beim Schreiben der Datei: ${err.message}`));
      process.exitCode = 1;
    }
  } else {
    console.log(boxen(
      `${chalk.cyan.bold('📋 Generiertes Inhaltsverzeichnis (TOC):')}\n\n${chalk.white(tocMarkdown)}\n\n${chalk.dim('💡 Tipp: Verwende --inject, um das TOC direkt in die Datei zu schreiben.')}`,
      {
        padding: 1,
        borderColor: 'cyan',
        borderStyle: 'round',
        title: chalk.bold(` TOC: ${path.basename(resolvedPath)} `)
      }
    ));
  }
}
