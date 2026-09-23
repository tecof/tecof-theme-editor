import { useCallback, useMemo, useRef } from 'react';
import { FieldLabel } from './FieldLabel';
import { FieldErrorBoundary } from './FieldErrorBoundary';
import { LanguageTabBar, FieldLoading } from './LanguageField';
import { LanguageToolsBar, useLanguageToolsStatus } from './LanguageToolsBar';
import { useLanguages } from './useLanguages';
import { useActiveLanguage } from '../../studio/language/LanguageContext';
import { UploadField, type UploadFieldOptions } from './UploadField';
import type { UploadedFile } from '../../types';
import {
  type LocalizedUploadFieldValue,
  normalizeLocalizedUpload,
  setLocalizedUploadFiles,
  fastFillLocalizedUpload,
  emptyLocalizedUploadCodes,
} from '../../utils/localizedUpload';

/* ─── Props ─── */

export interface LocalizedUploadFieldProps {
  field: any;
  name: string;
  id: string;
  /** Kayıtlı ham değer — yeni biçim, eski düz dizi, tek nesne ya da null gelebilir. */
  value: LocalizedUploadFieldValue[] | UploadedFile[] | UploadedFile | string | null | undefined;
  /** Her zaman yeni biçimde (`[{code, value}]`) yazar. */
  onChange: (value: LocalizedUploadFieldValue[]) => void;
  readOnly?: boolean;
}

/**
 * Seçenekler `UploadField` ile birebir aynıdır (allowMultiple, maxFiles,
 * acceptedTypes, folder, …). Ek seçenek yok; API paritesi bilinçli — bir alanı
 * `createUploadField` → `createLocalizedUploadField` yapmak yalnız fabrika adı
 * değiştirmek olsun.
 */
export type LocalizedUploadFieldOptions = UploadFieldOptions;

/* Merchant bilgisi gelene kadar sabit boş liste — her render'da yeni `[]`
   üretip callback bağımlılıklarını gereksiz yenilememek için. */
const EMPTY_LANGUAGES: string[] = [];

/* ─── Bileşen ─── */

/**
 * LocalizedUploadField — `UploadField`'ın dil sekmeli sürümü.
 *
 * Gövde (medya drawer'ı, FilePond, Doka, odak noktası, CMS referansı) mevcut
 * lazy `UploadField` ile AYNI bileşendir; burada yalnız dil başına `value`
 * dilimlenir ve `onChange` o dile yazılır. İkinci bir impl kopyası bakım
 * borcu olurdu.
 */
