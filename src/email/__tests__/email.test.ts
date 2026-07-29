import { describe, expect, it } from 'vitest';
import {
  DEFAULT_EMAIL_THEME,
  EMAIL_BLOCK_CATALOG,
  EMAIL_DOCUMENT_VERSION,
  EMAIL_MERGE_TAGS,
  EMAIL_PRESETS,
  EmailValidationError,
  createEmailBlock,
  createEmailDocument,
  normalizeEmailDocument,
  renderEmailHtml,
  validateEmailDocument,
} from '..';

describe('e-mail document core', () => {
  it('publishes a versioned catalog for every supported block', () => {
    expect(EMAIL_DOCUMENT_VERSION).toBe(1);
    expect(EMAIL_BLOCK_CATALOG.map((item) => item.type)).toEqual([
      'logo',
      'heading',
      'text',
      'button',
      'image',
      'divider',
      'spacer',
      'social',
      'coupon',
      'product',
    ]);
    expect(new Set(EMAIL_MERGE_TAGS.map((tag) => tag.key)).size).toBe(EMAIL_MERGE_TAGS.length);
  });

  it('creates independent blocks and documents with safe defaults', () => {
    const first = createEmailBlock('text', {}, 'first-text');
    const second = createEmailBlock('text', {}, 'second-text');
    first.props.padding.top = 90;

    expect(second.props.padding.top).not.toBe(90);
    const document = createEmailDocument({ blocks: [second] });
    expect(document).toMatchObject({
      kind: 'tecof-email',
      version: 1,
      theme: DEFAULT_EMAIL_THEME,
    });

    const narrowImage = createEmailBlock(
      'image',
      { src: 'https://cdn.example.com/narrow.jpg', width: 80 },
      'narrow-image'
    );
    expect(createEmailDocument({ blocks: [narrowImage] }).blocks[0]).toMatchObject({
      type: 'image',
      props: { width: 80 },
    });
  });

  it('normalizes legacy aliases, bare tokens, and percentage image widths', () => {
    const document = normalizeEmailDocument({
      subject: 'Merhaba {{firstName}}',
      preheader: '{{orderNumber}} hazır',
      theme: {
        maxWidth: '640',
        bgColor: '#eeeeee',
        contentBgColor: '#ffffff',
        linkColor: '#123456',
        radius: 10,
      },
      blocks: [
        {
          id: 'legacy-image',
          type: 'image',
          data: {
            url: 'https://cdn.example.com/banner.jpg',
            link: 'https://example.com',
            alt: 'Banner',
            width: 50,
          },
        },
        {
          id: 'legacy-copy',
          component: 'paragraph',
          content: '{{fullName}} · {{totalPrice}} · {{trackingNumber}}',
        },
        {
          id: 'legacy-button',
          type: 'button',
          text: 'İncele',
          url: 'https://example.com/action',
          bgColor: '#112233',
          textColor: '#ffffff',
          radius: 14,
          fontWeight: 900,
        },
        {
          id: 'legacy-coupon',
          type: 'coupon',
          title: 'SANA ÖZEL',
          couponCode: 'TEST20',
          bgColor: '#f0f0f0',
          textColor: '#111111',
        },
        {
          id: 'legacy-product',
          type: 'product',
          image: 'https://cdn.example.com/product.jpg',
          name: 'Ürün',
          description: 'Açıklama',
          price: '100 TL',
          link: 'https://example.com/product',
          buttonText: 'Ürüne git',
        },
      ],
    });

    expect(document.subject).toBe('Merhaba {{customer.firstName}}');
    expect(document.previewText).toBe('{{order.number}} hazır');
    expect(document.theme).toMatchObject({ width: 640, primaryColor: '#123456', borderRadius: 10 });
    expect(document.blocks[0]).toMatchObject({
      type: 'image',
      props: { src: 'https://cdn.example.com/banner.jpg', width: 268 },
    });
    expect(document.blocks[1]).toMatchObject({
      type: 'text',
      props: {
        text: '{{customer.fullName}} · {{order.total}} · {{order.trackingNumber}}',
      },
    });
    expect(document.blocks[2]).toMatchObject({
      type: 'button',
      props: {
        label: 'İncele',
        href: 'https://example.com/action',
        backgroundColor: '#112233',
        color: '#ffffff',
        borderRadius: 14,
        fontWeight: 900,
      },
    });
    expect(document.blocks[3]).toMatchObject({
      type: 'coupon',
      props: {
        eyebrow: 'SANA ÖZEL',
        code: 'TEST20',
        backgroundColor: '#f0f0f0',
        color: '#111111',
      },
    });
    expect(document.blocks[4]).toMatchObject({
      type: 'product',
      props: { buttonLabel: 'Ürüne git' },
    });
    expect(validateEmailDocument(document).filter((item) => item.severity === 'error')).toEqual([]);
  });
});

