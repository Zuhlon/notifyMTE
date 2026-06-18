'use client';

import React, { useMemo, useState, useRef } from 'react';
import { usePrototypeStore, ChannelTab, Recipient } from '@/lib/prototype-store';
import {
  X,
  Check,
  MessageSquare,
  Mail,
  Share2,
  Copy,
  Unplug,
  Plus,
  UserPlus,
  Clock,
  AlertCircle,
} from 'lucide-react';

export function AddRecipientModal() {
  const {
    modal,
    scenario,
    scenarioStates,
    activeScenarioId,
    closeRecipientModal,
    setModalRecipientName,
    setModalRecipientPosition,
    setModalActiveTab,
    setModalPhone,
    setModalTelegramAccount,
    generateMaxLink,
    generateTelegramLink,
    saveRecipient,
    disconnectChannel,
    importRecipientFromOtherScenario,
    modal: { editingMaxStatus, editingTelegramStatus },
  } = usePrototypeStore();

  const [quickAddSearch, setQuickAddSearch] = useState('');
  const [showQuickAdd, setShowQuickAdd] = useState(true);

  const isEditing = !!modal.editingRecipientId;
  const isSaveEnabled = modal.recipientName.trim().length > 0;
  const isConnectMaxEnabled = modal.activeTab === 'max' && modal.isPhoneValid;
  const isConnectTelegramEnabled = modal.activeTab === 'telegram' && modal.isTelegramInputValid;
  const hasActiveLink = (modal.activeTab === 'max' && modal.isLinkGenerated)
    || (modal.activeTab === 'telegram' && modal.isTelegramLinkGenerated);

  // ── Recipients from other scenarios ──
  const otherRecipients = useMemo(() => {
    const result: { recipient: Recipient; scenarioName: string }[] = [];
    const seen = new Set<string>();
    for (const [sid, state] of Object.entries(scenarioStates)) {
      if (sid === activeScenarioId) continue;
      for (const r of state.recipients) {
        const key = `${r.phone.replace(/\D/g, '')}:${r.telegramAccount.toLowerCase().trim()}`;
        if (seen.has(key)) continue;
        seen.add(key);
        result.push({ recipient: r, scenarioName: state.name });
      }
    }
    return result;
  }, [scenarioStates, activeScenarioId]);

  const filteredOtherRecipients = useMemo(() => {
    if (!quickAddSearch.trim()) return otherRecipients;
    const q = quickAddSearch.toLowerCase();
    return otherRecipients.filter(
      (r) =>
        r.recipient.name.toLowerCase().includes(q) ||
        r.recipient.phone.replace(/\D/g, '').includes(q.replace(/\D/g, '')) ||
        r.recipient.telegramAccount.toLowerCase().includes(q) ||
        r.scenarioName.toLowerCase().includes(q)
    );
  }, [otherRecipients, quickAddSearch]);

  const hasOtherRecipients = otherRecipients.length > 0;

  // ── Duplicate detection on phone / telegram input ──
  const allExistingRecipients = useMemo(() => {
    const all: Recipient[] = [...scenario.recipients];
    for (const state of Object.values(scenarioStates)) {
      all.push(...state.recipients);
    }
    return all;
  }, [scenario.recipients, scenarioStates]);

  const duplicateRecipient = useMemo(() => {
    if (isEditing) return null;
    const digits = modal.phone.replace(/\D/g, '');
    const tg = modal.telegramAccount.toLowerCase().trim();
    if (!digits && !tg) return null;
    return allExistingRecipients.find((r) => {
      const rDigits = r.phone.replace(/\D/g, '');
      const rTg = r.telegramAccount.toLowerCase().trim();
      return (digits && rDigits && digits.length >= 3 && digits === rDigits) || (tg && rTg && tg === rTg);
    });
  }, [modal.phone, modal.telegramAccount, allExistingRecipients, isEditing]);

  const duplicateScenarioName = useMemo(() => {
    if (!duplicateRecipient) return '';
    for (const [sid, state] of Object.entries(scenarioStates)) {
      if (state.recipients.some((r) => r.id === duplicateRecipient.id)) return state.name;
    }
    return scenario.name;
  }, [duplicateRecipient, scenarioStates, scenario.name]);

  if (!modal.isOpen) return null;

  const applyDuplicate = () => {
    if (!duplicateRecipient) return;
    setModalRecipientName(duplicateRecipient.name);
    setModalRecipientPosition(duplicateRecipient.position);
    setModalPhone(duplicateRecipient.phone);
    setModalTelegramAccount(duplicateRecipient.telegramAccount);
    if (duplicateRecipient.maxStatus !== 'not_configured') {
      setModalActiveTab('max');
    }
  };

  // ── Phone formatter ──
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

  const modalTitle = isEditing ? 'Редактирование получателя' : 'Настройки получателя уведомлений';

  const saveLabel = hasActiveLink
    ? 'Сохранить и скопировать ссылку'
    : isEditing
    ? 'Сохранить'
    : 'Добавить получателя';

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/30 transition-opacity"
        onClick={closeRecipientModal}
      />

      <div className="absolute right-0 top-0 bottom-0 w-full max-w-[480px] bg-white shadow-2xl flex flex-col animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">{modalTitle}</h2>
          <button
            onClick={closeRecipientModal}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* ── Quick Add from Other Scenarios (only when adding new) ── */}
          {!isEditing && hasOtherRecipients && (
            <div>
              <button
                onClick={() => setShowQuickAdd((v) => !v)}
                className="flex items-center gap-2 w-full text-left mb-2"
              >
                <UserPlus className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Быстрое добавление
                </span>
                <span className="text-[10px] text-gray-400 bg-gray-100 rounded-full px-1.5 py-0.5">
                  {otherRecipients.length}
                </span>
                <span className="text-[10px] text-gray-400 ml-auto">{showQuickAdd ? 'свернуть' : 'развернуть'}</span>
              </button>

              {showQuickAdd && (
                <>
                  {/* Search */}
                  <div className="relative mb-2">
                    <input
                      type="text"
                      placeholder="Поиск по имени, номеру, сценарию..."
                      value={quickAddSearch}
                      onChange={(e) => setQuickAddSearch(e.target.value)}
                      className="w-full pl-3 pr-3 py-2 rounded-lg border border-gray-200 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 bg-gray-50"
                    />
                  </div>

                  {/* Recipient list */}
                  <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
                    {filteredOtherRecipients.length === 0 && (
                      <p className="text-xs text-gray-400 text-center py-2">Ничего не найдено</p>
                    )}
                    {filteredOtherRecipients.map(({ recipient: r, scenarioName }) => (
                      <button
                        key={r.id}
                        onClick={() => importRecipientFromOtherScenario(r)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-colors text-left group"
                      >
                        {/* Avatar */}
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                          r.maxStatus === 'active' || r.telegramStatus === 'active'
                            ? 'bg-green-50'
                            : 'bg-gray-100'
                        }`}>
                          <span className={`text-[10px] font-medium ${
                            r.maxStatus === 'active' || r.telegramStatus === 'active'
                              ? 'text-green-700'
                              : 'text-gray-600'
                          }`}>
                            {r.name.charAt(0)}
                          </span>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-medium text-gray-900 truncate">{r.name}</span>
                            {r.position && (
                              <span className="text-[10px] text-gray-400 truncate">— {r.position}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-gray-400 truncate">{scenarioName}</span>
                            {/* Channel badges */}
                            {r.maxStatus !== 'not_configured' && (
                              <span className={`text-[9px] font-medium px-1.5 py-px rounded ${
                                r.maxStatus === 'active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                              }`}>
                                М
                              </span>
                            )}
                            {r.telegramStatus !== 'not_configured' && (
                              <span className={`text-[9px] font-medium px-1.5 py-px rounded ${
                                r.telegramStatus === 'active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                              }`}>
                                TG
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Add icon */}
                        <Plus className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 transition-colors flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Divider when both sections visible */}
          {!isEditing && hasOtherRecipients && (
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-[10px] text-gray-400 uppercase tracking-wider">или введите вручную</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>
          )}

          {/* Step 1 — Имя получателя */}
          <div className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-indigo-500 text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
            <div className="flex-1 min-w-0">
              <label className="block text-[11px] font-medium text-gray-500 mb-1 uppercase tracking-wider">Имя получателя</label>
              <p className="text-[11px] text-gray-400 mb-1.5">Укажите ФИО сотрудника для идентификации</p>
              <input
                type="text"
                value={modal.recipientName}
                onChange={(e) => setModalRecipientName(e.target.value)}
                placeholder="Введите имя"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
                autoFocus
              />
            </div>
          </div>

          {/* Step 2 — Должность */}
          <div className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-indigo-500 text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
            <div className="flex-1 min-w-0">
              <label className="block text-[11px] font-medium text-gray-500 mb-1 uppercase tracking-wider">Должность</label>
              <p className="text-[11px] text-gray-400 mb-1.5">Опционально, для удобства навигации</p>
              <input
                type="text"
                value={modal.recipientPosition}
                onChange={(e) => setModalRecipientPosition(e.target.value)}
                placeholder="Введите должность"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
              />
            </div>
          </div>

          {/* Step 3 — Канал уведомлений */}
          <div className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-indigo-500 text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
            <div className="flex-1 min-w-0">
              <label className="block text-[11px] font-medium text-gray-500 mb-1 uppercase tracking-wider">Канал уведомлений</label>
              <p className="text-[11px] text-gray-400 mb-2">Выберите мессенджер и подключите получателя</p>

              {/* Channel Tabs */}
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
                <div className="ml-auto pr-2">
                  <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <div className="pt-3">
                {modal.activeTab === 'max' && (
                  <MaxTabContent
                    phone={modal.phone}
                    isLinkGenerated={modal.isLinkGenerated}
                    generatedLink={modal.generatedLink}
                    onPhoneChange={handlePhoneChange}
                    onGenerateLink={generateMaxLink}
                    isConnectEnabled={isConnectMaxEnabled}
                    currentStatus={editingMaxStatus}
                    isEditing={isEditing}
                    onDisconnect={() => disconnectChannel('max')}
                  />
                )}
                {modal.activeTab === 'telegram' && (
                  <TelegramTabContent
                    account={modal.telegramAccount}
                    isLinkGenerated={modal.isTelegramLinkGenerated}
                    generatedLink={modal.generatedTelegramLink}
                    onAccountChange={setModalTelegramAccount}
                    onGenerateLink={generateTelegramLink}
                    isConnectEnabled={isConnectTelegramEnabled}
                    currentStatus={editingTelegramStatus}
                    isEditing={isEditing}
                    onDisconnect={() => disconnectChannel('telegram')}
                  />
                )}
                {modal.activeTab === 'email' && (
                  <EmailTabContent />
                )}
              </div>
            </div>
          </div>

          {/* ── Duplicate Detection Banner ── */}
          {duplicateRecipient && (
            <div className="flex items-start gap-3 px-4 py-3 bg-indigo-50 border border-indigo-200 rounded-xl">
              <AlertCircle className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-indigo-900 mb-0.5">
                  Найден получатель: {duplicateRecipient.name}
                </p>
                <p className="text-[11px] text-indigo-600 mb-2">
                  {duplicateRecipient.position && `${duplicateRecipient.position}, `}
                  {duplicateScenarioName}
                  {duplicateRecipient.maxStatus !== 'not_configured' && ' · МАКС подключен'}
                  {duplicateRecipient.telegramStatus !== 'not_configured' && ' · Telegram подключен'}
                </p>
                <button
                  onClick={applyDuplicate}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-medium rounded-lg transition-colors"
                >
                  <UserPlus className="w-3 h-3" />
                  Использовать эти данные
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center gap-2 bg-white">
          <button
            onClick={closeRecipientModal}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Отменить
          </button>
          <button
            onClick={saveRecipient}
            disabled={!isSaveEnabled}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              isSaveEnabled
                ? 'bg-amber-400 text-gray-900 hover:bg-amber-500'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {hasActiveLink && <Copy className="w-4 h-4" />}
            {saveLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Attractive Instruction Stepper ─────────────────────── */

function InstructionStepper({ steps }: { steps: string[] }) {
  return (
    <div className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-3.5 py-2.5 mb-3 relative overflow-hidden">
      <div className="relative z-10 flex items-center gap-1.5 flex-wrap">
        {steps.map((step, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span className="text-white/40 text-xs select-none">→</span>}
            <span className="text-[10px] text-white font-medium bg-white/15 rounded-md px-2 py-0.5 whitespace-nowrap">
              {step}
            </span>
          </React.Fragment>
        ))}
      </div>
      <div className="absolute -right-3 -bottom-3 w-14 h-14 bg-white/10 rounded-full" />
    </div>
  );
}

/* ─── Link Copy Button ───────────────────────────────────── */

function CopyLinkButton({ link, channel }: { link: string; channel: 'max' | 'telegram' }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  const handleCopy = () => {
    const messengerName = channel === 'telegram' ? 'Telegram' : 'МАКС';
    const step3Action = channel === 'telegram'
      ? 'В открывшемся боте нажмите «Start» для активации подписки на уведомления'
      : 'В чат-боте подтвердите подписку на уведомления';
    const textToCopy = [
      `Подключение уведомлений о пропущенных через ${messengerName}`,
      '',
      `Ссылка для подключения:`,
      link,
      '',
      `Инструкция для получателя:`,
      `1. Откройте ${messengerName} на телефоне`,
      `2. Перейдите по ссылке выше`,
      `3. ${step3Action}`,
    ].join('\n');
    navigator.clipboard?.writeText(textToCopy).catch(() => {});
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2500);
  };

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
        copied
          ? 'bg-green-50 text-green-700 border border-green-200'
          : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
      }`}
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5" />
          Скопировано
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5" />
          Скопировать ссылку
        </>
      )}
    </button>
  );
}

/* ─── MAX Tab ────────────────────────────────────────────── */

function MaxTabContent({
  phone,
  isLinkGenerated,
  generatedLink,
  onPhoneChange,
  onGenerateLink,
  isConnectEnabled,
  currentStatus,
  isEditing,
  onDisconnect,
}: {
  phone: string;
  isLinkGenerated: boolean;
  generatedLink: string;
  onPhoneChange: (v: string) => void;
  onGenerateLink: () => void;
  isConnectEnabled: boolean;
  currentStatus: string;
  isEditing: boolean;
  onDisconnect: () => void;
}) {
  const isConnected = currentStatus === 'active' || currentStatus === 'waiting';
  const showConnectedView = isEditing && isConnected;

  return (
    <div className="space-y-3">
      {/* ── Editing: connected status + link + copy ── */}
      {showConnectedView && (
        <>
          {/* Status badge */}
          <div className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg ${
            currentStatus === 'active'
              ? 'bg-green-50 border border-green-200'
              : 'bg-amber-50 border border-amber-200'
          }`}>
            {currentStatus === 'active' ? (
              <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
            ) : (
              <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />
            )}
            <span className={`text-sm font-medium ${
              currentStatus === 'active' ? 'text-green-700' : 'text-amber-700'
            }`}>
              {currentStatus === 'active' ? 'Подключен' : 'Ожидает подтверждения'}
            </span>
          </div>

          {/* Link + Copy */}
          {generatedLink && (
            <div className="space-y-2">
              <div className="px-3 py-2.5 bg-gray-50 rounded-lg border border-gray-200 text-sm text-blue-600 font-mono truncate">
                {generatedLink}
              </div>
              <CopyLinkButton link={generatedLink} channel="max" />
            </div>
          )}

          {/* Disconnect */}
          <button
            onClick={onDisconnect}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 bg-red-50 border-2 border-red-200 hover:bg-red-100 transition-colors w-full"
          >
            <Unplug className="w-4 h-4" />
            Отключить МАКС
          </button>
        </>
      )}

      {/* ── Normal flow: not editing or not connected ── */}
      {!showConnectedView && (
        <>
          <InstructionStepper steps={['1. Номер', '2. Подключить', '3. Отправить ссылку']} />

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
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
            />
          </div>

          {/* Connect Button */}
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

          {/* Link Preview (after generation) */}
          {isLinkGenerated && (
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-600">
                  Ссылка готова! Нажмите <span className="font-medium text-gray-900">«Сохранить и скопировать ссылку»</span> внизу — ссылка и инструкция скопируются в буфер. Отправьте получателю.
                </p>
              </div>
              <div className="px-3 py-2.5 bg-gray-50 rounded-lg border border-gray-200 text-sm text-blue-600 font-mono truncate">
                {generatedLink}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ─── Telegram Tab ───────────────────────────────────────── */

function TelegramTabContent({
  account,
  isLinkGenerated,
  generatedLink,
  onAccountChange,
  onGenerateLink,
  isConnectEnabled,
  currentStatus,
  isEditing,
  onDisconnect,
}: {
  account: string;
  isLinkGenerated: boolean;
  generatedLink: string;
  onAccountChange: (v: string) => void;
  onGenerateLink: () => void;
  isConnectEnabled: boolean;
  currentStatus: string;
  isEditing: boolean;
  onDisconnect: () => void;
}) {
  const isConnected = currentStatus === 'active' || currentStatus === 'waiting';
  const showConnectedView = isEditing && isConnected;

  return (
    <div className="space-y-3">
      {/* ── Editing: connected status + link + copy ── */}
      {showConnectedView && (
        <>
          {/* Status badge */}
          <div className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg ${
            currentStatus === 'active'
              ? 'bg-green-50 border border-green-200'
              : 'bg-amber-50 border border-amber-200'
          }`}>
            {currentStatus === 'active' ? (
              <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
            ) : (
              <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />
            )}
            <span className={`text-sm font-medium ${
              currentStatus === 'active' ? 'text-green-700' : 'text-amber-700'
            }`}>
              {currentStatus === 'active' ? 'Подключен' : 'Ожидает подтверждения'}
            </span>
          </div>

          {/* Link + Copy */}
          {generatedLink && (
            <div className="space-y-2">
              <div className="px-3 py-2.5 bg-gray-50 rounded-lg border border-gray-200 text-sm text-blue-600 font-mono truncate">
                {generatedLink}
              </div>
              <CopyLinkButton link={generatedLink} channel="telegram" />
            </div>
          )}

          {/* Disconnect */}
          <button
            onClick={onDisconnect}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 bg-red-50 border-2 border-red-200 hover:bg-red-100 transition-colors w-full"
          >
            <Unplug className="w-4 h-4" />
            Отключить Telegram
          </button>
        </>
      )}

      {/* ── Normal flow: not editing or not connected ── */}
      {!showConnectedView && (
        <>
          <InstructionStepper steps={['1. Аккаунт', '2. Подключить', '3. Отправить ссылку']} />

          {/* Telegram Account Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Номер или Telegram-аккаунт <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={account}
              onChange={(e) => onAccountChange(e.target.value)}
              placeholder="@username или номер телефона"
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
            />
          </div>

          {/* Connect Button */}
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
              <MessageSquare className="w-4 h-4" />
              Подключить Telegram
            </button>
          )}

          {/* Link Preview (after generation) */}
          {isLinkGenerated && (
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-600">
                  Ссылка готова! Нажмите <span className="font-medium text-gray-900">«Сохранить и скопировать ссылку»</span> внизу — ссылка и инструкция скопируются в буфер. Отправьте получателю.
                </p>
              </div>
              <div className="px-3 py-2.5 bg-gray-50 rounded-lg border border-gray-200 text-sm text-blue-600 font-mono truncate">
                {generatedLink}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ─── Email Tab ──────────────────────────────────────────── */

function EmailTabContent() {
  return (
    <div className="flex flex-col items-center justify-center py-10">
      <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
        <Mail className="w-6 h-6 text-gray-400" />
      </div>
      <p className="text-sm font-medium text-gray-500 mb-1">
        Канал Email
      </p>
      <p className="text-xs text-gray-400">
        Скоро будет доступен
      </p>
    </div>
  );
}