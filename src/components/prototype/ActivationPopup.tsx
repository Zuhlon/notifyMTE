'use client';

import React from 'react';
import { usePrototypeStore } from '@/lib/prototype-store';
import {
  X,
  Check,
  Copy,
  MessageCircle,
  MessageSquare,
} from 'lucide-react';

export function ActivationPopup() {
  const {
    activationPopup,
    closeActivationPopup,
    confirmActivation,
    showToast,
  } = usePrototypeStore();

  if (!activationPopup.visible) return null;

  const isMax = activationPopup.channel === 'max';
  const channelLabel = isMax ? 'МАКС' : 'Telegram';
  const ChannelIcon = isMax ? MessageCircle : MessageSquare;

  const handleConfirm = () => {
    confirmActivation();
  };

  const handleCopy = () => {
    if (activationPopup.link) {
      navigator.clipboard?.writeText(activationPopup.link).catch(() => {});
      showToast('Ссылка скопирована');
      setTimeout(() => {
        const store = usePrototypeStore.getState();
        store.dismissToast();
      }, 2000);
    }
  };

  const instructionText = isMax
    ? 'Войдите в МАКС, запустите бота нажав Старт, подтвердите номер.'
    : 'Войдите в Telegram под указанным аккаунтом и перейдите по ссылке для подключения к боту.';

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/30 transition-opacity"
        onClick={closeActivationPopup}
      />

      {/* Side Sheet */}
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-[420px] bg-white shadow-2xl flex flex-col animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              isMax ? 'bg-amber-50' : 'bg-blue-50'
            }`}>
              <ChannelIcon className={`w-4.5 h-4.5 ${isMax ? 'text-amber-600' : 'text-blue-600'}`} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Подключение {channelLabel}
              </h2>
              <p className="text-xs text-gray-500">{activationPopup.recipientName}</p>
            </div>
          </div>
          <button
            onClick={closeActivationPopup}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
          {/* Status changed */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
              <span className="text-sm font-semibold text-green-800">
                Подключен
              </span>
            </div>
            <p className="text-xs text-green-700 leading-relaxed">
              {activationPopup.recipientName} теперь будет получать уведомления через {channelLabel}
            </p>
          </div>

          {/* Instructions */}
          <div>
            <p className="text-sm font-medium text-gray-900 mb-3">
              Текст для получателя
            </p>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-3">
              <div>
                <p className="text-xs text-gray-500 mb-1">Ссылка для подключения:</p>
                <p className="text-sm text-blue-600 font-medium break-all font-mono">
                  {activationPopup.link}
                </p>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <p className="text-sm text-gray-700 leading-relaxed">
                  {instructionText}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 space-y-3 bg-white">
          {/* Copy link button */}
          {activationPopup.link && (
            <button
              onClick={handleCopy}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Copy className="w-4 h-4" />
              Скопировать ссылку
            </button>
          )}
          <div className="flex items-center gap-2">
            <button
              onClick={closeActivationPopup}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Закрыть
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-amber-400 text-gray-900 hover:bg-amber-500 transition-colors"
            >
              <Check className="w-4 h-4" />
              Подтвердить подключение
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
