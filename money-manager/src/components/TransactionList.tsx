'use client';

import { useMemo, useState } from 'react';

import { useFinance } from '@/context/FinanceContext';
import type { TransactionType } from '@/types/finance';

const formatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
});

const typeLabels: Record<TransactionType, string> = {
  income: 'Income',
  expense: 'Expense',
  transfer: 'Transfer',
};

const typeColors: Record<TransactionType, string> = {
  income: 'bg-green-100 text-green-700 border-green-200',
  expense: 'bg-red-100 text-red-700 border-red-200',
  transfer: 'bg-amber-100 text-amber-700 border-amber-200',
};

const TransactionList = () => {
  const { state, removeTransaction } = useFinance();
  const [filter, setFilter] = useState<'all' | TransactionType>('all');

  const transactionMap = useMemo(() => {
    if (filter === 'all') return state.transactions;
    return state.transactions.filter((transaction) => transaction.type === filter);
  }, [state.transactions, filter]);

  const getCategoryName = (id?: string) =>
    state.categories.find((category) => category.id === id)?.name ?? 'Unassigned';

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-zinc-800">Recent Activity</h2>
          <p className="text-sm text-zinc-500">Track your latest income, expense, and transfer entries.</p>
        </div>
        <div className="flex gap-2">
          {(['all', 'income', 'expense', 'transfer'] as const).map((item) => (
            <button
              key={item}
              type="button"
              className={`rounded-full border px-3 py-1 text-sm font-medium capitalize transition ${
                filter === item
                  ? 'border-blue-500 bg-blue-50 text-blue-600'
                  : 'border-zinc-200 bg-white text-zinc-500 hover:border-blue-200 hover:text-blue-600'
              }`}
              onClick={() => setFilter(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {transactionMap.length === 0 && (
          <p className="rounded-lg border border-dashed border-zinc-200 bg-zinc-50 p-6 text-center text-sm text-zinc-500">
            No transactions yet. Add your first entry to see it here.
          </p>
        )}

        {transactionMap.map((transaction) => (
          <article
            key={transaction.id}
            className="flex flex-col gap-4 rounded-lg border border-zinc-200 p-4 transition hover:border-blue-200 md:flex-row md:items-center md:justify-between"
          >
            <div className="flex items-start gap-4">
              <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${typeColors[transaction.type]}`}>
                {typeLabels[transaction.type]}
              </span>
              <div>
                <h3 className="text-lg font-semibold text-zinc-800">{formatter.format(transaction.amount)}</h3>
                <p className="text-xs text-zinc-500">
                  {new Date(transaction.date).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>

                <div className="mt-2 text-sm text-zinc-600">
                  {transaction.type === 'income' && (
                    <p>
                      {getCategoryName(transaction.categoryId)}
                      {transaction.subcategoryId && ` • ${getCategoryName(transaction.subcategoryId)}`}
                    </p>
                  )}

                  {transaction.type === 'expense' && (
                    <p>
                      {getCategoryName(transaction.categoryId)}
                      {transaction.subcategoryId && ` • ${getCategoryName(transaction.subcategoryId)}`}
                    </p>
                  )}

                  {transaction.type === 'transfer' && (
                    <p>
                      {getCategoryName(transaction.fromCategoryId)} → {getCategoryName(transaction.toCategoryId)}
                      {transaction.fromSubcategoryId && ` • ${getCategoryName(transaction.fromSubcategoryId)}`}
                      {transaction.toSubcategoryId && ` • ${getCategoryName(transaction.toSubcategoryId)}`}
                    </p>
                  )}
                </div>

                {transaction.note && (
                  <p className="mt-2 rounded-md bg-zinc-100 px-3 py-2 text-xs text-zinc-600">{transaction.note}</p>
                )}
              </div>
            </div>

            <button
              type="button"
              className="self-start rounded-md border border-red-200 px-3 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50 md:self-center"
              onClick={() => removeTransaction(transaction.id)}
            >
              Delete
            </button>
          </article>
        ))}
      </div>
    </section>
  );
};

export default TransactionList;
