'use client';

import React from 'react';
import { usePrototypeStore, SOURCE_TYPE_LABELS } from '@/lib/prototype-store';
import {
  Plus,
  Pencil,
  Trash2,
  Phone,
  Users,
  AlertCircle,
} from 'lucide-react';

export function ScenarioSidebar() {
  const {
    scenarios,
    activeScenarioId,
    selectScenario,
    addScenario,
    deleteScenario,
  } = usePrototypeStore();

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <h3 className="text-sm font-medium text-gray-500 mb-3">Мои сценарии</h3>

      {/* Add Scenario Button */}
      <button
        onClick={addScenario}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-gray-300 text-sm text-gray-500 hover:bg-gray-50 hover:border-gray-400 hover:text-gray-700 transition-colors mb-3"
      >
        <Plus className="w-4 h-4" />
        Добавить сценарий
      </button>

      {/* Scenario List */}
      <div className="space-y-1 max-h-[calc(100vh-260px)] overflow-y-auto pr-1">
        {scenarios.map((sc) => (
          <div
            key={sc.id}
            onClick={() => selectScenario(sc.id)}
            className={`p-3 rounded-lg cursor-pointer transition-all group ${
              sc.id === activeScenarioId
                ? 'bg-blue-50 border border-blue-200 shadow-sm'
                : 'hover:bg-gray-50 border border-transparent'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900 truncate pr-1">{sc.name}</span>
              <div className="flex items-center gap-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
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
                <span>
                  {sc.selectedCount > 0
                    ? `для ${sc.selectedCount} ${SOURCE_TYPE_LABELS[sc.sourceType]}`
                    : `не настроено`
                  }
                </span>
              </div>
              {sc.recipientCount > 0 && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Users className="w-3 h-3" />
                  <span>{sc.recipientCount} получ.</span>
                </div>
              )}
            </div>
            {/* Status indicator */}
            {sc.recipientCount > 0 && sc.id === activeScenarioId && (
              <div className="mt-1.5">
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  Активен
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
