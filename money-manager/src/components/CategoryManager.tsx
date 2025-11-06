'use client';

import { FormEvent, useMemo, useState } from 'react';

import { useFinance } from '@/context/FinanceContext';
import type { Category, CategoryType } from '@/types/finance';

const CATEGORY_TYPES: CategoryType[] = ['income', 'expense', 'account'];

const CategoryManager = () => {
  const { state, addCategory, removeCategory } = useFinance();
  const [categoryName, setCategoryName] = useState('');
  const [categoryType, setCategoryType] = useState<CategoryType>('income');
  const [subcategoryName, setSubcategoryName] = useState('');
  const [subcategoryParentId, setSubcategoryParentId] = useState<string>('');

  const parentCategories = useMemo(
    () => state.categories.filter((category) => !category.parentId),
    [state.categories]
  );

  const groupedByType = useMemo(() => {
    return CATEGORY_TYPES.reduce<Record<CategoryType, Category[]>>(
      (acc, type) => ({
        ...acc,
        [type]: state.categories.filter((category) => category.type === type && !category.parentId),
      }),
      {
        income: [],
        expense: [],
        account: [],
      }
    );
  }, [state.categories]);

  const renderSubcategories = (parentId: string) =>
    state.categories.filter((category) => category.parentId === parentId);

  const handleCategorySubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!categoryName.trim()) return;

    addCategory({ name: categoryName.trim(), type: categoryType, parentId: null });
    setCategoryName('');
  };

  const handleSubcategorySubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!subcategoryName.trim() || !subcategoryParentId) return;

    const parentCategory = state.categories.find((category) => category.id === subcategoryParentId);
    if (!parentCategory) return;

    addCategory({
      name: subcategoryName.trim(),
      type: parentCategory.type,
      parentId: parentCategory.id,
    });
    setSubcategoryName('');
  };

  return (
    <section className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-800">Category Library</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Manage all categories and sub categories for your income, expenses, transfers, and accounts.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {CATEGORY_TYPES.map((type) => (
            <div key={type} className="rounded-lg border border-zinc-200 p-4">
              <h3 className="text-sm font-semibold uppercase tracking-tight text-zinc-500">{type}</h3>
              <ul className="mt-3 space-y-3">
                {groupedByType[type].length === 0 && (
                  <li className="text-sm text-zinc-500">No categories yet.</li>
                )}
                {groupedByType[type].map((category) => (
                  <li key={category.id} className="rounded-md bg-zinc-50 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium text-zinc-700">{category.name}</span>
                      <button
                        type="button"
                        className="text-xs font-medium text-red-500 hover:text-red-600"
                        onClick={() => removeCategory(category.id)}
                      >
                        Delete
                      </button>
                    </div>
                    <ul className="mt-2 space-y-1 pl-4 text-sm text-zinc-500">
                      {renderSubcategories(category.id).length === 0 && <li>No sub categories</li>}
                      {renderSubcategories(category.id).map((subcategory) => (
                        <li key={subcategory.id} className="flex items-center justify-between gap-2">
                          <span>{subcategory.name}</span>
                          <button
                            type="button"
                            className="text-xs font-medium text-red-500 hover:text-red-600"
                            onClick={() => removeCategory(subcategory.id)}
                          >
                            Delete
                          </button>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <form
          onSubmit={handleCategorySubmit}
          className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-zinc-800">Add New Category</h2>
          <label className="mt-4 block text-sm font-medium text-zinc-600">
            Category Name
            <input
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              value={categoryName}
              onChange={(event) => setCategoryName(event.target.value)}
              placeholder="e.g. Utilities"
              required
            />
          </label>

          <label className="mt-4 block text-sm font-medium text-zinc-600">
            Category Type
            <select
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              value={categoryType}
              onChange={(event) => setCategoryType(event.target.value as CategoryType)}
            >
              {CATEGORY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </label>

          <button
            type="submit"
            className="mt-6 w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Save Category
          </button>
        </form>

        <form
          onSubmit={handleSubcategorySubmit}
          className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-zinc-800">Add Sub Category</h2>
          <label className="mt-4 block text-sm font-medium text-zinc-600">
            Parent Category
            <select
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              value={subcategoryParentId}
              onChange={(event) => setSubcategoryParentId(event.target.value)}
              required
            >
              <option value="">Select category</option>
              {parentCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name} ({category.type})
                </option>
              ))}
            </select>
          </label>

          <label className="mt-4 block text-sm font-medium text-zinc-600">
            Sub Category Name
            <input
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              value={subcategoryName}
              onChange={(event) => setSubcategoryName(event.target.value)}
              placeholder="e.g. Mobile Recharge"
              required
            />
          </label>

          <button
            type="submit"
            className="mt-6 w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800"
          >
            Save Sub Category
          </button>
        </form>
      </div>
    </section>
  );
};

export default CategoryManager;
