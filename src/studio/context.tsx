import React, { createContext, useContext } from 'react';
import type { TecofApiClient } from '../api';
import type { StudioConfig } from '../types';

export interface StudioContextType {
  config: StudioConfig;
  metadata?: Record<string, any>;
  apiClient?: TecofApiClient;
  readOnly?: boolean;
  /** Düzenlenen sayfanın id'si — stil senkronu gibi SAYFA BAZLI uçlar bunu
   *  ister (kaynak sayfa hedeflerden dışlanır ve temayı o belirler). */
  pageId?: string;
}

export const StudioContext = createContext<StudioContextType | null>(null);

export const useStudio = () => {
  const ctx = useContext(StudioContext);
  if (!ctx) {
    throw new Error('useStudio must be used within a StudioProvider');
  }
  return ctx;
};
