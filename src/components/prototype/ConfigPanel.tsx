'use client';

import React, { useMemo, useState, useRef } from 'react';
import { usePrototypeStore, SourceType, ConnectionStatus } from '@/lib/prototype-store';
import { SourceSelector } from './SourceSelector';
import { EmployeeTable } from './EmployeeTable';
import { RecipientsSection } from './RecipientsSection';
import {
  Settings,
  ChevronDown,
  ChevronRight,
  Info,
} from 'lucide-react';

export function ConfigPanel() {
  const { scenario, renameScenario } = usePrototypeStore();

  return (
    <div className="space-y-4">
      {/* Scenario Name */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <label className="block text-xs font-medium text-gray-500 mb-1.5">Название сценария</label>
        <input
          type="text"
          value={scenario.name}
          onChange={(e) => renameScenario(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
        />
        <p className="text-xs text-gray-400 mt-1.5">
          Рекомендуем изменить название сценария для получения уведомлений на свое, чтобы с ним было
          удобнее работать
        </p>
      </div>

      {/* Source Selector Section */}
      <SourceSelector />

      {/* Recipients Section */}
      <RecipientsSection />
    </div>
  );
}
