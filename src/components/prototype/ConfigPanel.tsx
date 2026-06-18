'use client';

import React from 'react';
import { usePrototypeStore } from '@/lib/prototype-store';
import { SourceSelector } from './SourceSelector';
import { RecipientsSection } from './RecipientsSection';

export function ConfigPanel() {
  const { scenario, renameScenario } = usePrototypeStore();

  return (
    <div className="space-y-3">
      {/* Step 1 — Scenario Name */}
      <div className="bg-white rounded-xl border border-gray-200 p-3.5">
        <div className="flex items-start gap-2.5">
          <span className="w-5 h-5 rounded-full bg-amber-400 text-gray-900 text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
          <div className="flex-1 min-w-0">
            <label className="block text-[11px] font-medium text-gray-500 mb-1 uppercase tracking-wider">Название сценария</label>
            <p className="text-[11px] text-gray-400 mb-2">Дайте сценарию понятное название, отражающее его суть</p>
            <input
              type="text"
              value={scenario.name}
              onChange={(e) => renameScenario(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
            />
          </div>
        </div>
      </div>

      {/* Step 2 — Source Selector */}
      <SourceSelector />

      {/* Step 3 — Recipients */}
      <RecipientsSection />
    </div>
  );
}
