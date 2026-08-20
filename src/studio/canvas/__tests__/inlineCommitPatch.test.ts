// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { computeInlineCommitPatch, type MatchResult } from '../useInlineEdit';

/**
 * Inline edit commit'inin SAF çekirdeği: props + eşleşme + yeni metin →
 * updateProps patch'i. Özellikle repeater/array satırı hedefleyen
 * (`data-tecof-item="<field>:<index>"` + `data-tecof-item-prop`) yolun
 * immutability + çok dillilik + bayat-index guard'ları burada sabitlenir.
 */

const m = (over: Partial<MatchResult>): MatchResult => ({
  propName: 'text',
  isMultilingual: false,
  langCode: 'tr',
  ...over,
});

describe('computeInlineCommitPatch — top-level prop', () => {
  it('düz string prop → { [prop]: yeniMetin }', () => {
    expect(computeInlineCommitPatch({ text: 'eski' }, m({}), 'yeni')).toEqual({ text: 'yeni' });
  });

  it('çok dilli prop → yalnız hedef dilin value değişir, diğerleri korunur', () => {
    const props = {
      title: [
        { code: 'tr', value: 'Merhaba' },
        { code: 'en', value: 'Hello' },
      ],
    };
    const patch = computeInlineCommitPatch(
      props,
      m({ propName: 'title', isMultilingual: true, langCode: 'tr' }),
      'Selam'
    );
    expect(patch).toEqual({
      title: [
        { code: 'tr', value: 'Selam' },
        { code: 'en', value: 'Hello' },
      ],
    });
    // immutability: kaynak dizi değişmedi
    expect(props.title[0].value).toBe('Merhaba');
  });

  it('çok dilli propta dil girdisi yoksa push edilir', () => {
    const patch = computeInlineCommitPatch(
      { title: [{ code: 'en', value: 'Hello' }] },
      m({ propName: 'title', isMultilingual: true, langCode: 'tr' }),
      'Selam'
    );
    expect(patch).toEqual({
      title: [
        { code: 'en', value: 'Hello' },
        { code: 'tr', value: 'Selam' },
      ],
    });
  });
});

describe('computeInlineCommitPatch — repeater/array satırı (itemField + itemIndex)', () => {
  const rows = [
    { icon: 'Send', title: [{ code: 'tr', value: 'Drone Çekimi' }] },
    { icon: 'Camera', title: [{ code: 'tr', value: 'Fotoğraf' }], note: 'düz' },
  ];

  it('çok dilli satır alanı → yalnız hedef satırın hedef dili değişir', () => {
    const props = { services: rows };
    const patch = computeInlineCommitPatch(
      props,
      m({ propName: 'title', isMultilingual: true, langCode: 'tr', itemField: 'services', itemIndex: 1 }),
      'Video'
    );
    const next = (patch as { services: typeof rows }).services;
    expect(next[1].title).toEqual([{ code: 'tr', value: 'Video' }]);
    // komşu satır REFERANS olarak aynı kaldı (gereksiz kopya yok)
    expect(next[0]).toBe(rows[0]);
    // immutability: kaynak satır değişmedi
    expect(rows[1].title[0].value).toBe('Fotoğraf');
  });

  it('düz string satır alanı → satır kopyalanıp alan yazılır', () => {
    const patch = computeInlineCommitPatch(
      { services: rows },
      m({ propName: 'note', itemField: 'services', itemIndex: 1 }),
      'güncel'
    );
    const next = (patch as { services: typeof rows }).services;
    expect((next[1] as { note?: string }).note).toBe('güncel');
    expect(rows[1].note).toBe('düz');
  });

  it('satır bu arada silinmişse (bayat index) → null (yanlış satıra yazma yok)', () => {
    expect(
      computeInlineCommitPatch(
        { services: [rows[0]] },
        m({ propName: 'title', itemField: 'services', itemIndex: 5 }),
        'x'
      )
    ).toBeNull();
  });

  it('alan dizi değilse → null', () => {
    expect(
      computeInlineCommitPatch(
        { services: 'bozuk' },
        m({ propName: 'title', itemField: 'services', itemIndex: 0 }),
        'x'
      )
    ).toBeNull();
  });
});
