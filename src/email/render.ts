import { escapeHtml, resolveMergeTemplate, safeUrlProtocol } from './safety';
import type {
  EmailBlock,
  EmailButtonProps,
  EmailDocument,
  EmailMergeData,
  EmailSpacing,
  RenderEmailOptions,
} from './types';
import { EmailValidationError, assertValidEmailDocument } from './validation';

interface RenderContext {
  document: EmailDocument;
  mergeData?: EmailMergeData;
  preserveMergeTags: boolean;
}

const paddingCss = (padding: EmailSpacing): string =>
  `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`;

const resolvedText = (value: string, context: RenderContext): string =>
  escapeHtml(resolveMergeTemplate(value, context.mergeData, context.preserveMergeTags, 'text'));

const resolvedLines = (value: string, context: RenderContext): string =>
  resolvedText(value, context).replace(/\r?\n/g, '<br>');

const resolvedUrl = (
  value: string,
  context: RenderContext,
  kind: 'link' | 'image',
  path: string,
  allowEmpty = false
): string => {
  const resolved = resolveMergeTemplate(value, context.mergeData, context.preserveMergeTags, 'url');
  if (!safeUrlProtocol(resolved, kind, allowEmpty).safe) {
    throw new EmailValidationError([
      {
        path,
        code: 'url.resolved_unsafe',
        message: 'Kişiselleştirme sonrası URL güvenli değil.',
        severity: 'error',
      },
    ]);
  }
  return escapeHtml(resolved);
};

const contentWidth = (document: EmailDocument, padding: EmailSpacing): number =>
  Math.max(40, document.theme.width - padding.left - padding.right);

const wrappedImage = (
  src: string,
  alt: string,
  href: string,
  width: number,
  className: string,
  context: RenderContext,
  path: string
): string => {
  const image = `<img src="${resolvedUrl(src, context, 'image', `${path}.src`)}" width="${width}" alt="${resolvedText(alt, context)}" class="${className}" style="display:block;width:${width}px;max-width:100%;height:auto;border:0;outline:none;text-decoration:none;">`;
  if (href.trim() === '') return image;
  return `<a href="${resolvedUrl(href, context, 'link', `${path}.href`)}" target="_blank" style="text-decoration:none;">${image}</a>`;
};

const renderButtonMarkup = (
  props: EmailButtonProps,
  context: RenderContext,
  path: string
): string => {
  const href = resolvedUrl(props.href, context, 'link', `${path}.href`);
  const label = resolvedText(props.label, context);
  const arcSize = Math.max(0, Math.min(50, Math.round((props.borderRadius / props.height) * 100)));

  return [
    `<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="${props.align}">`,
    '<tr>',
    `<td align="center" bgcolor="${props.backgroundColor}" width="${props.width}" height="${props.height}" style="width:${props.width}px;height:${props.height}px;background-color:${props.backgroundColor};border-radius:${props.borderRadius}px;mso-padding-alt:0;">`,
    `<!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${href}" style="height:${props.height}px;v-text-anchor:middle;width:${props.width}px;" arcsize="${arcSize}%" stroke="f" fillcolor="${props.backgroundColor}"><w:anchorlock/><center style="color:${props.color};font-family:${escapeHtml(context.document.theme.fontFamily)};font-size:${props.fontSize}px;font-weight:${props.fontWeight};">${label}</center></v:roundrect><![endif]-->`,
    '<!--[if !mso]><!-->',
    `<a href="${href}" target="_blank" class="tecof-email-button" style="background-color:${props.backgroundColor};border-radius:${props.borderRadius}px;color:${props.color};display:inline-block;font-family:${escapeHtml(context.document.theme.fontFamily)};font-size:${props.fontSize}px;font-weight:${props.fontWeight};line-height:${props.height}px;text-align:center;text-decoration:none;width:${props.width}px;-webkit-text-size-adjust:none;">${label}</a>`,
    '<!--<![endif]-->',
    '</td>',
    '</tr>',
    '</table>',
  ].join('');
};

