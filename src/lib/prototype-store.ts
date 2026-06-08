import { create } from 'zustand';

export type SourceType = 'employee_numbers' | 'multi_channel' | 'departments' | 'call_centers';
export type ChannelTab = 'max' | 'telegram' | 'email';
export type ConnectionStatus = 'not_configured' | 'waiting' | 'active';

export interface Employee {
  id: string;
  shortNumber: string;
  phone: string;
  sip: string;
  name: string;
  selected: boolean;
}

export interface SelectableItem {
  id: string;
  code: string;
  name: string;
  selected: boolean;
}

export interface Recipient {
  id: string;
  name: string;
  position: string;
  phone: string;
  maxStatus: ConnectionStatus;
  telegramStatus: ConnectionStatus;
  emailStatus: ConnectionStatus;
  maxLink: string;
  telegramAccount: string;
  telegramLink: string;
  activeTab: ChannelTab;
}

export interface Scenario {
  id: string;
  name: string;
  sourceType: SourceType;
  isSourceCollapsed: boolean;
  isNumbersSaved: boolean;
  isRecipientsExpanded: boolean;
  isScenarioSaved: boolean;
  employees: Employee[];
  multiChannelNumbers: SelectableItem[];
  departments: SelectableItem[];
  callCenters: SelectableItem[];
  recipients: Recipient[];
  showSavedNotification: boolean;
  filterMode: 'all' | 'selected';
  searchQuery: string;
  recipientSearchQuery: string;
}

interface ModalState {
  isOpen: boolean;
  editingRecipientId: string | null;
  recipientName: string;
  recipientPosition: string;
  activeTab: ChannelTab;
  phone: string;
  isLinkGenerated: boolean;
  isPhoneValid: boolean;
  generatedLink: string;
  isSaving: boolean;
  telegramAccount: string;
  isTelegramLinkGenerated: boolean;
  generatedTelegramLink: string;
  isTelegramInputValid: boolean;
 editingMaxStatus: ConnectionStatus;
  editingTelegramStatus: ConnectionStatus;
}

interface ActivationPopup {
  visible: boolean;
  channel: 'max' | 'telegram';
  recipientId: string;
  recipientName: string;
  link: string;
}

interface ScenarioListItem {
  id: string;
  name: string;
  sourceType: SourceType;
  selectedCount: number;
  recipientCount: number;
}

export interface CJStep {
  id: string;
  label: string;
  emotion: string;
  comment: string;
}

interface PrototypeStore {
  // Main state
  scenarios: ScenarioListItem[];
  activeScenarioId: string;
  scenario: Scenario;
  scenarioStates: Record<string, Scenario>;
  modal: ModalState;
  activationPopup: ActivationPopup;

  // CJ tracker
  cjSteps: CJStep[];
  cjExpandedStep: string | null;
  cjCollapsed: boolean;
  cjHidden: boolean;
  setStepEmotion: (stepId: string, emotion: string) => void;
  setStepComment: (stepId: string, comment: string) => void;
  toggleStepExpanded: (stepId: string) => void;
  toggleCJCollapsed: () => void;
  toggleCJHidden: () => void;
  exportCJResults: () => string;

  // Toast notifications
  toast: { message: string; visible: boolean };

  // Scenario sidebar actions
  selectScenario: (id: string) => void;
  addScenario: () => void;
  renameScenario: (name: string) => void;
  deleteScenario: (id: string) => void;

  // Source type
  setSourceType: (type: SourceType) => void;
  toggleSourceCollapsed: () => void;

  // Employee / item selection (generic)
  toggleSelection: (sourceType: SourceType, id: string) => void;
  selectAll: (sourceType: SourceType) => void;
  deselectAll: (sourceType: SourceType) => void;
  setEmployeeFilter: (mode: 'all' | 'selected') => void;
  setEmployeeSearch: (query: string) => void;
  saveSelectedNumbers: () => void;
  cancelSelection: () => void;

  // Recipients section
  toggleRecipientsExpanded: () => void;
  setRecipientSearch: (query: string) => void;

  // Modal actions
  openAddRecipientModal: () => void;
  closeRecipientModal: () => void;
  setModalRecipientName: (name: string) => void;
  setModalRecipientPosition: (position: string) => void;
  setModalActiveTab: (tab: ChannelTab) => void;
  setModalPhone: (phone: string) => void;
  generateMaxLink: () => void;
  copyMaxLink: () => void;
  setModalTelegramAccount: (account: string) => void;
  generateTelegramLink: () => void;
  saveRecipient: () => void;
  disconnectChannel: (channel: 'max' | 'telegram') => void;
  resetModal: () => void;

