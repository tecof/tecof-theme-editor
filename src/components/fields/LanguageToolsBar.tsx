import { useCallback, useEffect, useRef, useState } from 'react';
import { Copy, Languages, Loader2 } from 'lucide-react';

/*
 * Çok dilli alanların ortak araç çubuğu: "Hızlı Doldur" + (isteğe bağlı) "Çevir"
 * + durum mesajı. Markup ve sınıflar LanguageField'daki eski bloğun aynısıdır;
 * iş mantığı yoktur — o `languageTools.ts`'te, çağıran alan kablolar.
 */

export interface LanguageToolsStatus {
  text: string;
  type: 'success' | 'error';
}

/**
 * Durum mesajı + translating bayrağı + zamanlayıcı temizliği. Mantık içermez.
 * `flash` önceki zamanlayıcıyı iptal eder ve unmount'ta temizlenir; böylece
 * React'in "unmounted component'e state update" uyarısı oluşmaz.
 */
export function useLanguageToolsStatus(): {
  status: LanguageToolsStatus | null;
  translating: boolean;
  setTranslating: (v: boolean) => void;
  /** ms sonra otomatik temizler (Doldur 2000, Çevir 3000 — LanguageField birebir) */
  flash: (status: LanguageToolsStatus, ms: number) => void;
  clear: () => void;
} {
  const [status, setStatus] = useState<LanguageToolsStatus | null>(null);
  const [translating, setTranslating] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const clear = useCallback(() => {
    cancelTimer();
    setStatus(null);
  }, [cancelTimer]);

  const flash = useCallback((next: LanguageToolsStatus, ms: number) => {
    cancelTimer();
    setStatus(next);
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      setStatus(null);
    }, ms);
  }, [cancelTimer]);

  // Unmount'ta bekleyen zamanlayıcıyı bırak.
  useEffect(() => cancelTimer, [cancelTimer]);

  return { status, translating, setTranslating, flash, clear };
}

export interface LanguageToolsBarProps {
  onFill: () => void;
  fillDisabled?: boolean;
  /** varsayılan 'Hızlı Doldur' */
  fillLabel?: string;
  /** varsayılan 'Aktif sekmedeki metni tüm dillere kopyala' */
  fillTitle?: string;
  /** verilmezse Çevir düğmesi çizilmez (LinkField) */
  onTranslate?: () => void;
  translateDisabled?: boolean;
  /** varsayılan 'Aktif sekmedeki metni diğer dillere çevir' */
  translateTitle?: string;
  /** Loader2 + 'Çevriliyor...' */
  translating?: boolean;
  status: LanguageToolsStatus | null;
}

export const LanguageToolsBar = ({
  onFill,
  fillDisabled = false,
  fillLabel = 'Hızlı Doldur',
  fillTitle = 'Aktif sekmedeki metni tüm dillere kopyala',
  onTranslate,
  translateDisabled = false,
  translateTitle = 'Aktif sekmedeki metni diğer dillere çevir',
  translating = false,
  status,
}: LanguageToolsBarProps) => (
  <div className="tecof-lang-action-bar">
    <button
      type="button"
      className="tecof-lang-action-btn"
      onClick={onFill}
      disabled={fillDisabled}
      title={fillTitle}
    >
      <Copy size={12} /> {fillLabel}
    </button>

    {onTranslate && (
      <button
        type="button"
        className="tecof-lang-action-btn"
        onClick={onTranslate}
        disabled={translateDisabled || translating}
        aria-busy={translating || undefined}
        title={translateTitle}
      >
        {translating ? (
          <Loader2 size={12} className="tecof-spin" />
        ) : (
          <Languages size={12} />
        )}
        {translating ? 'Çevriliyor...' : 'Çevir'}
      </button>
    )}

    {/* Canlı bölge: mesaj 2–3 sn'de silindiği için ekran okuyucu ancak
        role/aria-live ile duyar; hata `alert` (assertive), başarı `status`. */}
    {status && (
      <span
        className={`tecof-lang-status-msg ${status.type === 'success' ? 'success' : 'error'}`}
        role={status.type === 'error' ? 'alert' : 'status'}
        aria-live={status.type === 'error' ? 'assertive' : 'polite'}
      >
        {status.text}
      </span>
    )}
  </div>
);

LanguageToolsBar.displayName = 'LanguageToolsBar';

export default LanguageToolsBar;
