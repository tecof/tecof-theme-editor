import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, Loader2, Paintbrush, RefreshCw } from 'lucide-react';
import { useStudio } from '../context';
import { useUiStore } from '../uiStore';
import { useEditorStore } from '../../engine/store';
import { findNodeById } from '../../engine/zones';
import { usePermissions } from '../usePermissions';
import { StudioDrawer } from '../ui/StudioDrawer';
import { STYLES_PROP, type NodeStyles } from './types';
import { isEmptyStyles } from './styleClipboard';
import {
  buildStyleMatch,
  isSharedNode,
  mergeStyleSyncPages,
  nodeStyleLabel,
  styleSyncSummary,
  type StyleSyncPageRow,
} from './styleSync';
import type { ApplyStylesResult } from '../../api';

/**
 * "Stili diğer sayfalara uygula" penceresi (StudioDrawer 'md').
 *
 * Editörde bir bileşenin stilini ayarlayınca aynı bileşen diğer sayfalarda eski
 * hâlinde kalıyordu; tek yayılım yolu ORTAK BİLEŞEN'di ve o da tüm İÇERİĞİ
 * paylaşır. Bu pencere yalnız STİLİ taşır: kullanıcı hedef sayfaları görür,
 * her satırda kaç bileşenin etkileneceğini okur ve bilinçli onay verir.
 *
 * Akış: aç → (sayfa listesi + ÖNİZLEME aynı anda) → kullanıcı seçer → Uygula.
 * Önizleme backend'in AYNI fonksiyonunu `preview:true` ile koşar; böylece
 * ekranda gösterilen sayı ile yazılan sayı aynı yerden gelir.
 *
 * Uygulanan stil BELLEKTEKİ değerdir (kaydedilmemiş düzenleme dahil) — bu yüzden
 * `styles` isteğe AÇIKÇA konur; backend'in kaydedilmiş taslaktan okumasına
 * bırakılsaydı kullanıcı "az önce ayarladığım boşluk gitmedi" derdi.
 */
