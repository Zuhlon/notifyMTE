'use client';

import React from 'react';
import { usePrototypeStore } from '@/lib/prototype-store';
import { SourceSelector } from './SourceSelector';
import { RecipientsSection } from './RecipientsSection';

export function ConfigPanel() {
  const { scenario, renameScenario } = usePrototypeStore();

  return (
    <div className="space-y-3">
      {/* Scenario Name - compact */}
      <div className="bg-white rounded-xl border border-gray-200 p-3.5">
        <label className="block text-[11px] font-medium text-gray-500 mb-1 uppercase tracking-wider">Название сценария</label>
        <input
          type="text"
          value={scenario.name}
          onChange={(e) => renameScenario(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
        />
      </div>

      {/* Source Selector Section */}
      <SourceSelector />

      {/* Recipients Section - always visible */}
      <RecipientsSection />
    </div>
  );
}
