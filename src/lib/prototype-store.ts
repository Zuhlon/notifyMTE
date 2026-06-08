import { create } from 'zustand';

export type SourceType = 'employee_numbers' | 'multi_channel' | 'departments' | 'call_centers';
export type ChannelTab = 'max' | 'telegram' | 'email';
export type ConnectionStatus = 'not_configured' | 'waiting' | 'active';
export type ModalPhase = 'empty' | 'filling' | 'phone_entered' | 'link_generated';

export interface Employee {
  id: string;
  shortNumber: string;
  phone: string;
  sip: string;
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
  recipients: Recipient[];
  showSavedNotification: boolean;
  filterMode: 'all' | 'selected';
  searchQuery: string;
  recipientSearchQuery: string;
}

interface ModalState {
  isOpen: boolean;
  recipientName: string;
  recipientPosition: string;
  activeTab: ChannelTab;
  phone: string;
  isLinkGenerated: boolean;
  isPhoneValid: boolean;
  generatedLink: string;
  isSaving: boolean;
}

interface ScenarioListItem {
  id: string;
  name: string;
  selectedEmployeeCount: number;
  recipientCount: number;
}

interface PrototypeStore {
  // Main state
  scenarios: ScenarioListItem[];
  activeScenarioId: string;
  scenario: Scenario;
  modal: ModalState;

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

  // Employee selection
  toggleEmployeeSelection: (id: string) => void;
  selectAllEmployees: () => void;
  deselectAllEmployees: () => void;
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
  saveRecipient: () => void;
  resetModal: () => void;

  // Recipient actions
  editRecipient: (id: string) => void;
  deleteRecipient: (id: string) => void;
  simulateActivation: (recipientId: string) => void;

  // Notifications
  dismissSavedNotification: () => void;
  showToast: (message: string) => void;
  dismissToast: () => void;

  // Scenario save
  saveScenario: () => void;

  // Navigation
  closeAll: () => void;
}

