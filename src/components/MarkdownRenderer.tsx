import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Check, Copy, Terminal } from 'lucide-react';
import { highlightCode } from '../utils/highlighter';
import { normalizeLatexDelimiters } from '../utils/mathNormalizer';

interface MarkdownRendererProps {
  content: string;
}

interface CodeBlockProps {
  language?: string;
  codeString: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ language, codeString }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = codeString;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const highlightedHtml = highlightCode(codeString, language);

  return (
    <div className="my-3 rounded-lg overflow-hidden border border-slate-200 dark:border-[#2a3942] bg-[#f8f9fa] dark:bg-[#161f26] shadow-xs group">
      {/* Code Block Header */}
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-100/90 dark:bg-[#1d2830] border-b border-slate-200 dark:border-[#2a3942] text-xs">
        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-mono font-medium">
          <Terminal className="w-3.5 h-3.5 text-emerald-600 dark:text-teal-400" />
          <span>{language || 'code'}</span>
        </div>
        <button
          onClick={handleCopy}
          type="button"
          aria-label={copied ? 'Code copied to clipboard' : 'Copy code to clipboard'}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/80 dark:hover:bg-[#2a3942] transition-colors cursor-pointer"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-teal-400" aria-hidden="true" />
              <span className="text-emerald-600 dark:text-teal-400 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Block Body */}
      <div className="p-3.5 overflow-x-auto text-[13px] leading-relaxed font-mono">
        <pre className="!m-0 !p-0 !bg-transparent">
          <code
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
            className={`language-${language || 'text'} font-mono`}
          />
        </pre>
      </div>
    </div>
  );
};

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const normalizedContent = React.useMemo(() => normalizeLatexDelimiters(content), [content]);

  return (
    <div className="prose prose-slate dark:prose-invert max-w-none text-[14.5px] leading-relaxed break-words">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match && !String(children).includes('\n');
            const codeString = String(children).replace(/\n$/, '');

            if (isInline) {
              return (
                <code
                  className="px-1.5 py-0.5 mx-0.5 rounded text-[13px] font-mono bg-slate-100 dark:bg-[#1a242c] text-teal-700 dark:text-teal-300 border border-slate-200/80 dark:border-[#2c3c46]"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            return <CodeBlock language={match ? match[1] : undefined} codeString={codeString} />;
          },
          table({ children }) {
            return (
              <div className="my-3 overflow-x-auto rounded-lg border border-slate-200 dark:border-[#2a3942] shadow-xs">
                <table className="w-full text-left border-collapse text-xs md:text-sm">
                  {children}
                </table>
              </div>
            );
          },
          thead({ children }) {
            return (
              <thead className="bg-slate-100/90 dark:bg-[#1d2830] border-b border-slate-200 dark:border-[#2a3942] text-slate-800 dark:text-slate-200 font-semibold">
                {children}
              </thead>
            );
          },
          tbody({ children }) {
            return <tbody className="divide-y divide-slate-100 dark:divide-[#243038]">{children}</tbody>;
          },
          tr({ children }) {
            return (
              <tr className="hover:bg-slate-50/70 dark:hover:bg-[#19242c]/50 transition-colors">
                {children}
              </tr>
            );
          },
          th({ children }) {
            return <th className="px-3.5 py-2.5 font-semibold text-slate-800 dark:text-slate-200">{children}</th>;
          },
          td({ children }) {
            return <td className="px-3.5 py-2 text-slate-700 dark:text-slate-300 align-top">{children}</td>;
          },
          blockquote({ children }) {
            return (
              <blockquote className="my-3 pl-3.5 pr-2 py-1.5 border-l-3 border-[#00A884] dark:border-teal-400 bg-slate-50/80 dark:bg-[#18232a] rounded-r text-slate-700 dark:text-slate-300 italic">
                {children}
              </blockquote>
            );
          },
          h1({ children }) {
            return <h1 className="text-xl md:text-2xl font-bold mt-4 mb-2 text-slate-900 dark:text-slate-100 tracking-tight">{children}</h1>;
          },
          h2({ children }) {
            return <h2 className="text-lg md:text-xl font-bold mt-3.5 mb-1.5 text-slate-900 dark:text-slate-100 tracking-tight">{children}</h2>;
          },
          h3({ children }) {
            return <h3 className="text-base md:text-lg font-semibold mt-3 mb-1 text-slate-900 dark:text-slate-100">{children}</h3>;
          },
          h4({ children }) {
            return <h4 className="text-sm md:text-base font-semibold mt-2.5 mb-1 text-slate-900 dark:text-slate-100">{children}</h4>;
          },
          ul({ children }) {
            return <ul className="my-2 pl-5 list-disc space-y-1 text-slate-700 dark:text-slate-300">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="my-2 pl-5 list-decimal space-y-1 text-slate-700 dark:text-slate-300">{children}</ol>;
          },
          li({ children }) {
            return <li className="pl-1 leading-relaxed">{children}</li>;
          },
          p({ children }) {
            return <p className="my-2 leading-relaxed text-slate-800 dark:text-slate-200">{children}</p>;
          },
          hr() {
            return <hr className="my-4 border-slate-200 dark:border-[#2a3942]" />;
          },
          a({ href, children }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-600 dark:text-teal-400 underline underline-offset-2 hover:text-teal-700 dark:hover:text-teal-300 transition-colors"
              >
                {children}
              </a>
            );
          },
          img({ src, alt }) {
            return (
              <img
                src={src}
                alt={alt || 'Illustration or figure in output'}
                loading="lazy"
                className="max-w-full h-auto rounded-lg my-3 border border-slate-200 dark:border-[#2a3942]"
              />
            );
          },
        }}
      >
        {normalizedContent}
      </ReactMarkdown>
    </div>
  );
};
