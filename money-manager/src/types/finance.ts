export type TransactionType = 'income' | 'expense' | 'transfer';

export type CategoryType = 'income' | 'expense' | 'account';

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  parentId?: string | null;
  createdAt: string;
}

export interface Transaction {
  id: string;
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
  createdAt: string;
}

export interface FinanceState {
  categories: Category[];
  transactions: Transaction[];
}

export interface Summary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}
