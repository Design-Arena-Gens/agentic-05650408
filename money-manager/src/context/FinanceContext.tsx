'use client';

import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
} from 'react';
import { v4 as uuid } from 'uuid';

import type {
  FinanceState,
  Transaction,
  TransactionType,
  Category,
  Summary,
  CategoryType,
} from '@/types/finance';
import { loadState, saveState } from '@/lib/storage';

type FinanceAction =
  | { type: 'HYDRATE_STATE'; payload: FinanceState }
  | { type: 'ADD_CATEGORY'; payload: { name: string; type: CategoryType; parentId?: string | null } }
  | { type: 'REMOVE_CATEGORY'; payload: { id: string } }
  | { type: 'ADD_TRANSACTION'; payload: Omit<Transaction, 'id' | 'createdAt'> }
  | { type: 'REMOVE_TRANSACTION'; payload: { id: string } };

const initialState: FinanceState = {
  categories: [
    { id: uuid(), name: 'Salary', type: 'income', parentId: null, createdAt: new Date().toISOString() },
    { id: uuid(), name: 'Freelance', type: 'income', parentId: null, createdAt: new Date().toISOString() },
    { id: uuid(), name: 'Living', type: 'expense', parentId: null, createdAt: new Date().toISOString() },
    { id: uuid(), name: 'Food', type: 'expense', parentId: null, createdAt: new Date().toISOString() },
    { id: uuid(), name: 'Cash Wallet', type: 'account', parentId: null, createdAt: new Date().toISOString() },
    { id: uuid(), name: 'Bank Account', type: 'account', parentId: null, createdAt: new Date().toISOString() },
  ],
  transactions: [],
};

const FinanceContext = createContext<{
  state: FinanceState;
  summary: Summary;
  getCategoriesByType: (type: CategoryType, parentId?: string | null) => Category[];
  getSubcategories: (parentId: string) => Category[];
  addCategory: (input: { name: string; type: CategoryType; parentId?: string | null }) => void;
  removeCategory: (id: string) => void;
  addTransaction: (transaction: {
    type: TransactionType;
    amount: number;
    date: string;
    categoryId?: string;
    subcategoryId?: string;
    fromCategoryId?: string;
    fromSubcategoryId?: string;
    toCategoryId?: string;
    toSubcategoryId?: string;
    note?: string;
  }) => void;
  removeTransaction: (id: string) => void;
} | null>(null);

const financeReducer = (state: FinanceState, action: FinanceAction): FinanceState => {
  switch (action.type) {
    case 'HYDRATE_STATE': {
      return action.payload;
    }
    case 'ADD_CATEGORY': {
      const category: Category = {
        id: uuid(),
        createdAt: new Date().toISOString(),
        parentId: action.payload.parentId ?? null,
        name: action.payload.name,
        type: action.payload.type,
      };

      return { ...state, categories: [...state.categories, category] };
    }
    case 'REMOVE_CATEGORY': {
      const filteredCategories = state.categories.filter((cat) => cat.id !== action.payload.id && cat.parentId !== action.payload.id);
      const filteredTransactions = state.transactions.filter((transaction) => {
        return ![
          transaction.categoryId,
          transaction.subcategoryId,
          transaction.fromCategoryId,
          transaction.fromSubcategoryId,
          transaction.toCategoryId,
          transaction.toSubcategoryId,
        ].includes(action.payload.id);
      });

      return { ...state, categories: filteredCategories, transactions: filteredTransactions };
    }
    case 'ADD_TRANSACTION': {
      const transaction: Transaction = {
        id: uuid(),
        createdAt: new Date().toISOString(),
        ...action.payload,
      };
      return { ...state, transactions: [transaction, ...state.transactions] };
    }
    case 'REMOVE_TRANSACTION': {
      return {
        ...state,
        transactions: state.transactions.filter((transaction) => transaction.id !== action.payload.id),
      };
    }
    default:
      return state;
  }
};

export const FinanceProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(financeReducer, initialState);
  const isHydrated = useRef(false);
  const skipInitialSave = useRef(true);

  useEffect(() => {
    const stored = loadState();
    if (stored) {
      dispatch({ type: 'HYDRATE_STATE', payload: stored });
    }
    isHydrated.current = true;
  }, []);

  useEffect(() => {
    if (skipInitialSave.current) {
      skipInitialSave.current = false;
      return;
    }

    if (!isHydrated.current) {
      return;
    }

    saveState(state);
  }, [state]);

  const summary = useMemo<Summary>(() => {
    const totalIncome = state.transactions
      .filter((transaction) => transaction.type === 'income')
      .reduce((acc, transaction) => acc + transaction.amount, 0);
    const totalExpense = state.transactions
      .filter((transaction) => transaction.type === 'expense')
      .reduce((acc, transaction) => acc + transaction.amount, 0);

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
    };
  }, [state.transactions]);

  const getCategoriesByType = useCallback(
    (type: CategoryType, parentId: string | null = null) =>
      state.categories.filter((category) => category.type === type && category.parentId === parentId),
    [state.categories]
  );

  const getSubcategories = useCallback(
    (parentId: string) => state.categories.filter((category) => category.parentId === parentId),
    [state.categories]
  );

  const addCategory = useCallback((input: { name: string; type: CategoryType; parentId?: string | null }) => {
    dispatch({ type: 'ADD_CATEGORY', payload: input });
  }, []);

  const removeCategory = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_CATEGORY', payload: { id } });
  }, []);

  const addTransaction = useCallback(
    (transaction: {
      type: TransactionType;
      amount: number;
      date: string;
      categoryId?: string;
      subcategoryId?: string;
      fromCategoryId?: string;
      fromSubcategoryId?: string;
      toCategoryId?: string;
      toSubcategoryId?: string;
      note?: string;
    }) => {
      dispatch({ type: 'ADD_TRANSACTION', payload: transaction });
    },
    []
  );

  const removeTransaction = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_TRANSACTION', payload: { id } });
  }, []);

  const value = useMemo(
    () => ({
      state,
      summary,
      getCategoriesByType,
      getSubcategories,
      addCategory,
      removeCategory,
      addTransaction,
      removeTransaction,
    }),
    [state, summary, getCategoriesByType, getSubcategories, addCategory, removeCategory, addTransaction, removeTransaction]
  );

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
};

export const useFinance = () => {
  const context = useContext(FinanceContext);

  if (!context) {
    throw new Error('useFinance must be used within FinanceProvider');
  }

  return context;
};
