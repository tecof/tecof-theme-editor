import { useCallback, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useEditorStore } from '../../engine/store';
import { findNodeById } from '../../engine/zones';
import { useStudio } from '../context';
import { useUiStore } from '../uiStore';
import { NodeInspectorBody } from './NodeInspectorBody';

/**
 * NodeSettingsModal — seçili bileşenin Inspector gövdesini (içerik/stil/
 * etkileşim) sağ paneli açmadan ORTADA bir modal'da gösterir. Overlay
 * toolbar'daki kalem butonuyla açılır (AiSectionModal kalıbı: uiStore bayrağı,
 * TecofStudio'da koşulsuz mount).
 *
 * Gövde Inspector ile AYNI bileşendir (NodeInspectorBody) — alan render
 * mantığı kopyalanmaz; her iki yüzey store'a abone olduğundan panel açıkken
 * modal'da yapılan düzenleme panelde de anında görünür. showHeader=false:
 * modal kendi başlığını (bileşen adı + kapat) çizer, "Seçimi Kaldır" burada
 * anlamsız olurdu.
 *
 * Seçim kalkarsa/silinirse (selectedId null) modal kendini kapatır.
 */
export const NodeSettingsModal = () => {
  const { config } = useStudio();
  const open = useUiStore((s) => s.nodeSettingsOpen);
  const setOpen = useUiStore((s) => s.setNodeSettingsOpen);
  const selectedId = useEditorStore((s) => s.selection.selectedId);
  const node = useEditorStore((s) =>
    s.selection.selectedId ? findNodeById(s.document, s.selection.selectedId)?.node ?? null : null
  );

  const close = useCallback(() => setOpen(false), [setOpen]);
  const panelRef = useRef<HTMLDivElement | null>(null);

  // Seçim yokken (düğüm silindi, seçim kaldırıldı) modal açık kalamaz.
  useEffect(() => {
    if (open && !selectedId) setOpen(false);
  }, [open, selectedId, setOpen]);

  /* Açılışta paneli odakla: ESC panel-scoped onKeyDown ile yakalanır. Bilinçli
     olarak GLOBAL capture listener KULLANILMAZ — window-capture + stopPropagation,
     içteki katmanların (renk popover'ı ESC'si, vaul drawer'ları, komut paleti)
     kendi ESC işleyicilerini gasp edip yanlış katmanı kapatıyordu. Panel-scoped
     yaklaşımda odak hangi katmandaysa ESC'yi O işler: popover body'ye portallı
     olduğundan kendi ESC'sini alır, modal yalnız odak kendi içindeyken kapanır. */
  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);

  if (!open || !selectedId) return null;

  const label = (node && (config.components[node.type]?.label || node.type)) || 'Bileşen';

  return (
    /* onMouseDown + hedef kontrolü (onClick değil): modal içinden başlayıp
       backdrop'ta biten metin seçimi sürüklemesi modalı istemeden kapatmasın */
    <div
      className="tecof-modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        className="tecof-node-settings-modal"
        role="dialog"
        aria-modal="true"
        aria-label={`${label} ayarları`}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            e.stopPropagation(); // stüdyonun ESC'si (seçim kaldırma) tetiklenmesin
            close();
          }
        }}
      >
        <div className="tecof-node-settings-head">
          <div>
            <h3 className="tecof-inspector-title">{label}</h3>
            <span className="tecof-inspector-id">{selectedId}</span>
          </div>
          <button type="button" className="tecof-modal-close" onClick={close} title="Kapat">
            <X size={16} />
          </button>
        </div>

        <NodeInspectorBody showHeader={false} />
      </div>
    </div>
  );
};

export default NodeSettingsModal;