const renderBlock = (block: EmailBlock, context: RenderContext, index: number): string => {
  const theme = context.document.theme;
  const path = `blocks.${index}.props`;

  switch (block.type) {
    case 'logo': {
      const width = Math.min(block.props.width, contentWidth(context.document, block.props.padding));
      return `<tr data-block-id="${escapeHtml(block.id)}"><td align="${block.props.align}" style="padding:${paddingCss(block.props.padding)};font-size:0;">${wrappedImage(block.props.src, block.props.alt, block.props.href, width, 'tecof-email-logo', context, path)}</td></tr>`;
    }
    case 'heading': {
      const tag = `h${block.props.level}`;
      return `<tr data-block-id="${escapeHtml(block.id)}"><td align="${block.props.align}" style="padding:${paddingCss(block.props.padding)};"><${tag} style="margin:0;color:${block.props.color};font-family:${escapeHtml(theme.fontFamily)};font-size:${block.props.fontSize}px;font-weight:${block.props.fontWeight};line-height:${block.props.lineHeight};text-align:${block.props.align};">${resolvedLines(block.props.text, context)}</${tag}></td></tr>`;
    }
    case 'text':
      return `<tr data-block-id="${escapeHtml(block.id)}"><td align="${block.props.align}" style="padding:${paddingCss(block.props.padding)};color:${block.props.color};font-family:${escapeHtml(theme.fontFamily)};font-size:${block.props.fontSize}px;line-height:${block.props.lineHeight};text-align:${block.props.align};">${resolvedLines(block.props.text, context)}</td></tr>`;
    case 'button':
      return `<tr data-block-id="${escapeHtml(block.id)}"><td align="${block.props.align}" style="padding:${paddingCss(block.props.padding)};">${renderButtonMarkup(block.props, context, path)}</td></tr>`;
    case 'image': {
      const width = Math.min(block.props.width, contentWidth(context.document, block.props.padding));
      return `<tr data-block-id="${escapeHtml(block.id)}"><td align="${block.props.align}" style="padding:${paddingCss(block.props.padding)};font-size:0;">${wrappedImage(block.props.src, block.props.alt, block.props.href, width, 'tecof-email-fluid', context, path)}</td></tr>`;
    }
    case 'divider':
      return `<tr data-block-id="${escapeHtml(block.id)}"><td style="padding:${paddingCss(block.props.padding)};"><table role="presentation" width="${block.props.width}%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:${block.props.width}%;"><tr><td height="${block.props.thickness}" bgcolor="${block.props.color}" style="height:${block.props.thickness}px;background-color:${block.props.color};font-size:0;line-height:0;">&nbsp;</td></tr></table></td></tr>`;
    case 'spacer':
      return `<tr data-block-id="${escapeHtml(block.id)}"><td class="tecof-email-spacer" data-mobile-height="${block.props.mobileHeight}" height="${block.props.height}" style="height:${block.props.height}px;font-size:0;line-height:0;">&nbsp;</td></tr>`;
    case 'social': {
      const title = block.props.title
        ? `<div style="margin:0 0 10px;color:${block.props.color};font-family:${escapeHtml(theme.fontFamily)};font-size:${block.props.fontSize}px;font-weight:700;line-height:1.4;">${resolvedText(block.props.title, context)}</div>`
        : '';
      const links = block.props.links
        .map((link, linkIndex) => {
          const url = resolvedUrl(link.url, context, 'link', `${path}.links.${linkIndex}.url`);
          return `<a href="${url}" target="_blank" data-network="${link.network}" style="color:${block.props.color};font-family:${escapeHtml(theme.fontFamily)};font-size:${block.props.fontSize}px;font-weight:600;line-height:1.5;text-decoration:underline;">${resolvedText(link.label, context)}</a>`;
        })
        .join('<span style="color:#a1a1aa;">&nbsp;&nbsp;·&nbsp;&nbsp;</span>');
      return `<tr data-block-id="${escapeHtml(block.id)}"><td align="${block.props.align}" style="padding:${paddingCss(block.props.padding)};text-align:${block.props.align};">${title}${links}</td></tr>`;
    }
    case 'coupon':
      return `<tr data-block-id="${escapeHtml(block.id)}"><td style="padding:${paddingCss(block.props.padding)};"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${block.props.backgroundColor}" style="width:100%;background-color:${block.props.backgroundColor};border:2px dashed ${block.props.borderColor};border-radius:${theme.borderRadius}px;"><tr><td align="${block.props.align}" style="padding:22px;color:${block.props.color};font-family:${escapeHtml(theme.fontFamily)};text-align:${block.props.align};"><div style="font-size:12px;font-weight:700;letter-spacing:1.5px;line-height:1.4;">${resolvedText(block.props.eyebrow, context)}</div><div style="padding:6px 0;font-size:28px;font-weight:800;letter-spacing:2px;line-height:1.2;">${resolvedText(block.props.code, context)}</div><div style="font-size:14px;line-height:1.5;">${resolvedLines(block.props.description, context)}</div></td></tr></table></td></tr>`;
    case 'product': {
      const imageWidth = Math.min(block.props.imageWidth, contentWidth(context.document, block.props.padding));
      const image = wrappedImage(
        block.props.imageUrl,
        block.props.imageAlt,
        block.props.url,
        imageWidth,
        'tecof-email-fluid tecof-email-product-image',
        context,
        `${path}.image`
      );
      const oldPrice = block.props.oldPrice.trim()
        ? `<span style="margin-left:8px;color:${theme.mutedTextColor};font-size:13px;text-decoration:line-through;">${resolvedText(block.props.oldPrice, context)}</span>`
        : '';
      const productButton: EmailButtonProps = {
        label: block.props.buttonLabel,
        href: block.props.url,
        backgroundColor: block.props.accentColor,
        color: '#ffffff',
        align: 'left',
        width: 150,
        height: 40,
        borderRadius: Math.min(theme.borderRadius, 12),
        fontSize: 14,
        fontWeight: 700,
        padding: { top: 0, right: 0, bottom: 0, left: 0 },
      };
      return `<tr data-block-id="${escapeHtml(block.id)}"><td style="padding:${paddingCss(block.props.padding)};"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${block.props.backgroundColor}" style="width:100%;background-color:${block.props.backgroundColor};border-radius:${theme.borderRadius}px;"><tr><td class="tecof-email-stack tecof-email-product-media" width="${imageWidth}" valign="middle" style="width:${imageWidth}px;padding:18px;vertical-align:middle;">${image}</td><td class="tecof-email-stack" valign="middle" style="padding:18px;color:${theme.textColor};font-family:${escapeHtml(theme.fontFamily)};vertical-align:middle;"><div style="font-size:20px;font-weight:700;line-height:1.3;">${resolvedText(block.props.title, context)}</div><div style="padding-top:6px;color:${theme.mutedTextColor};font-size:14px;line-height:1.5;">${resolvedLines(block.props.description, context)}</div><div style="padding:10px 0 14px;color:${block.props.accentColor};font-size:18px;font-weight:800;line-height:1.3;">${resolvedText(block.props.price, context)}${oldPrice}</div>${renderButtonMarkup(productButton, context, `${path}.url`)}</td></tr></table></td></tr>`;
    }
  }
};

