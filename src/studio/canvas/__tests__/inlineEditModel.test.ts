// @vitest-environment node
import { describe, it, expect } from 'vitest';
import {
  findInlineFieldDef,
  preservesLineBreaks,
  readMatchedValue,
  resolveInlineEditBehavior,
  serializePlainText,
  snapshotSubtree,
  type MatchResult,
} from '../inlineEditModel';
import { createLanguageField } from '../../../components/fields/LanguageField';
import { createEditorField } from '../../../components/fields/EditorField';
import type { StudioConfig } from '../../../types';

/**
 * Kanvas içi metin düzenlemesinin saf çekirdeği (PRD-194):
 *  - Enter kuralı: tek satır / çok satır / zengin metin kararı,
 *  - düz metin serileştirmesi (`<br>`/blok → `\n`; textContent satırları birleştiriyordu),
 *  - oturum sonunda DOM'un React'in render ettiği hâle dönmesi (bayat kanvas → geri dönen değer).
 * Ortam node — DOM yerine asgari sahte düğümler kullanılır.
 */

/* ─── Asgari sahte DOM ─── */

class FakeNode {
  parent: FakeNode | null = null;
  childNodes: FakeNode[] = [];
  replaceCalls = 0;
  constructor(
    public nodeType: number,
    public nodeName: string,
    public data?: string
  ) {}
  get nodeValue(): string | null {
    return this.data ?? null;
  }
  append(...nodes: FakeNode[]): this {
    for (const n of nodes) {
      n.parent?.removeChild(n);
      n.parent = this;
      this.childNodes.push(n);
    }
    return this;
  }
  removeChild(n: FakeNode): void {
    const i = this.childNodes.indexOf(n);
    if (i >= 0) {
      this.childNodes.splice(i, 1);
      n.parent = null;
    }
  }
  replaceChildren(...nodes: FakeNode[]): void {
    this.replaceCalls += 1;
    for (const c of [...this.childNodes]) this.removeChild(c);
    this.append(...nodes);
  }
}

const el = (name: string, ...children: FakeNode[]) =>
  new FakeNode(1, name.toUpperCase()).append(...children);
const txt = (s: string) => new FakeNode(3, '#text', s);

/* ─── Davranış (Enter kuralı) ─── */

describe('resolveInlineEditBehavior — Enter kuralı', () => {
  it('zengin metin alanı (createEditorField) → HTML + çok satır', () => {
    expect(
      resolveInlineEditBehavior({
        fieldDef: createEditorField({ label: 'Metin' }),
        value: '<p>Paragraf metni.</p>',
        hasElementChildren: true,
      })
    ).toEqual({ html: true, multiline: true });
  });

  it('zengin alan ama AI düz metin yazmış (etiketsiz) → yine HTML + çok satır', () => {
    expect(
      resolveInlineEditBehavior({
        fieldDef: createEditorField({}),
        value: 'Merhaba',
        hasElementChildren: false,
      })
    ).toEqual({ html: true, multiline: true });
  });

  it('HTML değerin DÜZ METİN yansıması (özet / etiketi soyulmuş) → düzenleme başlamaz', () => {
    // Bu metni geri yazmak paragrafları ve biçimi silerdi.
    expect(
      resolveInlineEditBehavior({
        fieldDef: createEditorField({}),
        value: '<p>Bir</p><p><strong>İki</strong></p>',
        hasElementChildren: false,
      })
    ).toBeNull();
  });

  it('createLanguageField({ isTextarea: true }) → düz metin, çok satır', () => {
    const def = createLanguageField({ label: 'Açıklama', isTextarea: true });
    expect(def.isTextarea).toBe(true);
    expect(resolveInlineEditBehavior({ fieldDef: def, value: 'a', hasElementChildren: false })).toEqual({
      html: false,
      multiline: true,
    });
  });

  it('yerleşik textarea → çok satır', () => {
    expect(
      resolveInlineEditBehavior({ fieldDef: { type: 'textarea' }, value: 'a', hasElementChildren: false })
    ).toEqual({ html: false, multiline: true });
  });

  it('başlık / buton (dil girdisi, text) → tek satır: Enter kaydeder', () => {
    const def = createLanguageField({ label: 'Başlık' });
    expect(def.isTextarea).toBe(false);
    expect(resolveInlineEditBehavior({ fieldDef: def, value: 'Başlık', hasElementChildren: false })).toEqual({
      html: false,
      multiline: false,
    });
    expect(
      resolveInlineEditBehavior({ fieldDef: { type: 'text' }, value: 'Kaydet', hasElementChildren: false })
    ).toEqual({ html: false, multiline: false });
  });

  it('tek satırlı alan, değerde zaten \\n var (pre-line başlık) → yine tek satır', () => {
    expect(
      resolveInlineEditBehavior({
        fieldDef: createLanguageField({}),
        value: 'Yeni\nsezon',
        hasElementChildren: false,
      })
    ).toEqual({ html: false, multiline: false });
  });

  it('tek satırlı alan + satır içi etiketli değer → HTML korunur, Enter yine kaydeder', () => {
    expect(
      resolveInlineEditBehavior({
        fieldDef: createLanguageField({}),
        value: 'Yeni <b>sezon</b>',
        hasElementChildren: true,
      })
    ).toEqual({ html: true, multiline: false });
  });

  it('alan tanımı yok: değerdeki \\n ya da blok HTML çok satır demektir; yoksa tek satır', () => {
    expect(resolveInlineEditBehavior({ value: 'a\nb', hasElementChildren: false })).toEqual({
      html: false,
      multiline: true,
    });
    expect(resolveInlineEditBehavior({ value: '<p>a</p><p>b</p>', hasElementChildren: true })).toEqual({
      html: true,
      multiline: true,
    });
    expect(resolveInlineEditBehavior({ value: 'düz', hasElementChildren: false })).toEqual({
      html: false,
      multiline: false,
    });
    expect(resolveInlineEditBehavior({ value: undefined, hasElementChildren: false })).toEqual({
      html: false,
      multiline: false,
    });
  });

  it('bağlama token’ı taşıyan değer kanvasta düzenlenmez (token düz metinle ezilirdi)', () => {
    expect(resolveInlineEditBehavior({ value: '{{ item.title }}', hasElementChildren: false })).toBeNull();
    expect(
      resolveInlineEditBehavior({
        fieldDef: createLanguageField({}),
        value: 'Merhaba {{ data.name }}',
        hasElementChildren: false,
      })
    ).toBeNull();
  });
});

