'use client';

import React, { type ReactNode } from 'react';

/**
 * <Slot> — bir slot alanını tek satırda render eder. `renderSlot` + yerleşim +
 * (opsiyonel) boş-gizleme'yi birleştirir; tema yazarının her çağrıda className +
 * eşleşen `style` (slotGap/slotRow) geçirme yükünü kaldırır.
 *
 * NEDEN managedLayout: motor (RenderDropZone/DropZone) yatay slot'a VARSAYILAN
 * yerleşimi inline (yayın) ya da katmansız class (editör) olarak basıyordu ve
 * ikisi de tema Tailwind sınıflarını EZİYORDU. `<Slot>` `managedLayout` bayrağını
 * geçtiğinde motor varsayılanı basmaz; yerleşim tümüyle buradaki `layout`/`gap`/
 * `className`'den gelir (tema utilities'i kazanır). Düz `renderSlot` çağrıları
 * bayrağı geçmez → eski davranış korunur (BC).
 *
 * Yerleşim class'ları (`.tecof-slot-row` vb.) @layer base'de tanımlıdır:
 * editörde paket styles.css'ten, yayında temanın globals.css'inden. base <
 * utilities olduğu için `className="gap-x-10 flex-col"` gibi ek niyet kazanır.
 */

export type SlotLayout = 'row' | 'row-wrap' | 'col' | 'contents' | 'none';
export type SlotGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | (string & {});

const LAYOUT_CLASS: Record<SlotLayout, string> = {
  row: 'tecof-slot-row',
  'row-wrap': 'tecof-slot-row-wrap',
  col: 'tecof-slot-col',
  contents: 'tecof-slot-contents',
  none: '',
};

const GAP_VALUE: Record<string, string> = {
  none: '0px',
  xs: '0.25rem',
  sm: '0.5rem',
  md: '0.75rem',
  lg: '1rem',
  xl: '1.5rem',
};

const cx = (...v: Array<string | false | null | undefined>) => v.filter(Boolean).join(' ');

export interface SlotProps {
  /** Motorun enjekte ettiği slot değeri (tema render'ında `p.<slotAdı>`). */
  value: React.ComponentType<Record<string, unknown>> | ReactNode;
  /** Yerleşim: satır / saran satır / sütun / kapsayıcıyı yok say / düz (varsayılan 'none'). */
  layout?: SlotLayout;
  /** Boşluk ölçeği (`--tecof-slot-gap`) — `md`, `lg` ya da `"1.25rem"` gibi ham değer. */
  gap?: SlotGap;
  /** Ek düzen niyeti (hizalama vb.) — YERLEŞİM `layout`'tan gelir, buraya yazma. */
  className?: string;
  /** Slot kapsayıcısına ek inline stil (nadiren gerekir). */
  style?: React.CSSProperties;
}

export const Slot = ({ value, layout = 'none', gap, className, style }: SlotProps): ReactNode => {
  if (!value) return null;

  const gapValue = gap != null ? GAP_VALUE[gap] ?? gap : undefined;
  const mergedStyle: React.CSSProperties | undefined =
    gapValue != null
      ? ({ ['--tecof-slot-gap']: gapValue, ...style } as React.CSSProperties)
      : style;

  const injected: Record<string, unknown> = {
    managedLayout: true,
    className: cx('tecof-slot', LAYOUT_CLASS[layout], className),
    ...(mergedStyle ? { style: mergedStyle } : {}),
  };

  // Motor slot'u yayında ELEMENT (RenderDropZone), editörde ELEMENT (DropZone)
  // olarak enjekte eder; güvenlik için fonksiyon (component) biçimi de desteklenir.
  if (React.isValidElement(value)) {
    return React.cloneElement(value as React.ReactElement<Record<string, unknown>>, injected);
  }
  const Component = value as React.ComponentType<Record<string, unknown>>;
  return <Component {...injected} />;
};

export default Slot;