const mobileSpacerRules = (document: EmailDocument): string =>
  document.blocks
    .filter((block): block is Extract<EmailBlock, { type: 'spacer' }> => block.type === 'spacer')
    .map(
      (block) =>
        `tr[data-block-id="${block.id}"] .tecof-email-spacer,tr[data-block-id="${block.id}"] td.tecof-email-spacer{height:${block.props.mobileHeight}px!important;}`
    )
    .join('');

/**
 * Produces deterministic, send-ready HTML from the restricted e-mail AST.
 * This is the authoritative preview/send renderer; TecofStudio/TecofRender and
 * their Tailwind classes must not be used to generate outgoing e-mail markup.
 */
export const renderEmailHtml = (input: unknown, options: RenderEmailOptions = {}): string => {
  const document = assertValidEmailDocument(input, options.strict ?? false);
  const context: RenderContext = {
    document,
    mergeData: options.mergeData,
    preserveMergeTags: options.preserveMergeTags ?? true,
  };
  const lang = /^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8})?$/.test(options.lang ?? '')
    ? (options.lang as string)
    : 'tr';
  const blocks = document.blocks.map((block, index) => renderBlock(block, context, index)).join('');
  const subject = resolvedText(document.subject, context);
  const previewText = resolvedText(document.previewText, context);
  const theme = document.theme;

  const html = [
    '<!doctype html>',
    `<html lang="${escapeHtml(lang)}" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">`,
    '<head>',
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    '<meta name="x-apple-disable-message-reformatting">',
    `<title>${subject}</title>`,
    '<style>',
    'html,body{margin:0!important;padding:0!important;width:100%!important;}table,td{border-collapse:collapse!important;mso-table-lspace:0pt!important;mso-table-rspace:0pt!important;}img{-ms-interpolation-mode:bicubic;}a[x-apple-data-detectors]{color:inherit!important;text-decoration:none!important;}',
    '@media only screen and (max-width:620px){.tecof-email-shell{width:100%!important;max-width:100%!important;border-radius:0!important;}.tecof-email-fluid{width:100%!important;max-width:100%!important;height:auto!important;}.tecof-email-stack{display:block!important;width:100%!important;box-sizing:border-box!important;}.tecof-email-product-media{text-align:center!important;}.tecof-email-button{max-width:100%!important;}.tecof-email-logo{max-width:70%!important;height:auto!important;}',
    mobileSpacerRules(document),
    '}',
    '</style>',
    '<!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch><o:AllowPNG/></o:OfficeDocumentSettings></xml><![endif]-->',
    '</head>',
    `<body bgcolor="${theme.backgroundColor}" style="margin:0;padding:0;background-color:${theme.backgroundColor};word-spacing:normal;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">`,
    `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;opacity:0;color:transparent;">${previewText}${previewText ? '&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;' : ''}</div>`,
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${theme.backgroundColor}" style="width:100%;background-color:${theme.backgroundColor};">`,
    '<tr><td align="center" style="padding:24px 0;">',
    `<!--[if mso]><table role="presentation" width="${theme.width}" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->`,
    `<table role="presentation" width="${theme.width}" cellpadding="0" cellspacing="0" border="0" bgcolor="${theme.contentBackgroundColor}" class="tecof-email-shell" style="width:100%;max-width:${theme.width}px;background-color:${theme.contentBackgroundColor};border-radius:${theme.borderRadius}px;overflow:hidden;">`,
    blocks,
    '</table>',
    '<!--[if mso]></td></tr></table><![endif]-->',
    '</td></tr>',
    '</table>',
    '</body>',
    '</html>',
  ].join('');

  const byteLength = new TextEncoder().encode(html).byteLength;
  if (byteLength > 100 * 1024) {
    throw new EmailValidationError([
      {
        path: '',
        code: 'html.too_large',
        message: 'Derlenen e-posta HTML çıktısı 100 KiB sınırını aşıyor.',
        severity: 'error',
      },
    ]);
  }

  return html;
};
