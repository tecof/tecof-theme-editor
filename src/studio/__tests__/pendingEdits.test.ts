// @vitest-environment node
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { flushPendingEdits, hasPendingEdits, registerPendingEdit } from '../pendingEdits';
import { useEditorStore } from '../../engine/store';
import { findNodeById } from '../../engine/zones';
import { serializeDocument } from '../../engine/document';
import { computeInlineCommitPatch, type MatchResult } from '../canvas/useInlineEdit';

/**
 * PRD-194 — "Enter'a basmadan kaydetmiyor": kanvasta yazılan metin store'a ancak
 * oturum bitince yazılır. Kaydet / geri al / refetch / sekme kapatma önce
 * `flushPendingEdits()` çağırır; burada o sözleşme sabitlenir.
 */

describe('pendingEdits registry', () => {
  beforeEach(() => {
    flushPendingEdits(); // önceki testten kalan kayıt olmasın
  });

  it('flush her bekleyeni BİR kez çağırır ve kaydı boşaltır', () => {
    const a = vi.fn();
    const b = vi.fn();
    registerPendingEdit(a);
    registerPendingEdit(b);
    expect(hasPendingEdits()).toBe(true);

    flushPendingEdits();
    flushPendingEdits();

    expect(a).toHaveBeenCalledTimes(1);
    expect(b).toHaveBeenCalledTimes(1);
    expect(hasPendingEdits()).toBe(false);
  });

  it('kaydı silinen (oturumu kendiliğinden biten) düzenleme boşaltılmaz', () => {
    const a = vi.fn();
    const unregister = registerPendingEdit(a);
    unregister();
    unregister(); // idempotent
    flushPendingEdits();
    expect(a).not.toHaveBeenCalled();
    expect(hasPendingEdits()).toBe(false);
  });

  it('hata veren bir düzenleme diğerlerini engellemez', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const ok = vi.fn();
    registerPendingEdit(() => {
      throw new Error('bozuk');
    });
    registerPendingEdit(ok);
    expect(() => flushPendingEdits()).not.toThrow();
    expect(ok).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('flush içinden tekrar flush çağrılsa da aynı düzenleme ikinci kez çalışmaz', () => {
    const inner = vi.fn(() => flushPendingEdits());
    registerPendingEdit(inner);
    flushPendingEdits();
    expect(inner).toHaveBeenCalledTimes(1);
  });
});

describe('kaydet yolu bekleyen inline taslağı store’dan önce yazar', () => {
  const match: MatchResult = { propName: 'text', isMultilingual: true, langCode: 'tr' };

  beforeEach(() => {
    flushPendingEdits();
    useEditorStore.getState().setDocument({
      root: { props: {} },
      content: [
        {
          type: 'Title',
          props: {
            id: 't1',
            text: [
              { code: 'tr', value: 'Merhaba' },
              { code: 'en', value: 'Hello' },
            ],
          },
        },
      ],
      zones: {},
    });
  });

  /** useInlineEdit oturumunun commit'i: güncel props'a karşı tek updateProps. */
  const openInlineDraft = (draft: string) =>
    registerPendingEdit(() => {
      const store = useEditorStore.getState();
      const props = findNodeById(store.document, 't1')!.node.props;
      const patch = computeInlineCommitPatch(props, match, draft);
      if (patch) store.updateProps('t1', patch);
    });

  /** TecofStudio.handleSaveDraft'ın okuma sırası: önce flush, sonra store. */
  const readForSave = () => {
    flushPendingEdits();
    return serializeDocument(useEditorStore.getState().document);
  };

  it('Enter’a basılmadan kaydedilen sayfada yazılan metin vardır', () => {
    openInlineDraft('Merhaba dünya');
    const saved = readForSave();
    expect(saved.content[0].props.text).toEqual([
      { code: 'tr', value: 'Merhaba dünya' },
      { code: 'en', value: 'Hello' },
    ]);
    expect(hasPendingEdits()).toBe(false);
  });

  it('çok satırlı taslak \\n ile saklanır; oturum TEK geri al adımıdır', () => {
    const before = useEditorStore.getState().history.past.length;
    openInlineDraft('Birinci satır\nİkinci satır');
    readForSave();

    const state = useEditorStore.getState();
    expect(state.history.past.length).toBe(before + 1);
    expect(findNodeById(state.document, 't1')!.node.props.text[0].value).toBe('Birinci satır\nİkinci satır');

    state.undo();
    expect(findNodeById(useEditorStore.getState().document, 't1')!.node.props.text[0].value).toBe('Merhaba');
    useEditorStore.getState().redo();
    expect(findNodeById(useEditorStore.getState().document, 't1')!.node.props.text[0].value).toBe(
      'Birinci satır\nİkinci satır'
    );
  });

  it('kaydedilmiş değer sonraki flush’larla geri dönmez', () => {
    openInlineDraft('Selam');
    readForSave();
    // Aynı oturum ikinci kez boşaltılmaz; eski metin yeniden yazılmaz.
    flushPendingEdits();
    readForSave();
    expect(findNodeById(useEditorStore.getState().document, 't1')!.node.props.text[0].value).toBe('Selam');
  });
});