  // Recipient actions
  editRecipient: (id: string) => void;
  editRecipientWithTab: (id: string, tab: ChannelTab) => void;
  deleteRecipient: (id: string) => void;

  // Activation popup
  openActivationPopup: (recipientId: string, channel: 'max' | 'telegram') => void;
  closeActivationPopup: () => void;
  confirmActivation: () => void;

  // Notifications
  dismissSavedNotification: () => void;
  showToast: (message: string) => void;
  dismissToast: () => void;

  // Scenario save
  saveScenario: () => void;

  // Navigation
  closeAll: () => void;
}

function pluralize(n: number, one: string, few: string, many: string): string {
  const abs = Math.abs(n);
  const mod10 = abs % 10;
  const mod100 = abs % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}

const SOURCE_TYPE_LABELS: Record<SourceType, { one: string; few: string; many: string }> = {
  employee_numbers: { one: 'номер сотрудника', few: 'номера сотрудников', many: 'номеров сотрудников' },
  multi_channel: { one: 'многоканальный номер', few: 'многоканальных номера', many: 'многоканальных номеров' },
  departments: { one: 'отдел', few: 'отдела', many: 'отделов' },
  call_centers: { one: 'колл-центр', few: 'колл-центра', many: 'колл-центров' },
};

function getSourceLabel(type: SourceType, count: number): string {
  const labels = SOURCE_TYPE_LABELS[type];
  return pluralize(count, labels.one, labels.few, labels.many);
}

export { SOURCE_TYPE_LABELS, getSourceLabel };

const MOCK_EMPLOYEES: Employee[] = Array.from({ length: 50 }, (_, i) => ({
  id: `emp-${i + 1}`,
  shortNumber: i < 4 ? '201' : i < 8 ? '202' : i < 12 ? '203' : i < 16 ? '204' : `${200 + Math.floor(i / 4)}`,
  phone: `+7 (${900 + Math.floor(Math.random() * 99)}) ${String(Math.floor(Math.random() * 900) + 100).slice(0, 3)}-${String(Math.floor(Math.random() * 90) + 10).padStart(3, '0')}-${String(Math.floor(Math.random() * 90) + 10)}`,
  sip: `SIP02RBTU${String(i + 1).padStart(4, '0')}L5`,
  name: [
    'Константин Кристоводжинский',
    'Александр Петров',
    'Мария Иванова',
    'Дмитрий Сидоров',
    'Елена Смирнова',
    'Андрей Волков',
    'Ольга Новикова',
    'Сергей Морозов',
    'Наталья Лебедева',
    'Павел Козлов',
  ][i % 10],
  selected: false,
}));

const MOCK_MULTI_CHANNEL: SelectableItem[] = Array.from({ length: 12 }, (_, i) => ({
  id: `mc-${i + 1}`,
  code: `+7 (495) ${String(100 + i * 15).slice(0, 3)}-${String(10 + i * 7).padStart(2, '0')}-${String(20 + i * 3).padStart(2, '0')}`,
  name: `Многоканальный номер ${i + 1}`,
  selected: false,
}));

const MOCK_DEPARTMENTS: SelectableItem[] = [
  { id: 'dep-1', code: '101', name: 'Отдел продаж', selected: false },
  { id: 'dep-2', code: '102', name: 'Отдел поддержки', selected: false },
  { id: 'dep-3', code: '103', name: 'Отдел маркетинга', selected: false },
  { id: 'dep-4', code: '104', name: 'Бухгалтерия', selected: false },
  { id: 'dep-5', code: '105', name: 'IT отдел', selected: false },
  { id: 'dep-6', code: '106', name: 'HR отдел', selected: false },
  { id: 'dep-7', code: '107', name: 'Логистика', selected: false },
  { id: 'dep-8', code: '108', name: 'Юридический отдел', selected: false },
];

const MOCK_CALL_CENTERS: SelectableItem[] = [
  { id: 'cc-1', code: '301', name: 'Колл-центр "Входящие"', selected: false },
  { id: 'cc-2', code: '302', name: 'Колл-центр "Исходящие"', selected: false },
  { id: 'cc-3', code: '303', name: 'Колл-центр "Техподдержка"', selected: false },
  { id: 'cc-4', code: '304', name: 'Колл-центр "Продажи"', selected: false },
  { id: 'cc-5', code: '305', name: 'Колл-центр "VIP"', selected: false },
];

