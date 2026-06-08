'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { usePrototypeStore, ChannelTab } from '@/lib/prototype-store';
import {
  X,
  Copy,
  Check,
  MessageSquare,
  Mail,
  ArrowDown,
  Share2,
  Link as LinkIcon,
} from 'lucide-react';

export function AddRecipientModal() {
  const {
    modal,
    closeRecipientModal,
    setModalRecipientName,
    setModalRecipientPosition,
    setModalActiveTab,
    setModalPhone,
    generateMaxLink,
    copyMaxLink,
    saveRecipient,
  } = usePrototypeStore();

  if (!modal.isOpen) return null;

  const isSaveEnabled = modal.recipientName.trim().length > 0;
  const isConnectMaxEnabled = modal.activeTab === 'max' && modal.isPhoneValid;

  // Format phone as user types: (XXX) XXX-XX-XX
  const handlePhoneChange = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length === 0) {
      setModalPhone('');
      return;
    }
    let formatted = '';
    if (digits.length > 0) formatted += '(' + digits.slice(0, 3);
    if (digits.length >= 3) formatted += ') ';
    if (digits.length > 3) formatted += digits.slice(3, 6);
    if (digits.length >= 6) formatted += '-';
    if (digits.length > 6) formatted += digits.slice(6, 8);
    if (digits.length >= 8) formatted += '-';
    if (digits.length > 8) formatted += digits.slice(8, 10);
    setModalPhone(formatted);
  };

  const tabs: { key: ChannelTab; label: string; icon: React.ReactNode }[] = [
    {
      key: 'max',
      label: 'МАКС',
      icon: <div className="w-5 h-5 rounded bg-amber-400 flex items-center justify-center text-[9px] font-bold text-white">M</div>,
    },
    {
      key: 'telegram',
      label: 'Telegram',
      icon: <MessageSquare className="w-4 h-4" />,
    },
    {
      key: 'email',
      label: 'Email',
      icon: <Mail className="w-4 h-4" />,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={closeRecipientModal}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[540px] mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Настройки получателя уведомлений</h2>
          <button
            onClick={closeRecipientModal}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* User Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Имя пользователя <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={modal.recipientName}
              onChange={(e) => setModalRecipientName(e.target.value)}
              placeholder="Введите имя"
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
              autoFocus
            />
          </div>

          {/* Position */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Должность <span className="text-gray-400 font-normal">(опционально)</span>
            </label>
            <input
              type="text"
              value={modal.recipientPosition}
              onChange={(e) => setModalRecipientPosition(e.target.value)}
              placeholder="Введите должность"
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
            />
          </div>

          {/* Channel Tabs */}
          <div>
            <div className="flex items-center border-b border-gray-200">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setModalActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative ${
                    modal.activeTab === tab.key
                      ? 'text-gray-900'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                  {modal.activeTab === tab.key && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400" />
                  )}
                </button>
              ))}
              {/* Share icon on the right */}
              <div className="ml-auto pr-2">
                <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="pt-4">
              {modal.activeTab === 'max' && (
                <MaxTabContent
                  phone={modal.phone}
                  isLinkGenerated={modal.isLinkGenerated}
                  generatedLink={modal.generatedLink}
                  onPhoneChange={handlePhoneChange}
                  onGenerateLink={generateMaxLink}
                  onCopyLink={copyMaxLink}
                  isConnectEnabled={isConnectMaxEnabled}
                />
              )}
              {modal.activeTab === 'telegram' && (
                <TelegramTabContent />
              )}
              {modal.activeTab === 'email' && (
                <EmailTabContent />
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
          <button
            onClick={closeRecipientModal}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Отменить
          </button>
          <button
            onClick={saveRecipient}
            disabled={!isSaveEnabled}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isSaveEnabled
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

/* ─── MAX Tab ────────────────────────────────────────────── */

function MaxTabContent({
  phone,
  isLinkGenerated,
  generatedLink,
  onPhoneChange,
  onGenerateLink,
  onCopyLink,
  isConnectEnabled,
}: {
  phone: string;
  isLinkGenerated: boolean;
  generatedLink: string;
  onPhoneChange: (v: string) => void;
  onGenerateLink: () => void;
  onCopyLink: () => void;
  isConnectEnabled: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopyLink();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Instruction Block */}
      <div className="bg-blue-50 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <ArrowDown className="w-4 h-4 text-blue-600" />
          </div>
          <div className="space-y-1.5">
            <p className="text-sm text-blue-900 font-medium">Подключение через МАКС</p>
            <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
              <li>Укажите номер получателя и сгенерируйте ссылку</li>
              <li>Отправьте ссылку сотруднику</li>
              <li>
                Сотрудник перейдет в чат-бот, подтвердит свой номер и подписка активируется
                автоматически
              </li>
            </ol>
          </div>
        </div>
      </div>

      {/* Phone Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Номер телефона <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value)}
          placeholder="(XXX) XXX-XX-XX"
          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
        />
      </div>

      {/* Connect Button (before link generation) */}
      {!isLinkGenerated && (
        <button
          onClick={onGenerateLink}
          disabled={!isConnectEnabled}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            isConnectEnabled
              ? 'bg-white text-gray-900 border-2 border-gray-900 hover:bg-gray-50'
              : 'bg-gray-100 text-gray-400 border-2 border-gray-200 cursor-not-allowed'
          }`}
        >
          <div className="w-5 h-5 rounded bg-amber-400 flex items-center justify-center text-[9px] font-bold text-white">
            M
          </div>
          Подключить МАКС
        </button>
      )}

      {/* Link Section (after generation) */}
      {isLinkGenerated && (
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <LinkIcon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-600">
              Сохраните данные получателя и отправьте ему ссылку для подключения:
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 px-3 py-2.5 bg-gray-50 rounded-lg border border-gray-200 text-sm text-blue-600 font-mono truncate">
              {generatedLink}
            </div>
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors flex-shrink-0 ${
                copied
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Скопировано
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Скопировать ссылку
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Telegram Tab ───────────────────────────────────────── */

function TelegramTabContent() {
  return (
    <div className="space-y-4">
      <div className="bg-blue-50 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <MessageSquare className="w-4 h-4 text-blue-600" />
          </div>
          <div className="space-y-1.5">
            <p className="text-sm text-blue-900 font-medium">Подключение через Telegram</p>
            <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
              <li>Введите Telegram username получателя</li>
              <li>Система отправит приглашение в чат</li>
              <li>
                Получатель подтвердит подписку и уведомления начнут доставляться
              </li>
            </ol>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Telegram username <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          placeholder="@username"
          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
        />
      </div>

      <button
        disabled
        className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-400 border-2 border-gray-200 cursor-not-allowed"
      >
        <MessageSquare className="w-4 h-4" />
        Подключить Telegram
      </button>
    </div>
  );
}

/* ─── Email Tab ──────────────────────────────────────────── */

function EmailTabContent() {
  return (
    <div className="space-y-4">
      <div className="bg-blue-50 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Mail className="w-4 h-4 text-blue-600" />
          </div>
          <div className="space-y-1.5">
            <p className="text-sm text-blue-900 font-medium">Подключение через Email</p>
            <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
              <li>Введите email получателя</li>
              <li>Система отправит письмо-подтверждение</li>
              <li>
                Получатель подтвердит подписку по ссылке из письма
              </li>
            </ol>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          placeholder="email@example.com"
          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
        />
      </div>

      <button
        disabled
        className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-400 border-2 border-gray-200 cursor-not-allowed"
      >
        <Mail className="w-4 h-4" />
        Подключить Email
      </button>
    </div>
  );
}
