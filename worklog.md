---
Task ID: 1
Agent: main
Task: Build interactive prototype for admin panel - missed call notification scenarios

Work Log:
- Initialized fullstack dev environment (Next.js 16 + Zustand + Tailwind)
- Updated prototype-store.ts: per-scenario state persistence via scenarioStates map, generic selection for 4 source types (employee_numbers, multi_channel, departments, call_centers), activation popup state, toast in confirmActivation
- Updated ScenarioSidebar.tsx: dynamic source type labels ("для X номеров сотрудников", "для X многоканальных номеров", etc.), active scenario indicator with green "Активен" badge
- Updated SourceSelector.tsx: compact 2x2 radio button grid for source types, generic SourceTable component that adapts columns based on type, reduced padding/size to fit on screen with Save button visible
- Updated RecipientsSection.tsx: always visible (removed early return), disabled/collapsed state with tooltip "Сначала выберите и сохраните источник пропущенных" when no numbers saved, clickable "Ожидает" chip with visual highlight ring, activation popup trigger
- Updated ConfigPanel.tsx: compact layout, removed unused imports
- Created ActivationPopup.tsx: popup with green "Подключен" status, instruction text "Вот ваша ссылка, войдите в МАКС, запустите бота нажав Старт, подтвердите номер", copy link button, confirm button
- Updated page.tsx: integrated ActivationPopup, sticky header
- Removed dead code: EmployeeTable.tsx (logic moved into SourceSelector)
- Fixed toast timing: moved showToast from component to store's confirmActivation for reliability
- Browser E2E verification: all 17 steps passed

Stage Summary:
- All user requirements implemented: scenario switching, always-visible recipients block with disabled state, 4 source types, compact source selector, MAX connection flow (enter phone → generate link → copy → save → Ожидает → click → Подключен popup)
- Prototype verified end-to-end via browser automation
- Files: src/lib/prototype-store.ts, src/components/prototype/*.tsx, src/app/page.tsx
