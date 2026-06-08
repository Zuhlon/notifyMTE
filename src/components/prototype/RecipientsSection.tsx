'use client';

import React, { useState, useCallback } from 'react';
import { usePrototypeStore, ConnectionStatus } from '@/lib/prototype-store';
import {
  Users,
  ChevronDown,
  ChevronRight,
  Plus,
  Search,
  Settings,
  Trash2,
  MessageSquare,
  Mail,
  Check,
  Info,
  AlertTriangle,
  X,
} from 'lucide-react';

function MaxIcon({ status }: { status: ConnectionStatus }) {
  return (
    <div className="relative">
      <div className="flex items-center gap-1">
        <div
          className={`w-6 h-6 rounded flex items-center justify-center text-[9px] font-bold transition-colors ${
            status === 'active'
              ? 'bg-amber-400 text-white'
              : status === 'waiting'
              ? 'bg-amber-100 text-amber-600'
              : 'bg-gray-100 text-gray-400'
          }`}
        >
          M
        </div>
        {status === 'active' && (
          <div className="flex items-center gap-1">
            <span className="text-xs text-green-600 font-medium">Подключен</span>
            <Check className="w-3.5 h-3.5 text-green-600" />
          </div>
        )}
        {status === 'waiting' && (
          <span className="text-xs text-amber-600 font-medium">Ожидает</span>
        )}
        {status === 'not_configured' && (
          <span className="text-xs text-gray-400">не настроен</span>
        )}
      </div>
    </div>
  );
}

