import { createContext, useContext, useMemo } from 'react';
import { TecofApiClient } from '../api';
import type { TecofProviderProps } from '../types';

/* ─── Context ─── */

interface TecofContextValue {
  apiClient: TecofApiClient;
  secretKey: string;
  apiUrl: string;
  cdnUrl?: string;
}

const TecofContext = createContext<TecofContextValue | null>(null);

/* ─── Provider ─── */

export const TecofProvider = ({ apiUrl, secretKey, cdnUrl, children }: TecofProviderProps) => {
  const value = useMemo<TecofContextValue>(
    () => ({
      apiClient: new TecofApiClient(apiUrl, secretKey, cdnUrl),
      secretKey,
      apiUrl,
      cdnUrl,
    }),
    [apiUrl, secretKey, cdnUrl]
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

/**
 * Provider-optional variant for features that DEGRADE instead of break without
 * a `<TecofProvider>` — e.g. repeat zones resolving CMS collection rows only
 * when an API client exists (published pages may render fully static).
 */
export function useTecofOptional(): TecofContextValue | null {
  return useContext(TecofContext);
}

export default TecofProvider;
