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
  /** Panelin (app.tecof.com) taban adresi — alanlardaki "Panelde yönet"
   *  bağlantıları bunun üzerine kurulur. `TecofEditorProps.panelUrl`'den gelir. */
  panelUrl?: string;
}

export const StudioContext = createContext<StudioContextType | null>(null);

/**
 * Provider YOKSA `null` döner — hata fırlatmaz.
 *
 * Alan bileşenleri (UploadField, EcommerceField, LinkField…) yalnız editörde
 * değil; tema paketinin standalone form/önizleme yüzeylerinde de render
 * edilebiliyor. `useStudio` orada patlardı; panel bağlantısı gibi İSTEĞE BAĞLI
 * bilgiler bu kancayla okunur ve yoklukta varsayılana düşülür.
 */
export const useStudioOptional = (): StudioContextType | null => useContext(StudioContext);

export const useStudio = () => {
  const ctx = useContext(StudioContext);
  if (!ctx) {
    throw new Error('useStudio must be used within a StudioProvider');
  }
  return ctx;
};
