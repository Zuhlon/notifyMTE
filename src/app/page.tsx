'use client';

import React, { useEffect } from 'react';
import { usePrototypeStore } from '@/lib/prototype-store';
import { ScenarioSidebar } from '@/components/prototype/ScenarioSidebar';
import { ConfigPanel } from '@/components/prototype/ConfigPanel';
import { AddRecipientModal } from '@/components/prototype/AddRecipientModal';
import { Toast } from '@/components/prototype/Toast';
import {
  X,
} from 'lucide-react';

export default function PrototypePage() {
  const { scenario, toast, dismissToast, closeAll, saveRecipient, openAddRecipientModal, saveSelectedNumbers, toggleEmployeeSelection, simulateActivation } = usePrototypeStore();

  // Expose debug functions for prototype testing
  useEffect(() => {
    const w = window as unknown as Record<string, unknown>;
    w.__proto_selectEmployee = (id: string) => toggleEmployeeSelection(id);
    w.__proto_saveNumbers = () => saveSelectedNumbers();
    w.__proto_openModal = () => openAddRecipientModal();
    w.__proto_saveRecipient = () => saveRecipient();
    w.__proto_activate = (id: string) => simulateActivation(id);
  }, []);

  return (
    <div className="min-h-screen bg-[#F3F4F6] font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full" />
          </div>
          <h1 className="text-lg font-semibold text-gray-900">Уведомления о пропущенных</h1>
        </div>
        <button
          onClick={closeAll}
          className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 transition-colors text-sm"
        >
          <X className="w-4 h-4" />
          Закрыть
        </button>
      </header>

      {/* Main Content */}
      <div className="max-w-[1200px] mx-auto p-6">
        {/* Page Title */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-semibold text-gray-900">Настройка сценария уведомлений</h2>
            <a href="#" className="text-sm text-blue-600 hover:underline">
              Как настроить
            </a>
          </div>
          <p className="text-sm text-gray-500 max-w-3xl leading-relaxed">
            Создайте сценарий для получения уведомлений: если клиент не дозвонится, уведомление о
            пропущенном вызове придет сотруднику и он оперативно перезвонит. Выберите, какие звонки
            считать пропущенными, и настройте оповещения. Вы можете создать неограниченное количество
            сценариев получения уведомлений.
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="flex gap-6">
          {/* Left Sidebar - Scenarios */}
          <div className="w-[260px] flex-shrink-0">
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
