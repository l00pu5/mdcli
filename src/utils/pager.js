import { spawn } from 'node:child_process';

/**
 * Displays content in the terminal, optionally using a pager if line count exceeds terminal height.
 * @param {string} content - The formatted string to display
 * @param {object} [options]
 * @param {boolean} [options.disablePager=false] - Force direct output without pager
 * @returns {Promise<void>}
 */
export function displayWithPager(content, options = {}) {
  const { disablePager = false } = options;
  const isTTY = Boolean(process.stdout.isTTY);
  const rows = process.stdout.rows || 24;

  // Split lines to calculate line count
  const lineCount = content.split(/\r?\n/).length;

  // Output directly if not a TTY, if pager is disabled, or if content fits on one screen
  if (!isTTY || disablePager || lineCount <= rows) {
    process.stdout.write(content);
    if (!content.endsWith('\n')) {
      process.stdout.write('\n');
    }
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const pagerCmd = process.env.PAGER || 'less';
    const isLess = pagerCmd.includes('less');
    
    // -R: preserve ANSI color escapes
    // -r: fallback for some versions of less
    const pagerArgs = isLess ? ['-R'] : [];

    const child = spawn(pagerCmd, pagerArgs, {
      stdio: ['pipe', 'inherit', 'inherit'],
    });

    // Handle EPIPE error if user exits pager early (e.g. presses 'q')
    child.stdin.on('error', (err) => {
      if (err.code !== 'EPIPE') {
        console.error(err);
      }
    });

    child.on('error', () => {
      // Fallback to normal stdout if pager executable was not found
      process.stdout.write(content);
      if (!content.endsWith('\n')) {
        process.stdout.write('\n');
      }
      resolve();
    });

    child.on('close', () => {
      resolve();
    });

    // Write content and close stdin
    child.stdin.write(content);
    child.stdin.end();
  });
}
