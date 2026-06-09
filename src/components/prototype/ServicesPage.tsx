'use client';

import React, { useState } from 'react';
import { usePrototypeStore, SOURCE_TYPE_LABELS } from '@/lib/prototype-store';
import {
  CheckCircle2,
  Phone,
  Bell,
  ChevronDown,
  ChevronUp,
  Settings,
  Trash2,
  Plus,
  MessageCircle,
  Mail,
  Send,
  Cloud,
  Mic,
} from 'lucide-react';

const SOURCE_TYPE_LABEL: Record<string, string> = {
  employee_numbers: 'Номера сотрудников',
  multi_channel: 'Многоканальные номера',
  departments: 'Отделы',
  call_centers: 'Колл-центры',
};

const CATEGORY_TABS = [
  { label: 'Обработка звонков', count: 4 },
  { label: 'Контроль звонков', count: 3 },
  { label: 'Интеграции', count: 5 },
  { label: 'Настройки звонков', count: 6 },
  { label: 'Дополнительные сервисы', count: 5 },
];

function pluralizeScenario(n: number): string {
  const abs = Math.abs(n);
  const mod10 = abs % 10;
  const mod100 = abs % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n} сценарий`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return `${n} сценария`;
  return `${n} сценариев`;
}

function Tooltip({ text, children }: { text: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false);
  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 bg-gray-900 text-white text-[11px] font-medium rounded-lg whitespace-nowrap z-50 shadow-lg pointer-events-none">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-gray-900" />
        </div>
      )}
    </div>
  );
}

export function ServicesPage() {
  const {
    scenarios,
    scenarioStates,
    navigateToPrototype,
    addScenario,
    deleteScenario,
  } = usePrototypeStore();

  const [activeTab, setActiveTab] = useState('Контроль звонков');
  const [cardExpanded, setCardExpanded] = useState(true);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const totalScenarios = scenarios.length;
  const scenariosWithData = scenarios.map(sc => {
    const state = scenarioStates[sc.id];
    return {
      ...sc,
      hasRecipients: (sc.recipientCount > 0),
      recipientNames: state?.recipients?.slice(0, 3).map(r => r.telegramAccount || r.name).filter(Boolean) || [],
      recipientCount: sc.recipientCount,
      selectedNumbers: state?.isNumbersSaved ? sc.selectedCount : 0,
      sourceType: sc.sourceType,
    };
  });

  const handleDelete = (id: string) => {
    setDeleteConfirmId(null);
    deleteScenario(id);
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Left sidebar nav */}
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-16 bg-white border-r border-gray-100 flex flex-col items-center py-4 gap-5">
          <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full" />
          </div>
          <div className="flex flex-col gap-4 mt-4">
            {[
              { icon: <Mail className="w-4 h-4" /> },
              { icon: <Send className="w-4 h-4" /> },
              { icon: <Phone className="w-4 h-4" /> },
              { icon: <Cloud className="w-4 h-4" /> },
              { icon: <Settings className="w-4 h-4" /> },
            ].map((item, i) => (
              <div key={i} className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors">
                {item.icon}
              </div>
            ))}
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          {/* Header */}
          <div className="px-8 pt-8 pb-2">
            <h1 className="text-2xl font-semibold text-gray-900">Услуги</h1>
          </div>

          {/* Category Tabs */}
          <div className="px-8 pt-4 border-b border-gray-100">
            <div className="flex gap-1">
              {CATEGORY_TABS.map(tab => (
                <button
                  key={tab.label}
                  onClick={() => setActiveTab(tab.label)}
                  className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
                    activeTab === tab.label
                      ? 'text-gray-900'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {tab.label}{' '}
                  <span className="text-xs opacity-60">({tab.count})</span>
                  {activeTab === tab.label && (
                    <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-amber-500 rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Service Cards */}
          <div className="p-8 space-y-4">
            {/* Main Service Card: Уведомления о пропущенных */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              {/* Card Header */}
              <div className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Status */}
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Подключено</span>
                  </div>
                  {/* Title */}
                  <div className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-blue-500" />
                    <h2 className="text-lg font-semibold text-gray-900">Уведомления о пропущенных</h2>
                  </div>
                  <p className="text-sm text-gray-400 italic">Не теряйте ни одного клиента</p>
                </div>
                <div className="flex items-center gap-3">
                  {/* Scenario count */}
                  <div className="text-right mr-2">
                    <span className="text-sm font-semibold text-gray-900">{pluralizeScenario(totalScenarios)}</span>
                    <br />
                    <span className="text-xs text-gray-400">создано</span>
                  </div>
                  {/* Actions */}
                  <Tooltip text="Настроить">
                    <button
                      onClick={() => {
                        if (scenarios.length > 0) navigateToPrototype(scenarios[0].id);
                      }}
                      className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      Настроить
                    </button>
                  </Tooltip>
                  <Tooltip text={cardExpanded ? 'Свернуть' : 'Развернуть'}>
                    <button
                      onClick={() => setCardExpanded(!cardExpanded)}
                      className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      {cardExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </Tooltip>
                  <Tooltip text="Поделиться">
                    <button className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors">
                      <Send className="w-4 h-4" />
                    </button>
                  </Tooltip>
                </div>
              </div>

              {/* Scenarios Table */}
              {cardExpanded && (
                <div className="border-t border-gray-100">
                  {/* Table Header */}
                  <div className="grid grid-cols-[40px_1fr_140px_180px_160px_80px] gap-0 px-6 py-2.5 bg-gray-50 text-[11px] font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                    <span></span>
                    <span>Название</span>
                    <span>Источник</span>
                    <span>Названия или номера</span>
                    <span>Получатели</span>
                    <span></span>
                  </div>

                  {/* Table Rows */}
                  {scenariosWithData.map(sc => (
                    <div
                      key={sc.id}
                      className="grid grid-cols-[40px_1fr_140px_180px_160px_80px] gap-0 px-6 py-3 border-b border-gray-50 hover:bg-gray-50/50 transition-colors items-center"
                    >
                      {/* Checkbox */}
                      <div className="flex items-center justify-center">
                        <div className="w-4 h-4 rounded border border-gray-300 hover:border-gray-400 cursor-pointer transition-colors" />
                      </div>

                      {/* Name — clickable */}
                      <button
                        onClick={() => navigateToPrototype(sc.id)}
                        className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors text-left truncate cursor-pointer bg-transparent border-0 p-0"
                      >
                        {sc.name}
                      </button>

                      {/* Source */}
                      <span className="text-xs text-gray-500 truncate">{SOURCE_TYPE_LABEL[sc.sourceType] || sc.sourceType}</span>

                      {/* Numbers */}
                      <span className="text-xs text-gray-400 truncate">
                        {sc.selectedNumbers > 0 ? `${sc.selectedNumbers} номер(ов)` : '—'}
                      </span>

                      {/* Recipients */}
                      <span className="text-xs text-gray-500 truncate">
                        {sc.recipientCount > 0
                          ? sc.recipientNames.slice(0, 2).join(', ') + (sc.recipientCount > 2 ? ` (+ещё ${sc.recipientCount - 2})` : '')
                          : '—'}
                      </span>

                      {/* Actions */}
                      <div className="flex items-center gap-1 justify-end">
                        <Tooltip text="Редактировать">
                          <button
                            onClick={() => navigateToPrototype(sc.id)}
                            className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <Settings className="w-3.5 h-3.5" />
                          </button>
                        </Tooltip>
                        <Tooltip text="Удалить">
                          <button
                            onClick={() => setDeleteConfirmId(sc.id)}
                            className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </Tooltip>
                      </div>
                    </div>
                  ))}

                  {/* Add scenario row */}
                  <div className="px-6 py-2.5">
                    <button
                      onClick={addScenario}
                      className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-amber-600 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Добавить сценарий
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Other Service Cards */}
            <div className="grid grid-cols-2 gap-4">
              {/* Запись звонков */}
              <div className="bg-white border border-gray-200 rounded-xl px-6 py-5 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Mic className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">Запись звонков</h3>
                    <p className="text-xs text-gray-400">Отслеживайте работу сотрудников</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors">
                  Купить за 1 500 ₽
                </button>
              </div>

              {/* Файлы */}
              <div className="bg-white border border-gray-200 rounded-xl px-6 py-5 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Cloud className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">Файлы</h3>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3 h-3 text-green-500" />
                      <span className="text-xs text-gray-400">1 ГБ · 150 МБ занято</span>
                    </div>
                  </div>
                </div>
                <button className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors">
                  Купить за 1 500 ₽
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setDeleteConfirmId(null)} />
          <div className="relative bg-white rounded-xl shadow-xl border border-gray-200 p-6 w-[360px] z-10">
            <h3 className="text-base font-semibold text-gray-900 mb-2">Удалить сценарий?</h3>
            <p className="text-sm text-gray-500 mb-5">
              Сценарий «{scenarios.find(s => s.id === deleteConfirmId)?.name}» будет удалён безвозвратно.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
