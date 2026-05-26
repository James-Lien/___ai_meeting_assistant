import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Copy, Check, Download, Send, CheckCircle, FileText, Share2 } from 'lucide-react';

interface ResultSectionProps {
  resultText: string;
  onOptimize?: (instruction: string) => void;
  isOptimizing?: boolean;
}

export default function ResultSection({ resultText, onOptimize, isOptimizing }: ResultSectionProps) {
  const [copied, setCopied] = useState(false);
  const [customFeedbackPrompt, setCustomFeedbackPrompt] = useState("");

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(resultText);
      } else {
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = resultText;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('複製失敗：', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([resultText], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // 從產出中找出第一行 # 標題當作檔名
    const match = resultText.match(/^#\s+(.+)$/m);
    const fileName = match ? `${match[1].trim()}.md` : `會議總結與翻譯記錄_${new Date().toISOString().split('T')[0]}.md`;
    
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleInlineOptimize = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customFeedbackPrompt.trim() || !onOptimize) return;
    onOptimize(customFeedbackPrompt);
    setCustomFeedbackPrompt("");
  };

  // 定義客製化 Markdown 渲染元件，避免依賴外部 tailwindcss-typography
  const renderers = {
    h1: ({ children }: any) => (
      <h1 className="text-2xl md:text-3xl font-extrabold text-indigo-950 mt-8 mb-4 pb-2 border-b border-indigo-100 flex items-center gap-2">
        {children}
      </h1>
    ),
    h2: ({ children }: any) => (
      <h2 className="text-lg md:text-xl font-bold text-gray-800 mt-6 mb-3 flex items-center gap-1.5">
        {children}
      </h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-base md:text-lg font-semibold text-gray-700 mt-4 mb-2">
        {children}
      </h3>
    ),
    p: ({ children }: any) => (
      <p className="text-sm md:text-base text-gray-600 leading-relaxed mb-4 font-sans">
        {children}
      </p>
    ),
    ul: ({ children }: any) => (
      <ul className="list-disc pl-6 space-y-2 mb-4 text-gray-600">
        {children}
      </ul>
    ),
    ol: ({ children }: any) => (
      <ol className="list-decimal pl-6 space-y-2 mb-4 text-gray-600">
        {children}
      </ol>
    ),
    li: ({ children }: any) => (
      <li className="text-sm md:text-base leading-relaxed">{children}</li>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-indigo-500 bg-indigo-50/50 pl-4 py-2 my-4 text-sm font-medium text-indigo-900 rounded-r-xl italic">
        {children}
      </blockquote>
    ),
    table: ({ children }: any) => (
      <div className="overflow-x-auto my-6 rounded-2xl border border-gray-150 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }: any) => (
      <thead className="bg-indigo-50/40">{children}</thead>
    ),
    tbody: ({ children }: any) => (
      <tbody className="divide-y divide-gray-100 bg-white">{children}</tbody>
    ),
    tr: ({ children }: any) => (
      <tr className="hover:bg-gray-50/50 transition-colors">{children}</tr>
    ),
    th: ({ children }: any) => (
      <th className="px-4 py-3 text-left text-xs font-semibold text-indigo-900 uppercase tracking-wider bg-indigo-50/50 font-sans border border-gray-150">
        {children}
      </th>
    ),
    td: ({ children }: any) => (
      <td className="px-4 py-3 text-sm text-gray-700 font-sans border border-gray-100">
        {children}
      </td>
    ),
    code: ({ node, inline, className, children, ...props }: any) => {
      const match = /language-(\w+)/.exec(className || '');
      return !inline ? (
        <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl overflow-x-auto font-mono text-xs my-4 shadow-inner">
          <code className={className} {...props}>
            {children}
          </code>
        </pre>
      ) : (
        <code className="bg-indigo-50/80 text-indigo-700 px-1.5 py-0.5 rounded-md font-mono text-xs font-semibold" {...props}>
          {children}
        </code>
      );
    },
    hr: () => <hr className="my-6 border-t border-gray-100" />
  };

  return (
    <div className="bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden transition-all duration-300">
      {/* 標頭與操作 */}
      <div className="bg-indigo-50/30 px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse"></div>
          <span className="text-sm font-semibold text-indigo-950 flex items-center gap-1.5">
            <FileText className="w-4 h-4" /> AI 整理翻譯報告 (.md 自訂版)
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-all duration-200 ${
              copied
                ? 'bg-emerald-500 text-white shadow-emerald-100'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" /> 已複製到剪貼簿
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" /> 一鍵複製
              </>
            )}
          </button>
          
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium cursor-pointer transition-all duration-200 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" /> 下載 Markdown
          </button>
        </div>
      </div>

      {/* 報告渲染區 */}
      <div className="p-6 md:p-8 max-h-[600px] overflow-y-auto bg-white markdown-container border-b border-gray-50 scrollbar-thin">
        <div className="prose prose-indigo max-w-none">
          <ReactMarkdown components={renderers}>
            {resultText}
          </ReactMarkdown>
        </div>
      </div>

      {/* AI 再度調優/對話調整 */}
      {onOptimize && (
        <div className="bg-slate-50 p-5 border-t border-gray-100">
          <form onSubmit={handleInlineOptimize} className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5 text-indigo-500" /> 對產生結果不夠滿意嗎？可以貼心要求 AI 微調：
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customFeedbackPrompt}
                onChange={(e) => setCustomFeedbackPrompt(e.target.value)}
                placeholder="例如：『請將下一步負責人改成 Betty 與 Chris 共同負責』或『格式要再更簡潔點』..."
                disabled={isOptimizing}
                className="flex-1 px-4 py-2 text-sm bg-white border border-gray-250 rounded-2xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-sans"
              />
              <button
                type="submit"
                disabled={isOptimizing || !customFeedbackPrompt.trim()}
                className="px-4 py-2 bg-slate-800 text-white rounded-2xl hover:bg-slate-900 font-medium text-xs flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                {isOptimizing ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    微調中...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" /> 發送指令
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              💡 發送指令後，AI 將基於此份記錄與您的要求進行增修、修改指定對象或重塑格式。
            </p>
          </form>
        </div>
      )}
    </div>
  );
}
