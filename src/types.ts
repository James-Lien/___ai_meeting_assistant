export interface SystemInstructionTemplate {
  id: string;
  name: string;
  description: string;
  instruction: string;
}

export interface GenerationHistoryItem {
  id: string;
  timestamp: string;
  rawInput: string;
  systemInstructionUsed: string;
  result: string;
  title: string;
}

export interface PresetMeetingTranscript {
  id: string;
  title: string;
  description: string;
  content: string;
}
