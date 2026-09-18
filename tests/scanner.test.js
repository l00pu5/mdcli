import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { findMarkdownFiles, buildDirectoryMarkdownTree } from '../src/utils/fileScanner.js';

describe('File Scanner Tests', () => {
  test('findMarkdownFiles discovers markdown files in test_docs', () => {
    const files = findMarkdownFiles('test_docs');
    assert.ok(files.length >= 4);
    const names = files.map(f => path.basename(f));
    assert.ok(names.includes('guide.md'));
    assert.ok(names.includes('api.md'));
    assert.ok(names.includes('notes.md'));
    assert.ok(names.includes('long_document.md'));
  });

  test('buildDirectoryMarkdownTree populates frontmatter titles', () => {
    const tree = buildDirectoryMarkdownTree('test_docs');
    assert.equal(tree.type, 'dir');
    const apiFile = tree.children.find(c => c.name === 'api.md');
    assert.ok(apiFile);
    assert.equal(apiFile.title, 'API Referenz');

    const nestedDir = tree.children.find(c => c.name === 'nested');
    assert.ok(nestedDir);
    assert.equal(nestedDir.children[0].title, 'Entwickler-Notizen');
  });
});
