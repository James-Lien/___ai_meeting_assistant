import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Sparkles, 
  Trash2, 
  History, 
  Settings2, 
  AlertCircle, 
  HelpCircle, 
  Clock, 
  CheckCircle, 
  Plus, 
  BookOpen, 
  Activity,
  ArrowRight
} from 'lucide-react';
import Header from './components/Header';
import LoadingOverlay from './components/LoadingOverlay';
import ResultSection from './components/ResultSection';
import TemplateCard from './components/TemplateCard';
import { INSTRUCTION_TEMPLATES, PRESET_TRANSCRIPTS, DEFAULT_SYSTEM_INSTRUCTION } from './constants';
import { GenerationHistoryItem, SystemInstructionTemplate } from './types';

export default function App() {
  // Input states
  const [transcriptInput, setTranscriptInput] = useState("");
  const [selectedInstructionId, setSelectedInstructionId] = useState("standard");
  const [customInstruction, setCustomInstruction] = useState(DEFAULT_SYSTEM_INSTRUCTION);
  const [showAdvanceSettings, setShowAdvanceSettings] = useState(false);

  // Output/UI states
  const [isLoading, setIsLoading] = useState(false);
  const [resultMd, setResultMd] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [historyList, setHistoryList] = useState<GenerationHistoryItem[]>([]);
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);
  
  // Custom feedback / inline optimize state
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Load history from localStorage on startup
  useEffect(() => {
    try {
      const stored = localStorage.getItem('meeting_ai_history_v1');
      if (stored) {
        const parsed = JSON.parse(stored) as GenerationHistoryItem[];
        setHistoryList(parsed);
      }
    } catch (e) {
      console.error('無法自 localStorage 讀取歷史資料：', e);
    }
  }, []);

  // Sync custom instruction when template selection changes
  const handleInstructionTemplateChange = (id: string) => {
    setSelectedInstructionId(id);
    const template = INSTRUCTION_TEMPLATES.find(t => t.id === id);
    if (template) {
      setCustomInstruction(template.instruction);
    }
  };

  // Helper to save to history
  const handleSaveToHistory = (raw: string, instruction: string, result: string, specifiedTitle?: string) => {
    try {
      // Create a nice title from first 18 characters of raw or simple theme
      const timeStr = new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });
      const dateStr = new Date().toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit' });
      
      const lineMatch = result.match(/^#\s+(.+)$/m);
      const generatedTitle = lineMatch ? lineMatch[1].trim() : "會議記要總結";
      const displayTitle = specifiedTitle || `${generatedTitle} [${dateStr} ${timeStr}]`;

      const newItem: GenerationHistoryItem = {
        id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2, 9),
        timestamp: new Date().toLocaleString('zh-TW'),
        rawInput: raw,
        systemInstructionUsed: instruction,
        result: result,
        title: displayTitle
      };

      const updated = [newItem, ...historyList].slice(0, 30); // limit 30 items
      setHistoryList(updated);
      localStorage.setItem('meeting_ai_history_v1', JSON.stringify(updated));
      setActiveHistoryId(newItem.id);
    } catch (e) {
      console.error('儲存歷史資料失敗：', e);
    }
  };

  // Triggers main summary generation
  const handleGenerate = async () => {
    if (!transcriptInput.trim()) {
      setErrorMsg("請先輸入或是貼上「會議逐字稿」內容哦！");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");
    setResultMd("");
    setActiveHistoryId(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: transcriptInput,
          systemInstruction: customInstruction
        })
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `伺服器回應代碼 ${response.status}`);
      }

      const data = await response.json();
      if (!data.text) {
        throw new Error("AI 回應中未包含文字內容。");
      }

      setResultMd(data.text);
      handleSaveToHistory(transcriptInput, customInstruction, data.text);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "連線至後端 AI 服務器時發生異常。");
    } finally {
      setIsLoading(false);
    }
  };

  // Quick preset loading
  const handleLoadPreset = (content: string) => {
    setTranscriptInput(content);
    setErrorMsg("");
  };

  // Clear input
  const handleClear = () => {
    if (confirm("確定要清除目前的逐字稿輸入內容嗎？")) {
      setTranscriptInput("");
      setErrorMsg("");
    }
  };

  // Select a historical item to view
  const handleSelectHistory = (item: GenerationHistoryItem) => {
    setTranscriptInput(item.rawInput);
    setCustomInstruction(item.systemInstructionUsed);
    setResultMd(item.result);
    setActiveHistoryId(item.id);
    setErrorMsg("");
  };

  // Delete a historical item
  const handleDeleteHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("要刪除這筆歷史會議記錄嗎？")) {
      const updated = historyList.filter(item => item.id !== id);
      setHistoryList(updated);
      localStorage.setItem('meeting_ai_history_v1', JSON.stringify(updated));
      if (activeHistoryId === id) {
        setResultMd("");
        setActiveHistoryId(null);
      }
    }
  };

  // Optional: Clean all histories
  const handleClearAllHistory = () => {
    if (confirm("確定要清空所有 localStorage 中的歷史紀錄嗎？動作無法還原。")) {
      setHistoryList([]);
      localStorage.removeItem('meeting_ai_history_v1');
      setResultMd("");
      setActiveHistoryId(null);
    }
  };

  // AI Refine/Optimize prompt (Multi-turn feedback tool)
  const handleOptimizeResult = async (feedback: string) => {
    if (!resultMd) return;
    setIsOptimizing(true);
    setErrorMsg("");

    try {
      // 構建二次提煉的 Prompt: 基於原逐字稿 + 原產生報告 + 用戶修訂與調優需求
      const optimizationPrompt = `**[會議逐字稿/重點筆記原檔]**
${transcriptInput}

---
**[先前產生的會議總結報告]**
${resultMd}

---
**[使用者提出的增補與修正要求]**
請對上方的「先前產生的會議總結報告」進行以下優化與修改：
「${feedback}」

並且請保持先前的繁體中文文筆和 Markdown 結構，直接輸出最新最完美的優化後報告。`;

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: optimizationPrompt,
          systemInstruction: "你是一個專業的會議助理。請精準閱讀並落實使用者的增補修正指引，修改先前的會議總結，不論新增或移除對象、改進措辭、簡化長度皆能完美落實。請只輸出更新後的 Markdown 報告。"
        })
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `伺服器回應代碼 ${response.status}`);
      }

      const data = await response.json();
      if (!data.text) {
        throw new Error("AI 優化回應中未包含文字內容。");
      }

      const updatedResult = data.text;
      setResultMd(updatedResult);

      // 保存修正後的版本到歷史，並特別註記
      const match = updatedResult.match(/^#\s+(.+)$/m);
      const baseTitle = match ? match[1].trim() : "會議記要總結";
      handleSaveToHistory(transcriptInput, customInstruction, updatedResult, `${baseTitle} (AI修訂版)`);
      
    } catch (err: any) {
      console.error(err);
      setErrorMsg(`AI 微調過程中出現錯誤: ${err.message || err}`);
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-gray-800 font-sans flex flex-col selection:bg-indigo-100 selection:text-indigo-900">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* 左側或頂部快捷與歷史區 (佔 4/12 寬) */}
        <section className="lg:col-span-4 flex flex-col gap-6" id="left-column">
          
          {/* 會議逐字稿範本 */}
          <div className="bg-white rounded-3xl p-6 border border-gray-150 shadow-xs flex flex-col gap-4">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-500" />
              1. 選擇會議逐字稿範例 (免輸入)
            </h3>
            <p className="text-xs text-gray-500 -mt-2">
              系統內建了 2 套具有真實中英口語夾雜、帶有多人討論細節的會議文字範例，點擊即可一鍵帶入！
            </p>
            <div className="flex flex-col gap-3">
              {PRESET_TRANSCRIPTS.map((t) => (
                <TemplateCard
                  key={t.id}
                  transcript={t}
                  onSelect={handleLoadPreset}
                  isActive={transcriptInput === t.content}
                />
              ))}
            </div>
          </div>

          {/* 歷史總結紀錄 (Pragmatic Local Data) */}
          <div className="bg-white rounded-3xl p-6 border border-gray-150 shadow-xs flex-1 flex flex-col gap-4 min-h-[300px]">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-500" />
                歷史會議紀錄庫 ({historyList.length})
              </h3>
              {historyList.length > 0 && (
                <button
                  onClick={handleClearAllHistory}
                  className="text-[11px] font-semibold text-red-500 hover:text-red-700 cursor-pointer"
                >
                  清空歷史
                </button>
              )}
            </div>
            
            <p className="text-xs text-gray-500 -mt-2">
              本地儲存，保障資料隱私。點擊任何一項可快速切換回看、重新優化或複製。
            </p>

            {historyList.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-2xl p-6 text-center text-gray-400">
                <Clock className="w-8 h-8 text-gray-300 mb-2 stroke-[1.5]" />
                <p className="text-xs font-medium">尚未有任何產出紀錄</p>
                <p className="text-[10px] text-gray-400 mt-1">
                  貼上逐字稿並點擊生成，完成後將自動在此留存紀錄檔案
                </p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto max-h-[380px] space-y-2.5 pr-1 scrollbar-thin">
                {historyList.map((item) => {
                  const isActive = activeHistoryId === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectHistory(item)}
                      className={`group p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer flex items-start gap-2 justify-between ${
                        isActive
                          ? 'bg-slate-100 border-indigo-400 shadow-xs'
                          : 'bg-white border-gray-100 hover:bg-slate-50'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <h4 className={`text-xs font-bold truncate ${isActive ? 'text-indigo-900' : 'text-gray-700'}`}>
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1.5 text-[10px] text-gray-400 font-mono">
                          <span>{item.timestamp}</span>
                          <span>•</span>
                          <span>{item.rawInput.length} 字</span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleDeleteHistory(item.id, e)}
                        className="text-gray-300 hover:text-red-600 p-1 rounded-md hover:bg-white border border-transparent hover:border-gray-100 opacity-20 group-hover:opacity-100 transition-all cursor-pointer"
                        title="刪除"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* 右側核心操作與結果顯示 (佔 8/12 寬) */}
        <section className="lg:col-span-8 flex flex-col gap-6" id="right-column">
          
          {/* 輸入面板 */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-150 shadow-xs flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-indigo-50 p-1.5 rounded-lg text-indigo-600">
                  <FileText className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-800">2. 輸入會議文字或貼上逐字稿</h2>
                  <p className="text-xs text-gray-500">支援繁、簡、英等各種混雜、粗糙、斷斷續續的語音轉換結果</p>
                </div>
              </div>
              
              {transcriptInput && (
                <button
                  onClick={handleClear}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 px-2.5 py-1.5 rounded-xl border border-gray-100 transition-colors cursor-pointer font-medium"
                >
                  <Trash2 className="w-3.5 h-3.5" /> 清空輸入
                </button>
              )}
            </div>

            <div className="relative">
              <textarea
                value={transcriptInput}
                onChange={(e) => {
                  setTranscriptInput(e.target.value);
                  setErrorMsg("");
                }}
                rows={10}
                placeholder="請把會議逐字稿內容貼在此處...
例如在 kick-off 會議上，主管們討論了 Q3 行銷 timeline、API 預算限制 (Redis rate-limiting 500美元上限) 還有 Betty 在 6/10 前交 API specs 等細節。
即使口語斷斷續續、不流暢，AI 依然能智慧識別並提煉整理！"
                className="w-full p-4 text-sm bg-slate-50/70 focus:bg-white text-gray-700 border border-gray-200 focus:border-indigo-500 rounded-2xl focus:outline-hidden focus:ring-4 focus:ring-indigo-505/10 transition-all duration-300 font-sans leading-relaxed resize-y scrollbar-thin min-h-[220px]"
              />
              <span className="absolute bottom-3 right-3 text-[10px] font-mono font-medium text-gray-400 bg-white shadow-xs border border-gray-100 px-2 py-1 rounded-md">
                字符數: {transcriptInput.length}
              </span>
            </div>

            {/* 高級 System Instruction 設定 */}
            <div className="border border-gray-100 rounded-2xl overflow-hidden bg-slate-50/40">
              <button
                type="button"
                onClick={() => setShowAdvanceSettings(!showAdvanceSettings)}
                className="w-full px-4 py-3 text-left hover:bg-slate-100/60 transition-colors flex items-center justify-between text-xs font-semibold text-gray-700 cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-gray-500" />
                  進階 AI 翻譯模組與 System Instructions 指令設定
                  <span className="text-[10px] font-normal text-slate-400 bg-white border border-slate-100 px-1.5 py-0.5 rounded-md">
                    自訂 AI 格式語調
                  </span>
                </span>
                <span className="text-gray-400">
                  {showAdvanceSettings ? "收合 ─" : "展開 ┼"}
                </span>
              </button>

              {showAdvanceSettings && (
                <div className="p-4 border-t border-gray-100 flex flex-col gap-4 bg-white">
                  
                  {/* 快選模版按鈕 */}
                  <div>
                    <span className="block text-xs font-semibold text-gray-600 mb-2.5">
                      💡 快速切換報告排版格式 (預設 System Instruction)：
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {INSTRUCTION_TEMPLATES.map((tpl) => (
                        <button
                          key={tpl.id}
                          type="button"
                          onClick={() => handleInstructionTemplateChange(tpl.id)}
                          className={`p-3 rounded-xl text-left border text-xs leading-normal transition-all duration-200 cursor-pointer ${
                            selectedInstructionId === tpl.id
                              ? 'bg-indigo-50 border-indigo-300 text-indigo-950 font-bold'
                              : 'bg-white hover:bg-gray-50 border-gray-150 text-gray-600'
                          }`}
                        >
                          <div className="font-semibold mb-1 flex items-center gap-1">
                            {tpl.name}
                          </div>
                          <div className="text-[10px] opacity-80 font-normal">
                            {tpl.description}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 文字 Instructions */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-700 flex items-center gap-1">
                      完全自訂 AI 行為與格式輸出 (即繁體中文指令)：
                    </label>
                    <textarea
                      value={customInstruction}
                      onChange={(e) => {
                        setCustomInstruction(e.target.value);
                        setSelectedInstructionId("custom");
                      }}
                      rows={8}
                      className="w-full p-3 font-mono text-xs text-gray-600 bg-slate-50 border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-hidden leading-relaxed"
                      placeholder="設定 AI 的角色設定。例如：你必須整理成簡報投影片大綱..."
                    />
                    <p className="text-[10px] text-gray-400 mt-1">
                      ⚠️ 提示：您可以增加額外規定，例如「請將 final deadline 加上顏色強調」或「對敏感資訊進行匿名去標識處理」。
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* 錯誤資訊 */}
            {errorMsg && (
              <div className="p-4 bg-red-50 text-red-800 rounded-2xl text-xs flex items-start gap-2.5 border border-red-100 animate-shake">
                <AlertCircle className="w-4.5 h-4.5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold">分析生成失敗：</h4>
                  <p className="mt-0.5 leading-relaxed font-sans">{errorMsg}</p>
                </div>
              </div>
            )}

            {/* 大動作按鈕 */}
            <div className="pt-2">
              <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-indigo-200 text-sm md:text-base flex items-center justify-center gap-2.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    AI 會議助理正在理解並總結您的會議紀錄...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 fill-white/10" />
                    開始生成總結與翻譯 (繁體中文報告)
                    <ArrowRight className="w-4.5 h-4.5" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 結果面板 */}
          {isLoading ? (
            <LoadingOverlay />
          ) : resultMd ? (
            <div className="animate-fade-in">
              <ResultSection 
                resultText={resultMd} 
                onOptimize={handleOptimizeResult}
                isOptimizing={isOptimizing}
              />
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-200 rounded-3xl p-12 text-center bg-white">
              <div className="bg-indigo-50 p-4 rounded-full w-14 h-14 mx-auto mb-4 flex items-center justify-center text-indigo-500">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-gray-700 mb-1.5">尚未生成報告</h3>
              <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
                在上方文字框中貼入會議逐字稿（或直接在左側點擊預設測試範本），然後按「開始生成總結與翻譯」按鈕，由 Gemini 3.5 AI 模組即刻為您服務。
              </p>
            </div>
          )}
        </section>

      </main>

      {/* 頁尾 */}
      <footer className="bg-white border-t border-gray-100 py-6 mt-16 text-center text-xs text-gray-400 px-6 font-sans">
        <p>© 2026 AI 會議記錄生成與翻譯工具. 利用 Google Gemini 3.5-Flash 端對端代理架構設計.</p>
        <p className="mt-1">專門針對中英混雜時程紀錄、工程決策與商業會議的最佳化本地小秘書.</p>
      </footer>
    </div>
  );
}
