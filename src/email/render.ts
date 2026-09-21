import { EMAIL_COLUMN_LAYOUTS } from './constants';
import { walkEmailBlocks } from './factory';
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

/** `available` = bloğun içine yazıldığı kabın genişliği (px); en üstte theme.width */
const contentWidth = (available: number, padding: EmailSpacing): number =>
  Math.max(40, available - padding.left - padding.right);

/**
 * Satır içi biçim alt kümesi (backend `renderInlineText` ile aynı): strong/b, em/i, u, s/strike, a[href], br,
 * ul, ol, li tanınır; kalan `<…>` metin olarak kaçırılır; href URL kuralından geçer; etiketler dengelenir.
 */
const INLINE_TOKEN = /<\/?(strong|b|em|i|u|s|strike|ul|ol|li|br)\s*\/?>|<a\s+[^>]*?href\s*=\s*"([^"]*)"[^>]*>|<a\s+[^>]*?href\s*=\s*'([^']*)'[^>]*>|<\/a>/gi;
const INLINE_ALIAS: Record<string, string> = { b: 'strong', i: 'em', strike: 's' };
const INLINE_OPEN: Record<string, string> = {
  strong: '<strong>', em: '<em>', u: '<u>', s: '<s>',
  ul: '<ul style="margin:0 0 0 20px;padding:0;">', ol: '<ol style="margin:0 0 0 20px;padding:0;">', li: '<li>',
};

const renderInlineText = (value: string, context: RenderContext, path: string): string => {
  const linkColor = context.document.theme.primaryColor;
  const out: string[] = [];
  const stack: string[] = [];
  let last = 0;
  for (const match of value.matchAll(INLINE_TOKEN)) {
    const start = match.index ?? 0;
    if (start > last) out.push(resolvedLines(value.slice(last, start), context));
    last = start + match[0].length;
    const raw = match[0];
    if (/^<br/i.test(raw)) { out.push('<br>'); continue; }
    if (/^<a\s/i.test(raw)) {
      const href = String(match[2] ?? match[3] ?? '').trim();
      const safe = !!href && safeUrlProtocol(href, 'link', false).safe;
      out.push(safe ? `<a href="${resolvedUrl(href, context, 'link', `${path}.href`)}" target="_blank" style="color:${linkColor};text-decoration:underline;">` : `<a style="color:${linkColor};text-decoration:underline;">`);
      stack.push('a');
      continue;
    }
    if (/^<\/a>/i.test(raw)) {
      if (stack.lastIndexOf('a') >= 0) { while (stack.length) { const top = stack.pop() as string; out.push(`</${top}>`); if (top === 'a') break; } }
      continue;
    }
    const closing = raw.startsWith('</');
    const name = INLINE_ALIAS[String(match[1]).toLowerCase()] || String(match[1]).toLowerCase();
    if (closing) {
      if (stack.lastIndexOf(name) >= 0) { while (stack.length) { const top = stack.pop() as string; out.push(`</${top}>`); if (top === name) break; } }
      continue;
    }
    out.push(INLINE_OPEN[name] || `<${name}>`);
    stack.push(name);
  }
  if (last < value.length) out.push(resolvedLines(value.slice(last), context));
  while (stack.length) out.push(`</${stack.pop()}>`);
  return out.join('');
};

const MENU_SEPARATOR_HTML: Record<string, string> = {
  dot: '<span style="color:#a1a1aa;">&nbsp;&nbsp;·&nbsp;&nbsp;</span>',
  pipe: '<span style="color:#a1a1aa;">&nbsp;&nbsp;|&nbsp;&nbsp;</span>',
  space: '&nbsp;&nbsp;&nbsp;&nbsp;',
  none: '',
};

const linkMarkup = (
  href: string,
  label: string,
  color: string,
  fontSize: number,
  fontWeight: number,
  underline: boolean,
  context: RenderContext,
  path: string
): string =>
  `<a href="${resolvedUrl(href, context, 'link', path)}" target="_blank" style="color:${color};font-family:${escapeHtml(context.document.theme.fontFamily)};font-size:${fontSize}px;font-weight:${fontWeight};line-height:1.5;text-decoration:${underline ? 'underline' : 'none'};">${resolvedText(label, context)}</a>`;

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