function TelegramIcon({ status }: { status: ConnectionStatus }) {
  return (
    <div className="relative">
      <div className="flex items-center gap-1">
        <div
          className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${
            status === 'active'
              ? 'bg-blue-500 text-white'
              : status === 'waiting'
              ? 'bg-blue-100 text-blue-500'
              : 'bg-gray-100 text-gray-400'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
        </div>
        {status === 'active' && (
          <div className="flex items-center gap-1">
            <span className="text-xs text-green-600 font-medium">Подключен</span>
            <Check className="w-3.5 h-3.5 text-green-600" />
          </div>
        )}
        {status === 'waiting' && (
          <span className="text-xs text-amber-600 font-medium">Ожидает</span>
        )}
        {status === 'not_configured' && (
          <span className="text-xs text-gray-400">не настроен</span>
        )}
      </div>
    </div>
  );
}

function StatusIndicator({ status }: { status: ConnectionStatus }) {
  if (status === 'active') {
    return (
      <div className="relative group">
        <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-[11px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
          Подключен
        </div>
      </div>
    );
  }
  if (status === 'waiting') {
    return (
      <div className="relative group">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-[11px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
          Ожидает подтверждения подписки
        </div>
      </div>
    );
  }
  return null;
}

/* ─── Confirmation Dialog ─────────────────────────────────── */

function ConfirmDialog({
  message,
  onConfirm,
  onCancel,
}: {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-xl shadow-xl p-5 w-[360px] space-y-4 animate-slide-in">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-sm font-medium text-gray-900">{message}</p>
        </div>
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Отмена
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-colors"
          >
            Удалить
          </button>
        </div>
      </div>
    </div>
  );
}

export function RecipientsSection() {
  const {
    scenario,
    toggleRecipientsExpanded,
    openAddRecipientModal,
    editRecipient,
    editRecipientWithTab,
    deleteRecipient,
    deleteRecipients,
    openActivationPopup,
    setRecipientSearch,
  } = usePrototypeStore();

  const recipients = scenario.recipients;
  const isExpanded = scenario.isRecipientsExpanded;
  const isNumbersSaved = scenario.isNumbersSaved;

  // Always render, but disable when no numbers saved
  const isDisabled = !isNumbersSaved;

  const allActive = recipients.length > 0 && recipients.every((r) => r.maxStatus === 'active' && r.telegramStatus === 'active');
  const anyWaiting = recipients.some((r) => r.maxStatus === 'waiting' || r.telegramStatus === 'waiting');

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Confirmation state
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

  const filteredRecipients = recipients.filter((r) =>
    r.name.toLowerCase().includes(scenario.recipientSearchQuery.toLowerCase())
  );

  const allFilteredSelected = filteredRecipients.length > 0 && filteredRecipients.every((r) => selectedIds.has(r.id));

  const toggleSelectAll = useCallback(() => {
    if (allFilteredSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredRecipients.map((r) => r.id)));
    }
  }, [allFilteredSelected, filteredRecipients]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSingleDelete = () => {
    if (!confirmDeleteId) return;
    deleteRecipient(confirmDeleteId);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(confirmDeleteId);
      return next;
    });
    setConfirmDeleteId(null);
  };

  const handleBulkDelete = () => {
    const ids = Array.from(selectedIds);
    deleteRecipients(ids);
    setSelectedIds(new Set());
    setConfirmBulkDelete(false);
  };

  return (
    <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden transition-opacity ${isDisabled ? 'opacity-60' : ''}`}>
      {/* Section Header */}
      <div className="relative">
        <button
          onClick={isDisabled ? undefined : toggleRecipientsExpanded}
          disabled={isDisabled}
          className={`w-full flex items-center gap-2.5 px-4 py-3 transition-colors ${
            isDisabled ? 'cursor-not-allowed' : 'hover:bg-gray-50'
          }`}
        >
          {isExpanded && !isDisabled ? (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
              isDisabled ? 'bg-gray-100' : 'bg-purple-50'
            }`}>
              <Users className={`w-3.5 h-3.5 ${isDisabled ? 'text-gray-400' : 'text-purple-600'}`} />
            </div>
            <div className="text-left">
              <h3 className="text-sm font-medium text-gray-900">Получатели уведомлений</h3>
              {!isExpanded && !isDisabled && recipients.length > 0 && (
                <p className="text-[11px] text-gray-500">
                  {recipients.length} {recipients.length === 1 ? 'получатель' : recipients.length < 5 ? 'получателя' : 'получателей'}
                </p>
              )}
            </div>
          </div>
        </button>

        {/* Tooltip for disabled state */}
        {isDisabled && (
          <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 px-3 py-1.5 bg-gray-900 text-white text-[11px] rounded-lg opacity-100 whitespace-nowrap z-50 pointer-events-none">
            Сначала выберите и сохраните источник пропущенных
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45 -mb-1" />
          </div>
        )}
      </div>

      {/* Expanded Content */}
      {isExpanded && !isDisabled && (
        <div className="border-t border-gray-100">
          {/* Add Recipient CTA (when no recipients) */}
          {recipients.length === 0 && (
            <div className="px-4 py-4">
              <p className="text-sm text-gray-500 mb-3">
                Добавьте получателей уведомлений
              </p>
              <button
                onClick={openAddRecipientModal}
                className="flex items-center gap-2 px-4 py-2.5 bg-amber-400 hover:bg-amber-500 text-gray-900 rounded-lg text-sm font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                Добавить получателя
              </button>
            </div>
          )}

          {/* Recipients Table */}
          {recipients.length > 0 && (
            <>
              {/* Search & Add */}
              <div className="px-4 pt-3 pb-2 flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Поиск получателя"
                    value={scenario.recipientSearchQuery}
                    onChange={(e) => setRecipientSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 bg-gray-50"
                  />
                </div>
                <button
                  onClick={openAddRecipientModal}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Добавить
                </button>
              </div>

              {/* Inline Warning Banner - moved to top */}
              {anyWaiting && (
                <div className="mx-4 mt-2 mb-2 flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                  <p className="text-[11px] text-amber-700 leading-relaxed">
                    Некоторые получатели не получают уведомления. Отправьте ссылку для активации
                  </p>
                </div>
              )}

              {/* Bulk actions bar */}
              {selectedIds.size > 0 && (
                <div className="mx-4 mt-2 mb-2 flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                  <span className="text-xs font-medium text-gray-700">
                    Выбрано: {selectedIds.size}
                  </span>
                  <div className="flex-1" />
                  <button
                    onClick={() => setSelectedIds(new Set())}
                    className="text-[11px] text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Снять
                  </button>
                  <button
                    onClick={() => setConfirmBulkDelete(true)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    Удалить
                  </button>
                </div>
              )}

              {/* Select all row */}
              <div className="px-4 pt-1 pb-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allFilteredSelected}
                    onChange={toggleSelectAll}
                    className="w-3.5 h-3.5 rounded border-gray-300 text-amber-400 focus:ring-amber-400"
                  />
                  <span className="text-[11px] text-gray-500 font-medium">
                    Выбрать всех
                  </span>
                </label>
              </div>

              {/* Recipient Rows */}
              <div className="px-4 pb-2">
                {recipients.map((recipient) => (
                  <RecipientRow
                    key={recipient.id}
                    recipient={recipient}
                    isSelected={selectedIds.has(recipient.id)}
                    onSelect={() => toggleSelect(recipient.id)}
                    onEdit={editRecipient}
                    onEditWithTab={editRecipientWithTab}
                    onDelete={() => setConfirmDeleteId(recipient.id)}
                    onActivate={openActivationPopup}
                  />
                ))}
              </div>

              {/* Status Bar - only shows success indicator */}
              {allActive && (
                <div className="px-4 py-2.5 border-t border-gray-100 flex items-center gap-3">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 rounded-lg text-[11px] font-medium border border-green-200">
                    <Check className="w-3.5 h-3.5" />
                    Уведомления отправляются
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Confirmation Dialogs */}
      {confirmDeleteId && (
        <ConfirmDialog
          message={`Удалить получателя «${recipients.find(r => r.id === confirmDeleteId)?.name}»?`}
          onConfirm={handleSingleDelete}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}
      {confirmBulkDelete && (
        <ConfirmDialog
          message={`Удалить ${selectedIds.size} ${selectedIds.size === 1 ? 'получателя' : selectedIds.size < 5 ? 'получателя' : 'получателей'}?`}
          onConfirm={handleBulkDelete}
          onCancel={() => setConfirmBulkDelete(false)}
        />
      )}
    </div>
  );
}

function RecipientRow({
  recipient,
  isSelected,
  onSelect,
  onEdit,
  onEditWithTab,
  onDelete,
  onActivate,
}: {
  recipient: {
    id: string;
    name: string;
    position: string;
    maxStatus: ConnectionStatus;
    telegramStatus: ConnectionStatus;
    emailStatus: ConnectionStatus;
    maxLink: string;
    telegramLink: string;
    telegramAccount: string;
  };
  isSelected: boolean;
  onSelect: () => void;
  onEdit: (id: string) => void;
  onEditWithTab: (id: string, tab: 'max' | 'telegram' | 'email') => void;
  onDelete: () => void;
  onActivate: (id: string, channel: 'max' | 'telegram') => void;
}) {
  // Determine overall status indicator from max + telegram
  const hasAnyActive = recipient.maxStatus === 'active' || recipient.telegramStatus === 'active';
  const hasAnyWaiting = recipient.maxStatus === 'waiting' || recipient.telegramStatus === 'waiting';
  const overallStatus: ConnectionStatus = hasAnyActive ? 'active' : hasAnyWaiting ? 'waiting' : 'not_configured';

  return (
    <div className={`py-2.5 border-b border-gray-50 last:border-b-0 ${isSelected ? 'bg-amber-50/50 rounded-lg' : ''}`}>
      <div className="flex items-start gap-2.5">
        {/* Checkbox */}
        <div className="pt-1.5 flex-shrink-0">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onSelect}
            className="w-3.5 h-3.5 rounded border-gray-300 text-amber-400 focus:ring-amber-400"
          />
        </div>

        {/* Avatar placeholder */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
          hasAnyActive ? 'bg-green-50' : 'bg-gray-100'
        }`}>
          <span className={`text-xs font-medium ${
            hasAnyActive ? 'text-green-700' : 'text-gray-600'
          }`}>
            {recipient.name.charAt(0)}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          {/* Name & Position */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-gray-900">{recipient.name}</span>
            <StatusIndicator status={overallStatus} />
            {recipient.position && (
              <span className="text-[11px] text-gray-500 truncate">— {recipient.position}</span>
            )}
          </div>

          {/* Channels */}
          <div className="flex items-center gap-3">
            {/* MAX Channel - clickable if waiting or not_configured */}
            <div className="relative group">
              <button
                onClick={() => {
                  if (recipient.maxStatus === 'waiting') {
                    onActivate(recipient.id, 'max');
                  } else if (recipient.maxStatus === 'not_configured') {
                    onEdit(recipient.id);
                  }
                }}
                className={`flex items-center gap-1.5 transition-all ${
                  recipient.maxStatus === 'waiting'
                    ? 'cursor-pointer hover:opacity-80 ring-1 ring-amber-300 rounded px-1.5 py-0.5'
                    : recipient.maxStatus === 'not_configured'
                    ? 'cursor-pointer hover:opacity-80 ring-1 ring-gray-200 rounded px-1.5 py-0.5'
                    : ''
                }`}
              >
                <MaxIcon status={recipient.maxStatus} />
              </button>
              {/* Tooltip */}
              {recipient.maxStatus === 'waiting' && (
                <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-900 text-white text-[11px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-normal pointer-events-none z-50 w-52">
                  <p className="font-medium mb-1">МАКС: Ожидает</p>
                  <p className="text-gray-300 leading-relaxed">
                    Получатель ещё не перешёл по ссылке для активации подписки в мессенджере МАКС.
                    Нажмите, чтобы промоделировать подключение.
                  </p>
                </div>
              )}
              {recipient.maxStatus === 'active' && (
                <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-900 text-white text-[11px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-normal pointer-events-none z-50 w-52">
                  <p className="font-medium mb-1">МАКС: Подключен</p>
                  <p className="text-gray-300 leading-relaxed">
                    Получатель подтвердил подписку. Уведомления будут доставляться через МАКС.
                  </p>
                </div>
              )}
              {recipient.maxStatus === 'not_configured' && (
                <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-900 text-white text-[11px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-normal pointer-events-none z-50 w-44">
                  <p className="font-medium mb-1">МАКС: не настроен</p>
                  <p className="text-gray-300">Нажмите для настройки МАКС</p>
                </div>
              )}
            </div>

            {/* Telegram Channel - clickable if waiting or not_configured */}
            <div className="relative group">
              <button
                onClick={() => {
                  if (recipient.telegramStatus === 'waiting') {
                    onActivate(recipient.id, 'telegram');
                  } else if (recipient.telegramStatus === 'not_configured') {
                    onEditWithTab(recipient.id, 'telegram');
                  }
                }}
                className={`flex items-center gap-1.5 transition-all ${
                  recipient.telegramStatus === 'waiting'
                    ? 'cursor-pointer hover:opacity-80 ring-1 ring-amber-300 rounded px-1.5 py-0.5'
                    : recipient.telegramStatus === 'not_configured'
                    ? 'cursor-pointer hover:opacity-80 ring-1 ring-gray-200 rounded px-1.5 py-0.5 opacity-60 hover:opacity-80'
                    : recipient.telegramStatus === 'active'
                    ? ''
                    : 'opacity-40'
                }`}
              >
                <TelegramIcon status={recipient.telegramStatus} />
              </button>
              {/* Tooltip */}
              {recipient.telegramStatus === 'waiting' && (
                <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-900 text-white text-[11px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-normal pointer-events-none z-50 w-52">
                  <p className="font-medium mb-1">Telegram: Ожидает</p>
                  <p className="text-gray-300 leading-relaxed">
                    Получатель ещё не перешёл по ссылке для активации подписки в Telegram.
                    Нажмите, чтобы промоделировать подключение.
                  </p>
                </div>
              )}
              {recipient.telegramStatus === 'active' && (
                <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-900 text-white text-[11px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-normal pointer-events-none z-50 w-52">
                  <p className="font-medium mb-1">Telegram: Подключен</p>
                  <p className="text-gray-300 leading-relaxed">
                    Получатель подтвердил подписку. Уведомления будут доставляться через Telegram.
                  </p>
                </div>
              )}
              {recipient.telegramStatus === 'not_configured' && (
                <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-900 text-white text-[11px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-normal pointer-events-none z-50 w-44">
                  <p className="font-medium mb-1">Telegram: не настроен</p>
                  <p className="text-gray-300">Нажмите для настройки Telegram</p>
                </div>
              )}
            </div>

            {/* Email — coming soon */}
            <div className="relative group">
              <div className="flex items-center gap-1.5 opacity-40 cursor-default">
                <div className="w-6 h-6 rounded flex items-center justify-center bg-gray-100">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                </div>
                <span className="text-[11px] text-gray-400">скоро</span>
              </div>
              <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-900 text-white text-[11px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-normal pointer-events-none z-50 w-44">
                <p className="font-medium mb-1">Email</p>
                <p className="text-gray-300">Канал скоро будет доступен</p>
              </div>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Actions */}
            <button
              onClick={() => onEdit(recipient.id)}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onDelete}
              className="p-1 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
