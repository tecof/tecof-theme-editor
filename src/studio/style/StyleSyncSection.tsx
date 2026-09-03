import React from 'react';
import { AlertTriangle, Link2, Share2 } from 'lucide-react';
import { useEditorStore } from '../../engine/store';
import { findNodeById } from '../../engine/zones';
import { useUiStore } from '../uiStore';
import { useStudio } from '../context';
import { usePermissions } from '../usePermissions';
import { STYLES_PROP, STYLE_SYNC_PROP, type NodeStyles } from './types';
import { isEmptyStyles } from './styleClipboard';
import { buildStyleSyncFlag, isSharedNode, nodeStyleLabel, styleSyncFlagOf } from './styleSync';

/**
 * Stil sekmesinin altındaki "Sayfalar arası stil" bölümü.
 *
 * İki ayrı yetenek, bilinçli olarak yan yana:
 *  - **Diğer sayfalara uygula** — TEK SEFERLİK kopyalama (modal açar).
 *  - **Stil kaynağı yap** — SÜREKLİ senkron: düğüme `_tecofStyleSync` yazılır,
 *    sayfa her kaydedildiğinde backend yayılımı kendisi koşar.
 *
 * Bayrak yazımı `updateProps`'tan geçer → tek commit, GERİ ALINABİLİR (kullanıcı
 * yanlışlıkla açtıysa Cmd+Z yeter). Kapatırken prop `undefined` yapılır: kayıtta
 * JSON'dan düşer ve backend "kaynak değil" görür (ortak bileşen bağını koparan
 * `sharedComponentId: undefined` deseniyle aynı).
 */
export const StyleSyncSection: React.FC<{ nodeId: string }> = ({ nodeId }) => {
  const { apiClient, pageId, readOnly } = useStudio();
  const updateProps = useEditorStore((state) => state.updateProps);
  const openStyleSync = useUiStore((s) => s.openStyleSync);

  const node = useEditorStore((state) => findNodeById(state.document, nodeId)?.node ?? null);
  /* Motorun yetkili kapısı: tema `permissions.edit:false` ile kilitlediyse bu
     bileşenin stili yerelde bile değiştirilemez — site geneline yazmak o kapıyı
     atlamak olurdu (aynı kural modalda ve bağlam menüsünde de var). */
  const perms = usePermissions(nodeId);
  const flag = styleSyncFlagOf(node);
  const nodeName = nodeStyleLabel(node);
  const shared = isSharedNode(node);
  /* Stili BOŞ bir düğümü kaynak yapmak, kaydedince hedeflerdeki stilleri
     TEMİZLER (backend boş kaynağı artık atlar; kullanıcı yine de "yayılmadı"
     şaşkınlığı yaşamasın diye uyarı burada gösterilir). */
  const emptyStyles = isEmptyStyles((node?.props?.[STYLES_PROP] as NodeStyles | undefined) ?? null);

  if (!node) return null;

  // Uç sayfa bazlıdır: pageId olmadan kaynak sayfa (ve dolayısıyla tema)
  // çözülemez. Ortak bileşenlerde stil master'da yaşar — backend hem kaynak hem
  // hedef olarak atlar, o yüzden burada da kapatılır (sessizce çalışmaz sanılmasın).
  const available = !!apiClient && !!pageId && !shared && !readOnly && perms.edit !== false;
  const byName = !!flag?.match?.name;

  const setSource = (on: boolean, useName = byName) => {
    if (!on) {
      updateProps(nodeId, { [STYLE_SYNC_PROP]: undefined });
      return;
    }
    const next = buildStyleSyncFlag(node, { sourcePageId: pageId, byName: useName });
    if (next) updateProps(nodeId, { [STYLE_SYNC_PROP]: next });
  };

  return (
    <section className="tecof-stylesync-section">
      <div className="tecof-stylesync-section-head">
        <Share2 size={12} aria-hidden="true" />
        Sayfalar arası stil
      </div>

      <button
        type="button"
        className="tecof-stylesync-open"
        disabled={!available}
        onClick={() => openStyleSync(nodeId)}
      >
        Diğer sayfalara uygula…
      </button>

      <label className={`tecof-stylesync-toggle${available ? '' : ' is-disabled'}`}>
        <input
          type="checkbox"
          checked={!!flag}
          disabled={!available}
          onChange={(e) => setSource(e.target.checked)}
        />
        <span>
          Bu bileşeni stil kaynağı yap
          <span className="tecof-stylesync-toggle-hint">
            Bu sayfayı her kaydedişinizde stil, temadaki eşleşen bileşenlere yayılır.
          </span>
        </span>
      </label>

      {flag && (
        <label className={`tecof-stylesync-toggle is-sub${nodeName ? '' : ' is-disabled'}`}>
          <input
            type="checkbox"
            checked={byName}
            disabled={!available || !nodeName}
            onChange={(e) => setSource(true, e.target.checked)}
          />
          <span>
            Yalnız aynı adlı bileşenler
            {nodeName ? ` (“${nodeName}”)` : ' — bu bileşenin adı yok'}
          </span>
        </label>
      )}

      {flag && emptyStyles && (
        <div className="tecof-stylesync-section-note">
          <AlertTriangle size={11} aria-hidden="true" />
          Bu bileşende ayarlı stil yok — yayılacak bir şey olmadığı için senkron
          şimdilik boş çalışır. Önce stilini ayarlayın.
        </div>
      )}

      {shared && (
        <div className="tecof-stylesync-section-note">
          <AlertTriangle size={11} aria-hidden="true" />
          Ortak bileşenin stili master&apos;da yaşar; senkron burada kapalıdır.
        </div>
      )}

      {!shared && perms.edit === false && (
        <div className="tecof-stylesync-section-note">
          <AlertTriangle size={11} aria-hidden="true" />
          Bu bileşen tema tarafından düzenlemeye kapatılmış; stil senkronu kapalıdır.
        </div>
      )}

      {!shared && !pageId && (
        <div className="tecof-stylesync-section-note">
          <Link2 size={11} aria-hidden="true" />
          Sayfa kimliği olmadan (gömülü önizleme) bu bölüm çalışmaz.
        </div>
      )}
    </section>
  );
};

export default StyleSyncSection;
