# Refactoring Plan: `client/src/pages/Lead`

## Goals

- Reduce component size and complexity
- Eliminate code duplication
- Improve separation of concerns
- Fix prop drilling
- Consolidate constants

---

## Phase 1 — Extract Logic from Lead.js (889 lines → ~300 lines)

### 1.1 Create `hooks/useLeadData.js`

Extract all data fetching and lead CRUD:

- `fetchLeads(status)` → `GET /api/v1/leads/fetch/{status}/lead`
- `fetchTickets(tab)` → `GET /api/v1/leads/available-tickets`
- `handleCreateLead`, `handleUpdateData`, `handleDeleteLead`, `handleBulkUpdate`
- Returns: `{ leadData, filteredData, isLoading, ticketMap, ... }`

### 1.2 Create `hooks/useLeadFilters.js`

Extract all filtering/sorting state:

- `filterInfo`, `selectedUsers`, `selectedTab`
- `filteredData` derived from `leadData + filterInfo + selectedUsers + selectedTab`
- Returns filter state + setters

### 1.3 Create `hooks/useLeadModals.js`

Extract modal state management:

- `showNewTicketModal`, `showSendModal`, `emailPopup`
- All modal open/close handlers

### 1.4 Create `hooks/useLeadUsers.js`

Merge `usePersistedUsers` + user fetching from Lead.js:

- Fetch `/api/v1/user/get_all/users`
- `selectedUsers`, `user_leads_count_map`, `userName`

---

## Phase 2 — Consolidate Constants (Eliminate Duplication)

All constants currently duplicated across `constants/`, `MyLists/Leads.js`, and `leadStats/Filters.js`.

### 2.1 Expand `constants/dropdownOptions.js` — single source of truth for:

- `LEAD_STAGES`, `BRANDS`, `LEAD_SOURCES`, `DEPARTMENTS`

### 2.2 Create `constants/leadStatus.js`

```js
export const LEAD_STATUS = { PROGRESS: "progress", WON: "won", LOST: "lost" };
```

### 2.3 Create `constants/storageKeys.js`

```js
export const STORAGE_KEYS = {
  COLUMN_VISIBILITY: "columnVisibilityLead",
  USER_ORDER: "leads_usernamesOrder",
};
```

### 2.4 Fix typo

`NumderFilterFn` → `NumberFilterFn` in `table/columns/index.js`

---

## Phase 3 — Merge Context Providers

### 3.1 Merge `UserContext.js` + `ColumnContext.js` → `LeadContext.js`

Single `LeadProvider` exposing all shared state — reduces nesting depth and provider overhead.

---

## Phase 4 — Fix Prop Drilling

### 4.1 Move dropdown options into constants (not props)

`BulkLeadEditForm` receives 8+ array props for dropdowns. Import directly from `constants/dropdownOptions.js` — no prop passing needed.

### 4.2 Reduce `Tabswitcher` props (21 → ~8)

Move configuration props to context; keep only event callbacks and essential state.

### 4.3 Reduce `ActionsCell` props (11 → ~5)

Move `selectedTab`, `users`, `ticketMap` to context.

---

## Phase 5 — Table Columns Cleanup

### 5.1 Refactor `table/columns/index.js`

- `getLeadColumns()` currently receives a massive context object — replace with a `useLeadColumns()` hook that reads from context directly
- Extract inline Cell JSX into named sub-components: `EditableCell`, `LeadRefCell`, `StatusCell`
- Deduplicate column filter logic

---

## Phase 6 — Stats Components

### 6.1 Create `leadStats/hooks/useStatsFilters.js`

Extract shared filter state from `Filters.js` (297 lines) — date range, source, department presets.

### 6.2 Lazy-load stats components

`LeadStats.js` renders all charts on mount. Wrap with `React.lazy` + `Suspense` so charts only load when the analytics tab is opened.

---

## Phase 7 — Cleanup

| Issue                                   | Fix                                                                    |
| --------------------------------------- | ---------------------------------------------------------------------- |
| Commented-out code                      | Remove from `RefreshLeadsButton.js`, `ActionsCell.jsx`, `LeadStats.js` |
| `console.log` in production             | Remove all                                                             |
| `leadData` + `filteredData` duplication | Derive `filteredData` from `leadData` via `useMemo`                    |
| `userName` + `users` duplication        | Keep only `users`, derive `userName`                                   |
| `updates_object_init` duplication       | Import from `constants/` in `MyLists/Leads.js`                         |

---

## Resulting File Structure

```
pages/Lead/
├── Lead.js                        (~300 lines, orchestration only)
├── AutoCreateLeadFromURL.jsx
├── ActionsCell.jsx
├── components/
│   ├── Header.jsx
│   ├── Tabswitcher.jsx            (slimmed down)
│   ├── BulkLeadEditForm.jsx       (reads constants directly)
│   └── RenderColumnControls.jsx
├── hooks/
│   ├── useLeadData.js             (NEW - data fetching + CRUD)
│   ├── useLeadFilters.js          (NEW - filter state)
│   ├── useLeadModals.js           (NEW - modal state)
│   ├── useLeadUsers.js            (NEW - user management)
│   └── useBulkLeadEdit.js
├── context/
│   └── LeadContext.js             (merged UserContext + ColumnContext)
├── constants/
│   ├── dropdownOptions.js         (expanded, single source of truth)
│   ├── leadStatus.js              (NEW)
│   ├── storageKeys.js             (NEW)
│   ├── columnData.js
│   └── leadSource.js
├── table/columns/
│   ├── index.js                   (useLeadColumns hook)
│   └── cells/                    (NEW - extracted cell components)
│       ├── EditableCell.jsx
│       ├── LeadRefCell.jsx
│       └── StatusCell.jsx
├── ui/
│   ├── RefreshLeadsButton.js      (cleaned up)
│   └── FollowupDateFilter.jsx
└── leadStats/
    ├── LeadStats.js
    ├── hooks/
    │   └── useStatsFilters.js     (NEW)
    ├── LeadChart.js
    ├── LeadDonutChart.js
    ├── LeadStatusAreaChart.js
    ├── ConversionRateCard.js
    ├── Filters.js                 (slimmed down)
    └── PageHeading.js
```

---

## Priority Order

| Phase                           | Impact | Risk     | Do First?     |
| ------------------------------- | ------ | -------- | ------------- | ---- |
| Phase 1 — Extract hooks         | High   | Low      | Yes           | Done |
| Phase 2 — Consolidate constants | High   | Very Low | Yes           | Done |
| Phase 7 — Cleanup               | Medium | Very Low | Yes           | Done |
| Phase 4 — Fix prop drilling     | High   | Medium   | After Phase 1 | Done |
| Phase 3 — Merge contexts        | Medium | Medium   | After Phase 1 | Done |
| Phase 5 — Table columns         | Medium | Medium   | After Phase 1 |
| Phase 6 — Stats lazy loading    | Low    | Low      | Last          |