export const StyleSyncModal = () => {
  const { apiClient, pageId, config, readOnly } = useStudio();
  const nodeId = useUiStore((s) => s.styleSyncNodeId);
  const close = useUiStore((s) => s.closeStyleSync);

  /* Kapanış animasyonu boyunca (nodeId null'a düştükten sonra) içerik son
     düğümü göstermeye devam etsin — boş gövdeyle kayıp giden bir kart olmasın. */
  const lastIdRef = useRef<string | null>(null);
  if (nodeId) lastIdRef.current = nodeId;
  const shownId = nodeId ?? lastIdRef.current;

  // Pencere açıkken düğüm silinebilir — store'a abone kalıp null'a düşünce uyarır.
  const node = useEditorStore((s) => (shownId ? findNodeById(s.document, shownId)?.node ?? null : null));
  /* Bu pencere düğümün stilini SİTE GENELİNE yazar; tema `permissions.edit:false`
     ile kilitlediyse yerelde bile düzenlenemeyen bir stil buradan yayılmamalı
     (motorun yetkili kapısı — bkz. usePermissions). */
  const perms = usePermissions(shownId);
  const canEdit = perms.edit !== false;

  const [byName, setByName] = useState(false);
  const [pages, setPages] = useState<StyleSyncPageRow[]>([]);
  const [checked, setChecked] = useState<Set<string>>(() => new Set());
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ApplyStylesResult | null>(null);
  const [truncated, setTruncated] = useState(false);

  // Uçuşan önizlemeyi iptal et: pencere kapanır ya da ölçüt değişirse eski yanıt
  // taze listeyi ezmemeli.
  const abortRef = useRef<AbortController | null>(null);

  const label = node ? config.components[node.type]?.label || node.type : '';
  const nodeName = nodeStyleLabel(node);
  const styles = (node?.props?.[STYLES_PROP] as NodeStyles | undefined) ?? null;
  const emptyStyles = isEmptyStyles(styles);
  const shared = isSharedNode(node);
  const match = useMemo(() => buildStyleMatch(node, { byName }), [node, byName]);

  const dismiss = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    close();
  }, [close]);

  /* Her açılışta taze başla: bayat sonuç/seçim bir sonraki düğümde gösterilmesin. */
  useEffect(() => {
    if (!nodeId) return;
    setByName(false);
    setResult(null);
    setError(null);
    setChecked(new Set());
    setPages([]);
    setTruncated(false);
    /* `loading`, iptal edilen bir önizlemeden true kalmış olabilir (abort
       yolunda finally atlanır) — apiClient/pageId yoksa bir sonraki açılışta
       pencere sonsuza dek "hesaplanıyor" gösterirdi. */
    setLoading(false);
  }, [nodeId]);

  /* Sayfa listesi + önizleme. Ölçüt (yalnız aynı adlı) değişince YENİDEN koşar:
     eşleşme sayıları kullanıcının seçtiği daraltmayla tutarlı kalmalı. */
  useEffect(() => {
    if (!nodeId || !node || !apiClient || !pageId || !match) return;
    const controller = new AbortController();
    abortRef.current?.abort();
    abortRef.current = controller;
    let cancelled = false;

    setLoading(true);
    setError(null);

    (async () => {
      try {
        const [pageRes, previewRes] = await Promise.all([
          apiClient.getPages(),
          apiClient.previewApplyStyles(
            {
              sourcePageId: pageId,
              sourceNodeId: nodeId,
              styles: styles ?? null,
              match,
            },
            controller.signal
          ),
        ]);
        if (cancelled || controller.signal.aborted) return;

        if (!previewRes.success) {
          setPages([]);
          setError(previewRes.message || 'Eşleşmeler alınamadı.');
          return;
        }
        const rows = mergeStyleSyncPages(pageRes.data, previewRes.data?.pages, pageId);
        setPages(rows);
        setTruncated(!!previewRes.data?.truncated);
        // Eşleşmesi olan sayfalar VARSAYILAN seçili — kullanıcı istemediğini kaldırır.
        setChecked(new Set(rows.filter((r) => r.matches > 0).map((r) => r.pageId)));
      } catch (err) {
        if (cancelled || (err instanceof DOMException && err.name === 'AbortError')) return;
        setError(err instanceof Error ? err.message : 'Eşleşmeler alınamadı.');
      } finally {
        if (!cancelled && !controller.signal.aborted) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
    // `styles` referansı her stil düzenlemesinde değişir; önizlemeyi yalnız
    // ölçüt/düğüm değişince tazelemek yeterli (uygulama anında güncel stil
    // store'dan taze okunur).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodeId, apiClient, pageId, byName]);

  const totalMatches = pages
    .filter((p) => checked.has(p.pageId))
    .reduce((sum, p) => sum + p.matches, 0);
  const selectedCount = pages.filter((p) => checked.has(p.pageId) && p.matches > 0).length;
  const canApply =
    !!apiClient && !!pageId && !!node && !readOnly && canEdit && !applying && selectedCount > 0;

  const toggle = (id: string) =>
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const setAll = (on: boolean) =>
    setChecked(on ? new Set(pages.filter((p) => p.matches > 0).map((p) => p.pageId)) : new Set());

  const apply = async () => {
    if (!canApply || !apiClient || !pageId || !match || !nodeId) return;
    setApplying(true);
    setError(null);
    try {
      /* Stil UYGULAMA anında taze okunur: pencere açıkken kullanıcı stil
         panelinde bir değer daha değiştirmiş olabilir. */
      const fresh = findNodeById(useEditorStore.getState().document, nodeId)?.node;
      const res = await apiClient.applyStylesToPages({
        sourcePageId: pageId,
        sourceNodeId: nodeId,
        styles: ((fresh?.props?.[STYLES_PROP] as NodeStyles | undefined) ?? null),
        match,
        targetPageIds: pages.filter((p) => checked.has(p.pageId) && p.matches > 0).map((p) => p.pageId),
        preview: false,
      });
      if (res.success && res.data) setResult(res.data);
      else setError(res.message || 'Uygulanamadı.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Uygulanamadı.');
    } finally {
      setApplying(false);
    }
  };

  return (
    <StudioDrawer
      open={!!nodeId}
      onOpenChange={(next) => {
        if (!next) dismiss();
      }}
      size="md"
      tone="primary"
      icon={<Paintbrush size={22} />}
      title="Stili diğer sayfalara uygula"
      description="Aynı temadaki diğer sayfalarda bu tipteki bileşenler hedeflenir."
      busy={applying}
      className="tecof-stylesync-drawer"
      bodyClassName="tecof-stylesync-drawer-body"
      footer={
        node ? (
          <>
            <span className="tecof-drawer-footer-note">
              {selectedCount > 0
                ? `${selectedCount} sayfa · ${totalMatches} bileşen`
                : 'Uygulanacak sayfa seçin'}
            </span>
            <button
              type="button"
              className="tecof-drawer-btn tecof-drawer-btn--secondary"
              onClick={dismiss}
              disabled={applying}
            >
              {result ? 'Kapat' : 'Vazgeç'}
            </button>
            <button
              type="button"
              className="tecof-drawer-btn tecof-drawer-btn--primary"
              disabled={!canApply}
              onClick={apply}
            >
              {applying ? (
                <Loader2 size={15} className="tecof-upload-spin" aria-hidden="true" />
              ) : (
                <Paintbrush size={14} aria-hidden="true" />
              )}
              {applying ? 'Uygulanıyor…' : 'Uygula'}
            </button>
          </>
        ) : (
          <button type="button" className="tecof-drawer-btn tecof-drawer-btn--secondary" onClick={dismiss}>
            Kapat
          </button>
        )
      }
    >
      {!node ? (
        <div className="tecof-stylesync-note is-warning" role="alert">
          <AlertTriangle size={13} aria-hidden="true" />
          Bileşen bulunamadı (silinmiş olabilir).
        </div>
      ) : (
        <>
          <div className="tecof-stylesync-source">
            <span className="tecof-stylesync-source-type">{label}</span>
            {nodeName && <span className="tecof-stylesync-source-name">“{nodeName}”</span>}
          </div>

          <label className={`tecof-stylesync-check${nodeName ? '' : ' is-disabled'}`}>
            <input
              type="checkbox"
              checked={byName && !!nodeName}
              disabled={!nodeName}
              onChange={(e) => setByName(e.target.checked)}
            />
            <span>
              Yalnız aynı adlı bileşenlere uygula
              {nodeName ? ` (“${nodeName}”)` : ' — bu bileşenin adı yok'}
            </span>
          </label>

          {shared && (
            <div className="tecof-stylesync-note is-warning">
              <AlertTriangle size={13} aria-hidden="true" />
              Bu bir ortak bileşen; stili master&apos;da yaşar ve diğer sayfalardaki
              ortak kopyalar bu uygulamanın DIŞINDA tutulur.
            </div>
          )}

          {emptyStyles && (
            <div className="tecof-stylesync-note is-warning">
              <AlertTriangle size={13} aria-hidden="true" />
              Bu bileşende ayarlı stil yok — uygulamak hedeflerdeki stilleri TEMİZLER.
            </div>
          )}

          {!canEdit && (
            <div className="tecof-stylesync-note is-warning" role="alert">
              <AlertTriangle size={13} aria-hidden="true" />
              Bu bileşen tema tarafından düzenlemeye kapatılmış; stili diğer
              sayfalara uygulanamaz.
            </div>
          )}

          {!apiClient || !pageId ? (
            <div className="tecof-stylesync-note is-warning" role="alert">
              <AlertTriangle size={13} aria-hidden="true" />
              Bu özellik sayfa kimliği ve API bağlantısı ister.
            </div>
          ) : null}

          <div className="tecof-stylesync-listhead">
            <span>Hedef sayfalar</span>
            {pages.length > 0 && (
              <span className="tecof-stylesync-bulk">
                <button type="button" onClick={() => setAll(true)}>Tümü</button>
                <button type="button" onClick={() => setAll(false)}>Hiçbiri</button>
              </span>
            )}
          </div>

          <div className="tecof-stylesync-list">
            {loading ? (
              <div className="tecof-stylesync-empty">
                <RefreshCw size={13} className="tecof-stylesync-spin" aria-hidden="true" />
                Eşleşmeler hesaplanıyor…
              </div>
            ) : pages.length === 0 ? (
              <div className="tecof-stylesync-empty">Bu temada başka sayfa yok.</div>
            ) : (
              pages.map((page) => (
                <label
                  key={page.pageId}
                  className={`tecof-stylesync-row${page.matches === 0 ? ' is-empty' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={checked.has(page.pageId)}
                    disabled={page.matches === 0}
                    onChange={() => toggle(page.pageId)}
                  />
                  <span className="tecof-stylesync-row-title">{page.title}</span>
                  <span className="tecof-stylesync-row-slug">/{page.slug}</span>
                  <span className="tecof-stylesync-row-count">
                    {page.matches > 0 ? `${page.matches} eşleşme` : 'eşleşme yok'}
                    {page.conflicts > 0 ? ` · ${page.conflicts} atlanacak` : ''}
                  </span>
                </label>
              ))
            )}
          </div>

          {truncated && (
            <div className="tecof-stylesync-note is-warning">
              <AlertTriangle size={13} aria-hidden="true" />
              Tema 500&apos;den fazla sayfa içeriyor; yalnız ilk 500 sayfa tarandı.
            </div>
          )}

          {error && (
            <div className="tecof-stylesync-note is-error" role="alert">
              <AlertTriangle size={13} aria-hidden="true" />
              {error}
            </div>
          )}

          {result && (
            <div className="tecof-stylesync-note is-success" role="status">
              {styleSyncSummary(result)}
            </div>
          )}

          <p className="tecof-stylesync-foot">
            Yalnız TASLAK değişir — hedef sayfaları ayrıca yayınlamanız gerekir.
            Başka sekmede açık bir sayfa varsa değişikliği bir sonraki yüklemede görür.
          </p>
        </>
      )}
    </StudioDrawer>
  );
};

export default StyleSyncModal;
