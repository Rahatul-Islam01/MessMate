# MessMate

MessMate is a frontend-only Smart Mess Management System for tracking members, meals, expenses, deposits, accounting, reports, and backups.

## Tech Stack

- React 19
- Vite 8
- Tailwind CSS 4
- React Router
- Recharts
- Lucide React
- Local Storage

## Setup

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

Lint:

```bash
npm run lint
```

## Key Features

- Responsive dashboard with summary cards and charts
- Member, meal, expense, and deposit management
- Monthly accounting and meal rate calculation
- Reports with CSV export
- JSON backup and restore
- Light/dark mode with persistence

## Accounting Formulas

```text
Meal Rate = Total Meal-Related Expenses / Total Meals
Member Meal Cost = Member Meals × Meal Rate
Member Balance = Member Deposits − Member Meal Cost − Additional Charges
```

## Data Storage

All data is stored in the browser using Local Storage. No backend or external database is used.

## Limitations

- Frontend-only application
- Data is device/browser specific
- No authentication or multi-user support
- Browser Local Storage capacity limits apply
