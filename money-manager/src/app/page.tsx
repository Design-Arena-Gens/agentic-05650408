'use client';

import CategoryManager from '@/components/CategoryManager';
import SummaryCards from '@/components/SummaryCards';
import TransactionForm from '@/components/TransactionForm';
import TransactionList from '@/components/TransactionList';

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 pb-16">
      <header className="border-b border-zinc-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900">Rupiya Manager</h1>
            <p className="text-sm text-zinc-500">
              Manage income, expenses, transfers, categories, and sub categories in one place.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-100 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-600">
            Money Management Dashboard
          </div>
        </div>
      </header>

      <main className="mx-auto mt-10 flex max-w-6xl flex-col gap-8 px-6">
        <SummaryCards />
        <TransactionForm />
        <section className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
          <TransactionList />
          <CategoryManager />
        </section>
      </main>
    </div>
  );
}
