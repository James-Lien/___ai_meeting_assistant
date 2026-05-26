import React from 'react';
import { Languages, FileText, Sparkles } from 'lucide-react';

export default function Header() {
  return (
    <header className="border-b border-gray-100 bg-white/70 backdrop-blur-md sticky top-0 z-10 py-4 px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-tr from-indigo-500 to-violet-600 p-2.5 rounded-2xl text-white shadow-sm shadow-indigo-100">
          <Languages className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            AI 會議記錄生成與翻譯工具
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700">
              <Sparkles className="w-3 h-3" />
              Gemini 3.5
            </span>
          </h1>
          <p className="text-xs md:text-sm text-gray-500 mt-0.5">
            將混雜中英文的會議逐字稿即時整理，自動分析、總結，並一鍵翻譯為原生繁體中文
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 text-xs font-mono text-gray-500 bg-gray-50 px-3.5 py-1.5 rounded-xl border border-gray-100">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
        <span className="font-sans font-medium">系統安全連線 (Server Proximity)</span>
      </div>
    </header>
  );
}
