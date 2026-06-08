'use client';

import React from 'react';
import { usePrototypeStore, ConnectionStatus } from '@/lib/prototype-store';
import {
  Plus,
  Pencil,
  Trash2,
  Phone,
  Users,
  ChevronDown,
  ChevronRight,
  UserCheck,
} from 'lucide-react';

export function ScenarioSidebar() {
  const {
    scenarios,
    activeScenarioId,
    selectScenario,
    addScenario,
    renameScenario,
    deleteScenario,
    scenario,
  } = usePrototypeStore();

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <h3 className="text-sm font-medium text-gray-500 mb-3">Мои сценарии</h3>

      {/* Add Scenario Button */}
      <button
        onClick={addScenario}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors mb-3"
      >
        <Plus className="w-4 h-4" />
        Добавить сценарий
      </button>

      {/* Scenario List */}
      <div className="space-y-1">
        {scenarios.map((sc) => (
          <div
            key={sc.id}
            onClick={() => selectScenario(sc.id)}
            className={`p-3 rounded-lg cursor-pointer transition-all ${
              sc.id === activeScenarioId
                ? 'bg-blue-50 border border-blue-200'
                : 'hover:bg-gray-50 border border-transparent'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900 truncate">{sc.name}</span>
              <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // For prototype: toggle edit mode or just allow inline editing
                    renameScenario(sc.name + ' (ред.)');
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteScenario(sc.id);
                  }}
                  className="p-1 text-gray-400 hover:text-red-500 rounded"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-1.5">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Phone className="w-3 h-3" />
                <span>для {sc.selectedEmployeeCount} номеров сотрудников</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Users className="w-3 h-3" />
                <span>получателей: {sc.recipientCount}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
