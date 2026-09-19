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
    console.error(chalk.red.bold(`❌ Error: File '${filePath}' does not exist`));
    process.exitCode = 1;
    return;
  }

  const stat = fs.statSync(resolvedPath);
  if (!stat.isFile()) {
    console.error(chalk.red.bold(`❌ Error: '${filePath}' is not a file`));
    process.exitCode = 1;
    return;
  }

  let rawContent;
  try {
    rawContent = fs.readFileSync(resolvedPath, 'utf8');
  } catch (err) {
    console.error(chalk.red.bold(`❌ Error while reading file: ${err.message}`));
    process.exitCode = 1;
    return;
  }

  const minLevel = parseInt(options.minLevel, 10) || 1;
  const maxLevel = parseInt(options.maxLevel, 10) || 6;

  const headings = extractHeadings(rawContent);

  if (headings.length === 0) {
    console.log(boxen(
      `${chalk.cyan.bold('📄 ' + path.basename(resolvedPath))}\n\n${chalk.yellow('⚠️ No headings found')}`,
      { padding: 1, borderColor: 'yellow', borderStyle: 'round' }
    ));
    return;
  }

  const tocMarkdown = generateToc(headings, minLevel, maxLevel);

  if (!tocMarkdown) {
    console.log(chalk.yellow(`⚠️ No headings found between H${minLevel} and H${maxLevel}`));
    return;
  }

  if (options.inject) {
    const { content: updatedContent, status } = injectTocIntoMarkdown(rawContent, tocMarkdown);
    try {
      fs.writeFileSync(resolvedPath, updatedContent, 'utf8');
      const actionText = status === 'updated'
        ? 'TOC updated in existing <!-- toc --> block'
        : 'TOC inserted in <!-- toc --> block';

      console.log(boxen(
        `✅ ${chalk.green.bold(actionText)}\n\n${chalk.cyan('📄 Datei:')} ${resolvedPath}\n${chalk.gray(`Entries: ${headings.length} headings`)}`,
        { padding: 1, borderColor: 'green', borderStyle: 'round', title: chalk.bold(' TOC Injected ') }
      ));
    } catch (err) {
      console.error(chalk.red.bold(`❌ Error while writing file: ${err.message}`));
      process.exitCode = 1;
    }
  } else {
    console.log(boxen(
      `${chalk.cyan.bold('📋 TOC:')}\n\n${chalk.white(tocMarkdown)}\n\n${chalk.dim('💡 Hint: use --inject to insert the TOC directly into the file')}`,
      {
        padding: 1,
        borderColor: 'cyan',
        borderStyle: 'round',
        title: chalk.bold(` TOC: ${path.basename(resolvedPath)} `)
      }
    ));
  }
}
