import fs from 'node:fs';
import path from 'node:path';
import { parseMarkdown } from './markdown.js';

const IGNORED_NAMES = new Set([
  'node_modules',
  '.git',
  '.svn',
  '.hg',
  '.DS_Store',
  'dist',
  'build',
  '.cache',
  '.gemini',
  '.idea',
  '.vscode'
]);

/**
 * Checks if a filename is a Markdown file.
 * @param {string} filename 
 * @returns {boolean}
 */
export function isMarkdownFile(filename) {
  const ext = path.extname(filename).toLowerCase();
  return ext === '.md' || ext === '.markdown';
}

/**
 * Recursively scans a directory for markdown files and returns a flat list of absolute paths.
 * @param {string} dirPath 
 * @returns {string[]}
 */
export function findMarkdownFiles(dirPath) {
  const results = [];

  function walk(currentDir) {
    let entries;
    try {
      entries = fs.readdirSync(currentDir, { withFileTypes: true });
    } catch {
      return;
    }

    // Sort entries: directories first, then files
    entries.sort((a, b) => a.name.localeCompare(b.name));

    for (const entry of entries) {
      if (IGNORED_NAMES.has(entry.name) || entry.name.startsWith('.')) {
        continue;
      }

      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && isMarkdownFile(entry.name)) {
        results.push(fullPath);
      }
    }
  }

  walk(dirPath);
  return results;
}

/**
 * Recursively builds a directory tree structure containing only directories with markdown files.
 * @param {string} dirPath 
 * @returns {object|null}
 */
export function buildDirectoryMarkdownTree(dirPath) {
  const resolvedDir = path.resolve(dirPath);
  const baseName = path.basename(resolvedDir) || resolvedDir;

  function buildNode(currentPath, nodeName) {
    let entries;
    try {
      entries = fs.readdirSync(currentPath, { withFileTypes: true });
    } catch {
      return null;
    }

    entries.sort((a, b) => {
      // Directories first, then files, then alphabetical
      if (a.isDirectory() && !b.isDirectory()) return -1;
      if (!a.isDirectory() && b.isDirectory()) return 1;
      return a.name.localeCompare(b.name);
    });

    const children = [];

    for (const entry of entries) {
      if (IGNORED_NAMES.has(entry.name) || entry.name.startsWith('.')) {
        continue;
      }

      const childPath = path.join(currentPath, entry.name);

      if (entry.isDirectory()) {
        const subDirNode = buildNode(childPath, entry.name);
        // Only include subdirectory if it has markdown files/children
        if (subDirNode && subDirNode.children.length > 0) {
          children.push(subDirNode);
        }
      } else if (entry.isFile() && isMarkdownFile(entry.name)) {
        let title = null;
        try {
          const raw = fs.readFileSync(childPath, 'utf8');
          const parsed = parseMarkdown(raw);
          if (parsed.data && parsed.data.title) {
            title = String(parsed.data.title).trim();
          }
        } catch {
          // ignore read error
        }

        children.push({
          type: 'file',
          name: entry.name,
          path: childPath,
          title
        });
      }
    }

    return {
      type: 'dir',
      name: nodeName,
      path: currentPath,
      children
    };
  }

  return buildNode(resolvedDir, baseName);
}
