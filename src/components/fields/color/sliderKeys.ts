/**
 * ColorField v2 — kaydırıcıların ORTAK klavye modeli (saf).
 *
 * SV alanı (iki eksen), ton ve opaklık kaydırıcıları aynı tuş sözleşmesini
 * paylaşır; davranış tek yerde tanımlanır ki üç kontrol birbirinden sapmasın:
 *   ArrowRight/ArrowUp  +step (Shift: shiftStep)
 *   ArrowLeft/ArrowDown −step (Shift: shiftStep)
 *   PageUp/PageDown     ±page
 *   Home/End            min/max
 * Sonuç [min, max] içine kırpılır; `wrap:true` (ton) sınırdan diğer uca sarar.
 */
export interface SliderKeyOpts {
  min: number;
  max: number;
  /** Varsayılan 1. */
  step?: number;
  /** Shift ile adım; varsayılan step × 10. */
  shiftStep?: number;
  /** PageUp/PageDown adımı; varsayılan shiftStep. */
  page?: number;
  /** Döngüsel ölçek (ton): max'ı aşınca min'e sarar. */
  wrap?: boolean;
}

/** Klavye olayını hedef değere çevirir; null = ilgisiz tuş (olay yutulmaz). */
export function sliderKeyTarget(key: string, shift: boolean, current: number, o: SliderKeyOpts): number | null {
  const step = o.step ?? 1;
  const shiftStep = o.shiftStep ?? step * 10;
  const page = o.page ?? shiftStep;
  const delta = shift ? shiftStep : step;

  let next: number;
  switch (key) {
    case 'ArrowRight':
    case 'ArrowUp':
      next = current + delta;
      break;
    case 'ArrowLeft':
    case 'ArrowDown':
      next = current - delta;
      break;
    case 'PageUp':
      next = current + page;
      break;
    case 'PageDown':
      next = current - page;
      break;
    case 'Home':
      return o.min;
    case 'End':
      return o.max;
    default:
      return null;
  }

  if (o.wrap) {
    // Ölçek [min, max] KAPALI aralık (0..359): 359 + 1 → 0, 0 − 1 → 359.
    const span = o.max - o.min + step;
    return o.min + ((((next - o.min) % span) + span) % span);
  }
  return Math.min(o.max, Math.max(o.min, next));
}
