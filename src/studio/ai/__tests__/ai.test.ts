import { describe, it, expect } from 'vitest';
import { buildComponentCatalog, buildSectionSystemPrompt, buildSectionUserPrompt } from '../prompt';
import { parseAiSection, AiParseError } from '../parse';
import type { StudioConfig } from '../../../types';

const config = {
  components: {
    Hero: {
      render: () => null,
      label: 'Hero',
      fields: {
        title: { type: 'text', label: 'Başlık' },
        tone: { type: 'select', options: [{ label: 'Koyu', value: 'dark' }, { label: 'Açık', value: 'light' }] },
        content: { type: 'slot' },
      },
      defaultProps: { tone: 'dark' },
      variants: { light: { label: 'Açık', props: { tone: 'light' } } },
    },
    Button: { render: () => null, label: 'Buton', allowedParents: ['Hero'] },
  },
} as unknown as StudioConfig;

describe('prompt builder', () => {
  it('serializes the catalog with fields, options, defaults, variants and rules', () => {
    const catalog = JSON.parse(buildComponentCatalog(config));
    const hero = catalog.find((c: any) => c.type === 'Hero');
    expect(hero.fields).toContainEqual({ name: 'tone', type: 'select', options: ['dark', 'light'] });
    expect(hero.fields).toContainEqual({ name: 'content', type: 'slot', slot: true });
    expect(hero.defaultProps).toEqual({ tone: 'dark' });
    expect(hero.variants).toEqual({ light: { tone: 'light' } });
    const button = catalog.find((c: any) => c.type === 'Button');
    expect(button.allowedParents).toEqual(['Hero']);
    // Functions (render) never leak into the prompt.
    expect(buildComponentCatalog(config)).not.toContain('render');
  });

  it('system prompt embeds the catalog + contract; user prompt frames the request', () => {
    const system = buildSectionSystemPrompt(config);
    expect(system).toContain('SADECE geçerli JSON');
    expect(system).toContain('"type":"Hero"');
    expect(buildSectionUserPrompt('  fiyat tablosu ')).toContain('İstek: fiyat tablosu');
  });
});

describe('parseAiSection', () => {
  it('parses a plain JSON node and validates nested slot children', () => {
    const node = parseAiSection(
      JSON.stringify({
        type: 'Hero',
        props: { title: 'Merhaba', content: [{ type: 'Button', props: { label: 'Tıkla' } }] },
      }),
      config,
    );
    expect(node.type).toBe('Hero');
    expect((node.props.content as any[])[0]).toMatchObject({ type: 'Button', props: { label: 'Tıkla' } });
  });

  it('tolerates markdown fences and surrounding prose', () => {
    const text = 'İşte bölümünüz:\n```json\n{"type":"Hero","props":{"title":"X"}}\n```\nBaşka bir şey?';
    expect(parseAiSection(text, config).props.title).toBe('X');
  });

  it('strips ids everywhere (editor generates fresh ones)', () => {
    const node = parseAiSection(
      JSON.stringify({
        type: 'Hero',
        props: { id: 'evil', content: [{ type: 'Button', props: { id: 'evil2' } }] },
      }),
      config,
    );
    expect(node.props.id).toBeUndefined();
    expect((node.props.content as any[])[0].props.id).toBeUndefined();
  });

  it('rejects hallucinated component types with a Turkish message', () => {
    expect(() => parseAiSection('{"type":"Uydurma","props":{}}', config)).toThrowError(AiParseError);
    expect(() => parseAiSection('{"type":"Uydurma","props":{}}', config)).toThrowError(/Bilinmeyen bileşen/);
  });

  it('rejects non-JSON and non-node shapes', () => {
    expect(() => parseAiSection('sadece düz yazı', config)).toThrowError(AiParseError);
    expect(() => parseAiSection('{"foo":1}', config)).toThrowError(AiParseError);
    expect(() => parseAiSection('{"type":"Hero","props":"broken"', config)).toThrowError(AiParseError);
  });

  it('caps runaway nesting depth', () => {
    let inner: any = { type: 'Hero', props: {} };
    for (let i = 0; i < 20; i++) inner = { type: 'Hero', props: { content: [inner] } };
    expect(() => parseAiSection(JSON.stringify(inner), config)).toThrowError(/çok derin/);
  });
});
