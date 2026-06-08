'use client';

import React from 'react';
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
} from 'lucide-react';

function StatusBadge({ status }: { status: ConnectionStatus }) {
  switch (status) {
    case 'not_configured':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-500">
          не настроен
        </span>
      );
    case 'waiting':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-100 text-amber-700 cursor-pointer hover:bg-amber-200 transition-colors">
          ожидает
        </span>
      );
    case 'active':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-green-100 text-green-700">
          Подключен
        </span>
      );
  }
}

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

export function RecipientsSection() {
  const {
    scenario,
    toggleRecipientsExpanded,
    openAddRecipientModal,
    editRecipient,
    editRecipientWithTab,
    deleteRecipient,
    openActivationPopup,
    setRecipientSearch,
  } = usePrototypeStore();

  const recipients = scenario.recipients;
  const isExpanded = scenario.isRecipientsExpanded;
  const isNumbersSaved = scenario.isNumbersSaved;

  // Always render, but disable when no numbers saved
  const isDisabled = !isNumbersSaved;

  const allActive = recipients.length > 0 && recipients.every((r) => r.maxStatus === 'active');
  const anyWaiting = recipients.some((r) => r.maxStatus === 'waiting');

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

              {/* Recipient Rows */}
              <div className="px-4 pb-2">
                {recipients.map((recipient) => (
                  <RecipientRow
                    key={recipient.id}
                    recipient={recipient}
                    onEdit={editRecipient}
                    onEditWithTab={editRecipientWithTab}
                    onDelete={deleteRecipient}
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
    </div>
  );
}

function RecipientRow({
  recipient,
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
  };
  onEdit: (id: string) => void;
  onEditWithTab: (id: string, tab: 'telegram' | 'email') => void;
  onDelete: (id: string) => void;
  onActivate: (id: string) => void;
}) {
  return (
    <div className="py-2.5 border-b border-gray-50 last:border-b-0">
      <div className="flex items-start gap-2.5">
        {/* Avatar placeholder */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
          recipient.maxStatus === 'active' ? 'bg-green-50' : 'bg-gray-100'
        }`}>
          <span className={`text-xs font-medium ${
            recipient.maxStatus === 'active' ? 'text-green-700' : 'text-gray-600'
          }`}>
            {recipient.name.charAt(0)}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          {/* Name & Position */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-gray-900">{recipient.name}</span>
            <StatusIndicator status={recipient.maxStatus} />
            {recipient.position && (
              <span className="text-[11px] text-gray-500 truncate">— {recipient.position}</span>
            )}
          </div>

          {/* Channels */}
          <div className="flex items-center gap-3">
            {/* MAX Channel - clickable if waiting */}
            <div className="relative group">
              <button
                onClick={() => {
                  if (recipient.maxStatus === 'waiting') {
                    onActivate(recipient.id);
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
            </div>

            {/* Telegram - clickable when not configured */}
            <div className="relative group">
              <button
                onClick={() => {
                  if (recipient.telegramStatus === 'not_configured') {
                    onEditWithTab(recipient.id, 'telegram');
                  }
                }}
                className={`flex items-center gap-1.5 transition-all rounded px-1.5 py-0.5 ${
                  recipient.telegramStatus === 'not_configured'
                    ? 'opacity-50 hover:opacity-80 cursor-pointer ring-1 ring-gray-200 hover:ring-gray-300'
                    : 'opacity-40'
                }`}
              >
                <div className="w-6 h-6 rounded flex items-center justify-center bg-gray-100">
                  <MessageSquare className="w-3.5 h-3.5 text-gray-400" />
                </div>
                <span className="text-[11px] text-gray-400">не настроен</span>
              </button>
              {recipient.telegramStatus === 'not_configured' && (
                <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-900 text-white text-[11px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-normal pointer-events-none z-50 w-44">
                  <p className="font-medium mb-1">Telegram: не настроен</p>
                  <p className="text-gray-300">Нажмите для настройки Telegram</p>
                </div>
              )}
            </div>

            {/* Email - clickable when not configured */}
            <div className="relative group">
              <button
                onClick={() => {
                  if (recipient.emailStatus === 'not_configured') {
                    onEditWithTab(recipient.id, 'email');
                  }
                }}
                className={`flex items-center gap-1.5 transition-all rounded px-1.5 py-0.5 ${
                  recipient.emailStatus === 'not_configured'
                    ? 'opacity-50 hover:opacity-80 cursor-pointer ring-1 ring-gray-200 hover:ring-gray-300'
                    : 'opacity-40'
                }`}
              >
                <div className="w-6 h-6 rounded flex items-center justify-center bg-gray-100">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                </div>
                <span className="text-[11px] text-gray-400">не настроен</span>
              </button>
              {recipient.emailStatus === 'not_configured' && (
                <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-900 text-white text-[11px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-normal pointer-events-none z-50 w-44">
                  <p className="font-medium mb-1">Email: не настроен</p>
                  <p className="text-gray-300">Нажмите для настройки Email</p>
                </div>
              )}
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
              onClick={() => onDelete(recipient.id)}
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
