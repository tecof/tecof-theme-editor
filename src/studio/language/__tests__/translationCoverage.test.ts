import { describe, it, expect } from 'vitest';
import { collectTranslationGaps, isEmptyLocalizedValue } from '../translationCoverage';
import type { TecofDocument } from '../../../types';

const LANGS = ['tr', 'en'];

const emptyDoc = (): TecofDocument => ({
  root: { props: {} },
  content: [],
  zones: {},
});

describe('isEmptyLocalizedValue', () => {
  it('treats nullish and blank strings as empty', () => {
    expect(isEmptyLocalizedValue(null)).toBe(true);
    expect(isEmptyLocalizedValue(undefined)).toBe(true);
    expect(isEmptyLocalizedValue('')).toBe(true);
    expect(isEmptyLocalizedValue('   ')).toBe(true);
  });

  it('treats empty HTML as empty', () => {
    expect(isEmptyLocalizedValue('<p></p>')).toBe(true);
    expect(isEmptyLocalizedValue('<p><br></p>')).toBe(true);
    expect(isEmptyLocalizedValue('<p>&nbsp;</p>')).toBe(true);
    expect(isEmptyLocalizedValue('<p>Merhaba</p>')).toBe(false);
  });

  it('treats non-string non-null values as filled', () => {
    expect(isEmptyLocalizedValue({ url: '/hakkimizda' })).toBe(false);
    expect(isEmptyLocalizedValue(0)).toBe(false);
  });
});

