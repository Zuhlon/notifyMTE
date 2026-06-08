'use client';

import React from 'react';
import { usePrototypeStore, SourceType } from '@/lib/prototype-store';
import { EmployeeTable } from './EmployeeTable';
import {
  Users,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Radio,
} from 'lucide-react';

const SOURCE_OPTIONS: { value: SourceType; label: string }[] = [
  { value: 'employee_numbers', label: 'Номера сотрудников' },
  { value: 'multi_channel', label: 'Многоканальные номера' },
  { value: 'departments', label: 'Отделы' },
  { value: 'call_centers', label: 'Колл-центры' },
];

export function SourceSelector() {
  const {
    scenario,
    setSourceType,
    toggleSourceCollapsed,
    saveSelectedNumbers,
  } = usePrototypeStore();

  const selectedCount = scenario.employees.filter((e) => e.selected).length;
  const totalCount = scenario.employees.length;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Section Header */}
      <button
        onClick={toggleSourceCollapsed}
        className="w-full flex items-center gap-3 px-4 py-4 hover:bg-gray-50 transition-colors"
      >
        {scenario.isSourceCollapsed ? (
          <ChevronRight className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-medium text-gray-900">Выберите источник пропущенных</h3>
            {scenario.isSourceCollapsed && scenario.isNumbersSaved && (
              <p className="text-xs text-gray-500">
                Номера сотрудников — выбрано {selectedCount}
              </p>
            )}
          </div>
        </div>
      </button>

      {/* Collapsed Content */}
      {!scenario.isSourceCollapsed && (
        <div className="border-t border-gray-100">
          {/* Description */}
          <div className="px-4 pt-3 pb-2">
            <p className="text-xs text-gray-500">
              Выберите, о каких пропущенных вызовах будут приходить уведомления, затем добавьте
              многоканальные номера, отделы или колл-центры
            </p>
          </div>

          {/* Radio Buttons */}
          <div className="px-4 py-2">
            <div className="space-y-2">
              {SOURCE_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <div className="relative flex items-center justify-center">
                    <div
                      className={`w-4 h-4 rounded-full border-2 transition-all ${
                        scenario.sourceType === option.value
                          ? 'border-amber-400'
                          : 'border-gray-300 group-hover:border-gray-400'
                      }`}
                    >
                      {scenario.sourceType === option.value && (
                        <div className="w-2 h-2 rounded-full bg-amber-400 m-auto" />
                      )}
                    </div>
                    <input
                      type="radio"
                      name="sourceType"
                      value={option.value}
                      checked={scenario.sourceType === option.value}
                      onChange={() => setSourceType(option.value)}
                      className="sr-only"
                    />
                  </div>
                  <span
                    className={`text-sm ${
                      scenario.sourceType === option.value
                        ? 'text-gray-900 font-medium'
                        : 'text-gray-600'
                    }`}
                  >
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Employee Table (only for employee_numbers source) */}
          {scenario.sourceType === 'employee_numbers' && <EmployeeTable />}
        </div>
      )}
    </div>
  );
}
