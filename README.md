# Spendwise — Expense Tracker

A personal expense tracker built with **Next.js 14 (App Router)**, **TypeScript**, and **Tailwind CSS**. Add, edit, filter, and export your expenses, and see where your money goes on a dashboard with summaries and charts. Data is stored in your browser's `localStorage`. There's no backend or account.

## Features

- **Add, edit, and delete expenses** with a date, amount, category, and description. The form validates every field, and you can undo a delete.
- **Dashboard** with this month's spending (compared with last month), total spending, monthly average, and top category.
- **Charts**: spending for the last 6 months and a breakdown by category for this month.
- **Search, filter, and sort** by description, category, and date range, with quick presets (this month, last 30 days, this year).
- **CSV export** of the expenses that match your current filters.
- **Sample data** to try the app before adding your own.
- Works on desktop and mobile, with light and dark themes that follow your system setting.

Categories: Food, Transportation, Entertainment, Shopping, Bills, Other.

## Requirements

- [Node.js](https://nodejs.org/) 18.17 or newer
- npm (comes with Node.js)

## Setup

```bash
git clone https://github.com/arbabrar/expense-tracker-ai.git
cd expense-tracker-ai/expense-tracker-ai
npm install
```

> The app lives in the `expense-tracker-ai/` subfolder of this repository, so you `cd` into it twice.

## Running

| Command | What it does |
|---|---|
| `npm run dev` | Starts the development server at http://localhost:3000 with hot reload |
| `npm run build` | Creates an optimized production build |
| `npm start` | Serves the production build (run `npm run build` first) |
| `npm run lint` | Runs ESLint |
| `npm run typecheck` | Runs the TypeScript compiler without emitting files |

To use a different port: `npm run dev -- -p 4000`.

## Using the app

1. Open http://localhost:3000. On first visit, click **Load sample data** to explore, or **Add your first expense**.
2. Use **Add expense** in the top bar to record a new expense from any page.
3. The **Expenses** page lets you search, filter, sort, edit (pencil icon), and delete (trash icon) expenses.
4. **Export CSV** downloads the expenses that match your current filters. The file opens directly in Excel or Google Sheets.
5. **Clear all** removes every expense after you confirm. Export first if you want a backup.

## Data and privacy

Expenses are saved in your browser's `localStorage` under the key `expense-tracker:v1:expenses`. This means:

- Your data stays on your device and is never sent to a server.
- It's tied to one browser on one device and isn't synced between them.
- Clearing your browser's site data deletes it. Use **Export CSV** to keep a backup.

Amounts are shown in US dollars.

## Project structure

```
expense-tracker-ai/
└── src/
    ├── app/            # Pages: dashboard (page.tsx), expenses/, layout, global styles
    ├── components/     # UI: app shell and nav, expense form, list, charts, modals, summary cards
    ├── hooks/          # State: expenses store (with localStorage persistence) and toast notifications
    ├── lib/            # Logic: analytics and filtering, CSV export, formatting, storage, sample data
    └── types/          # Shared TypeScript types and the category list
```
