'use client';

import { ReactNode } from 'react';

import { FinanceProvider } from '@/context/FinanceContext';

const Providers = ({ children }: { children: ReactNode }) => {
  return <FinanceProvider>{children}</FinanceProvider>;
};

export default Providers;
