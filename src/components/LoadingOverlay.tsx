import React, { useState, useEffect } from 'react';
import { Loader2, Sparkles, Brain, Cpu } from 'lucide-react';

const LOADING_STEPS = [
  "🤖 AI 正在讀取並理解您的會議內容...",
  "🔍 正在解析發言人角色與對話脈絡...",
  "🧠 正在提取核心決策、討論要點與下一步行動...",
  "🎯 正在對中英混雜的專用術語進行繁體中文翻譯...",
  "✨ 正在為您排版並生成高可讀性的精美 Markdown 報告...",
  "🚀 即將完成，正在做最後的篇幅修飾..."
];

export default function LoadingOverlay() {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % LOADING_STEPS.length);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-gray-50/50 rounded-3xl border border-gray-100 min-h-[350px] transition-all duration-300">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-indigo-100 rounded-full blur-xl opacity-60 animate-pulse"></div>
        <div className="relative bg-white p-5 rounded-full shadow-md border border-gray-100">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
        </div>
        <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-white p-1.5 rounded-full shadow-sm animate-bounce">
          <Sparkles className="w-4 h-4" />
        </div>
      </div>
      
      <h3 className="text-lg font-bold text-gray-800 tracking-tight leading-relaxed">
        AI 會議小助手正在全力分析中
      </h3>
      
      <div className="max-w-md mx-auto mt-4 min-h-[48px] px-4 py-2 bg-white rounded-2xl shadow-sm border border-indigo-50/50">
        <p className="text-sm font-medium text-indigo-700 animate-fade-in-out">
          {LOADING_STEPS[stepIndex]}
        </p>
      </div>

      <div className="flex items-center justify-center gap-3 mt-8">
        <span className="flex items-center gap-1.5 text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
          <Brain className="w-3.5 h-3.5 text-indigo-400" /> 深度語意分析
        </span>
        <span className="flex items-center gap-1.5 text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
          <Cpu className="w-3.5 h-3.5 text-violet-400" /> 機器翻譯
        </span>
      </div>
    </div>
  );
}
