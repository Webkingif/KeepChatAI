/**
 * Normalizes LaTeX math delimiters across different LLM formats:
 * - Converts display math: \[ ... \] -> $$ ... $$
 * - Converts inline math: \( ... \) -> $ ... $
 * 
 * Safely preserves fenced code blocks and inline code spans.
 */
export function normalizeLatexDelimiters(markdown: string): string {
  if (!markdown) return '';

  // Protect code fences by splitting on code blocks and inline backticks
  const codeBlockRegex = /(```[\s\S]*?```|`[^`\n]+`)/g;
  const parts = markdown.split(codeBlockRegex);

  return parts
    .map((part, index) => {
      // Odd indices are code blocks - leave them untouched
      if (index % 2 === 1) {
        return part;
      }

      // Convert display math: \[ ... \] to \n\n$$\n...\n$$\n\n
      let transformed = part.replace(/\\\[([\s\S]*?)\\\]/g, (_, math) => {
        return `\n\n$$\n${math.trim()}\n$$\n\n`;
      });

      // Convert inline math: \( ... \) to $...$
      transformed = transformed.replace(/\\\(([\s\S]*?)\\\)/g, (_, math) => {
        return `$${math.trim()}$`;
      });

      return transformed;
    })
    .join('');
}
