import matter from 'gray-matter';

/**
 * Parses frontmatter and markdown content from a raw file string.
 * @param {string} rawContent 
 * @returns {{ data: Record<string, any>, content: string }}
 */
export function parseMarkdown(rawContent) {
  try {
    const parsed = matter(rawContent);
    return {
      data: parsed.data || {},
      content: parsed.content || ''
    };
  } catch (error) {
    return {
      data: {},
      content: rawContent
    };
  }
}

/**
 * Strips markdown inline formatting (bold, italic, links, code, strikethrough).
 * @param {string} text 
 * @returns {string}
 */
export function stripMarkdownFormatting(text) {
  return text
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1') // images
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')  // links
    .replace(/`([^`]+)`/g, '$1')             // inline code
    .replace(/(\*\*|__)(.*?)\1/g, '$2')      // bold
    .replace(/(\*|_)(.*?)\1/g, '$2')        // italic
    .replace(/~~(.*?)~~/g, '$1')             // strikethrough
    .trim();
}

/**
 * Generates a GitHub-compatible anchor slug from heading text.
 * @param {string} text 
 * @returns {string}
 */
export function slugify(text) {
  const clean = stripMarkdownFormatting(text);
  return clean
    .toLowerCase()
    .trim()
    .replace(/[\s\t\n]+/g, '-')              // spaces to hyphens
    .replace(/[^\p{L}\p{N}\-_]/gu, '')      // keep unicode letters, numbers, hyphens, underscores
    .replace(/-+/g, '-')                     // collapse multiple hyphens
    .replace(/^-+|-+$/g, '');                // trim hyphens
}

/**
 * Extracts headings from markdown content, ignoring code blocks.
 * @param {string} rawFileContent - The complete file text including frontmatter
 * @returns {Array<{ level: number, text: string, cleanText: string, slug: string, lineNumber: number }>}
 */
export function extractHeadings(rawFileContent) {
  const lines = rawFileContent.split(/\r?\n/);
  const headings = [];
  const slugCounts = new Map();

  let inFencedCode = false;
  let inFrontmatter = false;
  let frontmatterDelimiters = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNumber = i + 1;
    const trimmed = line.trim();

    // Check frontmatter boundaries (only at start of file)
    if (i === 0 && trimmed === '---') {
      inFrontmatter = true;
      frontmatterDelimiters++;
      continue;
    } else if (inFrontmatter) {
      if (trimmed === '---') {
        inFrontmatter = false;
      }
      continue;
    }

    // Check code fences
    if (trimmed.startsWith('```') || trimmed.startsWith('~~~')) {
      inFencedCode = !inFencedCode;
      continue;
    }

    if (inFencedCode) {
      continue;
    }

    // Match ATX headings (# to ######)
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      // Strip trailing # if present (e.g. "## Heading ##")
      const rawText = headingMatch[2].replace(/\s+#+\s*$/, '').trim();
      const cleanText = stripMarkdownFormatting(rawText);
      let baseSlug = slugify(rawText);
      if (!baseSlug) baseSlug = `heading-${lineNumber}`;

      // Handle duplicate slugs (CommonMark/GitHub style: slug, slug-1, slug-2, ...)
      let slug = baseSlug;
      const count = slugCounts.get(baseSlug) || 0;
      if (count > 0) {
        slug = `${baseSlug}-${count}`;
      }
      slugCounts.set(baseSlug, count + 1);

      headings.push({
        level,
        text: rawText,
        cleanText,
        slug,
        lineNumber
      });
    }
  }

  return headings;
}

/**
 * Builds a hierarchical tree node structure from a flat list of headings.
 * @param {Array<{ level: number, text: string, cleanText: string, slug: string, lineNumber: number }>} headings 
 * @returns {Array<object>} Root nodes with .children arrays
 */
export function buildHeadingHierarchy(headings) {
  const roots = [];
  const stack = []; // [{ node, level }]

  for (const h of headings) {
    const node = { ...h, children: [] };

    // Pop stack while top has level >= current level
    while (stack.length > 0 && stack[stack.length - 1].level >= h.level) {
      stack.pop();
    }

    if (stack.length === 0) {
      roots.push(node);
    } else {
      stack[stack.length - 1].node.children.push(node);
    }

    stack.push({ node, level: h.level });
  }

  return roots;
}

/**
 * Generates a Markdown Table of Contents string from headings.
 * @param {Array<object>} headings 
 * @param {number} [minLevel=1] 
 * @param {number} [maxLevel=6] 
 * @returns {string}
 */
export function generateToc(headings, minLevel = 1, maxLevel = 6) {
  const filtered = headings.filter(h => h.level >= minLevel && h.level <= maxLevel);
  if (filtered.length === 0) return '';

  const lowestLevel = Math.min(...filtered.map(h => h.level));
  const tocLines = [];

  for (const h of filtered) {
    const indentLevel = h.level - lowestLevel;
    const indent = '  '.repeat(indentLevel);
    tocLines.push(`${indent}* [${h.cleanText}](#${h.slug})`);
  }

  return tocLines.join('\n');
}

/**
 * Injects or updates a TOC inside markdown content.
 * @param {string} rawContent 
 * @param {string} tocMarkdown 
 * @returns {{ content: string, status: 'updated' | 'inserted' }}
 */
export function injectTocIntoMarkdown(rawContent, tocMarkdown) {
  const tocBlock = `<!-- toc -->\n${tocMarkdown}\n<!-- /toc -->`;

  // Check for existing paired markers: <!-- toc --> ... <!-- /toc --> or <!-- endtoc -->
  const pairedRegex = /<!--\s*toc\s*-->[\s\S]*?<!--\s*(?:\/toc|endtoc)\s*-->/i;
  if (pairedRegex.test(rawContent)) {
    const updated = rawContent.replace(pairedRegex, tocBlock);
    return { content: updated, status: 'updated' };
  }

  // Check for single <!-- toc --> marker
  const singleRegex = /<!--\s*toc\s*-->/i;
  if (singleRegex.test(rawContent)) {
    const updated = rawContent.replace(singleRegex, tocBlock);
    return { content: updated, status: 'updated' };
  }

  // No marker found: insert after frontmatter or at top
  const frontmatterMatch = rawContent.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n/);
  if (frontmatterMatch) {
    const frontmatterEnd = frontmatterMatch[0].length;
    const before = rawContent.slice(0, frontmatterEnd);
    const after = rawContent.slice(frontmatterEnd);
    const updated = `${before}\n${tocBlock}\n\n${after.replace(/^\n+/, '')}`;
    return { content: updated, status: 'inserted' };
  }

  // Prepend at top
  const updated = `${tocBlock}\n\n${rawContent.replace(/^\n+/, '')}`;
  return { content: updated, status: 'inserted' };
}
