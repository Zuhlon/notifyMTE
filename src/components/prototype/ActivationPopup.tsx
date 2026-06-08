'use client';

import React from 'react';
import { usePrototypeStore } from '@/lib/prototype-store';
import {
  X,
  Check,
  Link as LinkIcon,
  Copy,
  MessageCircle,
} from 'lucide-react';

export function ActivationPopup() {
  const {
    activationPopup,
    closeActivationPopup,
    confirmActivation,
    showToast,
  } = usePrototypeStore();

  if (!activationPopup.visible) return null;

  const handleConfirm = () => {
    confirmActivation(); // Toast is handled in the store
  };

  const handleCopy = () => {
    if (activationPopup.maxLink) {
      navigator.clipboard?.writeText(activationPopup.maxLink).catch(() => {});
      showToast('Ссылка скопирована');
      setTimeout(() => {
        const store = usePrototypeStore.getState();
        store.dismissToast();
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={closeActivationPopup}
      />

      {/* Popup */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[440px] mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-amber-600" />
            </div>
            <h2 className="text-base font-semibold text-gray-900">Подключение МАКС</h2>
          </div>
          <button
            onClick={closeActivationPopup}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4">
          {/* Recipient info */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-sm font-medium text-green-800">
                Статус изменён: Подключен
              </span>
            </div>
            <p className="text-xs text-green-700">
              {activationPopup.recipientName} теперь будет получать уведомления через МАКС
            </p>
          </div>

          {/* Instructions for recipient */}
          <div className="bg-blue-50 rounded-xl p-4">
            <p className="text-sm font-medium text-blue-900 mb-2">
              Текст для получателя:
            </p>
            <div className="bg-white rounded-lg p-3 border border-blue-100">
              <p className="text-sm text-gray-700 leading-relaxed">
                Вот ваша ссылка:{' '}
                <span className="text-blue-600 font-medium break-all text-xs">
                  {activationPopup.maxLink}
                </span>
              </p>
              <p className="text-sm text-gray-700 leading-relaxed mt-1.5">
                Войдите в МАКС, запустите бота нажав <span className="font-medium">Старт</span>,
                подтвердите номер.
              </p>
            </div>
          </div>

          {/* Copy link button */}
          {activationPopup.maxLink && (
            <button
              onClick={handleCopy}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Copy className="w-4 h-4" />
              Скопировать ссылку
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-gray-100 flex items-center justify-end gap-2 bg-gray-50/50">
          <button
            onClick={closeActivationPopup}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Закрыть
          </button>
          <button
            onClick={handleConfirm}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-amber-400 text-gray-900 hover:bg-amber-500 transition-colors"
          >
            <Check className="w-4 h-4" />
            Подтвердить подключение
          </button>
        </div>
      </div>
    </div>
  );
}
