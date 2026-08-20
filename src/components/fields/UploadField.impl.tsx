import { useCallback, useRef, useState } from 'react';
import { MediaDrawer, type MediaDrawerTab } from './MediaDrawer';
import { useTecof } from '../TecofProvider';
import { TecofPicture } from '../TecofPicture';
import type { UploadedFile } from '../../types';
import type { UploadFieldProps, UploadFieldOptions } from './UploadField';

// FilePond Imports
import { FilePond, registerPlugin } from 'react-filepond';
import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import FilePondPluginImageCrop from 'filepond-plugin-image-crop';
import FilePondPluginImageResize from 'filepond-plugin-image-resize';
import FilePondPluginImageTransform from 'filepond-plugin-image-transform';
import FilePondPluginImageEdit from 'filepond-plugin-image-edit';

// Doka Image Editor
import { create } from '../../vendor/doka.esm.min';

// Image Compression
import imageCompression from 'browser-image-compression';

// Icons and Helpers
import {
  X,
  Upload,
  FileIcon,
  ImagePlus,
  Code,
} from 'lucide-react';

registerPlugin(
  FilePondPluginFileValidateSize,
  FilePondPluginFileValidateType,
  FilePondPluginImageExifOrientation,
  FilePondPluginImagePreview,
  FilePondPluginImageCrop,
  FilePondPluginImageResize,
  FilePondPluginImageTransform,
  FilePondPluginImageEdit
);

/* ─── Constants ─── */

const DEFAULT_ACCEPTED_TYPES = [
  'image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif', 'image/bmp',
  'image/svg+xml', 'image/tiff', 'image/heic', 'image/avif',
  'application/pdf',
  'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
  'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'video/mp4', 'video/webm', 'video/ogg', 'video/x-msvideo', 'video/quicktime',
];

const DEFAULT_COMPRESSION_OPTIONS = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  fileType: 'image/webp' as const,
};

/* ─── Helpers ─── */

const isImageType = (type: string) =>
  ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'avif', 'bmp', 'tiff', 'heic', 'image'].some(
    (t) => type?.toLowerCase().includes(t)
  );

/**
 * External stock photos (Freepik vb.) carry `type: 'external'` + a direct
 * `url` instead of an image extension — TecofPicture already resolves them,
 * so they must be treated as previewable images here too.
 */
const isPreviewableImage = (file: UploadedFile) =>
  file.type === 'external' || file.provider === 'external' || isImageType(file.type);

const getFileExtension = (filename: string) => {
  if (!filename) return '';
  const parts = filename.split('.');
  return parts.length > 1 ? (parts.pop() || '').toUpperCase() : '';
};

/* ─── MediaTile ─── */

/** A single selected media item, rendered as a visual preview tile. */
const MediaTile = ({
  file,
  onRemove,
  readOnly,
}: {
  file: UploadedFile;
  onRemove?: () => void;
  readOnly?: boolean;
}) => {
  const ext = getFileExtension(file.name);
  const displayName = file.meta?.originalName || file.name;
  const isReference = file.type === 'image/reference';

  return (
    <div className="tecof-media-tile" title={displayName}>
      <div className="tecof-media-tile-preview">
        {isReference ? (
          <div className="tecof-media-tile-ref">
            <Code size={18} />
          </div>
        ) : isPreviewableImage(file) ? (
          <TecofPicture
            data={file}
            alt={displayName}
            size="thumbnail"
            className="tecof-media-tile-img"
          />
        ) : (
          <div className="tecof-media-tile-file">
            <FileIcon size={20} />
            {ext && <span className="tecof-media-tile-ext">{ext}</span>}
          </div>
        )}
        {!readOnly && onRemove && (
          <button
            type="button"
            className="tecof-media-tile-remove"
            onClick={onRemove}
            title="Kaldır"
          >
            <X size={13} />
          </button>
        )}
      </div>
      <span className="tecof-media-tile-caption">{displayName}</span>
    </div>
  );
};

