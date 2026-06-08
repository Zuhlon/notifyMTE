'use client';

import React from 'react';
import { usePrototypeStore, SourceType } from '@/lib/prototype-store';
import {
  Users,
  ChevronDown,
  ChevronRight,
  Building2,
  HeadphonesIcon,
  PhoneForwarded,
  Search,
  Check,
  Minus,
} from 'lucide-react';

const SOURCE_OPTIONS: { value: SourceType; label: string; icon: React.ReactNode }[] = [
  { value: 'employee_numbers', label: 'Номера сотрудников', icon: <Users className="w-3.5 h-3.5" /> },
  { value: 'multi_channel', label: 'Многоканальные номера', icon: <PhoneForwarded className="w-3.5 h-3.5" /> },
  { value: 'departments', label: 'Отделы', icon: <Building2 className="w-3.5 h-3.5" /> },
  { value: 'call_centers', label: 'Колл-центры', icon: <HeadphonesIcon className="w-3.5 h-3.5" /> },
];

const SOURCE_TYPE_LABELS: Record<SourceType, { singular: string; plural: string }> = {
  employee_numbers: { singular: 'номер сотрудника', plural: 'номеров сотрудников' },
  multi_channel: { singular: 'многоканальный номер', plural: 'многоканальных номеров' },
  departments: { singular: 'отдел', plural: 'отделов' },
  call_centers: { singular: 'колл-центр', plural: 'колл-центров' },
};

