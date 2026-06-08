'use client';

import React, { useRef } from 'react';
import { usePrototypeStore } from '@/lib/prototype-store';
import {
  ChevronDown,
  ChevronUp,
  Download,
  ChevronRight,
  MessageSquare,
  X,
} from 'lucide-react';

const EMOTIONS = ['😊', '😐', '😕', '😤', '🤔', '😍', '👎', '👍'];

export function CJTracker() {
  const {
    cjSteps,
    cjExpandedStep,
    cjCollapsed,
    cjHidden,
    toggleStepExpanded,
    toggleCJCollapsed,
    toggleCJHidden,
    setStepEmotion,
    setStepComment,
    exportCJResults,
  } = usePrototypeStore();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const content = exportCJResults();
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const now = new Date();
    const ts = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}-${String(now.getMinutes()).padStart(2,'0')}`;
    a.download = `CJ_${ts}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (cjHidden) return null;

  return (
    <div className="border-b border-gray-200 bg-white">
      {/* Collapsed bar — thin strip */}
      {cjCollapsed && (
        <div
          className="flex items-center justify-between px-4 py-1.5 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={toggleCJCollapsed}
        >
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">CJ</span>
            <div className="flex items-center gap-1">
              {cjSteps.map((step, i) => (
                <React.Fragment key={step.id}>
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium bg-gray-100 text-gray-500">
                    {step.emotion || i + 1}
                  </div>
                  {i < cjSteps.length - 1 && <div className="w-3 h-px bg-gray-200" />}
                </React.Fragment>
              ))}
            </div>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
        </div>
      )}

      {/* Expanded */}
      {!cjCollapsed && (
        <div>
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={toggleCJCollapsed}
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-700">Карта CJ</span>
              <span className="text-[10px] text-gray-400">нажмите на шаг для оценки</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); handleExport(); }}
                className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                title="Скачать результаты"
              >
                <Download className="w-3 h-3" />
                Скачать
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); toggleCJHidden(); }}
                className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors"
                title="Скрыть карту CJ"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
            </div>
          </div>

          {/* Steps */}
          <div className="px-4 pb-3">
            <div className="flex items-start gap-0 overflow-x-auto">
              {cjSteps.map((step, i) => (
                <React.Fragment key={step.id}>
                  <div className="flex-shrink-0 w-[140px]">
                    {/* Step header */}
                    <button
                      onClick={() => toggleStepExpanded(step.id)}
                      className={`w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-left transition-colors ${
                        cjExpandedStep === step.id
                          ? 'bg-amber-50 ring-1 ring-amber-200'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold flex-shrink-0 ${
                        step.emotion
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-gray-200 text-gray-500'
                      }`}>
                        {step.emotion || i + 1}
                      </div>
                      <span className="text-[11px] font-medium text-gray-700 truncate flex-1">
                        {step.label}
                      </span>
                      {step.emotion && <span className="text-xs flex-shrink-0">{step.emotion}</span>}
                    </button>

                    {/* Expanded panel */}
                    {cjExpandedStep === step.id && (
                      <div className="mt-1.5 mx-1 p-2 rounded-lg bg-gray-50 border border-gray-200 space-y-2">
                        {/* Emotions */}
                        <div className="flex flex-wrap gap-1">
                          {EMOTIONS.map((em) => (
                            <button
                              key={em}
                              onClick={() => setStepEmotion(step.id, step.emotion === em ? '' : em)}
                              className={`w-6 h-6 rounded-md flex items-center justify-center text-xs transition-colors ${
                                step.emotion === em
                                  ? 'bg-amber-200 ring-1 ring-amber-400'
                                  : 'hover:bg-gray-200'
                              }`}
                            >
                              {em}
                            </button>
                          ))}
                          {step.emotion && (
                            <button
                              onClick={() => setStepEmotion(step.id, '')}
                              className="w-6 h-6 rounded-md flex items-center justify-center text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors"
                              title="Убрать эмоцию"
                            >
                              ×
                            </button>
                          )}
                        </div>
                        {/* Comment */}
                        <div className="relative">
                          <MessageSquare className="absolute left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                          <input
                            type="text"
                            placeholder="Комментарий..."
                            value={step.comment}
                            onChange={(e) => setStepComment(step.id, e.target.value)}
                            className="w-full pl-6 pr-2 py-1 text-[11px] bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-300 placeholder:text-gray-400"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Connector */}
                  {i < cjSteps.length - 1 && (
                    <div className="flex-shrink-0 flex items-center pt-2">
                      <ChevronRight className="w-3 h-3 text-gray-300" />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
