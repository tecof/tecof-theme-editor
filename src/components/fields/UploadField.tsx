import { forwardRef, useCallback, useEffect, useState } from 'react';
import { useTecof } from '../TecofProvider';
import type { UploadedFile } from '../../types';

// FilePond Imports
import { FilePond, registerPlugin } from 'react-filepond';
import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';

// Vaul and Icons
import { Drawer } from 'vaul';
import { Image as ImageIcon, FolderOpen, RefreshCcw, X, Upload } from 'lucide-react';

registerPlugin(
  FilePondPluginFileValidateSize,
  FilePondPluginFileValidateType,
  FilePondPluginImageExifOrientation,
  FilePondPluginImagePreview
);

const DEFAULT_ACCEPTED_TYPES = [
  'image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif',
  'image/svg+xml', 'image/avif',
];

const isImage = (type: string) =>
  ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'avif'].includes(type?.toLowerCase());

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
    padding: '8px',
    background: '#ffffff',
    border: '1px solid #e4e4e7',
    borderRadius: '8px',
  },
  fileThumb: {
    width: '44px',
    height: '44px',
    borderRadius: '6px',
    objectFit: 'cover' as const,
    background: '#f4f4f5',
    flexShrink: 0,
  },
  fileIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '6px',
    background: '#f4f4f5',
    display: 'flex',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    color: '#71717a',
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
  fileType: {
    fontSize: '11px',
    color: '#71717a',
    margin: '2px 0 0 0',
  },
  removeBtn: {
    display: 'flex',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    width: '28px',
    height: '28px',
    color: '#a1a1aa',
    background: 'none',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer' as const,
  },
  actionBtns: {
    display: 'flex',
    gap: '8px',
  },
  btnSecondary: {
    display: 'flex',
    alignItems: 'center' as const,
    gap: '6px',
    flex: 1,
    justifyContent: 'center' as const,
    padding: '8px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#3f3f46',
    background: '#f4f4f5',
    border: '1px solid #e4e4e7',
    borderRadius: '6px',
    cursor: 'pointer' as const,
    transition: 'background 0.2s',
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
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
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
    border: `2px solid ${selected ? '#3b82f6' : '#e4e4e7'}`,
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
} as const;

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
  folder?: string;
  label?: string;
}

/* ─── FileItem Component ─── */

const FileItemRenderer = ({ file, onRemove, cdnUrl }: { file: UploadedFile; onRemove?: () => void; cdnUrl: string }) => {
  return (
    <div style={s.fileItem}>
      {isImage(file.type) ? (
        <img src={`${cdnUrl}/${file.name}`} alt={file.name} style={s.fileThumb} />
      ) : (
        <div style={s.fileIcon}><ImageIcon size={20} /></div>
      )}
      <div style={s.fileInfo}>
        <p style={s.fileName}>{file.name}</p>
        <p style={s.fileType}>{file.type?.toUpperCase()}</p>
      </div>
      {onRemove && (
        <button type="button" style={s.removeBtn} onClick={onRemove}>
          <X size={16} />
        </button>
      )}
    </div>
  );
};

/* ─── Main Component ─── */

export const UploadField = forwardRef<any, UploadFieldProps & UploadFieldOptions>(({
  value = [],
  onChange,
  allowMultiple = true,
  maxFiles = 10,
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
  maxFileSize = '5MB',
  folder = '/',
  readOnly,
}, ref) => {
  const { apiUrl, secretKey, apiClient } = useTecof();
  const cdnUrl = apiClient.cdnUrl;

  const [filesForPond, setFilesForPond] = useState<any[]>([]);
  const [showPond, setShowPond] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Gallery State
  const [galleryFiles, setGalleryFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Sync initial FilePond files — we don't strictly load them into FilePond if they are already saved,
  // we just show them in the custom UI and show FilePond purely for *new* uploads.

  const handlePondProcess = (error: any, file: any) => {
    if (error) return;
    try {
      const fileData = typeof file.serverId === 'string' ? JSON.parse(file.serverId) : file.serverId;
      if (fileData && fileData._id) {
        const updated = allowMultiple ? [...value, fileData] : [fileData];
        onChange(updated);
        // Clear pond after successful upload so it doesn't duplicate UI
        setTimeout(() => {
          setFilesForPond([]);
          setShowPond(false);
        }, 1000);
      }
    } catch (e) {
      console.error('FilePond upload error:', e);
    }
  };

  const handleRemove = (idx: number) => {
    const updated = [...value];
    updated.splice(idx, 1);
    onChange(updated);
  };

  // ── Drawer Gallery ──
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

  const toggleGalleryFile = (file: UploadedFile) => {
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
  };

  const canAddMore = allowMultiple ? value.length < maxFiles : value.length === 0;

  return (
    <div style={s.container} ref={ref}>

      {/* Selected Files List */}
      {value.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {value.map((file, idx) => (
            <FileItemRenderer
              key={file._id || idx}
              file={file}
              cdnUrl={cdnUrl}
              onRemove={readOnly ? undefined : () => handleRemove(idx)}
            />
          ))}
        </div>
      )}

      {/* Action Buttons */}
      {!readOnly && canAddMore && !showPond && (
        <div style={s.actionBtns}>
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
            style={{ ...s.removeBtn, position: 'absolute', top: -30, right: 0 }}
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
            acceptedFileTypes={acceptedTypes}
            server={{
              process: (fieldName, file, metadata, load, error, progress, abort) => {
                const formData = new FormData();
                formData.append('files', file, file.name);

                const controller = new AbortController();
                const url = folder
                  ? `${apiUrl}/api/store/upload?folder=${encodeURIComponent(folder)}`
                  : `${apiUrl}/api/store/upload`;

                fetch(url, {
                  method: 'POST',
                  headers: {
                    'x-secret-key': secretKey,
                    Accept: 'application/json',
                  },
                  body: formData,
                  signal: controller.signal,
                })
                  .then(res => res.json())
                  .then(res => {
                    if (!res.success) throw new Error(res.message);
                    const fileData = res.data?.[0];
                    if (!fileData) throw new Error('No file returned from server');
                    load(JSON.stringify(fileData));
                  })
                  .catch(() => error('Yükleme hatası'));

                return {
                  abort: () => {
                    controller.abort();
                    abort();
                  },
                };
              },
            }}
            name="files"
            labelIdle='Sürükleyip bırakın veya <span class="filepond--label-action">Gözatın</span>'
            credits={false}
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
                      {isImage(file.type) ? (
                        <img src={`${cdnUrl}/${file.name}`} alt={file.name} style={s.galleryThumb} />
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
});

UploadField.displayName = 'UploadField';

/* ─── Factory Function ─── */

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
