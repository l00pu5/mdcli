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
    .description(chalk.cyan.bold('md-cli') + ' - Modernes CLI-Tool zum Navigieren, Durchsuchen und Betrachten von Markdown-Dateien')
    .version('1.0.0', '-v, --version', 'Gibt die aktuelle Version von md-cli aus');

  // Command: tree <dateipfad>
  program
    .command('tree')
    .description('Parst eine Markdown-Datei und gibt die Überschriften-Hierarchie (H1-H6) als Baum aus')
    .argument('<dateipfad>', 'Pfad zur Markdown-Datei')
    .action(async (filePath) => {
      await treeCommand(filePath);
    });

  // Command: map [verzeichnis]
  program
    .command('map')
    .description('Scannt ein Verzeichnis rekursiv nach Markdown-Dateien und zeigt einen Baum mit Frontmatter-Titeln')
    .argument('[verzeichnis]', 'Zu scannendes Verzeichnis (Standard: .)', '.')
    .action(async (dirPath) => {
      await mapCommand(dirPath);
    });

  // Command: search <suchbegriff>
  program
    .command('search')
    .description('Durchsucht Markdown-Dateien nach einem Begriff (Volltext oder Frontmatter-Tags)')
    .argument('<suchbegriff>', 'Der gesuchte Begriff')
    .option('-d, --dir <verzeichnis>', 'Verzeichnis, das durchsucht werden soll', '.')
    .option('-t, --tags', 'Sucht explizit nur in den YAML-Frontmatter-Tags & Properties', false)
    .action(async (query, options) => {
      await searchCommand(query, options);
    });

  // Command: toc <dateipfad>
  program
    .command('toc')
    .description('Generiert ein Inhaltsverzeichnis (TOC) basierend auf den Überschriften')
    .argument('<dateipfad>', 'Pfad zur Markdown-Datei')
    .option('-i, --inject', 'Schreibt das TOC direkt in die Datei (bei <!-- toc -->)', false)
    .option('--min-level <level>', 'Minimale Überschriften-Ebene (1-6)', '1')
    .option('--max-level <level>', 'Maximale Überschriften-Ebene (1-6)', '6')
    .action(async (filePath, options) => {
      await tocCommand(filePath, options);
    });

  // Command: view <dateipfad>
  program
    .command('view')
    .description('Rendert Markdown mit Syntax-Highlighting und automatischem Terminal-Pager')
    .argument('<dateipfad>', 'Pfad zur Markdown-Datei')
    .option('--no-pager', 'Deaktiviert den automatischen Pager und gibt direkt auf stdout aus')
    .action(async (filePath, options) => {
      await viewCommand(filePath, options);
    });

  return program;
}
