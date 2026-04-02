import { useCallback, useEffect, useRef, useState } from 'react';
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

// Vaul and Icons
import { Drawer } from 'vaul';
import {
  Image as ImageIcon,
  FolderOpen,
  RefreshCcw,
  X,
  Upload,
  Eye,
  Download,
  FileIcon,
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

/* ─── Styles ─── */

const s = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  fileItem: {
    display: 'flex',
    alignItems: 'center' as const,
    gap: '12px',
    padding: '10px 12px',
    background: '#fafafa',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#e4e4e7',
    borderRadius: '10px',
    transition: 'background 0.15s ease',
  },
  fileThumb: {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    objectFit: 'cover' as const,
    background: '#f4f4f5',
    flexShrink: 0,
  },
  fileIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    background: '#eff6ff',
    display: 'flex',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    color: '#3b82f6',
    flexShrink: 0,
  },
  fileInfo: {
    flex: 1,
    minWidth: 0,
  },
  fileName: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#18181b',
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden' as const,
    textOverflow: 'ellipsis' as const,
    margin: 0,
  },
  fileMeta: {
    display: 'flex',
    alignItems: 'center' as const,
    gap: '6px',
    marginTop: '3px',
  },
  fileBadge: {
    fontSize: '10px',
    fontWeight: 700,
    padding: '1px 5px',
    background: '#dbeafe',
    color: '#2563eb',
    borderRadius: '4px',
    lineHeight: '14px',
  },
  fileSize: {
    fontSize: '11px',
    color: '#a1a1aa',
    margin: 0,
  },
  fileActions: {
    display: 'flex',
    alignItems: 'center' as const,
    gap: '2px',
    flexShrink: 0,
  },
  actionBtn: {
    display: 'flex',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    width: '30px',
    height: '30px',
    color: '#a1a1aa',
    background: 'none',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer' as const,
    transition: 'all 0.15s ease',
  },
  mainActions: {
    display: 'flex',
    gap: '8px',
  },
  btnSecondary: {
    display: 'flex',
    alignItems: 'center' as const,
    gap: '6px',
    flex: 1,
    justifyContent: 'center' as const,
    padding: '10px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#3f3f46',
    background: '#f4f4f5',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#e4e4e7',
    borderRadius: '8px',
    cursor: 'pointer' as const,
    transition: 'all 0.15s ease',
  },
  drawerOverlay: {
    position: 'fixed' as const,
    inset: 0,
    background: 'rgba(0, 0, 0, 0.4)',
    zIndex: 9999,
  },
  drawerContent: {
    position: 'fixed' as const,
    bottom: 0,
    left: 0,
    right: 0,
    height: '85vh',
    display: 'flex',
    flexDirection: 'column' as const,
    background: '#ffffff',
    borderTopLeftRadius: '16px',
    borderTopRightRadius: '16px',
    zIndex: 10000,
    padding: '16px',
  },
  drawerHeader: {
    display: 'flex',
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: '16px',
  },
  drawerTitle: {
    fontSize: '18px',
    fontWeight: 600,
    margin: 0,
  },
  drawerCloseBtn: {
    background: '#f4f4f5',
    border: 'none',
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    cursor: 'pointer' as const,
  },
  galleryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
    gap: '12px',
    overflowY: 'auto' as const,
    paddingBottom: '24px',
  },
  galleryItem: (selected: boolean) => ({
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center' as const,
    padding: '8px',
    background: selected ? '#eff6ff' : '#fafafa',
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: selected ? '#3b82f6' : '#e4e4e7',
    borderRadius: '8px',
    cursor: 'pointer' as const,
    transition: 'all 0.15s ease',
  }),
  galleryThumb: {
    width: '100%',
    aspectRatio: '1',
    objectFit: 'cover' as const,
    borderRadius: '4px',
    marginBottom: '8px',
  },
  uploadedHeader: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#a1a1aa',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    margin: '4px 0 6px 0',
  },
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
  allowMultiple?: boolean;
  maxFiles?: number;
  acceptedTypes?: string[];
  maxFileSize?: string;
  maxTotalFileSize?: string;
  folder?: string;
  label?: string;
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
    <div style={s.fileItem}>
      {isImageType(file.type) ? (
        <TecofPicture
          data={file}
          alt={file.meta?.originalName || file.name}
          size="thumbnail"
          style={s.fileThumb}
          imgStyle={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
        />
      ) : (
        <div style={s.fileIcon}>
          <FileIcon size={18} />
        </div>
      )}
      <div style={s.fileInfo}>
        <p style={s.fileName} title={file.meta?.originalName || file.name}>
          {file.meta?.originalName || file.name}
        </p>
        <div style={s.fileMeta}>
          {ext && <span style={s.fileBadge}>{ext}</span>}
          {file.size > 0 && <span style={s.fileSize}>{formatBytes(file.size)}</span>}
        </div>
      </div>
      <div style={s.fileActions}>
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={s.actionBtn}
          title="Görüntüle"
        >
          <Eye size={15} />
        </a>
        <a
          href={fileUrl}
          download
          style={s.actionBtn}
          title="İndir"
        >
          <Download size={15} />
        </a>
        {!readOnly && onRemove && (
          <button type="button" style={s.actionBtn} onClick={onRemove} title="Kaldır">
            <X size={15} />
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

  // Gallery State
  const [galleryFiles, setGalleryFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

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

  /* ── Drawer Gallery ── */

  useEffect(() => {
    if (!drawerOpen) return;
    setLoading(true);
    apiClient.getUploads(1, 100).then((res) => {
      if (res.success && res.data) {
        setGalleryFiles(res.data);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [drawerOpen, refreshKey, apiClient]);

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
    <div style={s.container}>

      {/* Selected Files List */}
      {value.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {showUploadedFiles && (
            <p style={s.uploadedHeader}>
              Yüklenen Dosyalar ({value.length})
            </p>
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

      {/* Action Buttons */}
      {!readOnly && canAddMore && !showPond && (
        <div style={s.mainActions}>
          <button type="button" style={s.btnSecondary} onClick={() => setDrawerOpen(true)}>
            <FolderOpen size={16} /> Medya Seç
          </button>
          <button type="button" style={s.btnSecondary} onClick={() => setShowPond(true)}>
            <Upload size={16} /> Yeni Yükle
          </button>
        </div>
      )}

      {/* FilePond Uploader */}
      {!readOnly && showPond && (
        <div style={{ marginTop: '8px', position: 'relative' }}>
          <button
            type="button"
            style={{ ...s.actionBtn, position: 'absolute', top: -30, right: 0, zIndex: 1 }}
            onClick={() => setShowPond(false)}
          >
            <X size={16} />
          </button>
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
      )}

      {/* Vaul Media Drawer */}
      <Drawer.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
        <Drawer.Portal>
          <Drawer.Overlay style={s.drawerOverlay} />
          <Drawer.Content style={s.drawerContent}>
            <div style={s.drawerHeader}>
              <h2 style={s.drawerTitle}>Medya Kütüphanesi</h2>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  style={s.drawerCloseBtn}
                  onClick={() => setRefreshKey(k => k + 1)}
                  disabled={loading}
                >
                  <RefreshCcw size={16} />
                </button>
                <button
                  style={s.drawerCloseBtn}
                  onClick={() => setDrawerOpen(false)}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#a1a1aa' }}>Yükleniyor...</div>
            ) : (
              <div style={s.galleryGrid}>
                {galleryFiles.map((file) => {
                  const selected = value.some(v => v._id === file._id);
                  return (
                    <div
                      key={file._id}
                      style={s.galleryItem(selected)}
                      onClick={() => toggleGalleryFile(file)}
                    >
                      {isImageType(file.type) ? (
                        <TecofPicture
                          data={file}
                          alt={file.name}
                          size="thumbnail"
                          style={s.galleryThumb}
                          imgStyle={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }}
                        />
                      ) : (
                        <div style={{ ...s.galleryThumb, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4f4f5' }}>
                          <ImageIcon size={24} color="#a1a1aa" />
                        </div>
                      )}
                      <p style={{ ...s.fileName, fontSize: '11px', width: '100%', textAlign: 'center' }}>
                        {file.name}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

    </div>
  );
};

UploadField.displayName = 'UploadField';

/* ─── Factory Function (Puck Custom Field) ─── */

export const createUploadField = (options: UploadFieldOptions = {}) => {
  const { label, ...fieldOptions } = options;
  return {
    type: 'custom' as const,
    label,
    render: ({ value, onChange, readOnly, field, name, id }: UploadFieldProps) => (
      <UploadField
        field={field}
        name={name}
        id={id}
        value={value || []}
        onChange={onChange}
        readOnly={readOnly}
        {...fieldOptions}
      />
    ),
  };
};

export default UploadField;
