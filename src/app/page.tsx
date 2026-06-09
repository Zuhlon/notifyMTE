'use client';

import React, { useEffect, useState, useRef } from 'react';
import { usePrototypeStore } from '@/lib/prototype-store';
import { ScenarioSidebar } from '@/components/prototype/ScenarioSidebar';
import { ConfigPanel } from '@/components/prototype/ConfigPanel';
import { AddRecipientModal } from '@/components/prototype/AddRecipientModal';
import { ActivationPopup } from '@/components/prototype/ActivationPopup';
import { CJTracker } from '@/components/prototype/CJTracker';
import { Toast } from '@/components/prototype/Toast';
import { ServicesPage } from '@/components/prototype/ServicesPage';
import {
  X,
  HelpCircle,
  ArrowLeft,
} from 'lucide-react';

export default function PrototypePage() {
  const {
    viewMode,
    scenario,
    toast,
    dismissToast,
    closeAll,
    saveRecipient,
    openAddRecipientModal,
    saveSelectedNumbers,
    toggleEmployeeSelection,
    confirmActivation,
    activationPopup,
    closeActivationPopup,
    cjHidden,
    toggleCJHidden,
    navigateToServices,
  } = usePrototypeStore();

  const [showGuide, setShowGuide] = useState(false);
  const guideRef = useRef<HTMLDivElement>(null);

  // Close guide on click outside
  useEffect(() => {
    if (!showGuide) return;
    const handler = (e: MouseEvent) => {
      if (guideRef.current && !guideRef.current.contains(e.target as Node)) setShowGuide(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showGuide]);

  // ── Services View ──
  if (viewMode === 'services') {
    return <ServicesPage />;
  }

  // ── Prototype View ──
  return (
    <div className="min-h-screen bg-[#F3F4F6] font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Tooltip text="Назад к услугам">
            <button
              onClick={navigateToServices}
              className="flex items-center gap-1 text-gray-500 hover:text-gray-900 transition-colors text-sm bg-transparent border-0 cursor-pointer p-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          </Tooltip>
          <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full" />
          </div>
          <h1 className="text-lg font-semibold text-gray-900">Уведомления о пропущенных</h1>
        </div>
        <div className="flex items-center gap-2">
          {cjHidden && (
            <button
              onClick={toggleCJHidden}
              className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-800 transition-colors bg-transparent border-0 cursor-pointer p-0"
            >
              Показать CJ
            </button>
          )}
          <button
            onClick={closeAll}
            className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 transition-colors text-sm bg-transparent border-0 cursor-pointer p-0"
          >
            <X className="w-4 h-4" />
            Закрыть
          </button>
        </div>
      </header>

      {/* CJ Tracker */}
      <CJTracker />

      {/* Main Content */}
      <div className="max-w-[1200px] mx-auto p-6">
        {/* Page Title */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-1.5">
            <h2 className="text-xl font-semibold text-gray-900">Настройка сценария уведомлений</h2>
            <div className="relative" ref={guideRef}>
              <button
                onClick={() => setShowGuide(v => !v)}
                className="flex items-center gap-1 text-sm text-blue-600 hover:underline bg-transparent border-0 cursor-pointer p-0"
              >
                <HelpCircle className="w-4 h-4" />
                Как настроить
              </button>
              {showGuide && (
                <div className="absolute right-0 top-full mt-2 w-[380px] bg-white rounded-xl shadow-lg border border-gray-200 z-50 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900">Настройка уведомлений</h3>
                    <button onClick={() => setShowGuide(false)} className="text-gray-400 hover:text-gray-600 bg-transparent border-0 cursor-pointer p-0">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <ol className="space-y-2.5 text-[13px] text-gray-600 leading-relaxed">
                    <li className="flex gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-amber-400 text-gray-900 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                      <span><b className="text-gray-800">Выберите источник</b> — номера сотрудников, многоканальные номера, отделы или колл-центры, по которым будут отслеживаться пропущенные вызовы.</span>
                    </li>
                    <li className="flex gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-amber-400 text-gray-900 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                      <span><b className="text-gray-800">Выберите номера</b> — отметьте конкретные номера или элементы из выбранного источника.</span>
                    </li>
                    <li className="flex gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-amber-400 text-gray-900 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                      <span><b className="text-gray-800">Добавьте получателя</b> — укажите ФИО, должность и подключите канал уведомлений (МАКС или Telegram).</span>
                    </li>
                    <li className="flex gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-amber-400 text-gray-900 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">4</span>
                      <span><b className="text-gray-800">Сохраните и отправьте ссылку</b> — после сохранения ссылка скопируется. Отправьте её получателю для подключения.</span>
                    </li>
                    <li className="flex gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-amber-400 text-gray-900 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">5</span>
                      <span><b className="text-gray-800">Подтвердите подключение</b> — получатель переходит по ссылке и авторизуется. Нажмите «Подтвердить» для имитации.</span>
                    </li>
                  </ol>
                </div>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-500 max-w-3xl leading-relaxed">
            Создайте сценарий для получения уведомлений: если клиент не дозвонится, уведомление о
            пропущенном вызове придет сотруднику и он оперативно перезвонит. Вы можете создать
            неограниченное количество сценариев.
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="flex gap-5">
          {/* Left Sidebar - Scenarios */}
          <div className="w-[250px] flex-shrink-0">
            <ScenarioSidebar />
          </div>

          {/* Right Panel - Configuration */}
          <div className="flex-1 min-w-0">
            <ConfigPanel />
          </div>
        </div>
      </div>

      {/* Add Recipient Modal */}
      <AddRecipientModal />

      {/* Activation Popup */}
      <ActivationPopup />

      {/* Toast */}
      <Toast message={toast.message} visible={toast.visible} onDismiss={dismissToast} />

      {/* Saved Notification Bar */}
      {scenario.showSavedNotification && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white px-6 py-3 flex items-center justify-center gap-3 z-40">
          <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm font-medium">Сценарий сохранён</span>
        </div>
      )}
    </div>
  );
}

// Inline tooltip component for prototype page
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