describe('collectTranslationGaps', () => {
  it('returns zero for an empty document', () => {
    const result = collectTranslationGaps(emptyDoc(), LANGS);
    expect(result.total).toBe(0);
    expect(result.missingByLang).toEqual({});
    expect(result.gaps).toEqual([]);
  });

  it('returns zero when languages.length <= 1', () => {
    const doc = emptyDoc();
    doc.content = [
      { type: 'Hero', props: { id: 'h1', title: [{ code: 'tr', value: 'Başlık' }] } },
    ];
    expect(collectTranslationGaps(doc, ['tr']).total).toBe(0);
  });

  it('returns zero for a fully translated document', () => {
    const doc: TecofDocument = {
      root: {
        props: {
          seoTitle: [
            { code: 'tr', value: 'Anasayfa' },
            { code: 'en', value: 'Home' },
          ],
        },
      },
      content: [
        {
          type: 'Hero',
          props: {
            id: 'h1',
            title: [
              { code: 'tr', value: 'Merhaba' },
              { code: 'en', value: 'Hello' },
            ],
          },
        },
      ],
      zones: {
        'h1:body': [
          {
            type: 'Text',
            props: {
              id: 't1',
              text: [
                { code: 'tr', value: '<p>İçerik</p>' },
                { code: 'en', value: '<p>Content</p>' },
              ],
            },
          },
        ],
      },
    };
    const result = collectTranslationGaps(doc, LANGS);
    expect(result.total).toBe(0);
    expect(result.gaps).toEqual([]);
  });

  it('counts partially missing translations across root, content and zones', () => {
    const doc: TecofDocument = {
      root: {
        props: {
          // Missing 'en' entry entirely.
          seoTitle: [{ code: 'tr', value: 'Anasayfa' }],
        },
      },
      content: [
        {
          type: 'Hero',
          props: {
            id: 'h1',
            // 'en' entry exists but is an empty string.
            title: [
              { code: 'tr', value: 'Merhaba' },
              { code: 'en', value: '' },
            ],
          },
        },
      ],
      zones: {
        'h1:body': [
          {
            type: 'Text',
            props: {
              id: 't1',
              // 'tr' missing this time.
              text: [{ code: 'en', value: '<p>Content</p>' }],
            },
          },
        ],
      },
    };
    const result = collectTranslationGaps(doc, LANGS);
    expect(result.total).toBe(3);
    expect(result.missingByLang).toEqual({ en: 2, tr: 1 });
    expect(result.gaps).toContainEqual({ nodeId: 'root', propName: 'seoTitle', missing: ['en'] });
    expect(result.gaps).toContainEqual({ nodeId: 'h1', propName: 'title', missing: ['en'] });
    expect(result.gaps).toContainEqual({ nodeId: 't1', propName: 'text', missing: ['tr'] });
  });

  it('treats empty-HTML values as missing', () => {
    const doc = emptyDoc();
    doc.content = [
      {
        type: 'Text',
        props: {
          id: 't1',
          text: [
            { code: 'tr', value: '<p>Dolu</p>' },
            { code: 'en', value: '<p><br></p>' },
          ],
        },
      },
    ];
    const result = collectTranslationGaps(doc, LANGS);
    expect(result.total).toBe(1);
    expect(result.gaps[0]).toEqual({ nodeId: 't1', propName: 'text', missing: ['en'] });
  });

  it('does not count fields that are empty in every language (missing content, not translation)', () => {
    const doc = emptyDoc();
    doc.content = [
      {
        type: 'Text',
        props: {
          id: 't1',
          text: [
            { code: 'tr', value: '' },
            { code: 'en', value: '<p></p>' },
          ],
        },
      },
    ];
    expect(collectTranslationGaps(doc, LANGS).total).toBe(0);
  });

  it('finds multilingual fields nested inside object props', () => {
    const doc = emptyDoc();
    doc.content = [
      {
        type: 'Card',
        props: {
          id: 'c1',
          settings: {
            label: [{ code: 'tr', value: 'Etiket' }],
          },
        },
      },
    ];
    const result = collectTranslationGaps(doc, LANGS);
    expect(result.total).toBe(1);
    expect(result.gaps[0]).toEqual({ nodeId: 'c1', propName: 'settings.label', missing: ['en'] });
  });

  it('does not produce false positives for slot child arrays', () => {
    const doc = emptyDoc();
    doc.content = [
      {
        type: 'Row',
        props: {
          id: 'r1',
          // Slot children: { type, props } objects, not multilingual entries.
          items: [
            { type: 'Button', props: { id: 'b1', label: [{ code: 'tr', value: 'Tıkla' }] } },
          ],
        },
      },
    ];
    // The child also lives in zones — it must be counted exactly once.
    doc.zones = {
      'r1:items': [
        { type: 'Button', props: { id: 'b1', label: [{ code: 'tr', value: 'Tıkla' }] } },
      ],
    };
    const result = collectTranslationGaps(doc, LANGS);
    expect(result.total).toBe(1);
    expect(result.gaps).toEqual([{ nodeId: 'b1', propName: 'label', missing: ['en'] }]);
  });

  it('does not produce false positives for upload (external file) arrays', () => {
    const doc = emptyDoc();
    doc.content = [
      {
        type: 'Gallery',
        props: {
          id: 'g1',
          images: [
            { type: 'external', url: 'https://cdn.example.com/a.jpg' },
            { type: 'external', url: 'https://cdn.example.com/b.jpg' },
          ],
        },
      },
    ];
    expect(collectTranslationGaps(doc, LANGS).total).toBe(0);
  });

  it('ignores plain string/number arrays', () => {
    const doc = emptyDoc();
    doc.content = [
      { type: 'List', props: { id: 'l1', tags: ['a', 'b'], sizes: [1, 2, 3] } },
    ];
    expect(collectTranslationGaps(doc, LANGS).total).toBe(0);
  });

  it('reports missing for every merchant language with three languages', () => {
    const doc = emptyDoc();
    doc.content = [
      {
        type: 'Text',
        props: { id: 't1', text: [{ code: 'de', value: 'Hallo' }] },
      },
    ];
    const result = collectTranslationGaps(doc, ['tr', 'en', 'de']);
    expect(result.total).toBe(2);
    expect(result.missingByLang).toEqual({ tr: 1, en: 1 });
    expect(result.gaps[0].missing).toEqual(['tr', 'en']);
  });
});
