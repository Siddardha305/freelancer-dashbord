'use client';

import React, { createContext, useContext, useState } from 'react';

interface CurrencyContextType {
  currency: string;
  symbol: string;
  setCurrency: (currency: string) => void;
  formatCurrency: (amount: number | string) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ 
  children, 
  initialCurrency = 'INR' 
}: { 
  children: React.ReactNode;
  initialCurrency?: string;
}) {
  const [currency, setCurrencyState] = useState(initialCurrency);
  const [prevInitialCurrency, setPrevInitialCurrency] = useState(initialCurrency);

  if (initialCurrency !== prevInitialCurrency) {
    setPrevInitialCurrency(initialCurrency);
    setCurrencyState(initialCurrency || 'INR');
  }

  const getSymbol = (code: string) => {
    switch (code) {
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'INR':
      default: return '₹';
    }
  };

  const symbol = getSymbol(currency);

  const setCurrency = (code: string) => {
    setCurrencyState(code);
  };

  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === 'number' ? amount : Number(amount || 0);
    return `${symbol}${num.toLocaleString()}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, symbol, setCurrency, formatCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    return {
      currency: 'INR',
      symbol: '₹',
      setCurrency: () => {},
      formatCurrency: (amount: number | string) => {
        const num = typeof amount === 'number' ? amount : Number(amount || 0);
        return `₹${num.toLocaleString()}`;
      }
    };
  }
  return context;
}
