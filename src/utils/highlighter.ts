import Prism from 'prismjs';

// Load common language grammars for AI code outputs
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-css';

export function highlightCode(code: string, language?: string): string {
  if (!language) {
    return escapeHtml(code);
  }

  const lang = language.toLowerCase().trim();
  const grammarMap: Record<string, string> = {
    js: 'javascript',
    ts: 'typescript',
    tsx: 'tsx',
    jsx: 'jsx',
    py: 'python',
    sh: 'bash',
    shell: 'bash',
    zsh: 'bash',
    yml: 'yaml',
    md: 'markdown',
  };

  const targetGrammar = grammarMap[lang] || lang;

  if (Prism.languages[targetGrammar]) {
    try {
      return Prism.highlight(code, Prism.languages[targetGrammar], targetGrammar);
    } catch {
      return escapeHtml(code);
    }
  }

  return escapeHtml(code);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
