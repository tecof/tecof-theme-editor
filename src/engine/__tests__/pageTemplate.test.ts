// @vitest-environment node
import { describe, it, expect, beforeEach } from 'vitest';
import { useEditorStore } from '../store';

/**
 * Sayfa şablonu ekleme sözleşmesi: N bölüm TEK commit'te (tek Geri Al),
 * taze id'lerle, mevcut içerik KORUNARAK.
 */

const section = (type: string, id: string, childId?: string) => ({
  node: { type, props: { id } },
  zones: childId ? { [`${id}:contentSlot`]: [{ type: 'Title', props: { id: childId } }] } : {},
});

const emptyDoc = { root: { props: {} }, content: [], zones: {} } as any;

describe('insertPageTemplate', () => {
  beforeEach(() => {
    useEditorStore.setState({
      document: JSON.parse(JSON.stringify(emptyDoc)),
      history: { past: [], future: [] },
      selection: { selectedId: null, selectedIds: [], hoveredId: null },
      _lastCommit: null,
    } as any);
  });

  it('tüm bölümleri sırayla ekler ve TEK undo adımı üretir', () => {
    const s = useEditorStore.getState();
    s.insertPageTemplate([section('Header', 'h'), section('Hero', 'x'), section('Footer', 'f')]);

    const doc = useEditorStore.getState().document;
    expect(doc.content).toHaveLength(3);
    expect(doc.content.map((n: any) => n.type)).toEqual(['Header', 'Hero', 'Footer']);
    // tek commit → tek geri alma adımı
    expect(useEditorStore.getState().history.past).toHaveLength(1);
  });

  it('tek Geri Al şablonun TAMAMINI kaldırır', () => {
    const s = useEditorStore.getState();
    s.insertPageTemplate([section('Header', 'h'), section('Hero', 'x')]);
    useEditorStore.getState().undo();
    expect(useEditorStore.getState().document.content).toHaveLength(0);
  });

  it('id çakışmaz: aynı şablon iki kez eklenebilir (remap)', () => {
    const s = useEditorStore.getState();
    const tpl = [section('Hero', 'x', 'title-1')];
    s.insertPageTemplate(tpl);
    useEditorStore.getState().insertPageTemplate(tpl);

    const doc = useEditorStore.getState().document;
    expect(doc.content).toHaveLength(2);
    const ids = doc.content.map((n: any) => n.props.id);
    expect(new Set(ids).size).toBe(2); // benzersiz
    // zone anahtarları da yeni id'lere bağlanmış olmalı
    expect(Object.keys(doc.zones).length).toBe(2);
  });

  it('MEVCUT içeriği silmez — hedef index e ardışık ekler', () => {
    const s = useEditorStore.getState();
    s.insertPageTemplate([section('Var1', 'v1'), section('Var2', 'v2')]);
    // başa (index 0) iki bölümlük şablon ekle
    useEditorStore.getState().insertPageTemplate([section('A', 'a'), section('B', 'b')], undefined, 0);

    const types = useEditorStore.getState().document.content.map((n: any) => n.type);
    expect(types).toEqual(['A', 'B', 'Var1', 'Var2']); // ardışık, mevcutlar korundu
  });

  it('ilk bölüm seçili gelir', () => {
    const s = useEditorStore.getState();
    s.insertPageTemplate([section('Header', 'h'), section('Hero', 'x')]);
    const st = useEditorStore.getState();
    const firstId = st.document.content[0].props.id;
    expect(st.selection.selectedId).toBe(firstId);
  });

  it('boş liste no-op (commit üretmez)', () => {
    useEditorStore.getState().insertPageTemplate([]);
    expect(useEditorStore.getState().history.past).toHaveLength(0);
  });
});