function createDefaultScenario(id: string, name: string, sourceType: SourceType = 'employee_numbers'): Scenario {
  return {
    id,
    name,
    sourceType,
    isSourceCollapsed: false,
    isNumbersSaved: false,
    isRecipientsExpanded: false,
    isScenarioSaved: false,
    employees: MOCK_EMPLOYEES.map(e => ({ ...e, selected: false })),
    multiChannelNumbers: MOCK_MULTI_CHANNEL.map(e => ({ ...e, selected: false })),
    departments: MOCK_DEPARTMENTS.map(e => ({ ...e, selected: false })),
    callCenters: MOCK_CALL_CENTERS.map(e => ({ ...e, selected: false })),
    recipients: [],
    showSavedNotification: false,
    filterMode: 'all',
    searchQuery: '',
    recipientSearchQuery: '',
  };
}

const initialScenarios: ScenarioListItem[] = [
  { id: 'scenario-1', name: 'Продажи', sourceType: 'employee_numbers', selectedCount: 5, recipientCount: 2 },
  { id: 'scenario-2', name: 'Поддержка', sourceType: 'multi_channel', selectedCount: 3, recipientCount: 1 },
  { id: 'scenario-3', name: 'Новый сценарий', sourceType: 'employee_numbers', selectedCount: 0, recipientCount: 0 },
];

const initialScenario = createDefaultScenario('scenario-3', 'Новый сценарий');

