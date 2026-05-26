import { SystemInstructionTemplate, PresetMeetingTranscript } from "./types";

// 繁體中文預設 System Instructions
export const DEFAULT_SYSTEM_INSTRUCTION = `你是一位專業的會議記錄助理。請根據使用者提供的會議逐字稿，整理出結構化的會議紀錄。
請務必遵守以下輸出格式要求：

1. **會議主題與時間**：擷取會議的主題與時間。
2. **與會者**：列出參與會議的人員。
3. **會議重點總結**：用 3 到 5 個重點總結會議內容。
4. **Action Items (待辦事項)**：明確列出接下來的待辦事項與負責人。
5. **英文翻譯版**：將上述 1~4 點的內容完整翻譯成專業的英文。

請以 Markdown 格式輸出，所有繁體中文部分必須使用**繁體中文**回覆，不要包含任何額外的問候語或結語。`;

export const INSTRUCTION_TEMPLATES: SystemInstructionTemplate[] = [
  {
    id: "standard",
    name: "標準會議總結與翻譯 (推薦)",
    description: "適合絕大多數商務或研發會議，產出最全面的結構化 Markdown 報告與下一步追蹤表格。",
    instruction: DEFAULT_SYSTEM_INSTRUCTION
  },
  {
    id: "executive-summary",
    name: "高階決策簡報格式",
    description: "極簡風格，專門提供給主管或高階層，略過瑣碎細節，直擊核心痛點、決策事項與時程表。",
    instruction: `你是一個商務執行長特助。請將以下會議內容提煉成極具精準度、超高資訊密度的「高階經理人會議總結」。
請翻譯為高雅、成熟的台灣繁體中文。

結構如下：
# 🚀 執行高階摘要 (Executive Summary)

- **會議大綱與戰略目的**：[精煉 30 字]
- **三大核心決策**：
  1. [決策一]
  2. [決策二]
  3. [決策三]

# 🎯 行動指南 (Immediate Next Steps)
- [ ] **任務 A**（負責人：XX ｜ 期限：XX）- 簡述戰略意義
- [ ] **任務 B**（負責人：XX ｜ 期限：XX）

# ⚠️ 關鍵風險與對策
- **風險點**：... | **應對方案**：...`
  },
  {
    id: "scrum-daily",
    name: "敏捷開發與 Tech 週會整理",
    description: "側重在軟體開發、Bug 追蹤、Sprint 進度與阻礙排除 (Blockers) 的工程導向紀錄。",
    instruction: `你是一個資深的敏捷教練（Scrum Master）與軟體技術總監。
請針對以下開發會議逐字稿，提取「昨日進度」、「今日計畫」、「系統卡點(Blockers)」與「技術決策」。
英文術語如 Deployment, Pipeline, PR, Branch, Cache 等可酌情保留（或加上括號中文說明），但語意主體必須為流利的繁體中文。

結構應包含：
# 💻 敏捷開發 Sprint 週報

- **🚨 當前 Blockers / 急需排除阻礙**：[如果沒有，請寫：無卡點]
- **🛠️ 技術決策與架構變動**：...
- **📅 各模組進度追蹤 (Updates)**：
  - **前端 (Frontend)**：...
  - **後端與 API (Backend)**：...
  - **測試與維運 (QA/DevOps)**：...
- **📌 新增 Ticket / 排入 Next Sprint**：...`
  }
];

export const PRESET_TRANSCRIPTS: PresetMeetingTranscript[] = [
  {
    id: "preset-1",
    title: "AI 旅遊規畫 App - 專案啟動會議 1",
    description: "包括產品定位、API 成本考量、預算、時程與負責人，中英文夾雜，適合測試翻譯與摘要功能。",
    content: `Alan: Hello everyone, 感謝大家今天來參加 AI App 開啟會議。我們今天要討論的是 AI Traveling Planner App, 這個 project 的 kick-off。
Betty: Hi, Alan. 我已經先評估過 API 串接。如果要同時支援 Google Maps 和 OpenAI/Gemini API，可能會有蠻可觀的 token 費用。
Alan: Right, 這是好問題。我們首期應該先把 MVP 做出來。我們的 target audience 是喜愛自由行的旅客。
Chris: 我想問一下 Marketing 這邊的 timeline。我們的 launch date 預計是什麼時候？
Alan: 我跟 Boss 討論過，希望能在 Q3 end, 大約 9 月中旬上架 iOS 和 Android 商店。所以我們只有 3 個月時間開發。
Chris: OK, 那 3 個月蠻趕的。Betty, Front-end 和 Back-end 的 specs 什麼時候能定好？
Betty: Front-end 用 React Native 開發，Back-end 搭配 Node.js。預計兩週內 (也就是 6 月 10 號前) 會把 API flow 還有 schema 開出來給 Chris。
Chris: 了解。那我就開始準備 marketing campaign。我會先在社交平台建立 teaser 網頁收 user email。
Alan: Great. 我們的 budget 方面，目前第一期 API budget 設定在每月 500 美元上限，請 Betty 這邊做一下 rate limit, 防止被惡意刷流量造成帳單爆掉。
Betty: No problem, 我會設定 Redis token bucket 來 limit requests。
Alan: 好，那我們 summary 一下今天的 Action items：
1. Betty 負責在 6/10 前交付 API schema。
2. Chris 負責下週五前交一份行銷推廣草案，並在 6/20 前上線預註冊頁面。
3. 我會去跟 Design team confirm UI mockups, 預計下週一提供給 Betty。
感謝大家，今天 meeting 就到這邊！`
  },
  {
    id: "preset-2",
    title: "電商網站 Q2 營運回顧與促銷討論 2",
    description: "包含了營收數據、客戶退貨率痛點分析、雙 11 提前布局，有許多對話雜音，適合考驗 AI 的整理能力。",
    content: `主持-凱文: 好的各位，我們今早開會檢討一下 Q2 營運表現。整體營收 target 雖然達成了 92%，但退貨率在女裝這塊偏高，達到了 15%。
營運-雅婷: 隊啊，關於退貨，我們看見 customer feedback，主要原因是「實物與照片色差嚴重」，還有「版型偏大偏小」。
凱文: 色差這個是視覺團隊的問題。視覺組的志豪不在，雅婷妳幫我轉告他，之後所有 product photo 必須在標準光源拉色差值，不能調色調得太誇張。
雅婷: 好，我會傳達給志豪，讓他這週五前交個改進流程。
行銷-俊宏: 另外就是 Q3 規劃了。我們下半年重頭戲是「雙11大促」，雖然還有點時間，但現在不規劃，供應鏈備貨會來不及。
雅婷: 對，去年的時候就是十月中才提貨，差點開天窗。今年我們是不是提早到 8 月底前把 Q3/Q4 熱銷品的備貨預估算出來？
凱文: 同意。雅婷，八月底前，妳協同採購組產出「雙11備貨首波預估表」。
俊宏: 行銷這方面，我們打算在九月先跑一個「夏末清倉（Summer Clearance）」活動，把一些囤積的外套、夏季服飾清掉。
凱文: 這是好點子，能釋放倉儲空間。清倉活動的主題和折扣，俊宏你下週一下午前交案。
俊宏: 沒問題，我會規劃折扣落在 5 到 7 折之間。
凱文: 好，我簡單整理：
1. 志豪（雅婷轉達）：這週五前撰寫「色差降低與修圖光源標準指引」。
2. 雅婷：8/31 前，與採購產出「雙11大促第一期貨量預估」。
3. 俊宏：下週一前交「夏末清倉特賣方案（Q3 Clearance）」。
散會，謝謝大家！`
  }
];