/* ─── FilePond Turkish Labels ─── */

const FILEPOND_LABELS = {
  labelIdle: 'Dosyanızı sürükleyip bırakın veya <span class="filepond--label-action">dosya seçin</span>',
  labelInvalidField: 'Geçersiz dosya alanı',
  labelFileWaitingForSize: 'Boyut alınıyor',
  labelFileSizeNotAvailable: 'Boyut mevcut değil',
  labelFileLoading: 'Yükleniyor',
  labelFileLoadError: 'Yükleme hatası',
  labelFileProcessing: 'Yükleniyor...',
  labelFileProcessingComplete: 'Yükleme tamamlandı',
  labelFileProcessingAborted: 'Yükleme iptal edildi',
  labelFileProcessingError: 'Yükleme hatası',
  labelFileProcessingRevertError: 'Geri alma hatası',
  labelFileRemoveError: 'Silme hatası',
  labelTapToCancel: 'İptal etmek için tıklayın',
  labelTapToRetry: 'Yeniden denemek için tıklayın',
  labelTapToUndo: 'Geri almak için tıklayın',
  labelButtonRemoveItem: 'Kaldır',
  labelButtonAbortItemLoad: 'İptal',
  labelButtonRetryItemLoad: 'Yeniden Dene',
  labelButtonAbortItemProcessing: 'İptal',
  labelButtonUndoItemProcessing: 'Geri Al',
  labelButtonRetryItemProcessing: 'Yeniden Dene',
  labelButtonProcessItem: 'Yükle',
  labelMaxFileSizeExceeded: 'Dosya çok büyük',
  labelMaxFileSize: 'Maksimum dosya boyutu: {filesize}',
  labelMaxTotalFileSizeExceeded: 'Toplam dosya boyutu aşıldı',
  labelMaxTotalFileSize: 'Toplam dosya boyutu en fazla {filesize}',
  labelFileTypeNotAllowed: 'Bu dosya türüne izin verilmiyor',
  fileValidateTypeLabelExpectedTypes: 'Desteklenen türler: {allButLastType} ya da {lastType}',
};

/* ─── Doka Editor Turkish Labels ─── */

const DOKA_LABELS = {
  // Ana Butonlar
  labelButtonReset: 'Sıfırla',
  labelButtonCancel: 'İptal',
  labelButtonConfirm: 'Tamam',

  // Araç Butonları
  labelButtonUtilCrop: 'Kırp',
  labelButtonUtilResize: 'Yeniden Boyutlandır',
  labelButtonUtilFilter: 'Filtrele',
  labelButtonUtilColor: 'Renkler',
  labelButtonUtilMarkup: 'İşaretle',
  labelButtonUtilSticker: 'Çıkartma',

  // Durum Mesajları
  labelStatusMissingWebGL: 'WebGL gerekli fakat tarayıcınızda devre dışı bırakılmış',
  labelStatusAwaitingImage: 'Görsel bekleniyor…',
  labelStatusLoadImageError: 'Görsel yüklenirken bir hata oluştu…',
  labelStatusLoadingImage: 'Görsel yükleniyor…',
  labelStatusProcessingImage: 'Görsel işleniyor…',

  // Renk Ayarları
  labelColorBrightness: 'Parlaklık',
  labelColorContrast: 'Kontrast',
  labelColorExposure: 'Pozlama',
  labelColorSaturation: 'Doygunluk',

  // Kırpma (Crop) Aracı
  labelCropInstructionZoom: 'Fare tekerleği veya dokunmatik yüzey ile yakınlaştırıp uzaklaştırın.',
  labelButtonCropZoom: 'Yakınlaştır',
  labelButtonCropRotateLeft: 'Sola Döndür',
  labelButtonCropRotateRight: 'Sağa Döndür',
  labelButtonCropRotateCenter: 'Döndürmeyi Ortala',
  labelButtonCropFlipHorizontal: 'Yatay Çevir',
  labelButtonCropFlipVertical: 'Dikey Çevir',
  labelButtonCropAspectRatio: 'En Boy Oranı',
  labelButtonCropToggleLimit: 'Kırpma Sınırı',
  labelButtonCropToggleLimitEnable: 'Görüntü ile Sınırlı',
  labelButtonCropToggleLimitDisable: 'Görüntü Dışını Seç',

  // İşaretleme (Markup) Aracı
  labelMarkupTypeRectangle: 'Kare',
  labelMarkupTypeEllipse: 'Daire',
  labelMarkupTypeText: 'Metin',
  labelMarkupTypeLine: 'Ok',
  labelMarkupSelectFontSize: 'Boyut',
  labelMarkupSelectFontFamily: 'Yazı Tipi',
  labelMarkupSelectLineDecoration: 'Süsleme',
  labelMarkupSelectLineStyle: 'Stil',
  labelMarkupSelectShapeStyle: 'Stil',
  labelMarkupRemoveShape: 'Kaldır',
  labelMarkupToolSelect: 'Seç',
  labelMarkupToolDraw: 'Çiz',
  labelMarkupToolLine: 'Ok',
  labelMarkupToolText: 'Metin',
  labelMarkupToolRect: 'Kare',
  labelMarkupToolEllipse: 'Daire',

  // Yeniden Boyutlandırma (Resize) Aracı
  labelResizeWidth: 'Genişlik',
  labelResizeHeight: 'Yükseklik',
  labelResizeApplyChanges: 'Uygula',
};