const MOCK_EMPLOYEES: Employee[] = Array.from({ length: 100 }, (_, i) => ({
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

const initialScenarios: ScenarioListItem[] = [
  { id: 'scenario-1', name: 'Новый 1', selectedEmployeeCount: 5, recipientCount: 2 },
  { id: 'scenario-2', name: 'Новый 2', selectedEmployeeCount: 10, recipientCount: 0 },
  { id: 'scenario-3', name: 'Новый 3', selectedEmployeeCount: 0, recipientCount: 0 },
];

export const usePrototypeStore = create<PrototypeStore>((set, get) => ({
  scenarios: initialScenarios,
  activeScenarioId: 'scenario-3',
  scenario: {
    id: 'scenario-3',
    name: 'Новый 3',
    sourceType: 'employee_numbers',
    isSourceCollapsed: false,
    isNumbersSaved: false,
    isRecipientsExpanded: false,
    isScenarioSaved: false,
    employees: MOCK_EMPLOYEES,
    recipients: [],
    showSavedNotification: false,
    filterMode: 'all',
    searchQuery: '',
    recipientSearchQuery: '',
  },
  modal: {
    isOpen: false,
    recipientName: '',
    recipientPosition: '',
    activeTab: 'max',
    phone: '',
    isLinkGenerated: false,
    isPhoneValid: false,
    generatedLink: '',
    isSaving: false,
  },
  toast: { message: '', visible: false },

  // Scenario sidebar
  selectScenario: (id) => set({ activeScenarioId: id }),
  addScenario: () => {
    const state = get();
    const newId = `scenario-${state.scenarios.length + 1}`;
    const newScenario: ScenarioListItem = {
      id: newId,
      name: `Новый ${state.scenarios.length + 1}`,
      selectedEmployeeCount: 0,
      recipientCount: 0,
    };
    set({
      scenarios: [...state.scenarios, newScenario],
      activeScenarioId: newId,
      scenario: {
        ...state.scenario,
        id: newId,
        name: newScenario.name,
        isSourceCollapsed: false,
        isNumbersSaved: false,
        isRecipientsExpanded: false,
        isScenarioSaved: false,
        employees: MOCK_EMPLOYEES.map(e => ({ ...e, selected: false })),
        recipients: [],
        showSavedNotification: false,
      },
    });
  },
  renameScenario: (name) => set((s) => ({
    scenario: { ...s.scenario, name },
    scenarios: s.scenarios.map(sc =>
      sc.id === s.activeScenarioId ? { ...sc, name } : sc
    ),
  })),
  deleteScenario: (id) => set((s) => ({
    scenarios: s.scenarios.filter(sc => sc.id !== id),
  })),

  // Source type
  setSourceType: (type) => set((s) => ({
    scenario: { ...s.scenario, sourceType: type, isNumbersSaved: false, isRecipientsExpanded: false, isSourceCollapsed: false },
  })),
  toggleSourceCollapsed: () => set((s) => ({
    scenario: { ...s.scenario, isSourceCollapsed: !s.scenario.isSourceCollapsed },
  })),

  // Employee selection
  toggleEmployeeSelection: (id) => set((s) => ({
    scenario: {
      ...s.scenario,
      employees: s.scenario.employees.map(e => e.id === id ? { ...e, selected: !e.selected } : e),
    },
  })),
  selectAllEmployees: () => set((s) => ({
    scenario: {
      ...s.scenario,
      employees: s.scenario.employees.map(e => ({ ...e, selected: true })),
    },
  })),
  deselectAllEmployees: () => set((s) => ({
    scenario: {
      ...s.scenario,
      employees: s.scenario.employees.map(e => ({ ...e, selected: false })),
    },
  })),
  setEmployeeFilter: (mode) => set((s) => ({
    scenario: { ...s.scenario, filterMode: mode },
  })),
  setEmployeeSearch: (query) => set((s) => ({
    scenario: { ...s.scenario, searchQuery: query },
  })),
  saveSelectedNumbers: () => {
    const state = get();
    const selectedCount = state.scenario.employees.filter(e => e.selected).length;
    if (selectedCount === 0) {
      set({ toast: { message: 'Выберите хотя бы один номер', visible: true } });
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
          ? { ...sc, selectedEmployeeCount: s.scenario.employees.filter(e => e.selected).length }
          : sc
      ),
    }));
    // Auto-dismiss notification after 3s
    setTimeout(() => set((s) => ({
      scenario: { ...s.scenario, showSavedNotification: false },
    })), 3000);
  },
  cancelSelection: () => set((s) => ({
    scenario: {
      ...s.scenario,
      employees: s.scenario.employees.map(e => ({ ...e, selected: false })),
    },
  })),

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
      recipientName: '',
      recipientPosition: '',
      activeTab: 'max',
      phone: '',
      isLinkGenerated: false,
      isPhoneValid: false,
      generatedLink: '',
      isSaving: false,
    },
  }),
  closeRecipientModal: () => set({
    modal: {
      isOpen: false,
      recipientName: '',
      recipientPosition: '',
      activeTab: 'max',
      phone: '',
      isLinkGenerated: false,
      isPhoneValid: false,
      generatedLink: '',
      isSaving: false,
    },
  }),
  setModalRecipientName: (name) => set((s) => ({
    modal: { ...s.modal, recipientName: name },
  })),
  setModalRecipientPosition: (position) => set((s) => ({
    modal: { ...s.modal, recipientPosition: position },
  })),
  setModalActiveTab: (tab) => set((s) => ({
    modal: { ...s.modal, activeTab: tab, isLinkGenerated: false },
  })),
  setModalPhone: (phone) => {
    // Format phone: (XXX) XXX-XX-XX
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
  saveRecipient: () => {
    const state = get();
    if (!state.modal.recipientName.trim()) {
      set({ toast: { message: 'Введите имя получателя', visible: true } });
      setTimeout(() => set({ toast: { message: '', visible: false } }), 2000);
      return;
    }
    const newRecipient: Recipient = {
      id: `recipient-${Date.now()}`,
      name: state.modal.recipientName,
      position: state.modal.recipientPosition,
      phone: state.modal.phone,
      maxStatus: state.modal.isLinkGenerated ? 'waiting' : 'not_configured',
      telegramStatus: 'not_configured',
      emailStatus: 'not_configured',
      maxLink: state.modal.generatedLink,
      activeTab: state.modal.activeTab,
    };
    set((s) => ({
      scenario: {
        ...s.scenario,
        recipients: [...s.scenario.recipients, newRecipient],
        isScenarioSaved: true,
      },
      scenarios: s.scenarios.map(sc =>
        sc.id === s.activeScenarioId
          ? { ...sc, recipientCount: s.scenario.recipients.length + 1 }
          : sc
      ),
      modal: {
        isOpen: false,
        recipientName: '',
        recipientPosition: '',
        activeTab: 'max',
        phone: '',
        isLinkGenerated: false,
        isPhoneValid: false,
        generatedLink: '',
        isSaving: false,
      },
    }));
  },
  resetModal: () => set({
    modal: {
      isOpen: false,
      recipientName: '',
      recipientPosition: '',
      activeTab: 'max',
      phone: '',
      isLinkGenerated: false,
      isPhoneValid: false,
      generatedLink: '',
      isSaving: false,
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
          recipientName: recipient.name,
          recipientPosition: recipient.position,
          activeTab: recipient.activeTab,
          phone: recipient.phone,
          isLinkGenerated: !!recipient.maxLink,
          isPhoneValid: recipient.phone.length > 0,
          generatedLink: recipient.maxLink,
          isSaving: false,
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
  simulateActivation: (recipientId) => set((s) => ({
    scenario: {
      ...s.scenario,
      recipients: s.scenario.recipients.map(r =>
        r.id === recipientId ? { ...r, maxStatus: 'active' as ConnectionStatus } : r
      ),
    },
  })),

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
    scenario: {
      ...s.scenario,
      showSavedNotification: false,
    },
  })),
}));
