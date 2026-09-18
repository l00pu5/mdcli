import fs from 'node:fs';
import path from 'node:path';
import chalk from 'chalk';
import boxen from 'boxen';
import { Marked } from 'marked';
import { markedTerminal } from 'marked-terminal';
import { highlight } from 'cli-highlight';
import { parseMarkdown } from '../utils/markdown.js';
import { displayWithPager } from '../utils/pager.js';

/**
 * Creates and configures the Marked renderer for terminal output.
 */
function createTerminalRenderer() {
  return new Marked(
    markedTerminal({
      width: Math.min(process.stdout.columns || 80, 100),
      reflowText: true,
      showSectionPrefix: false,
      tab: 2,
      highlight: (code, lang) => {
        try {
          return highlight(code, {
            language: lang,
            ignoreIllegals: true
          });
        } catch {
          return code;
        }
      },
      heading: chalk.bold.cyan,
      firstHeading: chalk.bold.underline.cyan,
      secondHeading: chalk.bold.yellow,
      thirdHeading: chalk.bold.green,
      blockquote: chalk.gray.italic,
      code: chalk.yellow,
      strong: chalk.bold,
      em: chalk.italic,
      tableOptions: {
        chars: {
          top: '─', 'top-mid': '┬', 'top-left': '┌', 'top-right': '┐',
          bottom: '─', 'bottom-mid': '┴', 'bottom-left': '└', 'bottom-right': '┘',
          left: '│', 'left-mid': '├', mid: '─', 'mid-mid': '┼',
          right: '│', 'right-mid': '┤', middle: '│'
        }
      }
    })
  );
}

/**
 * Formats frontmatter as a clean metadata block.
 * @param {Record<string, any>} data 
 * @returns {string}
 */
function formatFrontmatterBox(data) {
  if (!data || Object.keys(data).length === 0) return '';

  const lines = [];
  for (const [key, val] of Object.entries(data)) {
    const formattedKey = chalk.dim.cyan(key + ':');
    let formattedVal;
    if (Array.isArray(val)) {
      formattedVal = chalk.white(val.join(', '));
    } else if (typeof val === 'object' && val !== null) {
      formattedVal = chalk.white(JSON.stringify(val));
    } else {
      formattedVal = chalk.white(String(val));
    }
    lines.push(`  ${formattedKey} ${formattedVal}`);
  }

  return boxen(lines.join('\n'), {
    padding: { top: 0, bottom: 0, left: 1, right: 1 },
    borderColor: 'cyan',
    borderStyle: 'round',
    title: chalk.bold(' Metadata '),
    titleAlignment: 'left'
  }) + '\n\n';
}

/**
 * Command: md-cli view <filepath> [options]
 * @param {string} filePath 
 * @param {object} options 
 * @param {boolean} [options.noPager=false]
 */
export async function viewCommand(filePath, options = {}) {
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

  const { data: frontmatter, content: markdownBody } = parseMarkdown(rawContent);

  // Strip HTML comments (e.g. <!-- toc -->) for clean terminal reading
  const cleanBody = markdownBody.replace(/<!--[\s\S]*?-->/g, '');

  const headerBox = formatFrontmatterBox(frontmatter);
  const renderer = createTerminalRenderer();
  const renderedBody = renderer.parse(cleanBody);

  const fullOutput = `${headerBox}${renderedBody}`;

  await displayWithPager(fullOutput, { disablePager: options.noPager });
}