describe('preservesLineBreaks — tek satırda Shift+Enter yalnız görünecekse', () => {
  it('normal / nowrap → satır sonu görünmez', () => {
    expect(preservesLineBreaks({ whiteSpace: 'normal' })).toBe(false);
    expect(preservesLineBreaks({ whiteSpace: 'nowrap' })).toBe(false);
    expect(preservesLineBreaks({ whiteSpace: 'normal', whiteSpaceCollapse: 'collapse' })).toBe(false);
    expect(preservesLineBreaks(null)).toBe(false);
  });

  it('pre / pre-wrap / pre-line / break-spaces → görünür', () => {
    for (const ws of ['pre', 'pre-wrap', 'pre-line', 'break-spaces']) {
      expect(preservesLineBreaks({ whiteSpace: ws })).toBe(true);
    }
  });

  it('yeni tarayıcı: white-space-collapse preserve / preserve-breaks / break-spaces', () => {
    expect(preservesLineBreaks({ whiteSpace: 'normal', whiteSpaceCollapse: 'preserve-breaks' })).toBe(true);
    expect(preservesLineBreaks({ whiteSpaceCollapse: 'preserve' })).toBe(true);
    expect(preservesLineBreaks({ whiteSpaceCollapse: 'break-spaces' })).toBe(true);
  });
});

/* ─── Serileştirme ─── */

describe('serializePlainText — contentEditable → saklanan düz metin', () => {
  it('tek metin düğümü', () => {
    expect(serializePlainText(el('h2', txt('  Merhaba dünya  ')))).toBe('Merhaba dünya');
  });

  it('<br> satır sonu olur (textContent "satır1satır2" diye birleştiriyordu)', () => {
    expect(serializePlainText(el('p', txt('satır1'), el('br'), txt('satır2')))).toBe('satır1\nsatır2');
  });

  it('tarayıcının Enter’da açtığı blok <div>/<p>’ler satır olur; sondaki boş satır kırpılır', () => {
    const root = el('div', txt('a'), el('div', txt('b')), el('div', el('br')));
    expect(serializePlainText(root)).toBe('a\nb');
    expect(serializePlainText(el('div', el('p', txt('x')), el('p', txt('y'))))).toBe('x\ny');
  });

  it('NBSP normal boşluğa döner; satır içi biçim etiketleri metni bozmaz', () => {
    expect(serializePlainText(el('span', txt('a\u00a0b\u00a0')))).toBe('a b');
    expect(serializePlainText(el('span', txt('Yeni '), el('b', txt('sezon'))))).toBe('Yeni sezon');
  });
});

