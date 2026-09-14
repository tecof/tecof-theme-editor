import React, { useRef } from 'react';
import { RefreshCcw, Search } from 'lucide-react';
import { StudioDrawer } from '../../studio/ui/StudioDrawer';

/**
 * PickerDrawer — "veri seç" penceresi (ExternalField, EcommerceField,
 * ProductField, VariantField ortak kabuğu).
 *
 * StudioDrawer size 'md': baş satırında arama kutusu + Yenile + Kapat;
 * gövde `tecof-cmdk-list` sınıfıyla liste (satırlar `tecof-cmdk-item`,
 * boş/yükleniyor `tecof-cmdk-empty`, hata `tecof-external-error`). Böylece
 * editörde tek bir "veri seç" dili olur ve komut paletiyle aynı liste
 * görünümü paylaşılır.
 *
 * Drawer hep mount kalır (kapanış animasyonu için); veri çekimini çağıran
 * `open`'a bağlar, bu bileşen çekmez.
 */
export interface PickerDrawerProps {
  open: boolean;
  title: string;
  query: string;
  onQueryChange: (value: string) => void;
  /** Listeyi yeniden çek; verilmezse Yenile düğmesi çizilmez. */
  onReload?: () => void;
  onClose: () => void;
  loading?: boolean;
  /** false ise arama kutusu yerine yalnız başlık basılır (varyant 2. adımı). */
  searchable?: boolean;
  /** Arama kutusu yer tutucusu; varsayılan `${title} — ara…`. */
  placeholder?: string;
  children: React.ReactNode;
}

export const PickerDrawer = ({
  open,
  title,
  query,
  onQueryChange,
  onReload,
  onClose,
  loading,
  searchable = true,
  placeholder,
  children,
}: PickerDrawerProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <StudioDrawer
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
      size="md"
      title={title}
      className="tecof-picker-drawer"
      bodyClassName="tecof-picker-drawer-body"
      onOpenAutoFocus={(e) => {
        if (!searchable || !inputRef.current) return;
        e.preventDefault();
        inputRef.current.focus({ preventScroll: true });
      }}
      headerActions={
        <>
          {searchable && (
            <label className="tecof-picker-drawer-search">
              <Search size={15} className="tecof-cmdk-search-icon" aria-hidden="true" />
              <input
                ref={inputRef}
                type="text"
                className="tecof-picker-drawer-input"
                placeholder={placeholder ?? `${title} — ara…`}
                aria-label={`${title} — ara`}
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
              />
            </label>
          )}
          {onReload && (
            <button
              type="button"
              className="tecof-drawer-close"
              onClick={onReload}
              title="Listeyi yenile"
              aria-label="Listeyi yenile"
              disabled={loading}
            >
              <RefreshCcw size={14} className={loading ? 'tecof-upload-spin' : ''} />
            </button>
          )}
        </>
      }
    >
      <div className="tecof-cmdk-list tecof-picker-drawer-list">{children}</div>
    </StudioDrawer>
  );
};

export default PickerDrawer;
