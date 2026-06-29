import React, { createContext, useContext } from 'react';
import type { TecofApiClient } from '../api';

export interface StudioContextType {
  config: any;
  metadata?: Record<string, any>;
  apiClient?: TecofApiClient;
  readOnly?: boolean;
}

export const StudioContext = createContext<StudioContextType | null>(null);

export const useStudio = () => {
  const ctx = useContext(StudioContext);
  if (!ctx) {
    throw new Error('useStudio must be used within a StudioProvider');
  }
  return ctx;
};