export const usePrototypeStore = create<PrototypeStore>((set, get) => ({
  scenarios: initialScenarios,
  activeScenarioId: 'scenario-3',
  scenario: initialScenario,
  scenarioStates: { 'scenario-3': initialScenario },
  modal: {
    isOpen: false,
    editingRecipientId: null,
    recipientName: '',
    recipientPosition: '',
    activeTab: 'max',
    phone: '',
    isLinkGenerated: false,
    isPhoneValid: false,
    generatedLink: '',
    isSaving: false,
    telegramAccount: '',
    isTelegramLinkGenerated: false,
    generatedTelegramLink: '',
    isTelegramInputValid: false,
    editingMaxStatus: 'not_configured' as ConnectionStatus,
    editingTelegramStatus: 'not_configured' as ConnectionStatus,
  },
  activationPopup: {
    visible: false,
    channel: 'max',
    recipientId: '',
    recipientName: '',
    link: '',
  },
  toast: { message: '', visible: false },

  // CJ tracker
  cjSteps: [
    { id: 'source', label: 'Выбор источника', emotion: '', comment: '' },
    { id: 'numbers', label: 'Выбор номеров', emotion: '', comment: '' },
    { id: 'recipient', label: 'Добавление получателя', emotion: '', comment: '' },
    { id: 'link', label: 'Генерация ссылки', emotion: '', comment: '' },
    { id: 'save', label: 'Сохранение и копирование', emotion: '', comment: '' },
    { id: 'activate', label: 'Подтверждение подключения', emotion: '', comment: '' },
  ],
  cjExpandedStep: null,
  cjCollapsed: false,
  cjHidden: false,
  setStepEmotion: (stepId, emotion) => set((s) => ({
    cjSteps: s.cjSteps.map(st => st.id === stepId ? { ...st, emotion } : st),
  })),
  setStepComment: (stepId, comment) => set((s) => ({
    cjSteps: s.cjSteps.map(st => st.id === stepId ? { ...st, comment } : st),
  })),
  toggleStepExpanded: (stepId) => set((s) => ({
    cjExpandedStep: s.cjExpandedStep === stepId ? null : stepId,
  })),
  toggleCJCollapsed: () => set((s) => ({ cjCollapsed: !s.cjCollapsed })),
  toggleCJHidden: () => set((s) => ({ cjHidden: !s.cjHidden })),
  exportCJResults: () => {
    const { cjSteps } = get();
    const now = new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' });
    const lines = [
      `Результаты прохождения CJ — ${now}`,
      '=' .repeat(50),
      '',
    ];
    cjSteps.forEach((step, i) => {
      lines.push(`${i + 1}. ${step.label}`);
      lines.push(`   Эмоция: ${step.emotion || '(не указана)'}`);
      lines.push(`   Комментарий: ${step.comment || '(нет)'}`);
      lines.push('');
    });
    return lines.join('\n');
  },

  // Scenario sidebar
  selectScenario: (id) => {
    const state = get();
    // Save current scenario state
    const updatedStates = { ...state.scenarioStates };
    updatedStates[state.activeScenarioId] = state.scenario;
    // Load new scenario or create default
    let newScenario = updatedStates[id];
    if (!newScenario) {
      const listItem = state.scenarios.find(s => s.id === id);
      newScenario = createDefaultScenario(id, listItem?.name || 'Новый', listItem?.sourceType || 'employee_numbers');
    }
    set({
      activeScenarioId: id,
      scenario: newScenario,
      scenarioStates: updatedStates,
    });
  },
  addScenario: () => {
    const state = get();
    const newId = `scenario-${Date.now()}`;
    const newScenario = createDefaultScenario(newId, 'Новый сценарий', 'employee_numbers');
    const newListItem: ScenarioListItem = {
      id: newId,
      name: 'Новый сценарий',
      sourceType: 'employee_numbers',
      selectedCount: 0,
      recipientCount: 0,
    };
    // Save current state first
    const updatedStates = { ...state.scenarioStates };
    updatedStates[state.activeScenarioId] = state.scenario;
    updatedStates[newId] = newScenario;
    set({
      scenarios: [...state.scenarios, newListItem],
      activeScenarioId: newId,
      scenario: newScenario,
      scenarioStates: updatedStates,
    });
  },
  renameScenario: (name) => set((s) => ({
    scenario: { ...s.scenario, name },
    scenarios: s.scenarios.map(sc =>
      sc.id === s.activeScenarioId ? { ...sc, name } : sc
    ),
  })),
  deleteScenario: (id) => set((s) => {
    if (s.scenarios.length <= 1) return s; // Can't delete last scenario
    const remaining = s.scenarios.filter(sc => sc.id !== id);
    const newStates = { ...s.scenarioStates };
    delete newStates[id];
    // If deleting active, switch to first remaining
    const newActiveId = s.activeScenarioId === id ? remaining[0].id : s.activeScenarioId;
    const newScenario = newStates[newActiveId] || createDefaultScenario(newActiveId, remaining[0]?.name || 'Новый');
    return {
      scenarios: remaining,
      activeScenarioId: newActiveId,
      scenario: newScenario,
      scenarioStates: newStates,
    };
  }),

  // Source type
  setSourceType: (type) => set((s) => ({
    scenario: { ...s.scenario, sourceType: type, isNumbersSaved: false, isRecipientsExpanded: false, isSourceCollapsed: false },
    scenarios: s.scenarios.map(sc =>
      sc.id === s.activeScenarioId ? { ...sc, sourceType: type, selectedCount: 0 } : sc
    ),
    ...(!s.cjHidden && s.cjCollapsed ? {} : { cjExpandedStep: 'source' }),
  })),
  toggleSourceCollapsed: () => set((s) => ({
    scenario: { ...s.scenario, isSourceCollapsed: !s.scenario.isSourceCollapsed },
  })),

  // Generic selection
  toggleSelection: (sourceType, id) => set((s) => {
    const getList = () => {
      switch (sourceType) {
        case 'employee_numbers': return s.scenario.employees;
        case 'multi_channel': return s.scenario.multiChannelNumbers;
        case 'departments': return s.scenario.departments;
        case 'call_centers': return s.scenario.callCenters;
      }
    };
    const list = getList();
    const newList = list.map((item: Employee | SelectableItem) =>
      item.id === id ? { ...item, selected: !item.selected } : item
    );
    switch (sourceType) {
      case 'employee_numbers': return { scenario: { ...s.scenario, employees: newList as Employee[] } };
      case 'multi_channel': return { scenario: { ...s.scenario, multiChannelNumbers: newList as SelectableItem[] } };
      case 'departments': return { scenario: { ...s.scenario, departments: newList as SelectableItem[] } };
      case 'call_centers': return { scenario: { ...s.scenario, callCenters: newList as SelectableItem[] } };
    }
  }),
  selectAll: (sourceType) => set((s) => {
    const selectFn = <T extends { selected: boolean }>(list: T[]): T[] =>
      list.map(item => ({ ...item, selected: true }));
    switch (sourceType) {
      case 'employee_numbers': return { scenario: { ...s.scenario, employees: selectFn(s.scenario.employees) as Employee[] } };
      case 'multi_channel': return { scenario: { ...s.scenario, multiChannelNumbers: selectFn(s.scenario.multiChannelNumbers) } };
      case 'departments': return { scenario: { ...s.scenario, departments: selectFn(s.scenario.departments) } };
      case 'call_centers': return { scenario: { ...s.scenario, callCenters: selectFn(s.scenario.callCenters) } };
    }
  }),
  deselectAll: (sourceType) => set((s) => {
    const deselectFn = <T extends { selected: boolean }>(list: T[]): T[] =>
      list.map(item => ({ ...item, selected: false }));
    switch (sourceType) {
      case 'employee_numbers': return { scenario: { ...s.scenario, employees: deselectFn(s.scenario.employees) as Employee[] } };
      case 'multi_channel': return { scenario: { ...s.scenario, multiChannelNumbers: deselectFn(s.scenario.multiChannelNumbers) } };
      case 'departments': return { scenario: { ...s.scenario, departments: deselectFn(s.scenario.departments) } };
      case 'call_centers': return { scenario: { ...s.scenario, callCenters: deselectFn(s.scenario.callCenters) } };
    }
  }),
  setEmployeeFilter: (mode) => set((s) => ({
    scenario: { ...s.scenario, filterMode: mode },
  })),
  setEmployeeSearch: (query) => set((s) => ({
    scenario: { ...s.scenario, searchQuery: query },
  })),
  saveSelectedNumbers: () => {
    const state = get();
    const getSelectedCount = () => {
      switch (state.scenario.sourceType) {
        case 'employee_numbers': return state.scenario.employees.filter(e => e.selected).length;
        case 'multi_channel': return state.scenario.multiChannelNumbers.filter(e => e.selected).length;
        case 'departments': return state.scenario.departments.filter(e => e.selected).length;
        case 'call_centers': return state.scenario.callCenters.filter(e => e.selected).length;
      }
    };
    const selectedCount = getSelectedCount();
    if (selectedCount === 0) {
      set({ toast: { message: 'Выберите хотя бы один элемент', visible: true } });
      setTimeout(() => set({ toast: { message: '', visible: false } }), 2500);
      return;
    }
    set((s) => ({
      scenario: {
        ...s.scenario,
        isNumbersSaved: true,
        isSourceCollapsed: true,
        isRecipientsExpanded: true,
        showSavedNotification: true,
        filterMode: 'all',
      },
      scenarios: s.scenarios.map(sc =>
        sc.id === s.activeScenarioId
          ? { ...sc, selectedCount, sourceType: s.scenario.sourceType }
          : sc
      ),
      ...(!s.cjHidden && s.cjCollapsed ? {} : { cjExpandedStep: 'numbers' }),
    }));
    setTimeout(() => set((s) => ({
      scenario: { ...s.scenario, showSavedNotification: false },
    })), 3000);
  },
  cancelSelection: () => {
    const state = get();
    switch (state.scenario.sourceType) {
      case 'employee_numbers': set((s) => ({
        scenario: { ...s.scenario, employees: s.scenario.employees.map(e => ({ ...e, selected: false })) },
      })); break;
      case 'multi_channel': set((s) => ({
        scenario: { ...s.scenario, multiChannelNumbers: s.scenario.multiChannelNumbers.map(e => ({ ...e, selected: false })) },
      })); break;
      case 'departments': set((s) => ({
        scenario: { ...s.scenario, departments: s.scenario.departments.map(e => ({ ...e, selected: false })) },
      })); break;
      case 'call_centers': set((s) => ({
        scenario: { ...s.scenario, callCenters: s.scenario.callCenters.map(e => ({ ...e, selected: false })) },
      })); break;
    }
  },

  // Recipients section
  toggleRecipientsExpanded: () => set((s) => ({
    scenario: { ...s.scenario, isRecipientsExpanded: !s.scenario.isRecipientsExpanded },
  })),
  setRecipientSearch: (query) => set((s) => ({
    scenario: { ...s.scenario, recipientSearchQuery: query },
  })),

  // Modal actions
  openAddRecipientModal: () => set({
    modal: {
      isOpen: true,
      editingRecipientId: null,
      recipientName: '',
      recipientPosition: '',
      activeTab: 'max',
      phone: '',
      isLinkGenerated: false,
      isPhoneValid: false,
      generatedLink: '',
      isSaving: false,
      telegramAccount: '',
      isTelegramLinkGenerated: false,
      generatedTelegramLink: '',
      isTelegramInputValid: false,
      editingMaxStatus: 'not_configured' as ConnectionStatus,
      editingTelegramStatus: 'not_configured' as ConnectionStatus,
    },
    ...(!get().cjHidden && get().cjCollapsed ? {} : { cjExpandedStep: 'recipient' }),
  }),
  closeRecipientModal: () => set({
    modal: {
      isOpen: false,
      editingRecipientId: null,
      recipientName: '',
      recipientPosition: '',
      activeTab: 'max',
      phone: '',
      isLinkGenerated: false,
      isPhoneValid: false,
      generatedLink: '',
      isSaving: false,
      telegramAccount: '',
      isTelegramLinkGenerated: false,
      generatedTelegramLink: '',
      isTelegramInputValid: false,
      editingMaxStatus: 'not_configured' as ConnectionStatus,
      editingTelegramStatus: 'not_configured' as ConnectionStatus,
    },
  }),
  setModalRecipientName: (name) => set((s) => ({
    modal: { ...s.modal, recipientName: name },
  })),
  setModalRecipientPosition: (position) => set((s) => ({
    modal: { ...s.modal, recipientPosition: position },
  })),
  setModalActiveTab: (tab) => set((s) => ({
    modal: { ...s.modal, activeTab: tab, isLinkGenerated: false, isTelegramLinkGenerated: false },
  })),
  setModalPhone: (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    const isValid = cleaned.length >= 10;
    set((s) => ({
      modal: { ...s.modal, phone, isPhoneValid: isValid },
    }));
  },
  generateMaxLink: () => {
    const state = get();
    if (!state.modal.isPhoneValid) return;
    const cleaned = state.modal.phone.replace(/\D/g, '');
    const digits = cleaned.length >= 11 ? cleaned.slice(-10) : cleaned;
    const link = `https://max.bot/start?phone=7${digits}`;
    set((s) => ({
      modal: { ...s.modal, isLinkGenerated: true, generatedLink: link },
      ...(!s.cjHidden && s.cjCollapsed ? {} : { cjExpandedStep: 'link' }),
    }));
  },
  copyMaxLink: () => {
    const state = get();
    if (state.modal.generatedLink) {
      navigator.clipboard?.writeText(state.modal.generatedLink).catch(() => {});
      set({ toast: { message: 'Ссылка скопирована', visible: true } });
      setTimeout(() => set({ toast: { message: '', visible: false } }), 2000);
    }
  },
  setModalTelegramAccount: (account) => {
    const isValid = account.trim().length > 0;
    set((s) => ({
      modal: { ...s.modal, telegramAccount: account, isTelegramInputValid: isValid },
    }));
  },
  generateTelegramLink: () => {
    const state = get();
    if (!state.modal.isTelegramInputValid) return;
    // Same link for all recipients
    const link = 'https://t.me/mte_notify_bot?start=link_a1b2c3d4';
    set((s) => ({
      modal: { ...s.modal, isTelegramLinkGenerated: true, generatedTelegramLink: link },
      ...(!s.cjHidden && s.cjCollapsed ? {} : { cjExpandedStep: 'link' }),
    }));
  },
  saveRecipient: () => {
    const state = get();
    if (!state.modal.recipientName.trim()) {
      set({ toast: { message: 'Введите имя получателя', visible: true } });
      setTimeout(() => set({ toast: { message: '', visible: false } }), 2000);
      return;
    }

    // Copy link to clipboard if generated
    const linkToCopy = state.modal.activeTab === 'telegram' && state.modal.generatedTelegramLink
      ? state.modal.generatedTelegramLink
      : state.modal.generatedLink;
    if (linkToCopy) {
      navigator.clipboard?.writeText(linkToCopy).catch(() => {});
    }

    const isEditing = !!state.modal.editingRecipientId;
    const resetModal = {
      isOpen: false,
      editingRecipientId: null,
      recipientName: '',
      recipientPosition: '',
      activeTab: 'max' as ChannelTab,
      phone: '',
      isLinkGenerated: false,
      isPhoneValid: false,
      generatedLink: '',
      isSaving: false,
      telegramAccount: '',
      isTelegramLinkGenerated: false,
      generatedTelegramLink: '',
      isTelegramInputValid: false,
      editingMaxStatus: 'not_configured' as ConnectionStatus,
      editingTelegramStatus: 'not_configured' as ConnectionStatus,
    };

    // Determine toast message
    const hasLink = !!linkToCopy;
    const toastMessage = hasLink
      ? 'Ссылка скопирована. Отправьте её получателю'
      : isEditing ? 'Получатель обновлён' : 'Получатель добавлен';

    if (isEditing) {
      // Update existing recipient — preserve channel statuses that are already 'active'
      set((s) => ({
        scenario: {
          ...s.scenario,
          recipients: s.scenario.recipients.map(r => {
            if (r.id !== state.modal.editingRecipientId) return r;
            return {
              ...r,
              name: state.modal.recipientName,
              position: state.modal.recipientPosition,
              phone: state.modal.phone,
              // Preserve 'active' statuses; only update from modal if not already active
              maxStatus: r.maxStatus === 'active' ? 'active' as ConnectionStatus
                : (state.modal.isLinkGenerated ? 'waiting' as ConnectionStatus : 'not_configured' as ConnectionStatus),
              telegramStatus: r.telegramStatus === 'active' ? 'active' as ConnectionStatus
                : (state.modal.isTelegramLinkGenerated ? 'waiting' as ConnectionStatus : 'not_configured' as ConnectionStatus),
              maxLink: state.modal.generatedLink || r.maxLink,
              telegramAccount: state.modal.telegramAccount || r.telegramAccount,
              telegramLink: state.modal.generatedTelegramLink || r.telegramLink,
              activeTab: state.modal.activeTab,
            };
          }),
          isScenarioSaved: true,
          showSavedNotification: true,
        },
        modal: resetModal,
        toast: { message: toastMessage, visible: true },
        ...(!s.cjHidden && s.cjCollapsed ? {} : { cjExpandedStep: 'save' }),
      }));
    } else {
      // Create new recipient
      const newRecipient: Recipient = {
        id: `recipient-${Date.now()}`,
        name: state.modal.recipientName,
        position: state.modal.recipientPosition,
        phone: state.modal.phone,
        maxStatus: (state.modal.isLinkGenerated ? 'waiting' : 'not_configured') as ConnectionStatus,
        telegramStatus: (state.modal.isTelegramLinkGenerated ? 'waiting' : 'not_configured') as ConnectionStatus,
        emailStatus: 'not_configured' as ConnectionStatus,
        maxLink: state.modal.generatedLink,
        telegramAccount: state.modal.telegramAccount,
        telegramLink: state.modal.generatedTelegramLink,
        activeTab: state.modal.activeTab,
      };
      set((s) => ({
        scenario: {
          ...s.scenario,
          recipients: [...s.scenario.recipients, newRecipient],
          isScenarioSaved: true,
          showSavedNotification: true,
        },
        scenarios: s.scenarios.map(sc =>
          sc.id === s.activeScenarioId
            ? { ...sc, recipientCount: s.scenario.recipients.length + 1 }
            : sc
        ),
        modal: resetModal,
        toast: { message: toastMessage, visible: true },
        ...(!s.cjHidden && s.cjCollapsed ? {} : { cjExpandedStep: 'save' }),
      }));
    }
    setTimeout(() => set((s) => ({
      scenario: { ...s.scenario, showSavedNotification: false },
      toast: { message: '', visible: false },
    })), 3000);
  },
  disconnectChannel: (channel) => {
    const state = get();
    if (!state.modal.editingRecipientId) return;
    const statusField = channel === 'max' ? 'editingMaxStatus' : 'editingTelegramStatus';
    const recipientStatusField = channel === 'max' ? 'maxStatus' : 'telegramStatus';
    const recipientLinkField = channel === 'max' ? 'maxLink' : 'telegramLink';
    const channelLabel = channel === 'max' ? 'МАКС' : 'Telegram';
    // Immediately update recipient status
    set((s) => ({
      scenario: {
        ...s.scenario,
        recipients: s.scenario.recipients.map(r =>
          r.id === s.modal.editingRecipientId
            ? { ...r, [recipientStatusField]: 'not_configured' as ConnectionStatus, [recipientLinkField]: '' }
            : r
        ),
      },
      modal: {
        ...s.modal,
        [statusField]: 'not_configured' as ConnectionStatus,
        ...(channel === 'max'
          ? { isLinkGenerated: false, generatedLink: '', phone: '' }
          : { isTelegramLinkGenerated: false, generatedTelegramLink: '', telegramAccount: '' }),
      },
      toast: { message: `${channelLabel} отключён`, visible: true },
    }));
    setTimeout(() => set({ toast: { message: '', visible: false } }), 2500);
  },
  resetModal: () => set({
    modal: {
      isOpen: false,
      editingRecipientId: null,
      recipientName: '',
      recipientPosition: '',
      activeTab: 'max',
      phone: '',
      isLinkGenerated: false,
      isPhoneValid: false,
      generatedLink: '',
      isSaving: false,
      telegramAccount: '',
      isTelegramLinkGenerated: false,
      generatedTelegramLink: '',
      isTelegramInputValid: false,
      editingMaxStatus: 'not_configured' as ConnectionStatus,
      editingTelegramStatus: 'not_configured' as ConnectionStatus,
    },
  }),

  // Recipient actions
  editRecipient: (id) => {
    const state = get();
    const recipient = state.scenario.recipients.find(r => r.id === id);
    if (recipient) {
      set({
        modal: {
          isOpen: true,
          editingRecipientId: id,
          recipientName: recipient.name,
          recipientPosition: recipient.position,
          activeTab: recipient.activeTab,
          phone: recipient.phone,
          isLinkGenerated: !!recipient.maxLink,
          isPhoneValid: recipient.phone.length > 0,
          generatedLink: recipient.maxLink,
          isSaving: false,
          telegramAccount: recipient.telegramAccount,
          isTelegramLinkGenerated: !!recipient.telegramLink,
          generatedTelegramLink: recipient.telegramLink,
          isTelegramInputValid: recipient.telegramAccount.length > 0,
          editingMaxStatus: recipient.maxStatus,
          editingTelegramStatus: recipient.telegramStatus,
        },
      });
    }
  },
  editRecipientWithTab: (id, tab) => {
    const state = get();
    const recipient = state.scenario.recipients.find(r => r.id === id);
    if (recipient) {
      set({
        modal: {
          isOpen: true,
          editingRecipientId: id,
          recipientName: recipient.name,
          recipientPosition: recipient.position,
          activeTab: tab,
          phone: recipient.phone,
          isLinkGenerated: tab === 'max' ? !!recipient.maxLink : !!recipient.maxLink,
          isPhoneValid: recipient.phone.length > 0,
          generatedLink: recipient.maxLink,
          isSaving: false,
          telegramAccount: recipient.telegramAccount,
          isTelegramLinkGenerated: tab === 'telegram' ? !!recipient.telegramLink : !!recipient.telegramLink,
          generatedTelegramLink: recipient.telegramLink,
          isTelegramInputValid: recipient.telegramAccount.length > 0,
          editingMaxStatus: recipient.maxStatus,
          editingTelegramStatus: recipient.telegramStatus,
        },
      });
    }
  },
  deleteRecipient: (id) => set((s) => ({
    scenario: {
      ...s.scenario,
      recipients: s.scenario.recipients.filter(r => r.id !== id),
    },
    scenarios: s.scenarios.map(sc =>
      sc.id === s.activeScenarioId
        ? { ...sc, recipientCount: Math.max(0, sc.recipientCount - 1) }
        : sc
    ),
  })),

  // Activation popup
  openActivationPopup: (recipientId, channel) => {
    const state = get();
    const recipient = state.scenario.recipients.find(r => r.id === recipientId);
    if (!recipient) return;
    if (channel === 'max' && recipient.maxStatus === 'waiting') {
      set({
        activationPopup: {
          visible: true,
          channel: 'max',
          recipientId: recipient.id,
          recipientName: recipient.name,
          link: recipient.maxLink,
        },
      });
    } else if (channel === 'telegram' && recipient.telegramStatus === 'waiting') {
      set({
        activationPopup: {
          visible: true,
          channel: 'telegram',
          recipientId: recipient.id,
          recipientName: recipient.name,
          link: recipient.telegramLink,
        },
      });
    }
  },
  closeActivationPopup: () => set({
    activationPopup: { visible: false, channel: 'max', recipientId: '', recipientName: '', link: '' },
  }),
  confirmActivation: () => {
    const state = get();
    const channel = state.activationPopup.channel;
    const updateField = channel === 'max' ? 'maxStatus' : 'telegramStatus';
    const toastMsg = channel === 'max' ? 'МАКС успешно подключён' : 'Telegram успешно подключён';
    set((s) => ({
      scenario: {
        ...s.scenario,
        recipients: s.scenario.recipients.map(r =>
          r.id === state.activationPopup.recipientId ? { ...r, [updateField]: 'active' as ConnectionStatus } : r
        ),
      },
      activationPopup: { visible: false, channel: 'max', recipientId: '', recipientName: '', link: '' },
      toast: { message: toastMsg, visible: true },
      ...(!s.cjHidden && s.cjCollapsed ? {} : { cjExpandedStep: 'activate' }),
    }));
    setTimeout(() => set({ toast: { message: '', visible: false } }), 2500);
  },

  // Notifications
  dismissSavedNotification: () => set((s) => ({
    scenario: { ...s.scenario, showSavedNotification: false },
  })),
  showToast: (message) => set({ toast: { message, visible: true } }),
  dismissToast: () => set({ toast: { message: '', visible: false } }),

  // Scenario save
  saveScenario: () => set((s) => ({
    scenario: { ...s.scenario, isScenarioSaved: true, showSavedNotification: true },
  })),

  // Navigation
  closeAll: () => set((s) => ({
    scenario: { ...s.scenario, showSavedNotification: false },
  })),
}));
