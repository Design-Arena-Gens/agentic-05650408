'use client';

import { useFinance } from '@/context/FinanceContext';

const numberFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
});

const SummaryCards = () => {
  const { summary, state } = useFinance();

  const totalTransfers = state.transactions
    .filter((transaction) => transaction.type === 'transfer')
    .reduce((acc, transaction) => acc + transaction.amount, 0);

  const items = [
    {
      title: 'Total Income',
      value: numberFormatter.format(summary.totalIncome),
      accent: 'from-green-500/20 to-green-500/5 text-green-600 border-green-500/30',
    },
    {
      title: 'Total Expense',
      value: numberFormatter.format(summary.totalExpense),
      accent: 'from-red-500/20 to-red-500/5 text-red-600 border-red-500/30',
    },
    {
      title: 'Transfers',
      value: numberFormatter.format(totalTransfers),
      accent: 'from-amber-500/20 to-amber-500/5 text-amber-600 border-amber-500/30',
    },
    {
      title: 'Net Balance',
      value: numberFormatter.format(summary.balance),
      accent: 'from-blue-500/20 to-blue-500/5 text-blue-600 border-blue-500/30',
    },
  ];

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <article
          key={item.title}
          className={`flex flex-col rounded-xl border bg-gradient-to-br p-4 transition duration-300 ${item.accent}`}
        >
          <span className="text-sm font-medium text-zinc-500">{item.title}</span>
          <span className="mt-2 text-2xl font-semibold">{item.value}</span>
        </article>
      ))}
    </section>
  );
};

export default SummaryCards;
