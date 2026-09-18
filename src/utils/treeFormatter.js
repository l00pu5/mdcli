import chalk from 'chalk';

/**
 * Color and badge mapping for heading levels H1-H6.
 */
const HEADING_STYLES = {
  1: { badge: chalk.bgCyan.black.bold(' H1 '), text: chalk.cyan.bold, icon: '🔷' },
  2: { badge: chalk.bgYellow.black.bold(' H2 '), text: chalk.yellow.bold, icon: '🔶' },
  3: { badge: chalk.bgGreen.black.bold(' H3 '), text: chalk.green, icon: '🟢' },
  4: { badge: chalk.bgMagenta.black.bold(' H4 '), text: chalk.magenta, icon: '🟣' },
  5: { badge: chalk.bgBlue.black.bold(' H5 '), text: chalk.blue, icon: '🔹' },
  6: { badge: chalk.bgGray.black.bold(' H6 '), text: chalk.gray, icon: '▫️' }
};

/**
 * Formats a hierarchical heading tree into a string.
 * @param {Array<object>} nodes - Hierarchy of heading nodes
 * @param {string} prefix - Current indentation prefix
 * @returns {string}
 */
export function formatHeadingTree(nodes, prefix = '') {
  let output = '';

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const isLast = i === nodes.length - 1;
    const branch = isLast ? '└── ' : '├── ';
    const childPrefix = prefix + (isLast ? '    ' : '│   ');

    const style = HEADING_STYLES[node.level] || HEADING_STYLES[6];
    const lineInfo = chalk.gray(`(Zeile ${node.lineNumber})`);
    const headingText = style.text(node.cleanText);

    output += `${prefix}${chalk.gray(branch)}${style.icon} ${style.badge} ${headingText} ${lineInfo}\n`;

    if (node.children && node.children.length > 0) {
      output += formatHeadingTree(node.children, childPrefix);
    }
  }

  return output;
}

/**
 * Formats a directory tree with frontmatter titles.
 * @param {object} dirNode - Directory tree node { name, type: 'dir'|'file', children, title }
 * @param {string} prefix - Current indentation prefix
 * @param {boolean} isRoot - True if this is the root node
 * @returns {string}
 */
export function formatDirectoryTree(dirNode, prefix = '', isRoot = false) {
  let output = '';

  if (isRoot) {
    output += `${chalk.bold.blue('📁 ' + dirNode.name)}\n`;
    if (dirNode.children && dirNode.children.length > 0) {
      for (let i = 0; i < dirNode.children.length; i++) {
        const child = dirNode.children[i];
        const isLast = i === dirNode.children.length - 1;
        output += formatDirectoryChild(child, '', isLast);
      }
    } else {
      output += chalk.gray('   └── (Keine Markdown-Dateien gefunden)\n');
    }
    return output;
  }

  return output;
}

function formatDirectoryChild(node, prefix, isLast) {
  let output = '';
  const branch = isLast ? '└── ' : '├── ';
  const childPrefix = prefix + (isLast ? '    ' : '│   ');

  if (node.type === 'dir') {
    output += `${prefix}${chalk.gray(branch)}${chalk.bold.blue('📁 ' + node.name)}\n`;
    if (node.children) {
      for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i];
        const childIsLast = i === node.children.length - 1;
        output += formatDirectoryChild(child, childPrefix, childIsLast);
      }
    }
  } else {
    const fileLabel = chalk.cyan(node.name);
    const titleLabel = node.title ? ` ${chalk.dim.italic(`[${node.title}]`)}` : '';
    output += `${prefix}${chalk.gray(branch)}📄 ${fileLabel}${titleLabel}\n`;
  }

  return output;
}
