import React from 'react';
import { PresetMeetingTranscript } from '../types';
import { FileText, ChevronRight, Zap } from 'lucide-react';

interface TemplateCardProps {
  transcript: PresetMeetingTranscript;
  onSelect: (content: string) => void;
  isActive: boolean;
}

export default function TemplateCard({ transcript, onSelect, isActive }: TemplateCardProps) {
  return (
    <div
      onClick={() => onSelect(transcript.content)}
      className={`group relative p-4 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between ${
        isActive
          ? 'bg-indigo-50/70 border-indigo-200 shadow-sm shadow-indigo-100/50'
          : 'bg-white border-gray-150 hover:border-gray-300 hover:shadow-md'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-xl border transition-colors ${
          isActive 
            ? 'bg-indigo-600 text-white border-indigo-300' 
            : 'bg-gray-50 text-gray-500 border-gray-100 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100'
        }`}>
          <FileText className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-800 group-hover:text-indigo-950 truncate flex items-center gap-1.5">
            {transcript.title}
          </h4>
          <p className="text-xs text-gray-500 line-clamp-2 mt-1 leading-relaxed">
            {transcript.description}
          </p>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100/60 flex items-center justify-between text-[11px] font-medium text-indigo-600">
        <span className="flex items-center gap-1 text-gray-400 group-hover:text-indigo-500 transition-colors">
          <Zap className="w-3 h-3 text-amber-500" /> 一鍵帶入逐字稿內容
        </span>
        <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
      </div>

      {isActive && (
        <span className="absolute top-2 right-2 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
        </span>
      )}
    </div>
  );
}