export function SourceSelector() {
  const {
    scenario,
    setSourceType,
    toggleSourceCollapsed,
  } = usePrototypeStore();

  const getSelectedCount = () => {
    switch (scenario.sourceType) {
      case 'employee_numbers': return scenario.employees.filter(e => e.selected).length;
      case 'multi_channel': return scenario.multiChannelNumbers.filter(e => e.selected).length;
      case 'departments': return scenario.departments.filter(e => e.selected).length;
      case 'call_centers': return scenario.callCenters.filter(e => e.selected).length;
    }
  };

  const selectedCount = getSelectedCount();
  const labels = SOURCE_TYPE_LABELS[scenario.sourceType];

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Section Header - compact */}
      <button
        onClick={toggleSourceCollapsed}
        className="w-full flex items-center gap-2.5 px-4 py-3 hover:bg-gray-50 transition-colors"
      >
        {scenario.isSourceCollapsed ? (
          <ChevronRight className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
        <h3 className="text-sm font-medium text-gray-900">Выберите источник пропущенных</h3>
        {scenario.isSourceCollapsed && scenario.isNumbersSaved && selectedCount > 0 && (
          <span className="ml-auto text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
            {SOURCE_OPTIONS.find(o => o.value === scenario.sourceType)?.label} — {selectedCount}
          </span>
        )}
      </button>

      {/* Expanded Content */}
      {!scenario.isSourceCollapsed && (
        <div className="border-t border-gray-100">
          {/* Radio Buttons - compact inline layout */}
          <div className="px-4 py-3">
            <div className="grid grid-cols-2 gap-2">
              {SOURCE_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all border ${
                    scenario.sourceType === option.value
                      ? 'border-amber-300 bg-amber-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="relative flex items-center justify-center flex-shrink-0">
                    <div
                      className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${
                        scenario.sourceType === option.value
                          ? 'border-amber-500'
                          : 'border-gray-300'
                      }`}
                    >
                      {scenario.sourceType === option.value && (
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 m-auto" />
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
                    className={`text-xs font-medium ${
                      scenario.sourceType === option.value
                        ? 'text-gray-900'
                        : 'text-gray-600'
                    }`}
                  >
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Source-specific table */}
          <SourceTable />
        </div>
      )}
    </div>
  );
}

function SourceTable() {
  const { scenario, setEmployeeSearch, setEmployeeFilter, saveSelectedNumbers, cancelSelection, selectAll, deselectAll } = usePrototypeStore();

  const allItems = (() => {
    switch (scenario.sourceType) {
      case 'employee_numbers':
        return scenario.employees.map(e => ({
          id: e.id,
          code: e.phone,
          name: e.name,
          selected: e.selected,
        }));
      case 'multi_channel':
        return scenario.multiChannelNumbers.map(e => ({
          id: e.id,
          code: e.code,
          name: e.name,
          selected: e.selected,
        }));
      case 'departments':
        return scenario.departments.map(e => ({
          id: e.id,
          code: e.code,
          name: e.name,
          selected: e.selected,
        }));
      case 'call_centers':
        return scenario.callCenters.map(e => ({
          id: e.id,
          code: e.code,
          name: e.name,
          selected: e.selected,
        }));
    }
  })();

  const selectedCount = allItems.filter(i => i.selected).length;

  // Filter
  let filtered = allItems;
  if (scenario.searchQuery) {
    const q = scenario.searchQuery.toLowerCase();
    filtered = filtered.filter(i =>
      i.name.toLowerCase().includes(q) ||
      i.code.toLowerCase().includes(q)
    );
  }
  if (scenario.filterMode === 'selected') {
    filtered = filtered.filter(i => i.selected);
  }

  // ── Employee-specific table: name + phone on one line ──
  if (scenario.sourceType === 'employee_numbers') {
    return (
      <div className="border-t border-gray-100">
        {/* Search & Filters */}
        <div className="px-4 pt-2.5 pb-2 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск по имени или номеру..."
              value={scenario.searchQuery}
              onChange={(e) => setEmployeeSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 bg-gray-50"
            />
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setEmployeeFilter('all')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                scenario.filterMode === 'all'
                  ? 'bg-amber-400 text-gray-900'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Все
            </button>
            <button
              onClick={() => setEmployeeFilter('selected')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                scenario.filterMode === 'selected'
                  ? 'bg-amber-400 text-gray-900'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Выбранные {selectedCount > 0 ? selectedCount : ''}
            </button>
          </div>
        </div>

        {/* Select all row */}
        <div className="px-4 pt-1 pb-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <div
              className={`w-4 h-4 rounded flex items-center justify-center transition-all border cursor-pointer ${
                filtered.length > 0 && filtered.every(i => i.selected)
                  ? 'bg-amber-400 border-amber-400'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onClick={() => {
                const allFilteredSelected = filtered.every(i => i.selected);
                if (allFilteredSelected) deselectAll(scenario.sourceType);
                else selectAll(scenario.sourceType);
              }}
            >
              {filtered.length > 0 && filtered.every(i => i.selected) ? (
                <Check className="w-2.5 h-2.5 text-white" />
              ) : (
                <Minus className="w-2.5 h-2.5 text-gray-300" />
              )}
            </div>
            <span className="text-[11px] text-gray-500 font-medium">
              Выбрать все ({filtered.length})
            </span>
          </label>
        </div>

        {/* Beautiful table with border */}
        <div className="mx-4 border border-gray-200 rounded-lg overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-[32px_1fr] gap-0 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-center py-2">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider"></span>
            </div>
            <div className="flex items-center py-2 px-3">
              <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Сотрудник</span>
            </div>
          </div>

          {/* Table Body */}
          <div className="max-h-[260px] overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-400">
                {scenario.searchQuery ? 'Ничего не найдено' : 'Нет данных'}
              </div>
            ) : (
              filtered.map((item, idx) => (
                <button
                  key={item.id}
                  type="button"
                  className={`w-full grid grid-cols-[32px_1fr] gap-0 items-center transition-colors cursor-pointer text-left bg-transparent border-0 ${
                    item.selected
                      ? 'bg-amber-50/80'
                      : idx % 2 === 0
                        ? 'bg-white hover:bg-gray-50/50'
                        : 'bg-gray-50/30 hover:bg-gray-50/50'
                  } ${idx > 0 ? 'border-t border-gray-100' : ''}`}
                  onClick={() => {
                    const store = usePrototypeStore.getState();
                    store.toggleSelection(store.scenario.sourceType, item.id);
                  }}
                >
                  {/* Checkbox */}
                  <div className="flex items-center justify-center py-2.5">
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center transition-all border ${
                        item.selected
                          ? 'bg-amber-400 border-amber-400'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {item.selected ? (
                        <Check className="w-2.5 h-2.5 text-white" />
                      ) : (
                        <Minus className="w-2.5 h-2.5 text-gray-300" />
                      )}
                    </div>
                  </div>
                  {/* Phone + Name on one line */}
                  <div className="flex items-center gap-2.5 py-2.5 px-3 min-w-0">
                    <span className="text-xs text-gray-900 font-mono flex-shrink-0">{item.code}</span>
                    <span className="text-xs font-medium text-gray-500 truncate min-w-0">{item.name}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-gray-100 flex items-center justify-between bg-gray-50/50 mt-2">
          <span className="text-[11px] text-gray-500">
            Выбрано {selectedCount} из {allItems.length}
          </span>
          <div className="flex gap-2">
            <button
              onClick={cancelSelection}
              className="px-2.5 py-1 rounded-md text-[11px] font-medium text-gray-600 border border-gray-200 hover:bg-gray-100 transition-colors"
            >
              Отменить
            </button>
            <button
              onClick={saveSelectedNumbers}
              disabled={selectedCount === 0}
              className={`px-3 py-1 rounded-md text-[11px] font-medium transition-colors ${
                selectedCount > 0
                  ? 'bg-amber-400 text-gray-900 hover:bg-amber-500'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              Сохранить
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Generic table for other source types ──
  const headers = scenario.sourceType === 'multi_channel'
    ? ['Номер', 'Название']
    : ['Код', 'Название'];
  const gridCols = 'grid-cols-[32px_80px_1fr]';

  return (
    <div className="border-t border-gray-100">
      {/* Search & Filters */}
      <div className="px-4 pt-2.5 pb-2 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Поиск..."
            value={scenario.searchQuery}
            onChange={(e) => setEmployeeSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 bg-gray-50"
          />
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setEmployeeFilter('all')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              scenario.filterMode === 'all'
                ? 'bg-amber-400 text-gray-900'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Все
          </button>
          <button
            onClick={() => setEmployeeFilter('selected')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              scenario.filterMode === 'selected'
                ? 'bg-amber-400 text-gray-900'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Выбранные {selectedCount > 0 ? selectedCount : ''}
          </button>
        </div>
      </div>

      {/* Select all row */}
      <div className="px-4 pt-1 pb-0.5">
        <label className="flex items-center gap-2 cursor-pointer">
          <div
            className={`w-4 h-4 rounded flex items-center justify-center transition-all border cursor-pointer ${
              filtered.length > 0 && filtered.every(i => i.selected)
                ? 'bg-amber-400 border-amber-400'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onClick={() => {
              const allFilteredSelected = filtered.every(i => i.selected);
              if (allFilteredSelected) deselectAll(scenario.sourceType);
              else selectAll(scenario.sourceType);
            }}
          >
            {filtered.length > 0 && filtered.every(i => i.selected) ? (
              <Check className="w-2.5 h-2.5 text-white" />
            ) : (
              <Minus className="w-2.5 h-2.5 text-gray-300" />
            )}
          </div>
          <span className="text-[11px] text-gray-500 font-medium">
            Выбрать все ({filtered.length})
          </span>
        </label>
      </div>

      {/* Table Header */}
      <div className="px-4 py-1.5">
        <div className={`grid ${gridCols} gap-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider`}>
          <span></span>
          {headers.map(h => <span key={h}>{h}</span>)}
        </div>
      </div>

      {/* Table Body - compact */}
      <div className="max-h-[200px] overflow-y-auto px-4 pb-2">
        {filtered.length === 0 ? (
          <div className="py-6 text-center text-xs text-gray-400">
            {scenario.searchQuery ? 'Ничего не найдено' : 'Нет данных'}
          </div>
        ) : (
          filtered.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`w-full grid ${gridCols} gap-2 items-center py-1.5 px-1 rounded-md hover:bg-gray-50 transition-colors cursor-pointer text-left bg-transparent border-0 ${
                item.selected ? 'bg-amber-50/60' : ''
              }`}
              onClick={() => {
                const store = usePrototypeStore.getState();
                store.toggleSelection(store.scenario.sourceType, item.id);
              }}
            >
              {/* Checkbox */}
              <div className="flex justify-center">
                <div
                  className={`w-4 h-4 rounded flex items-center justify-center transition-all border ${
                    item.selected
                      ? 'bg-amber-400 border-amber-400'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {item.selected ? (
                    <Check className="w-2.5 h-2.5 text-white" />
                  ) : (
                    <Minus className="w-2.5 h-2.5 text-gray-300" />
                  )}
                </div>
              </div>
              {/* Code */}
              <span className="text-xs text-gray-900 font-mono">{item.code}</span>
              {/* Name */}
              <span className="text-xs text-gray-900 truncate">{item.name}</span>
            </button>
          ))
        )}
      </div>

      {/* Footer - compact */}
      <div className="px-4 py-2 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
        <span className="text-[11px] text-gray-500">
          Выбрано {selectedCount} из {allItems.length}
        </span>
        <div className="flex gap-2">
          <button
            onClick={cancelSelection}
            className="px-2.5 py-1 rounded-md text-[11px] font-medium text-gray-600 border border-gray-200 hover:bg-gray-100 transition-colors"
          >
            Отменить
          </button>
          <button
            onClick={saveSelectedNumbers}
            disabled={selectedCount === 0}
            className={`px-3 py-1 rounded-md text-[11px] font-medium transition-colors ${
              selectedCount > 0
                ? 'bg-amber-400 text-gray-900 hover:bg-amber-500'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}