/* ─── DOM geri yükleme ─── */

describe('snapshotSubtree — oturum sonunda DOM React’in render ettiği hâle döner', () => {
  it('yerinde değişen metin düğümü eski içeriğine döner (kimlik korunur)', () => {
    const t1 = txt('Merhaba');
    const root = el('h2', t1);
    const restore = snapshotSubtree(root);
    t1.data = 'Merhaba dünya';
    restore();
    expect(root.childNodes).toEqual([t1]);
    expect(t1.data).toBe('Merhaba');
  });

  it('tümünü seçip yazmak orijinal düğümü siler → geri eklenir, tarayıcının düğümü düşer', () => {
    const t1 = txt('Merhaba');
    const root = el('h2', t1);
    const restore = snapshotSubtree(root);
    root.removeChild(t1);
    root.append(txt('Selam'), el('br'));
    restore();
    expect(root.childNodes.length).toBe(1);
    expect(root.childNodes[0]).toBe(t1); // React'in tuttuğu düğüm yeniden bağlı
    expect(t1.data).toBe('Merhaba');
  });

  it('iç içe yapı + ebeveynler arası taşınan düğüm (paragraf birleştirme) eski yerine döner', () => {
    const t1 = txt('Bir');
    const t2 = txt('İki');
    const pA = el('p', t1);
    const pB = el('p', t2);
    const root = el('div', pA, pB);
    const restore = snapshotSubtree(root);
    // Tarayıcı: ikinci paragrafı birincisine kat, boş kalan <p>'yi sil, biçim ekle.
    pA.append(t2);
    root.removeChild(pB);
    pA.append(el('b', txt('!')));
    restore();
    expect(root.childNodes).toEqual([pA, pB]);
    expect(pA.childNodes).toEqual([t1]);
    expect(pB.childNodes).toEqual([t2]);
  });

  it('değişiklik yoksa DOM’a hiç dokunmaz', () => {
    const root = el('p', txt('a'), el('span', txt('b')));
    const restore = snapshotSubtree(root);
    restore();
    expect(root.replaceCalls).toBe(0);
  });
});

/* ─── Alan tanımı / değer ─── */

describe('findInlineFieldDef + readMatchedValue', () => {
  const titleDef = createLanguageField({ label: 'Başlık' });
  const descDef = createLanguageField({ label: 'Açıklama', isTextarea: true });
  const config = {
    components: {
      Title: { fields: { text: titleDef }, render: () => null },
      HeroSlider: {
        fields: { slides: { type: 'array', arrayFields: { description: descDef } } },
        render: () => null,
      },
    },
  } as unknown as StudioConfig;

  const m = (over: Partial<MatchResult>): MatchResult => ({
    propName: 'text',
    isMultilingual: true,
    langCode: 'tr',
    ...over,
  });

  it('top-level prop ve repeater satır alanının tanımını bulur', () => {
    expect(findInlineFieldDef(config, 'Title', m({}))).toBe(titleDef);
    expect(
      findInlineFieldDef(config, 'HeroSlider', m({ propName: 'description', itemField: 'slides' }))
    ).toBe(descDef);
    expect(findInlineFieldDef(config, 'Yok', m({}))).toBeUndefined();
    expect(findInlineFieldDef(null, 'Title', m({}))).toBeUndefined();
  });

  it('çok dilli değerde hedef dilin metnini, satırda satırın alanını okur', () => {
    const props = {
      text: [
        { code: 'tr', value: 'Merhaba' },
        { code: 'en', value: 'Hello' },
      ],
      slides: [{ description: [{ code: 'tr', value: 'Açıklama\nikinci satır' }] }],
      plain: 'düz',
    };
    expect(readMatchedValue(props, m({ langCode: 'en' }))).toBe('Hello');
    expect(
      readMatchedValue(props, m({ propName: 'description', itemField: 'slides', itemIndex: 0 }))
    ).toBe('Açıklama\nikinci satır');
    expect(readMatchedValue(props, m({ propName: 'plain', isMultilingual: false }))).toBe('düz');
    expect(
      readMatchedValue(props, m({ propName: 'description', itemField: 'slides', itemIndex: 4 }))
    ).toBeUndefined();
  });
});
