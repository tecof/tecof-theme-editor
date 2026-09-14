import { useCallback, useEffect } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { useEditorStore } from '../../engine/store';
import { findNodeById } from '../../engine/zones';
import { useStudio } from '../context';
import { useUiStore } from '../uiStore';
import { StudioDrawer } from '../ui/StudioDrawer';
import { NodeInspectorBody } from './NodeInspectorBody';

/**
 * NodeSettingsModal — seçili bileşenin Inspector gövdesini (içerik/stil/
 * etkileşim) sağ paneli açmadan bir DRAWER'da gösterir (StudioDrawer 'md').
 * Overlay toolbar'daki kalem butonuyla açılır (uiStore bayrağı, TecofStudio'da
 * koşulsuz mount).
 *
 * Gövde Inspector ile AYNI bileşendir (NodeInspectorBody) — alan render
 * mantığı kopyalanmaz; her iki yüzey store'a abone olduğundan panel açıkken
 * drawer'da yapılan düzenleme panelde de anında görünür. showHeader=false:
 * başlık (bileşen adı + id) drawer baş satırındadır, "Seçimi Kaldır" burada
 * anlamsız olurdu.
 *
 * ESC / dış tıklama / tutamak vaul'dan gelir; stüdyonun global ESC'si drawer
 * açıkken susturulur (bkz. isStudioDrawerOpen). Alan popover'ları (renk, ikon,
 * CMS bağlama) ve MediaDrawer drawer'ın ÜSTÜNDE açılır.
 *
 * Seçim kalkarsa/silinirse (selectedId null) drawer kendini kapatır.
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

  // Seçim yokken (düğüm silindi, seçim kaldırıldı) drawer açık kalamaz.
  useEffect(() => {
    if (open && !selectedId) setOpen(false);
  }, [open, selectedId, setOpen]);

  const isOpen = open && !!selectedId;
  const label = (node && (config.components[node.type]?.label || node.type)) || 'Bileşen';

  return (
    <StudioDrawer
      open={isOpen}
      onOpenChange={(next) => {
        if (!next) close();
      }}
      size="md"
      tone="primary"
      icon={<SlidersHorizontal size={22} />}
      title={label}
      description={selectedId ?? undefined}
      className="tecof-node-settings-drawer"
      bodyClassName="tecof-node-settings-drawer-body"
    >
      {selectedId ? <NodeInspectorBody showHeader={false} /> : null}
    </StudioDrawer>
  );
};

export default NodeSettingsModal;
