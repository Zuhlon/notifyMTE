'use client';

import React, { useState } from 'react';
import { usePrototypeStore, SOURCE_TYPE_LABELS } from '@/lib/prototype-store';
import type { ConnectionStatus } from '@/lib/prototype-store';
import { CJTracker } from '@/components/prototype/CJTracker';
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
  Zap,
  MoreHorizontal,
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

function pluralizeNumber(n: number): string {
  const abs = Math.abs(n);
  const mod10 = abs % 10;
  const mod100 = abs % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n} номер`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return `${n} номера`;
  return `${n} номеров`;
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

function ChannelBadge({ channel, status }: { channel: 'MAX' | 'Telegram'; status: ConnectionStatus }) {
  const isActive = status === 'active';
  const isWaiting = status === 'waiting';

  if (channel === 'MAX') {
    return (
      <Tooltip text={isActive ? 'МАКС подключён' : isWaiting ? 'МАКС ожидает подключения' : 'МАКС не настроен'}>
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold leading-none ${
          isActive
            ? 'bg-blue-50 text-blue-700 border border-blue-200'
            : isWaiting
            ? 'bg-amber-50 text-amber-700 border border-amber-200'
            : 'bg-gray-50 text-gray-400 border border-gray-200'
        }`}>
          <Zap className="w-3 h-3" />
          MAX
        </span>
      </Tooltip>
    );
  }

  return (
    <Tooltip text={isActive ? 'Telegram подключён' : isWaiting ? 'Telegram ожидает подключения' : 'Telegram не настроен'}>
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold leading-none ${
        isActive
          ? 'bg-sky-50 text-sky-700 border border-sky-200'
          : isWaiting
          ? 'bg-amber-50 text-amber-700 border border-amber-200'
          : 'bg-gray-50 text-gray-400 border border-gray-200'
      }`}>
        <MessageCircle className="w-3 h-3" />
        Telegram
      </span>
    </Tooltip>
  );
}

export function ServicesPage() {
  const {
    scenarios,
    scenarioStates,
    navigateToPrototype,
    addScenario,
    deleteScenario,
    cjHidden,
    toggleCJHidden,
  } = usePrototypeStore();

  const [activeTab, setActiveTab] = useState('Контроль звонков');
  const [cardExpanded, setCardExpanded] = useState(true);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const totalScenarios = scenarios.length;

  // Enrich each scenario with full state data
  const scenariosWithData = scenarios.map(sc => {
    const state = scenarioStates[sc.id];
    const recipients = state?.recipients || [];

    // Determine which channels are used across all recipients
    const hasMax = recipients.some(r => r.maxStatus !== 'not_configured');
    const hasTelegram = recipients.some(r => r.telegramStatus !== 'not_configured');

    // Get selected items for display
    const selectedItems = (() => {
      if (!state) return [];
      switch (state.sourceType) {
        case 'employee_numbers': return state.employees.filter(e => e.selected);
        case 'multi_channel': return state.multiChannelNumbers.filter(e => e.selected);
        case 'departments': return state.departments.filter(e => e.selected);
        case 'call_centers': return state.callCenters.filter(e => e.selected);
      }
    })();

    return {
      ...sc,
      hasMax,
      hasTelegram,
      maxStatus: hasMax
        ? recipients.find(r => r.maxStatus === 'active') ? 'active' as ConnectionStatus : 'waiting' as ConnectionStatus
        : 'not_configured' as ConnectionStatus,
      telegramStatus: hasTelegram
        ? recipients.find(r => r.telegramStatus === 'active') ? 'active' as ConnectionStatus : 'waiting' as ConnectionStatus
        : 'not_configured' as ConnectionStatus,
      recipientNames: recipients.map(r => r.name).filter(Boolean),
      recipientCount: recipients.length,
      selectedCount: selectedItems.length,
      selectedLabels: selectedItems.slice(0, 2).map(item =>
        'phone' in item && item.phone
          ? `${item.shortNumber || item.code} · ${item.name}`
          : `${item.code} · ${item.name}`
      ),
    };
  });

  const handleDelete = (id: string) => {
    setDeleteConfirmId(null);
    deleteScenario(id);
  };

  return (
    <div className="min-h-screen bg-[#F5F6F8] font-sans">
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
          {/* CJ Tracker */}
          <CJTracker />

          {/* Header */}
          <div className="px-8 pt-6 pb-2 flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">Услуги</h1>
            {cjHidden && (
              <button
                onClick={toggleCJHidden}
                className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-800 transition-colors bg-transparent border-0 cursor-pointer p-0"
              >
                Показать CJ
              </button>
            )}
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
          <div className="p-8 space-y-6">
            {/* Main Service Card: Уведомления о пропущенных */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              {/* ── Card Header ── */}
              <div className="px-7 pt-5 pb-4">
                {/* Top row: title + status */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <Bell className="w-5 h-5 text-blue-500" />
                    </div>
                    {/* Title block */}
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2.5">
                        <h2 className="text-base font-semibold text-gray-900 leading-tight">Уведомления о пропущенных</h2>
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                          Подключено
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">Не теряйте ни одного клиента</p>
                    </div>
                  </div>

                  {/* Right actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Tooltip text="Настроить">
                      <button
                        onClick={() => {
                          if (scenarios.length > 0) navigateToPrototype(scenarios[0].id);
                        }}
                        className="h-8 px-4 bg-gray-900 text-white text-[13px] font-medium rounded-lg hover:bg-gray-800 transition-colors"
                      >
                        Настроить
                      </button>
                    </Tooltip>
                    <Tooltip text={cardExpanded ? 'Свернуть' : 'Развернуть'}>
                      <button
                        onClick={() => setCardExpanded(!cardExpanded)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        {cardExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </Tooltip>
                    <Tooltip text="Поделиться">
                      <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors">
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </Tooltip>
                  </div>
                </div>
              </div>

              {/* ── Scenarios Table ── */}
              {cardExpanded && (
                <div className="border-t border-gray-100">
                  {/* Table Header */}
                  <div className="grid grid-cols-[36px_minmax(140px,1fr)_repeat(4,minmax(140px,1fr))_36px] gap-x-4 px-7 py-3 bg-gray-50/80 text-[11px] font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                    <span></span>
                    <span>Название</span>
                    <span>Источник</span>
                    <span>Номера / названия</span>
                    <span>Получатели</span>
                    <span>Каналы</span>
                    <span></span>
                  </div>

                  {/* Table Rows */}
                  <div className="divide-y divide-gray-50">
                    {scenariosWithData.map(sc => (
                      <div
                        key={sc.id}
                        className="grid grid-cols-[36px_minmax(140px,1fr)_repeat(4,minmax(140px,1fr))_36px] gap-x-4 px-7 py-4 hover:bg-blue-50/30 transition-colors items-center group"
                      >
                        {/* Checkbox */}
                        <div className="flex items-center justify-center">
                          <div className="w-4 h-4 rounded border border-gray-300 hover:border-blue-400 cursor-pointer transition-colors" />
                        </div>

                        {/* Name — clickable */}
                        <button
                          onClick={() => navigateToPrototype(sc.id)}
                          className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors text-left truncate cursor-pointer bg-transparent border-0 p-0"
                        >
                          {sc.name}
                        </button>

                        {/* Source */}
                        <span className="text-[13px] text-gray-500 truncate">{SOURCE_TYPE_LABEL[sc.sourceType] || sc.sourceType}</span>

                        {/* Numbers */}
                        <div className="text-[13px] text-gray-500 truncate pr-4">
                          {sc.selectedCount > 0 ? (
                            <Tooltip text={
                              (() => {
                                const state = scenarioStates[sc.id];
                                if (!state) return '';
                                const items = (() => {
                                  switch (state.sourceType) {
                                    case 'employee_numbers': return state.employees.filter(e => e.selected).map(e => `${e.shortNumber} · ${e.name}`);
                                    case 'multi_channel': return state.multiChannelNumbers.filter(e => e.selected).map(e => `${e.code} · ${e.name}`);
                                    case 'departments': return state.departments.filter(e => e.selected).map(e => `${e.code} · ${e.name}`);
                                    case 'call_centers': return state.callCenters.filter(e => e.selected).map(e => `${e.code} · ${e.name}`);
                                  }
                                })().join('\n');
                                return items;
                              })()
                            }>
                              <span className="cursor-default">
                                {pluralizeNumber(sc.selectedCount)}
                              </span>
                            </Tooltip>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </div>

                        {/* Recipients */}
                        <div className="text-[13px] text-gray-500 truncate pr-4 flex items-center flex-wrap gap-x-3 gap-y-1">
                          {sc.recipientCount > 0
                            ? (() => {
                                const state = scenarioStates[sc.id];
                                const recips = state?.recipients || [];
                                return recips.map((r, i) => {
                                  const configured = r.maxStatus !== 'not_configured' || r.telegramStatus !== 'not_configured';
                                  return (
                                    <Tooltip key={r.id} text={`${r.name}${r.maxStatus === 'active' ? ' · MAX' : ''}${r.telegramStatus === 'active' ? ' · Telegram' : ''}`}>
                                      <span className="inline-flex items-center gap-[4px] cursor-default">
                                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${configured ? 'bg-green-500' : 'bg-red-400'}`} />
                                        <span className="truncate">{r.name}{i < recips.length - 1 && ','}</span>
                                      </span>
                                    </Tooltip>
                                  );
                                });
                              })()
                            : <span className="text-gray-300">—</span>
                          }
                        </div>

                        {/* Channels */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {sc.hasMax && <ChannelBadge channel="MAX" status={sc.maxStatus} />}
                          {sc.hasTelegram && <ChannelBadge channel="Telegram" status={sc.telegramStatus} />}
                          {!sc.hasMax && !sc.hasTelegram && (
                            <span className="text-[13px] text-gray-300">—</span>
                          )}
                        </div>

                        {/* Row actions */}
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
                  </div>

                  {/* Add scenario */}
                  <div className="px-7 py-3 border-t border-gray-100">
                    <button
                      onClick={addScenario}
                      className="flex items-center gap-1.5 text-[13px] font-medium text-gray-400 hover:text-amber-600 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Добавить сценарий
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Other Service Cards */}
            <div className="grid grid-cols-2 gap-5">
              {/* Запись звонков */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                    <Mic className="w-5 h-5 text-purple-500" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <h3 className="text-base font-semibold text-gray-900">Запись звонков</h3>
                    <p className="text-sm text-gray-400">Отслеживайте работу сотрудников</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-gray-900 text-white text-[13px] font-medium rounded-lg hover:bg-gray-800 transition-colors">
                  Купить за 1 500 ₽
                </button>
              </div>

              {/* Файлы */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Cloud className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-gray-900">Файлы</h3>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        Подключено
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">1 ГБ · 150 МБ занято</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-gray-900 text-white text-[13px] font-medium rounded-lg hover:bg-gray-800 transition-colors">
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
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={() => setDeleteConfirmId(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 w-[400px] z-10">
            <h3 className="text-base font-semibold text-gray-900 mb-2">Удалить сценарий?</h3>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Сценарий «{scenarios.find(s => s.id === deleteConfirmId)?.name}» будет удалён безвозвратно. Это действие нельзя отменить.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="h-9 px-4 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="h-9 px-4 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
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
