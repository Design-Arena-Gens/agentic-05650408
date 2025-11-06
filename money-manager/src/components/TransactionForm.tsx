'use client';

import { FormEvent, useMemo, useState } from 'react';

import { useFinance } from '@/context/FinanceContext';
import type { TransactionType } from '@/types/finance';

const transactionTypes: TransactionType[] = ['income', 'expense', 'transfer'];

const TransactionForm = () => {
  const { state, getSubcategories, addTransaction } = useFinance();
  const [type, setType] = useState<TransactionType>('income');
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [categoryId, setCategoryId] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [fromCategoryId, setFromCategoryId] = useState('');
  const [fromSubcategoryId, setFromSubcategoryId] = useState('');
  const [toCategoryId, setToCategoryId] = useState('');
  const [toSubcategoryId, setToSubcategoryId] = useState('');
  const [note, setNote] = useState('');

  const incomeCategories = useMemo(
    () => state.categories.filter((category) => category.type === 'income' && !category.parentId),
    [state.categories]
  );
  const expenseCategories = useMemo(
    () => state.categories.filter((category) => category.type === 'expense' && !category.parentId),
    [state.categories]
  );
  const accountCategories = useMemo(
    () => state.categories.filter((category) => category.type === 'account' && !category.parentId),
    [state.categories]
  );

  const availableCategoryOptions = type === 'income' ? incomeCategories : expenseCategories;

  const resetForm = () => {
    setAmount(0);
    setCategoryId('');
    setSubcategoryId('');
    setFromCategoryId('');
    setFromSubcategoryId('');
    setToCategoryId('');
    setToSubcategoryId('');
    setNote('');
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (amount <= 0) {
      return;
    }

    if (type === 'income' || type === 'expense') {
      if (!categoryId) return;

      addTransaction({
        type,
        amount,
        date,
        categoryId,
        subcategoryId: subcategoryId || undefined,
        note: note.trim() || undefined,
      });
    } else if (type === 'transfer') {
      if (!fromCategoryId || !toCategoryId || fromCategoryId === toCategoryId) return;

      addTransaction({
        type,
        amount,
        date,
        fromCategoryId,
        fromSubcategoryId: fromSubcategoryId || undefined,
        toCategoryId,
        toSubcategoryId: toSubcategoryId || undefined,
        note: note.trim() || undefined,
      });
    }

    resetForm();
  };

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-zinc-800">Quick Entry</h2>
      <p className="mt-1 text-sm text-zinc-500">
        Record income, expenses, and transfers to keep your budget updated.
      </p>

      <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-600">
          Entry Type
          <select
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            value={type}
            onChange={(event) => {
              const newType = event.target.value as TransactionType;
              setType(newType);
              setCategoryId('');
              setSubcategoryId('');
              setFromCategoryId('');
              setFromSubcategoryId('');
              setToCategoryId('');
              setToSubcategoryId('');
            }}
          >
            {transactionTypes.map((item) => (
              <option key={item} value={item}>
                {item.charAt(0).toUpperCase() + item.slice(1)}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-600">
          Amount
          <input
            type="number"
            step="0.01"
            min={0}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            value={amount}
            onChange={(event) => setAmount(Number(event.target.value))}
            required
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-600">
          Date
          <input
            type="date"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            required
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-600 md:col-span-2">
          Note
          <textarea
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Add a short note (optional)"
            rows={2}
          />
        </label>

        {(type === 'income' || type === 'expense') && (
          <>
            <label className="flex flex-col gap-1 text-sm font-medium text-zinc-600">
              Category
              <select
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                value={categoryId}
                onChange={(event) => {
                  setCategoryId(event.target.value);
                  setSubcategoryId('');
                }}
                required
              >
                <option value="">Select category</option>
                {availableCategoryOptions.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-sm font-medium text-zinc-600">
              Sub Category
              <select
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                value={subcategoryId}
                onChange={(event) => setSubcategoryId(event.target.value)}
                disabled={!categoryId}
              >
                <option value="">None</option>
                {categoryId &&
                  getSubcategories(categoryId).map((subcategory) => (
                    <option key={subcategory.id} value={subcategory.id}>
                      {subcategory.name}
                    </option>
                  ))}
              </select>
            </label>
          </>
        )}

        {type === 'transfer' && (
          <>
            <label className="flex flex-col gap-1 text-sm font-medium text-zinc-600">
              From Account
              <select
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                value={fromCategoryId}
                onChange={(event) => {
                  setFromCategoryId(event.target.value);
                  setFromSubcategoryId('');
                }}
                required
              >
                <option value="">Select account</option>
                {accountCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-sm font-medium text-zinc-600">
              To Account
              <select
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                value={toCategoryId}
                onChange={(event) => {
                  setToCategoryId(event.target.value);
                  setToSubcategoryId('');
                }}
                required
              >
                <option value="">Select account</option>
                {accountCategories
                  .filter((category) => category.id !== fromCategoryId)
                  .map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-sm font-medium text-zinc-600">
              From Sub Category
              <select
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                value={fromSubcategoryId}
                onChange={(event) => setFromSubcategoryId(event.target.value)}
                disabled={!fromCategoryId}
              >
                <option value="">None</option>
                {fromCategoryId &&
                  getSubcategories(fromCategoryId).map((subcategory) => (
                    <option key={subcategory.id} value={subcategory.id}>
                      {subcategory.name}
                    </option>
                  ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-sm font-medium text-zinc-600">
              To Sub Category
              <select
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                value={toSubcategoryId}
                onChange={(event) => setToSubcategoryId(event.target.value)}
                disabled={!toCategoryId}
              >
                <option value="">None</option>
                {toCategoryId &&
                  getSubcategories(toCategoryId).map((subcategory) => (
                    <option key={subcategory.id} value={subcategory.id}>
                      {subcategory.name}
                    </option>
                  ))}
              </select>
            </label>
          </>
        )}

        <button
          type="submit"
          className="mt-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700 md:col-span-2"
        >
          Save Entry
        </button>
      </form>
    </section>
  );
};

export default TransactionForm;
