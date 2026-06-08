'use client';

import React, { useState, useRef, useCallback } from 'react';
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
  Copy,
  Check,
  ExternalLink,
  Info,
  AlertCircle,
  Shield,
} from 'lucide-react';

function StatusBadge({ status }: { status: ConnectionStatus }) {
  switch (status) {
    case 'not_configured':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
          не настроен
        </span>
      );
    case 'waiting':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
          ожидает
        </span>
      );
    case 'active':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
          активен
        </span>
      );
  }
}

function MaxIcon({ status }: { status: ConnectionStatus }) {
  return (
    <div className="relative">
      <div className="flex items-center gap-1">
        <div
          className={`w-6 h-6 rounded flex items-center justify-center text-[9px] font-bold ${
            status === 'active'
              ? 'bg-amber-400 text-white'
              : status === 'waiting'
              ? 'bg-amber-100 text-amber-600'
              : 'bg-gray-100 text-gray-400'
          }`}
        >
          M
        </div>
        {status === 'active' && <Check className="w-3.5 h-3.5 text-green-600" />}
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
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
          Подключен
        </div>
      </div>
    );
  }
  if (status === 'waiting') {
    return (
      <div className="relative group">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
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
    isRecipientsExpanded,
    toggleRecipientsExpanded,
    openAddRecipientModal,
    editRecipient,
    deleteRecipient,
    simulateActivation,
    setRecipientSearch,
    recipients: _unused,
  } = usePrototypeStore();

  const recipients = scenario.recipients;
  const isExpanded = scenario.isRecipientsExpanded;

  if (!scenario.isNumbersSaved) return null;

  const allActive = recipients.length > 0 && recipients.every((r) => r.maxStatus === 'active');
  const anyWaiting = recipients.some((r) => r.maxStatus === 'waiting');

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Section Header */}
      <button
        onClick={toggleRecipientsExpanded}
        className="w-full flex items-center gap-3 px-4 py-4 hover:bg-gray-50 transition-colors"
      >
        {isExpanded ? (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-400" />
        )}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center">
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-medium text-gray-900">Получатели уведомлений</h3>
            {!isExpanded && recipients.length > 0 && (
              <p className="text-xs text-gray-500">
                {recipients.length} {recipients.length === 1 ? 'получатель' : 'получателей'}
              </p>
            )}
          </div>
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
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
              <div className="px-4 pt-3 pb-2 flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Поиск"
                    value={scenario.recipientSearchQuery}
                    onChange={(e) => setRecipientSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 bg-gray-50"
                  />
                </div>
                <button
                  onClick={openAddRecipientModal}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Добавить
                </button>
              </div>

              {/* Recipient Rows */}
              <div className="px-4 pb-2">
                {recipients.map((recipient) => (
                  <RecipientRow
                    key={recipient.id}
                    recipient={recipient}
                    onEdit={editRecipient}
                    onDelete={deleteRecipient}
                    onSimulateActivation={simulateActivation}
                  />
                ))}
              </div>

              {/* Status Bar */}
              <div className="px-4 py-3 border-t border-gray-100 flex items-center gap-4">
                {allActive ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-medium">
                    <Check className="w-3.5 h-3.5 text-green-400" />
                    Уведомления отправляются
                  </div>
                ) : anyWaiting ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium">
                    <Info className="w-3.5 h-3.5" />
                    Уведомления не отправляются
                  </div>
                ) : null}
                {anyWaiting && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <ExternalLink className="w-3.5 h-3.5" />
                    Отправьте пользователю ссылку для активации
                  </div>
                )}
              </div>
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
  onDelete,
  onSimulateActivation,
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
  onDelete: (id: string) => void;
  onSimulateActivation: (id: string) => void;
}) {
  return (
    <div className="py-3 border-b border-gray-50 last:border-b-0">
      <div className="flex items-start gap-3">
        {/* Avatar placeholder */}
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-xs font-medium text-gray-600">
            {recipient.name.charAt(0)}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          {/* Name & Position */}
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-sm font-medium text-gray-900">{recipient.name}</span>
            <StatusIndicator status={recipient.maxStatus} />
            {recipient.position && (
              <span className="text-xs text-gray-500">— {recipient.position}</span>
            )}
          </div>

          {/* Channels */}
          <div className="flex items-center gap-3">
            {/* MAX Channel */}
            <div className="relative group">
              <button
                onClick={() => {
                  if (recipient.maxStatus === 'waiting') {
                    onSimulateActivation(recipient.id);
                  }
                }}
                className="flex items-center gap-1.5"
                title={recipient.maxStatus === 'waiting' ? 'Нажмите для симуляции активации (прототип)' : ''}
              >
                <MaxIcon status={recipient.maxStatus} />
              </button>
              {/* Tooltip */}
              {recipient.maxStatus === 'waiting' && (
                <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-normal pointer-events-none z-50 w-48">
                  <p className="font-medium mb-1">МАКС: Ожидает</p>
                  <p className="text-gray-300">
                    Получатель ещё не перешёл по ссылке для активации подписки в мессенджере МАКС
                  </p>
                </div>
              )}
              {recipient.maxStatus === 'active' && (
                <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-normal pointer-events-none z-50 w-48">
                  <p className="font-medium mb-1">МАКС: Подключен</p>
                  <p className="text-gray-300">
                    Получатель подтвердил подписку. Уведомления будут доставляться через МАКС
                  </p>
                </div>
              )}
            </div>

            {/* Telegram */}
            <div className="relative group">
              <div className="flex items-center gap-1.5 opacity-40">
                <div className="w-6 h-6 rounded flex items-center justify-center bg-gray-100">
                  <MessageSquare className="w-3.5 h-3.5 text-gray-400" />
                </div>
              </div>
              <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-normal pointer-events-none z-50 w-44">
                <p className="font-medium mb-1">Telegram: не настроен</p>
                <p className="text-gray-300">Нажмите на иконку шестеренки для настройки</p>
              </div>
            </div>

            {/* Email */}
            <div className="relative group">
              <div className="flex items-center gap-1.5 opacity-40">
                <div className="w-6 h-6 rounded flex items-center justify-center bg-gray-100">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                </div>
              </div>
              <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-normal pointer-events-none z-50 w-44">
                <p className="font-medium mb-1">Email: не настроен</p>
                <p className="text-gray-300">Нажмите на иконку шестеренки для настройки</p>
              </div>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Actions */}
            <button
              onClick={() => onEdit(recipient.id)}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(recipient.id)}
              className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