describe('e-mail validation', () => {
  it('reports unsafe URLs, colors, ranges, duplicate ids, and unknown tokens', () => {
    const document = createEmailDocument({
      subject: 'Merhaba {{customer.secret}}',
      blocks: [
        createEmailBlock(
          'button',
          { href: 'javascript:alert(1)', backgroundColor: 'red', width: 999 },
          'same-id'
        ),
        createEmailBlock('text', {}, 'same-id'),
      ],
    });
    const issues = validateEmailDocument(document);
    const codes = issues.map((item) => item.code);

    expect(codes).toContain('merge_tag.unknown');
    expect(codes).toContain('url.unsafe');
    expect(codes).toContain('color.invalid');
    expect(codes).toContain('number.out_of_range');
    expect(codes).toContain('block.id_duplicate');
  });

  it('keeps compliance guidance non-blocking unless strict rendering is requested', () => {
    const document = createEmailDocument({
      blocks: [createEmailBlock('text', { text: 'Merhaba' }, 'plain-text')],
    });
    expect(validateEmailDocument(document)).toContainEqual(
      expect.objectContaining({ code: 'compliance.unsubscribe_missing', severity: 'warning' })
    );
    expect(() => renderEmailHtml(document)).not.toThrow();
    expect(() => renderEmailHtml(document, { strict: true })).toThrow(EmailValidationError);
  });

  it('only accepts unsubscribe tokens placed in an actual link target', () => {
    const plainText = createEmailDocument({
      blocks: [createEmailBlock('text', { text: '{{unsubscribeUrl}}' }, 'plain-unsubscribe')],
    });
    const linked = createEmailDocument({
      blocks: [
        createEmailBlock(
          'social',
          {
            links: [{ network: 'website', label: 'Abonelikten çık', url: '{{unsubscribeUrl}}' }],
          },
          'linked-unsubscribe'
        ),
      ],
    });

    expect(validateEmailDocument(plainText)).toContainEqual(
      expect.objectContaining({ code: 'compliance.unsubscribe_missing' })
    );
    expect(validateEmailDocument(linked)).not.toContainEqual(
      expect.objectContaining({ code: 'compliance.unsubscribe_missing' })
    );
  });

  it('rejects unsupported canonical document versions at render time', () => {
    const document = createEmailDocument({
      blocks: [createEmailBlock('text', {}, 'versioned-text')],
    });
    expect(() => renderEmailHtml({ ...document, version: 2 })).toThrow(EmailValidationError);
  });

  it('warns before subject, preview, and block counts reach their hard limits', () => {
    const blocks = Array.from({ length: 101 }, (_, index) =>
      createEmailBlock('spacer', {}, `soft-limit-${index}`)
    );
    const document = createEmailDocument({
      subject: 'S'.repeat(61),
      previewText: 'P'.repeat(101),
      blocks,
    });
    const warnings = validateEmailDocument(document)
      .filter((item) => item.severity === 'warning')
      .map((item) => item.code);

    expect(warnings).toEqual(
      expect.arrayContaining([
        'subject.recommended_length',
        'preview_text.recommended_length',
        'blocks.recommended_count',
      ])
    );
  });
});