/* ─── Heavy Implementation ─── */

/**
 * UploadFieldImpl — The heavy FilePond/Doka-backed implementation.
 *
 * Single entry point: selected media render as visual preview tiles plus an
 * "add" tile that opens the media drawer. The drawer hosts three tabs —
 * Kütüphane (library), Yükle (FilePond upload) and Referans (CMS variable) —
 * so every media source lives behind one affordance.
 *
 * Statically imports react-filepond, FilePond plugins, the Doka editor and
 * browser-image-compression; loaded lazily via the UploadField wrapper so it
 * stays out of the initial bundle chunk.
 */
const UploadFieldImpl = ({
  value: rawValue = [],
  onChange,
  allowMultiple = true,
  maxFiles = 100,
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
  maxFileSize = '100MB',
  maxTotalFileSize = '200MB',
  folder = '/',
  readOnly,
  imagePreviewHeight = 256,
  allowReorder = true,
  imageCompressionEnabled = true,
  imageCompressionOptions = DEFAULT_COMPRESSION_OPTIONS,
}: UploadFieldProps & UploadFieldOptions) => {

  // Defensive normalization
  let value: UploadedFile[] = [];
  if (Array.isArray(rawValue)) {
    value = rawValue;
  } else if (typeof rawValue === 'string' && rawValue) {
    value = [{ _id: 'legacy', name: rawValue, size: 0, type: 'image/jpeg' }];
  } else if (rawValue && typeof rawValue === 'object') {
    value = [rawValue as UploadedFile];
  }

  const { apiUrl, secretKey, apiClient } = useTecof();

  const [filesForPond, setFilesForPond] = useState<any[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [refCode, setRefCode] = useState('{{ data. }}');

  // Source → _id tracking for edit/remove
  const sourceToIdRef = useRef<Map<string, string>>(new Map());

  /* ── Image Compression ── */

  const compressFile = useCallback(async (file: File): Promise<File> => {
    if (!imageCompressionEnabled) return file;
    if (!file.type?.startsWith('image/')) return file;
    // Don't compress SVGs or GIFs
    if (file.type === 'image/svg+xml' || file.type === 'image/gif') return file;

    try {
      const compressed = await imageCompression(file, imageCompressionOptions as any);
      return compressed;
    } catch (err) {
      console.warn('Image compression failed, uploading original:', err);
      return file;
    }
  }, [imageCompressionEnabled, imageCompressionOptions]);

  /* ── Process Handler ── */

  const handlePondProcess = useCallback((error: any, file: any) => {
    if (error) return;
    try {
      const fileMeta = typeof file.serverId === 'string'
        ? JSON.parse(file.serverId)
        : file.serverId;

      if (!fileMeta?._id) return;

      // Track source → _id
      if (file.source) {
        sourceToIdRef.current.set(file.source, fileMeta._id);
      }

      const updated = allowMultiple ? [...value, fileMeta] : [fileMeta];
      onChange(updated);

      // Clear pond after successful upload; close the drawer for single-select.
      setTimeout(() => setFilesForPond([]), 600);
      if (!allowMultiple) setDrawerOpen(false);
    } catch (e) {
      console.error('FilePond upload parse error:', e);
    }
  }, [value, onChange, allowMultiple]);

  /* ── Remove Handler ── */

  const handleRemove = useCallback((idx: number) => {
    const removedFile = value[idx];
    if (removedFile?._id) {
      // Clean up source tracking
      sourceToIdRef.current.forEach((id, source) => {
        if (id === removedFile._id) sourceToIdRef.current.delete(source);
      });
    }
    const updated = [...value];
    updated.splice(idx, 1);
    onChange(updated);
  }, [value, onChange]);

  /* ── Reference Code Handler ── */

  const handleAddRef = useCallback(() => {
    if (!refCode.trim()) return;
    const refFile: UploadedFile = {
      _id: `ref_${Date.now()}`,
      name: refCode.trim(),
      size: 0,
      type: 'image/reference',
      meta: { originalName: refCode.trim(), isReference: true },
    };
    const updated = allowMultiple ? [...value, refFile] : [refFile];
    onChange(updated);
    setRefCode('{{ data. }}');
    if (!allowMultiple) setDrawerOpen(false);
  }, [refCode, allowMultiple, value, onChange]);

  /* ── Library Select Handler ── */

  const toggleGalleryFile = useCallback((file: UploadedFile) => {
    if (allowMultiple) {
      const exists = value.some(f => f._id === file._id);
      if (exists) {
        onChange(value.filter(f => f._id !== file._id));
      } else {
        onChange([...value, file]);
      }
    } else {
      onChange([file]);
      setDrawerOpen(false);
    }
  }, [value, onChange, allowMultiple]);

  /* ── Server Config ── */

  const serverConfig: any = {
    process: (fieldName: string, file: File, metadata: any, load: any, error: any, progress: any, abort: any) => {
      const controller = new AbortController();

      (async () => {
        try {
          const finalFile = await compressFile(file);

          const formData = new FormData();
          formData.append('files', finalFile, finalFile.name || file.name);

          const url = folder
            ? `${apiUrl}/api/store/upload?folder=${encodeURIComponent(folder)}`
            : `${apiUrl}/api/store/upload`;

          /* Secret key PUBLIC'tir (site bundle'ında gezer); backend yazma
             uçlarında üstüne JWT ister. Editörün diğer TÜM çağrıları
             `this.headers` ile Authorization gönderiyordu — yalnız bu FilePond
             akışı göndermiyordu ve backend upload'ı sıkılaştırıldığında
             `missing-auth-token` ile kırılıyordu. Token varsa eklenir. */
          const accessToken = apiClient?.getAccessToken?.();
          const res = await fetch(url, {
            method: 'POST',
            headers: {
              'x-secret-key': secretKey,
              Accept: 'application/json',
              ...(accessToken ? { Authorization: accessToken } : {}),
            },
            body: formData,
            signal: controller.signal,
          });

          const json = await res.json();
          if (!json.success) throw new Error(json.message || 'Upload failed');

          const fileData = json.data?.[0];
          if (!fileData?._id) throw new Error('Sunucu yanıtında dosya bilgisi bulunamadı');

          load(JSON.stringify({
            _id: fileData._id,
            name: fileData.name,
            size: fileData.size,
            type: fileData.type || 'application/octet-stream',
            /* folder ŞART — dosyalar artık depolama kökünde değil, scope'lu
               klasörde yaşıyor (merchants/{id}/theme/assets/…). Bu alan sayfa
               JSON'una yazılmayınca TecofPicture URL'i köke göre kurup 404
               alıyordu; tüm görüntüleme folder'lı yola bağlı. */
            folder: fileData.folder || '/',
            meta: fileData.meta || {},
          }));
        } catch (err: any) {
          if (err.name !== 'AbortError') {
            console.error('Upload error:', err);
            error('Yükleme hatası');
          }
        }
      })();

      return {
        abort: () => {
          controller.abort();
          abort();
        },
      };
    },
    load: (source: string, load: any, error: any, _progress: any, abort: any) => {
      const request = new XMLHttpRequest();
      request.open('GET', source);
      request.responseType = 'blob';
      request.onload = () => load(request.response);
      request.onerror = () => error('Dosya yüklenemedi');
      request.send();

      return {
        abort: () => {
          request.abort();
          abort();
        },
      };
    },
  };

  const canAddMore = allowMultiple ? value.length < maxFiles : value.length === 0;

  /* ── Drawer Tabs ── */

  const uploadTab: MediaDrawerTab = {
    id: 'upload',
    label: 'Yükle',
    icon: <Upload size={14} />,
    render: () => (
      <div className="tecof-media-upload-panel">
        <FilePond
          files={filesForPond}
          onupdatefiles={setFilesForPond}
          onprocessfile={handlePondProcess}
          allowMultiple={allowMultiple}
          maxFiles={maxFiles - value.length}
          maxFileSize={maxFileSize}
          maxTotalFileSize={maxTotalFileSize}
          acceptedFileTypes={acceptedTypes}
          allowReorder={allowReorder}
          imagePreviewHeight={imagePreviewHeight}
          imageResizeMode="contain"
          imageEditEditor={(create as any)(DOKA_LABELS)}
          server={serverConfig}
          name="files"
          credits={false}
          {...FILEPOND_LABELS}
        />
      </div>
    ),
  };

  const referenceTab: MediaDrawerTab = {
    id: 'reference',
    label: 'Referans',
    icon: <Code size={14} />,
    render: () => (
      <div className="tecof-media-ref-panel">
        <p className="tecof-media-ref-desc">
          CMS koleksiyonundan dinamik bir görsel değişkeni bağlayın.
        </p>
        <div className="tecof-upload-ref-row">
          <input
            type="text"
            value={refCode}
            onChange={(e) => setRefCode(e.target.value)}
            placeholder="{{ data. }}"
            className="tecof-upload-ref-input"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddRef();
              }
            }}
          />
          <button type="button" onClick={handleAddRef} className="tecof-upload-ref-add">
            Ekle
          </button>
        </div>
      </div>
    ),
  };

  return (
    <div className="tecof-upload-container">
      <div className="tecof-media-grid">
        {value.map((file, idx) => (
          <MediaTile
            key={file._id || idx}
            file={file}
            readOnly={readOnly}
            onRemove={readOnly ? undefined : () => handleRemove(idx)}
          />
        ))}

        {!readOnly && canAddMore && (
          <button
            type="button"
            className={`tecof-media-add-tile${value.length === 0 ? ' is-empty' : ''}`}
            onClick={() => setDrawerOpen(true)}
          >
            <ImagePlus size={value.length === 0 ? 22 : 18} />
            <span>{value.length === 0 ? 'Medya ekle' : 'Ekle'}</span>
          </button>
        )}
      </div>

      <MediaDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onSelect={toggleGalleryFile}
        selectedIds={value.map(v => v._id ?? '')}
        allowMultiple={allowMultiple}
        filterImages={acceptedTypes.length > 0 && acceptedTypes.every(t => t.startsWith('image/'))}
        title="Medya"
        enableStock={!readOnly}
        extraTabs={readOnly ? [] : [uploadTab, referenceTab]}
      />
    </div>
  );
};

export default UploadFieldImpl;
