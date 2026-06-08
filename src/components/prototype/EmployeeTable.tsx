'use client';

import React, { useMemo, useRef, useEffect } from 'react';
import { usePrototypeStore } from '@/lib/prototype-store';
import { Search, Check, Minus } from 'lucide-react';

export function EmployeeTable() {
  const {
    scenario,
    toggleEmployeeSelection,
    setEmployeeFilter,
    setEmployeeSearch,
    saveSelectedNumbers,
    cancelSelection,
  } = usePrototypeStore();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedCount = scenario.employees.filter((e) => e.selected).length;
  const totalCount = scenario.employees.length;

  const filteredEmployees = useMemo(() => {
    let list = scenario.employees;
    if (scenario.searchQuery) {
      const q = scenario.searchQuery.toLowerCase();
      list = list.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.shortNumber.toLowerCase().includes(q) ||
          e.phone.includes(q)
      );
    }
    if (scenario.filterMode === 'selected') {
      list = list.filter((e) => e.selected);
    }
    return list;
  }, [scenario.employees, scenario.searchQuery, scenario.filterMode]);

  return (
    <div className="border-t border-gray-100">
      {/* Search & Filters */}
      <div className="px-4 pt-3 pb-2 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Поиск по номеру и имени"
            value={scenario.searchQuery}
            onChange={(e) => setEmployeeSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 bg-gray-50"
          />
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setEmployeeFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              scenario.filterMode === 'all'
                ? 'bg-amber-400 text-gray-900'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Все
          </button>
          <button
            onClick={() => setEmployeeFilter('selected')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              scenario.filterMode === 'selected'
                ? 'bg-amber-400 text-gray-900'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Выбранные {selectedCount > 0 ? selectedCount : ''}
          </button>
        </div>
      </div>

      {/* Table Header */}
      <div className="px-4 py-2">
        <div className="grid grid-cols-[32px_100px_1fr_1fr] gap-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
          <span></span>
          <span>Короткий номер</span>
          <span>Телефон</span>
          <span>Имя</span>
        </div>
      </div>

      {/* Table Body */}
      <div className="max-h-[280px] overflow-y-auto px-4 pb-2 scrollbar-thin">
        {filteredEmployees.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-400">
            {scenario.searchQuery ? 'Ничего не найдено' : 'Нет данных'}
          </div>
        ) : (
          filteredEmployees.map((employee) => (
            <button
              key={employee.id}
              type="button"
              onClick={() => toggleEmployeeSelection(employee.id)}
              className="w-full grid grid-cols-[32px_100px_1fr_1fr] gap-2 items-center py-2 px-1 border-b border-gray-50 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer text-left bg-transparent border-x-0 border-t-0"
              data-employee-id={employee.id}
            >
              {/* Checkbox */}
              <div className="flex justify-center">
                <div
                  className={`w-5 h-5 rounded flex items-center justify-center transition-all border-2 ${
                    employee.selected
                      ? 'bg-amber-400 border-amber-400'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {employee.selected ? (
                    <Check className="w-3 h-3 text-white" />
                  ) : (
                    <Minus className="w-3 h-3 text-gray-300" />
                  )}
                </div>
              </div>
              {/* Short Number */}
              <span className="text-sm text-gray-900">{employee.shortNumber}</span>
              {/* Phone */}
              <span className="text-sm text-gray-500 truncate">{employee.sip}</span>
              {/* Name */}
              <span className="text-sm text-gray-900 truncate">{employee.name}</span>
            </button>
          ))
        )}
      </div>

      {/* Footer with count & actions */}
      <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs text-gray-500">
          Выбрано {selectedCount} из {totalCount}
        </span>
        <div className="flex gap-2">
          <button
            onClick={cancelSelection}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Отменить
          </button>
          <button
            onClick={saveSelectedNumbers}
            disabled={selectedCount === 0}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              selectedCount > 0
                ? 'bg-amber-400 text-gray-900 hover:bg-amber-500'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            Сохранить выбранные номера
          </button>
        </div>
      </div>
    </div>
  );
}