describe('send-ready HTML compiler', () => {
  it('renders deterministic table HTML with mobile, preheader, and Outlook support', () => {
    const document = EMAIL_PRESETS[0].build();
    const first = renderEmailHtml(document);
    const second = renderEmailHtml(document);

    expect(first).toBe(second);
    expect(first).toContain('<!doctype html>');
    expect(first).toContain('role="presentation"');
    expect(first).toContain('@media only screen and (max-width:620px)');
    expect(first).toContain('mso-hide:all');
    expect(first).toContain('<v:roundrect');
    expect(first).toContain('style="');
    expect(first).not.toContain('<script');
    expect(first.toLowerCase()).not.toContain('javascript:');
    expect(first).not.toContain('class="flex');
    expect(new TextEncoder().encode(first).byteLength).toBeLessThanOrEqual(100 * 1024);
  });

  it('escapes text and merge values without accepting raw HTML', () => {
    const document = createEmailDocument({
      subject: 'Merhaba {{customer.firstName}}',
      previewText: 'Önizleme & bilgi',
      blocks: [
        createEmailBlock(
          'text',
          { text: '<script>alert("x")</script>\n{{customer.firstName}}' },
          'escaped-text'
        ),
      ],
    });
    const html = renderEmailHtml(document, {
      mergeData: { customer: { firstName: 'Ada & <b>' } },
      preserveMergeTags: false,
    });

    expect(html).toContain('&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;<br>Ada &amp; &lt;b&gt;');
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('{{customer.firstName}}');
  });

  it('rejects a safe template token when resolved data turns it into an unsafe URL', () => {
    const document = createEmailDocument({
      blocks: [
        createEmailBlock('button', { href: '{{merchant.storeUrl}}' }, 'resolved-url-button'),
      ],
    });

    expect(() =>
      renderEmailHtml(document, {
        mergeData: { merchant: { storeUrl: 'javascript:alert(1)' } },
      })
    ).toThrow(EmailValidationError);
  });

  it('fails closed when URL merge data is removed but a required image URL is missing', () => {
    const document = EMAIL_PRESETS.find((preset) => preset.key === 'product-launch')!.build();
    expect(() =>
      renderEmailHtml(document, {
        mergeData: {},
        preserveMergeTags: false,
      })
    ).toThrow(EmailValidationError);
  });

  it('stops oversized HTML before it reaches the delivery provider', () => {
    const blocks = Array.from({ length: 12 }, (_, index) =>
      createEmailBlock('text', { text: 'x'.repeat(9_000) }, `large-copy-${index}`)
    );
    const document = createEmailDocument({ blocks });

    try {
      renderEmailHtml(document);
      throw new Error('Expected renderEmailHtml to reject oversized HTML.');
    } catch (error) {
      expect(error).toBeInstanceOf(EmailValidationError);
      expect((error as EmailValidationError).issues).toContainEqual(
        expect.objectContaining({ code: 'html.too_large' })
      );
    }
  });

  it('validates and compiles every bundled preset', () => {
    expect(EMAIL_PRESETS.length).toBeGreaterThanOrEqual(6);
    for (const preset of EMAIL_PRESETS) {
      const document = preset.build();
      const serialized = JSON.stringify(document);
      expect(document.subject).toBe(preset.subject);
      expect(document.previewText).toBe(preset.previewText);
      expect(serialized.match(/{{unsubscribeUrl}}/g) || []).toHaveLength(
        preset.purpose === 'marketing' ? 1 : 0
      );
      expect(serialized).not.toContain('{{preferencesUrl}}');
      expect(serialized).not.toContain('{{webViewUrl}}');
      expect(validateEmailDocument(document).filter((item) => item.severity === 'error')).toEqual([]);
      expect(renderEmailHtml(document)).toContain('</html>');
    }
  });

  it('keeps the abandoned-cart preset inside its runtime data contract', () => {
    const document = EMAIL_PRESETS.find((preset) => preset.key === 'abandoned-cart')!.build();
    const serialized = JSON.stringify(document);

    expect(serialized).toContain('{{cart.url}}');
    expect(serialized).toContain('{{cart.itemCount}}');
    expect(serialized).toContain('{{cart.total}}');
    expect(serialized).not.toContain('{{product.');
  });
});
