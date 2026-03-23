import { createContext, useContext, useMemo } from 'react';
import { TecofApiClient } from '../api';
import type { TecofProviderProps } from '../types';

/* ─── Context ─── */

interface TecofContextValue {
  apiClient: TecofApiClient;
  secretKey: string;
  apiUrl: string;
}

const TecofContext = createContext<TecofContextValue | null>(null);

/* ─── Provider ─── */

export const TecofProvider = ({ apiUrl, secretKey, children }: TecofProviderProps) => {
  const value = useMemo<TecofContextValue>(
    () => ({
      apiClient: new TecofApiClient(apiUrl, secretKey),
      secretKey,
      apiUrl,
    }),
    [apiUrl, secretKey]
  );

  return <TecofContext.Provider value={value}>{children}</TecofContext.Provider>;
};

/* ─── Hook ─── */

export function useTecof(): TecofContextValue {
  const ctx = useContext(TecofContext);
  if (!ctx) {
    throw new Error('useTecof must be used within a <TecofProvider>');
  }
  return ctx;
}

export default TecofProvider;
