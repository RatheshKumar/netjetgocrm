# NetJetGo CRM

> **beyond & more** — Internal Sales CRM Platform

---

## 🚀 Quick Start (for employees)

```bash
# 1. Install dependencies (only needed once)
npm install

# 2. Start the development server
npm start

# 3. Open your browser at:
http://localhost:3000
```

---

## 📁 Project Structure

```
src/
│
├── config/                         ← ✏️  EDIT THESE TO CUSTOMIZE
│   ├── theme.js                    ← Colors, fonts, brand settings
│   ├── navigation.js               ← Sidebar menu items
│   └── db.js                       ← Database keys & storage settings
│
├── utils/                          ← Helper functions (rarely need editing)
│   ├── storage.js                  ← Read/write to the database
│   ├── formatters.js               ← Date, money, text formatting
│   └── validators.js               ← Form validation rules
│
├── context/                        ← App-wide state
│   └── AuthContext.jsx             ← Login / logout / current user
│
├── hooks/                          ← Reusable React hooks
│   └── useDB.js                    ← Hook for loading & saving data
│
├── components/
│   ├── ui/                         ← ✏️  Shared building blocks
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Modal.jsx
│   │   ├── Badge.jsx
│   │   ├── DataTable.jsx
│   │   ├── StatCard.jsx
│   │   └── EmptyState.jsx
│   └── layout/
│       ├── Sidebar.jsx             ← Left navigation bar
│       └── Topbar.jsx              ← Top header bar
│
├── pages/                          ← ✏️  One file per screen
│   ├── LoginPage.jsx
│   ├── SignupPage.jsx
│   ├── DashboardPage.jsx
│   ├── ContactsPage.jsx
│   ├── CompaniesPage.jsx
│   ├── LeadsPage.jsx
│   ├── PipelinePage.jsx
│   ├── ContractsPage.jsx
│   ├── InvoicesPage.jsx
│   ├── PaymentsPage.jsx
│   └── TasksPage.jsx
│
├── assets/
│   ├── logo-dark.png               ← Logo for sidebar (white version)
│   └── logo-light.png              ← Logo for login page (dark version)
│
├── App.jsx                         ← Root: routing + auth check
└── index.js                        ← Entry point (don't edit)
```

---

## ✏️ How to Customize

### Change colors / branding
Edit `src/config/theme.js` — all colors are in one place.

### Add a new page
1. Create `src/pages/MyNewPage.jsx` (copy an existing page as template)
2. Add it to `src/config/navigation.js`
3. Import and add it to `src/App.jsx`

### Add a field to a form
Open the page file (e.g. `src/pages/ContactsPage.jsx`) and find the `FORM_FIELDS` array at the top of the file. Add your field there.

### Change what data is saved
Edit `src/config/db.js` to see all database key prefixes.

---

## 🛠 Tech Stack

| Tool | Purpose |
|------|---------|
| React 18 | UI framework |
| Create React App | Build tooling |
| Recharts | Charts & graphs |
| window.storage | Persistent database |

---

## 👥 Team Guidelines

- **One page = one file** in `src/pages/`
- **Never put styles in inline objects across multiple files** — use `theme.js`
- **All reusable UI** goes in `src/components/ui/`
- **Commit messages**: `feat: add X`, `fix: Y`, `style: Z`
