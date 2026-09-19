import { Command } from 'commander';
import chalk from 'chalk';
import { treeCommand } from './commands/tree.js';
import { mapCommand } from './commands/map.js';
import { searchCommand } from './commands/search.js';
import { tocCommand } from './commands/toc.js';
import { viewCommand } from './commands/view.js';

export function createCli() {
  const program = new Command();

  program
    .name('md-cli')
    .description(chalk.cyan.bold('md-cli') + ' - CLI tool to navigate, search and view MD files')
    .version('1.0.0', '-v, --version', 'Prints the current version of md-cli');

  // Command: tree <file_path>
  program
    .command('tree')
    .description('Parses MD file and renders heading structure as a tree')
    .argument('<file_path>', 'Path to MD file')
    .action(async (filePath) => {
      await treeCommand(filePath);
    });

  // Command: map [directory]
  program
    .command('map')
    .description('Scans a directory recursively and displays a tree with frontmatter titles')
    .argument('[directory]', 'Directory (default: .)', '.')
    .action(async (dirPath) => {
      await mapCommand(dirPath);
    });

  // Command: search <search_term>
  program
    .command('search')
    .description('Searches MD files for search term (full text or frontmatter tags)')
    .argument('<search_term>', 'Search term')
    .option('-d, --dir <directory>', 'Directory to be scanned', '.')
    .option('-t, --tags', 'Searches only in YAML frontmatter tags & properties', false)
    .action(async (query, options) => {
      await searchCommand(query, options);
    });

  // Command: toc <file_path>
  program
    .command('toc')
    .description('Generates TOC based on headings')
    .argument('<file_path>', 'Path to MD file')
    .option('-i, --inject', 'Injects the TOC into the file (at <!-- toc -->)', false)
    .option('--min-level <level>', 'Minimum heading level (1-6)', '1')
    .option('--max-level <level>', 'Maximum heading level (1-6)', '6')
    .action(async (filePath, options) => {
      await tocCommand(filePath, options);
    });

  // Command: view <file_path>
  program
    .command('view')
    .description('Renders MD with syntax highlighting and terminal paging')
    .argument('<file_path>', 'Path to MD file')
    .option('--no-pager', 'Disables paging and renders to stdout instead')
    .action(async (filePath, options) => {
      await viewCommand(filePath, options);
    });

  return program;
}