export const LocalizedUploadField = ({
  value,
  onChange,
  readOnly,
  field,
  name,
  id,
  ...fieldOptions
}: LocalizedUploadFieldProps & LocalizedUploadFieldOptions) => {
  const {
    merchantInfo,
    loading: langLoading,
    activeTab: localActiveTab,
    setActiveTab: localSetActiveTab,
  } = useLanguages();
  // TecofStudio içinde dil üst çubuktan global seçilir ve alan sekmeleri
  // gizlenir; sağlayıcı yoksa (host Puck / bağımsız) alan kendi sekmesini taşır.
  const globalLang = useActiveLanguage();
  const activeTab = globalLang ? globalLang.activeLanguage : localActiveTab;
  const setActiveTab = globalLang ? globalLang.setActiveLanguage : localSetActiveTab;

  // Durum mesajı + zamanlayıcı temizliği ortak kancadan (LanguageField ile aynı).
  const { status, flash } = useLanguageToolsStatus();

  const languages = merchantInfo ? merchantInfo.languages : EMPTY_LANGUAGES;
  const defaultLanguage = merchantInfo?.defaultLanguage ?? 'tr';

  // Tembel göç: eski düz dizi burada bellekte yeni biçime çevrilir; mount'ta
  // `onChange` ÇAĞRILMAZ (sayfayı kirli işaretler, autosave'i tetikler ve Puck
  // onChange'i her render'da yeniden yarattığı için döngü riski taşır). İlk
  // gerçek düzenlemede yeni biçim yazılır.
  const values = useMemo<LocalizedUploadFieldValue[]>(
    () => normalizeLocalizedUpload(value, merchantInfo ? { languages, defaultLanguage } : undefined),
    [value, merchantInfo, languages, defaultLanguage],
  );

  // Puck `onChange`'i her render'da yeniden yaratır; callback'ler ref üzerinden
  // en güncel değeri okur (LanguageField deseni).
  const valuesRef = useRef(values);
  valuesRef.current = values;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const activeFiles = useMemo<UploadedFile[]>(
    () => values.find(v => v.code === activeTab)?.value ?? [],
    [values, activeTab],
  );

  const handleFilesChange = useCallback((files: UploadedFile[]) => {
    onChangeRef.current(setLocalizedUploadFiles(valuesRef.current, activeTab, files));
  }, [activeTab]);

  const emptyTargets = useMemo(
    () => emptyLocalizedUploadCodes(values, languages, activeTab),
    [values, languages, activeTab],
  );

  const handleFastFill = useCallback(() => {
    const next = fastFillLocalizedUpload(valuesRef.current, activeTab, languages);
    // Aynı referans = kopyalanacak bir şey yoktu; kaydı kirletme.
    if (next === valuesRef.current) return;
    onChangeRef.current(next);
    flash({ text: 'Boş dillere kopyalandı', type: 'success' }, 2000);
  }, [activeTab, languages, flash]);

  // Aktif dil boşken sitede hangi dilin dosyası çıkacak? `resolveLocalizedUpload`
  // ile aynı zincir: varsayılan dil → ilk dolu dil. Hepsi boşsa ipucu yok.
  const fallbackCode = useMemo<string | null>(() => {
    if (activeFiles.length > 0) return null;
    const has = (code: string) => (values.find(v => v.code === code)?.value.length ?? 0) > 0;
    if (has(defaultLanguage)) return defaultLanguage;
    return values.find(v => v.value.length > 0)?.code ?? null;
  }, [activeFiles, values, defaultLanguage]);

  // Merchant dilleri (ve aktif sekme) gelene kadar gövdeyi çizme: aksi hâlde
  // boş `''` dil koduna dosya yazılabilirdi. `useLanguages` hata durumunda
  // `['tr']` yedeğine düştüğü için alan hiç kilitli kalmaz.
  if (langLoading || !merchantInfo || !activeTab) return <FieldLoading />;

  const hasMultipleLanguages = languages.length > 1;

  return (
    <div className="tecof-lang-container">
      {!globalLang && (
        <LanguageTabBar
          languages={languages}
          defaultLanguage={defaultLanguage}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      )}

      {/* key={activeTab}: impl'in FilePond kuyruğu, drawer ve odak durumu dil
          başına sıfırlansın — EN'de açık kalan kuyruk TR'ye yazmasın. Lazy modül
          ilk yüklemeden sonra önbellekte olduğu için sekme geçişinde iskelet
          titremesi olmaz. */}
      <UploadField
        key={activeTab}
        field={field}
        name={name}
        id={id}
        value={activeFiles}
        onChange={handleFilesChange}
        readOnly={readOnly}
        {...fieldOptions}
      />

      {fallbackCode && fallbackCode !== activeTab && (
        <p className="tecof-media-ref-desc">
          Bu dilde görsel yok — sitede {fallbackCode.toUpperCase()} görseli gösterilir.
        </p>
      )}

      {/* Yalnız Hızlı Doldur; dosya çevrilmez, "Çevir" düğmesi yok (onTranslate verilmez). */}
      {!readOnly && hasMultipleLanguages && (
        <LanguageToolsBar
          onFill={handleFastFill}
          fillDisabled={activeFiles.length === 0 || emptyTargets.length === 0}
          fillTitle="Aktif sekmedeki dosyaları boş dillere kopyala"
          status={status}
        />
      )}
    </div>
  );
};

LocalizedUploadField.displayName = 'LocalizedUploadField';

/* ─── Fabrika (Puck Custom Field) ─── */

export const createLocalizedUploadField = (options: LocalizedUploadFieldOptions = {}) => {
  const { label, labelIcon, visible, ...fieldOptions } = options;
  return {
    type: 'custom' as const,
    _fieldType: 'localized-upload' as const,
    label,
    labelIcon,
    visible,
    render: ({ value, onChange, readOnly, field, name, id }: LocalizedUploadFieldProps) => (
      <FieldLabel label={label || ''} icon={labelIcon} readOnly={readOnly}>
        <FieldErrorBoundary fieldName={name}>
          <LocalizedUploadField
            field={field}
            name={name}
            id={id}
            value={value ?? []}
            onChange={onChange}
            readOnly={readOnly}
            {...fieldOptions}
          />
        </FieldErrorBoundary>
      </FieldLabel>
    ),
  };
};

export default LocalizedUploadField;
