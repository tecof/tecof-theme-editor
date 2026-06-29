import type { ReactElement } from 'react';
import { useCallback, useRef, useState, useMemo, useEffect } from 'react';
import { FieldLabel } from './FieldLabel';
import { FieldErrorBoundary } from './FieldErrorBoundary';
import { MediaDrawer } from './MediaDrawer';
import { useTecof } from '../TecofProvider';
import { TecofPicture } from '../TecofPicture';
import type { UploadedFile } from '../../types';

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
  Image as ImageIcon,
  FolderOpen,
  RefreshCcw,
  X,
  Upload,
  Eye,
  Download,
  FileIcon,
  Search,
  Check,
  ImagePlus,
  Trash2,
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

const getFileExtension = (filename: string) => {
  if (!filename) return '';
  const parts = filename.split('.');
  return parts.length > 1 ? (parts.pop() || '').toUpperCase() : '';
};

const formatBytes = (bytes: number, decimals = 1): string => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
};

/* ─── Props ─── */

export interface UploadFieldProps {
  field: any;
  name: string;
  id: string;
  value: UploadedFile[];
  onChange: (value: UploadedFile[]) => void;
  readOnly?: boolean;
}

export interface UploadFieldOptions {
  /** Field label displayed in the Puck sidebar */
  label?: string;
  /** Icon displayed next to the label (React element, e.g. Lucide icon) */
  labelIcon?: ReactElement;
  /** Whether this field is visible in the sidebar */
  visible?: boolean;
  allowMultiple?: boolean;
  maxFiles?: number;
  acceptedTypes?: string[];
  maxFileSize?: string;
  maxTotalFileSize?: string;
  folder?: string;
  /** Show uploaded files list with view/download buttons */
  showUploadedFiles?: boolean;
  /** Preview height for images in FilePond */
  imagePreviewHeight?: number;
  /** Allow reorder in FilePond */
  allowReorder?: boolean;
  /** Enable image compression before upload */
  imageCompressionEnabled?: boolean;
  /** Image compression options */
  imageCompressionOptions?: {
    maxSizeMB?: number;
    maxWidthOrHeight?: number;
    useWebWorker?: boolean;
    fileType?: string;
  };
}

/* ─── FileItem Component ─── */