const renderBlock = (block: EmailBlock, context: RenderContext, basePath: string, available: number): string => {
  const theme = context.document.theme;
  const path = `${basePath}.props`;

  switch (block.type) {
    case 'logo': {
      const width = Math.min(block.props.width, contentWidth(available, block.props.padding));
      return `<tr data-block-id="${escapeHtml(block.id)}"><td align="${block.props.align}" style="padding:${paddingCss(block.props.padding)};font-size:0;">${wrappedImage(block.props.src, block.props.alt, block.props.href, width, 'tecof-email-logo', context, path)}</td></tr>`;
    }
    case 'heading': {
      const tag = `h${block.props.level}`;
      return `<tr data-block-id="${escapeHtml(block.id)}"><td align="${block.props.align}" style="padding:${paddingCss(block.props.padding)};"><${tag} style="margin:0;color:${block.props.color};font-family:${escapeHtml(theme.fontFamily)};font-size:${block.props.fontSize}px;font-weight:${block.props.fontWeight};line-height:${block.props.lineHeight};text-align:${block.props.align};">${renderInlineText(block.props.text, context, `${path}.text`)}</${tag}></td></tr>`;
    }
    case 'text':
      return `<tr data-block-id="${escapeHtml(block.id)}"><td align="${block.props.align}" style="padding:${paddingCss(block.props.padding)};color:${block.props.color};font-family:${escapeHtml(theme.fontFamily)};font-size:${block.props.fontSize}px;line-height:${block.props.lineHeight};text-align:${block.props.align};">${renderInlineText(block.props.text, context, `${path}.text`)}</td></tr>`;
    case 'button':
      return `<tr data-block-id="${escapeHtml(block.id)}"><td align="${block.props.align}" style="padding:${paddingCss(block.props.padding)};">${renderButtonMarkup({ ...block.props, width: Math.min(block.props.width, contentWidth(available, block.props.padding)) }, context, path)}</td></tr>`;
    case 'image': {
      const width = Math.min(block.props.width, contentWidth(available, block.props.padding));
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
      const imageWidth = Math.min(block.props.imageWidth, contentWidth(available, block.props.padding));
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
    case 'video': {
      const width = Math.min(block.props.width, contentWidth(available, block.props.padding));
      const caption = block.props.showCaption && block.props.caption.trim()
        ? `<div style="padding-top:10px;font-family:${escapeHtml(theme.fontFamily)};font-size:14px;font-weight:700;line-height:1.4;"><a href="${resolvedUrl(block.props.videoUrl, context, 'link', `${path}.videoUrl`)}" target="_blank" style="color:${theme.primaryColor};text-decoration:none;">&#9654;&nbsp;${resolvedText(block.props.caption, context)}</a></div>`
        : '';
      const image = `<img src="${resolvedUrl(block.props.thumbnailUrl, context, 'image', `${path}.thumbnailUrl`)}" width="${width}" alt="${resolvedText(block.props.alt, context)}" class="tecof-email-fluid tecof-email-video" style="display:block;width:${width}px;max-width:100%;height:auto;border:0;outline:none;text-decoration:none;">`;
      return `<tr data-block-id="${escapeHtml(block.id)}"><td align="${block.props.align}" style="padding:${paddingCss(block.props.padding)};text-align:${block.props.align};"><a href="${resolvedUrl(block.props.videoUrl, context, 'link', `${path}.videoUrl`)}" target="_blank" style="text-decoration:none;">${image}</a>${caption}</td></tr>`;
    }
    case 'footer': {
      const p = block.props;
      const links = p.links.map((link, linkIndex) => linkMarkup(link.url, link.label, p.color, p.fontSize, 400, true, context, `${path}.links.${linkIndex}.url`));
      if (p.showUnsubscribe) links.push(linkMarkup('{{unsubscribeUrl}}', p.unsubscribeLabel, p.color, p.fontSize, 400, true, context, `${path}.unsubscribe`));
      const text = p.text.trim() ? `<div style="padding-bottom:${links.length ? 10 : 0}px;">${resolvedLines(p.text, context)}</div>` : '';
      return `<tr data-block-id="${escapeHtml(block.id)}"><td align="${p.align}" class="tecof-email-footer" style="padding:${paddingCss(p.padding)};color:${p.color};font-family:${escapeHtml(theme.fontFamily)};font-size:${p.fontSize}px;line-height:1.6;text-align:${p.align};">${text}${links.join(MENU_SEPARATOR_HTML.dot)}</td></tr>`;
    }
    case 'menu': {
      const p = block.props;
      const items = p.items
        .map((item, itemIndex) => linkMarkup(item.url, item.label, p.color, p.fontSize, p.fontWeight, false, context, `${path}.items.${itemIndex}.url`))
        .join(MENU_SEPARATOR_HTML[p.separator] ?? MENU_SEPARATOR_HTML.dot);
      return `<tr data-block-id="${escapeHtml(block.id)}"><td align="${p.align}" class="tecof-email-menu" style="padding:${paddingCss(p.padding)};font-family:${escapeHtml(theme.fontFamily)};font-size:${p.fontSize}px;line-height:1.6;text-align:${p.align};">${items}</td></tr>`;
    }
    case 'html':
      /* Ham HTML olduğu gibi basılır; temizlik (script/olay/güvensiz URL) backend kaydında yapılır */
      return `<tr data-block-id="${escapeHtml(block.id)}"><td class="tecof-email-html" style="padding:${paddingCss(block.props.padding)};color:${theme.textColor};font-family:${escapeHtml(theme.fontFamily)};">${context.preserveMergeTags ? block.props.html : resolveMergeTemplate(block.props.html, context.mergeData, false, 'text')}</td></tr>`;
    case 'section': {
      const p = block.props;
      const inner = contentWidth(available, p.padding);
      const rows = p.blocks.map((child, childIndex) => renderBlock(child, context, `${path}.blocks.${childIndex}`, inner)).join('');
      return `<tr data-block-id="${escapeHtml(block.id)}"><td bgcolor="${p.backgroundColor}" class="tecof-email-section" style="padding:${paddingCss(p.padding)};background-color:${p.backgroundColor};"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-radius:${p.borderRadius}px;overflow:hidden;">${rows || '<tr><td style="font-size:0;line-height:0;">&nbsp;</td></tr>'}</table></td></tr>`;
    }
    case 'columns': {
      const p = block.props;
      const weights = EMAIL_COLUMN_LAYOUTS[p.layout] ?? EMAIL_COLUMN_LAYOUTS['1:1'];
      const count = weights.length;
      const inner = contentWidth(available, p.padding);
      const gap = Number(p.gap) || 0;
      const usable = Math.max(count * 40, inner - gap * (count - 1));
      const sum = weights.reduce((total, weight) => total + weight, 0);
      const stackClass = p.stackOnMobile ? ' tecof-email-col-stack' : '';
      const cells = weights
        .map((weight, index) => {
          const width = Math.floor((usable * weight) / sum);
          const left = index === 0 ? 0 : Math.round(gap / 2);
          const right = index === count - 1 ? 0 : Math.round(gap / 2);
          const rows = (p.columns[index] ?? []).map((child, childIndex) => renderBlock(child, context, `${path}.columns.${index}.${childIndex}`, width)).join('');
          return `<td class="tecof-email-col${stackClass}" width="${width + left + right}" valign="${p.verticalAlign}" style="width:${width + left + right}px;vertical-align:${p.verticalAlign};padding:0 ${right}px 0 ${left}px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;">${rows || '<tr><td style="font-size:0;line-height:0;">&nbsp;</td></tr>'}</table></td>`;
        })
        .join('');
      return `<tr data-block-id="${escapeHtml(block.id)}"><td style="padding:${paddingCss(p.padding)};"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;"><tr>${cells}</tr></table></td></tr>`;
    }
  }
};

const mobileSpacerRules = (document: EmailDocument): string => {
  const rules: string[] = [];
  walkEmailBlocks(document.blocks, (block) => {
    if (block.type === 'spacer') {
      rules.push(`tr[data-block-id="${block.id}"] .tecof-email-spacer,tr[data-block-id="${block.id}"] td.tecof-email-spacer{height:${block.props.mobileHeight}px!important;}`);
    }
  });
  return rules.join('');
};

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
  const blocks = document.blocks.map((block, index) => renderBlock(block, context, `blocks.${index}`, document.theme.width)).join('');
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
    '@media only screen and (max-width:620px){.tecof-email-shell{width:100%!important;max-width:100%!important;border-radius:0!important;}.tecof-email-fluid{width:100%!important;max-width:100%!important;height:auto!important;}.tecof-email-stack{display:block!important;width:100%!important;box-sizing:border-box!important;}.tecof-email-product-media{text-align:center!important;}.tecof-email-button{max-width:100%!important;}.tecof-email-logo{max-width:70%!important;height:auto!important;}.tecof-email-col-stack{display:block!important;width:100%!important;box-sizing:border-box!important;padding-left:0!important;padding-right:0!important;}',
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