const FileItemRenderer = ({
  file,
  onRemove,
  cdnUrl,
  readOnly,
}: {
  file: UploadedFile;
  onRemove?: () => void;
  cdnUrl: string;
  readOnly?: boolean;
}) => {
  const fileUrl = `${cdnUrl}/${file.name}`;
  const ext = getFileExtension(file.name);

  return (
    <div className="tecof-upload-file-item">
      {file.type === 'image/reference' ? (
        <div className="tecof-upload-file-icon" style={{ backgroundColor: '#f4f4f5', color: '#18181b' }}>
          <Code size={16} />
        </div>
      ) : isImageType(file.type) ? (
        <TecofPicture
          data={file}
          alt={file.meta?.originalName || file.name}
          size="thumbnail"
          className="tecof-upload-file-thumb"
          imgStyle={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }}
        />
      ) : (
        <div className="tecof-upload-file-icon">
          <FileIcon size={16} />
        </div>
      )}
      <div className="tecof-upload-file-info">
        <p className="tecof-upload-file-name" title={file.meta?.originalName || file.name}>
          {file.meta?.originalName || file.name}
        </p>
        <div className="tecof-upload-file-meta">
          {ext && <span className="tecof-upload-file-badge">{ext}</span>}
          {file.size > 0 && <span className="tecof-upload-file-size">{formatBytes(file.size)}</span>}
        </div>
      </div>
      <div className="tecof-upload-file-actions">
        {!readOnly && onRemove && (
          <button type="button" className="tecof-upload-action-btn tecof-upload-action-btn-danger" onClick={onRemove} title="Kaldır">
            <Trash2 size={13} />
          </button>
        )}
      </div>
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

/* ─── Main Component ─── */

export const UploadField = ({
  value: rawValue = [],
  onChange,
  allowMultiple = true,
  maxFiles = 100,
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
  maxFileSize = '100MB',
  maxTotalFileSize = '200MB',
  folder = '/',
  readOnly,
  showUploadedFiles = false,
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
  const cdnUrl = apiClient.cdnUrl;

  const [filesForPond, setFilesForPond] = useState<any[]>([]);
  const [showPond, setShowPond] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showRefInput, setShowRefInput] = useState(false);
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

      // Clear pond after successful upload
      setTimeout(() => {
        setFilesForPond([]);
        setShowPond(false);
      }, 1000);
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
    const refFile = {
      _id: `ref_${Date.now()}`,
      name: refCode.trim(),
      size: 0,
      type: 'image/reference',
      meta: { originalName: refCode.trim(), isReference: true }
    };
    const updated = allowMultiple ? [...value, refFile] : [refFile];
    onChange(updated);
    setShowRefInput(false);
    setRefCode('{{ data. }}');
  }, [refCode, allowMultiple, value, onChange]);



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

          const res = await fetch(url, {
            method: 'POST',
            headers: {
              'x-secret-key': secretKey,
              Accept: 'application/json',
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



  return (
    <div className="tecof-upload-container">

      {/* Selected Files List */}
      {value.length > 0 && (
        <div className="tecof-upload-file-list">
          {showUploadedFiles && (
            <div className="tecof-upload-uploaded-header">
              <p className="tecof-upload-uploaded-label">Yüklenen Dosyalar</p>
              <span className="tecof-upload-count-badge">{value.length}</span>
            </div>
          )}
          {value.map((file, idx) => (
            <FileItemRenderer
              key={file._id || idx}
              file={file}
              cdnUrl={cdnUrl}
              readOnly={readOnly}
              onRemove={readOnly ? undefined : () => handleRemove(idx)}
            />
          ))}
        </div>
      )}

      {/* Empty State (when no files and not in upload mode) */}
      {value.length === 0 && !readOnly && canAddMore && !showPond && (
        <div className="flex flex-col gap-2">
          <div
            className="tecof-upload-empty-state"
            onClick={() => setDrawerOpen(true)}
          >
            <div className="tecof-upload-empty-icon">
              <ImagePlus size={16} />
            </div>
            <p className="tecof-upload-empty-title">Dosya ekleyin</p>
            <p className="tecof-upload-empty-desc">
              Medya kütüphanesinden seçin veya yeni yükleyin
            </p>
          </div>
          {!showRefInput && (
            <div className="tecof-upload-main-actions">
              <button type="button" className="tecof-upload-btn-secondary" onClick={() => setShowRefInput(true)}>
                <Code size={13} /> Referans Gir
              </button>
              <button type="button" className="tecof-upload-btn-primary" onClick={() => setShowPond(true)}>
                <Upload size={13} /> Yeni Yükle
              </button>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons (when files are selected) */}
      {!readOnly && canAddMore && !showPond && value.length > 0 && !showRefInput && (
        <div className="tecof-upload-main-actions">
          <button type="button" className="tecof-upload-btn-secondary" onClick={() => setShowRefInput(true)}>
            <Code size={13} /> Referans
          </button>
          <button type="button" className="tecof-upload-btn-secondary" onClick={() => setDrawerOpen(true)}>
            <FolderOpen size={13} /> Kütüphane
          </button>
          <button type="button" className="tecof-upload-btn-primary" onClick={() => setShowPond(true)}>
            <Upload size={13} /> Yükle
          </button>
        </div>
      )}

      {/* Reference Code Input Mode */}
      {showRefInput && (
        <div className="tecof-upload-ref-section" style={{ background: '#ffffff', padding: '10px', borderRadius: '8px', border: '1px solid #e4e4e7', display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '11px', fontWeight: 500, color: '#71717a' }}>Dinamik CMS Değişkeni</span>
            <button type="button" onClick={() => setShowRefInput(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a1a1aa', padding: 0 }}>
              <X size={12} />
            </button>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <input
              type="text"
              value={refCode}
              onChange={(e) => setRefCode(e.target.value)}
              placeholder="{{ data. }}"
              style={{ flex: 1, padding: '6px 8px', fontSize: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddRef();
                }
              }}
            />
            <button
              type="button"
              onClick={handleAddRef}
              style={{ padding: '0 10px', background: '#18181b', color: '#fff', fontSize: '11px', fontWeight: 500, borderRadius: '6px', border: 'none', cursor: 'pointer' }}
            >
              Ekle
            </button>
          </div>
        </div>
      )}

      {/* FilePond Uploader */}
      {!readOnly && showPond && (
        <div className="tecof-upload-pond-section">
          <div className="tecof-upload-pond-header">
            <p className="tecof-upload-pond-header-title">
              <Upload size={14} /> Dosya Yükle
            </p>
            <button
              type="button"
              className="tecof-upload-pond-close-btn"
              onClick={() => setShowPond(false)}
            >
              <X size={14} />
            </button>
          </div>
          <div className="tecof-upload-pond-body">
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
        </div>
      )}

      {/* Media Drawer */}
      <MediaDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onSelect={toggleGalleryFile}
        selectedIds={value.map(v => v._id ?? '')}
        allowMultiple={allowMultiple}
        filterImages={acceptedTypes.length > 0 && acceptedTypes.every(t => t.startsWith('image/'))}
        title="Medya Kütüphanesi"
      />

    </div>
  );
};

UploadField.displayName = 'UploadField';

/* ─── Factory Function (Puck Custom Field) ─── */

export const createUploadField = (options: UploadFieldOptions = {}) => {
  const { label, labelIcon, visible, ...fieldOptions } = options;
  return {
    type: 'custom' as const,
    _fieldType: 'upload' as const,
    label,
    labelIcon,
    visible,
    render: ({ value, onChange, readOnly, field, name, id }: UploadFieldProps) => (
      <FieldLabel label={label || ''} icon={labelIcon} readOnly={readOnly}>
        <FieldErrorBoundary fieldName={name}>
          <UploadField
            field={field}
            name={name}
            id={id}
            value={value || []}
            onChange={onChange}
            readOnly={readOnly}
            {...fieldOptions}
          />
        </FieldErrorBoundary>
      </FieldLabel>
    ),
  };
};

export default UploadField;
