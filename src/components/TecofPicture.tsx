import { memo, useState } from 'react';
import { useTecof } from './TecofProvider';
import { cdnFileUrl } from '../utils';
import type { UploadedFile } from '../types';

/* ─── Helpers ─── */

const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'avif', 'bmp', 'tiff', 'heic'];
const VIDEO_EXTENSIONS = ['mp4', 'webm', 'ogg', 'avi', 'mov', 'quicktime'];

const isImage = (type: string): boolean => {
  if (!type) return false;
  const t = type.toLowerCase();
  return IMAGE_EXTENSIONS.some((ext) => t.includes(ext)) || t.startsWith('image/');
};

const isVideo = (type: string): boolean => {
  if (!type) return false;
  const t = type.toLowerCase();
  return VIDEO_EXTENSIONS.some((ext) => t.includes(ext)) || t.startsWith('video/');
};

/** External URLs carry no `type`; sniff videos from the URL path extension. */
const urlLooksLikeVideo = (url: string): boolean => {
  const path = url.split(/[?#]/)[0].toLowerCase();
  return VIDEO_EXTENSIONS.some((ext) => path.endsWith(`.${ext}`));
};

/**
 * Pick the backend-generated size variant matching the requested display size.
 * Uploads of raster images (png/jpg/jpeg/webp) get `meta.thumbnail` (360),
 * `meta.medium` (540), `meta.large` (720) square crops plus a full-size
 * `meta.webp`; other types carry no variants and fall back to the original.
 * Falls upward (thumbnail → medium → large → webp) so a missing variant never
 * breaks the image.
 */
const pickVariantName = (data: UploadedFile, size: PictureSize): string => {
  const m = data.meta;
  if (!m) return data.name;
  switch (size) {
    case 'thumbnail':
      return m.thumbnail || m.medium || m.large || m.webp || data.name;
    case 'medium':
      return m.medium || m.large || m.webp || data.name;
    case 'large':
      return m.large || m.webp || data.name;
    default:
      return m.webp || data.name;
  }
};

/* ─── Size Map ─── */

type PictureSize = 'thumbnail' | 'medium' | 'large' | 'full';

const getSizes = (size: PictureSize): string => {
  switch (size) {
    case 'thumbnail':
      return '(max-width: 360px) 100vw, 360px';
    case 'medium':
      return '(max-width: 540px) 100vw, 540px';
    case 'large':
      return '(max-width: 720px) 100vw, 720px';
    default:
      return '100vw';
  }
};


/* ─── Blur SVG Placeholder ─── */

const DEFAULT_BLUR_DATA_URL =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmM2Y0ZjYiLz48L3N2Zz4=';

/* ─── Props ─── */

export interface TecofPictureProps {
  /** The uploaded file data from UploadField */
  data: UploadedFile | null | undefined;
  /** Alt text for accessibility */
  alt?: string | null;
  /** Image size variant */
  size?: PictureSize;
  /** Loading strategy */
  loading?: 'lazy' | 'eager';
  /** Fill the parent container (position: absolute, 100%) */
  fill?: boolean;
  /** Container style overrides */
  style?: React.CSSProperties;
  /** Image style overrides */
  imgStyle?: React.CSSProperties;
  /** Container className */
  className?: string;
  /** Image className */
  imgClassName?: string;
  /** Image width (auto-detected from meta if available) */
  width?: number;
  /** Image height (auto-detected from meta if available) */
  height?: number;
  /** Whether to use a blur placeholder while loading */
  usePlaceholder?: boolean;
  /** Custom blur data URL */
  blurDataURL?: string;
  /** Fancybox lightbox support */
  fancybox?: boolean;
  /** Fancybox group name */
  fancyboxName?: string;
  /** Custom Image component (e.g. Next.js Image). If not provided, uses standard <img> */
  ImageComponent?: React.ComponentType<any>;
  /** Extra props to pass to the Image component (e.g. quality, priority, placeholder) */
  imageProps?: Record<string, any>;
}

/* ─── Component ─── */

export const TecofPicture = memo(({
  data,
  alt = null,
  size = 'full',
  loading = 'lazy',
  fill = false,
  style,
  imgStyle,
  className,
  imgClassName,
  width,
  height,
  usePlaceholder = true,
  blurDataURL = DEFAULT_BLUR_DATA_URL,
  fancybox = false,
  fancyboxName = 'gallery',
  ImageComponent,
  imageProps = {},
}: TecofPictureProps) => {
  const { apiClient } = useTecof();
  const cdnUrl = apiClient.cdnUrl;

  // Blur placeholder: tracks the last URL that finished loading, so swapping
  // to a new source shows the placeholder again (no stale "loaded" flag).
  const [loadedUrl, setLoadedUrl] = useState<string | null>(null);

  if (!data) return null;

  // CMS reference tokens ({{ data.x }}) have no real file behind them here —
  // building a CDN URL from the raw token would just render a broken image.
  if (data.type === 'image/reference') return null;

  /* ── External vs CDN URL Resolution ── */
  const isExternal = data.type === 'external' || data.provider === 'external';
  if (!isExternal && !data.name) return null;

  /* Ortak helper — EditorField/ThemeEditor ile aynı kaynak; folder mantığı
     bir daha sessizce ayrışamasın diye tek yerde yaşar. */
  const buildURL = (fileName: string) => cdnFileUrl(cdnUrl, data, fileName);

  // Original for the lightbox link; the size-matched variant for the <img>.
  const originalURL = isExternal ? (data.url || '') : buildURL(data.name);
  const fileURL = isExternal ? originalURL : buildURL(pickVariantName(data, size));
  const isVideoType = isExternal ? urlLooksLikeVideo(originalURL) : isVideo(data.type);
  const isImageType = isExternal ? !isVideoType : isImage(data.type);

  if (!fileURL) return null;

  const imgWidth = width || data?.meta?.width || 500;
  const imgHeight = height || data?.meta?.height || 500;
  const sizes = getSizes(size);

  const renderVideo = () => (
    <video
      src={fileURL}
      autoPlay
      loop
      muted
      playsInline
      preload="metadata"
      className={`tecof-picture-video ${imgClassName || ''}`.trim()}
      style={imgStyle}
    />
  );

  /* ── Image Renderer ── */

  const renderImg = () => {
    const baseImgClass = fill ? 'tecof-picture-img-fill' : 'tecof-picture-img';
    const computedImgClass = `${baseImgClass} ${imgClassName || ''}`.trim();

    const altText = alt || data?.name || 'Image';

    const commonProps = {
      src: fileURL,
      alt: altText,
      loading,
      sizes,
      className: computedImgClass,
      style: imgStyle,
      onLoad: () => setLoadedUrl(fileURL),
    };

    // If ImageComponent is provided (e.g. Next.js Image), use it
    if (ImageComponent) {
      return (
        <ImageComponent
          {...commonProps}
          width={fill ? undefined : imgWidth}
          height={fill ? undefined : imgHeight}
          {...(fill ? { fill: true } : {})}
          {...imageProps}
        />
      );
    }

    // Standard <img> fallback
    return (
      <img
        {...commonProps}
        width={fill ? undefined : imgWidth}
        height={fill ? undefined : imgHeight}
      />
    );
  };

  /* ── Container ── */

  const containerClassName = `tecof-picture-wrapper ${fill ? 'fill' : ''} ${className || ''}`.trim();

  // Blur-up: paint the placeholder behind the image until its URL reports
  // loaded. (Videos manage their own poster/loading.)
  const showBlur = usePlaceholder && isImageType && loadedUrl !== fileURL;
  const containerStyle: React.CSSProperties | undefined = showBlur
    ? { ...style, backgroundImage: `url("${blurDataURL}")`, backgroundSize: 'cover' }
    : style;

  /* ── Fancybox Wrapper ── */

  if (fancybox && (isImageType || isVideoType)) {
    return (
      <a
        data-fancybox={fancyboxName}
        // Lightbox always opens the ORIGINAL file, not the sized variant.
        href={originalURL || fileURL}
        className="tecof-picture-link"
      >
        <div style={containerStyle} className={containerClassName}>
          {isVideoType ? renderVideo() : renderImg()}
        </div>
      </a>
    );
  }

  /* ── Standard Render ── */

  if (isVideoType) {
    return (
      <div style={style} className={containerClassName}>
        {renderVideo()}
      </div>
    );
  }

  if (isImageType) {
    return (
      <div style={containerStyle} className={containerClassName}>
        {renderImg()}
      </div>
    );
  }

  return null;
});

TecofPicture.displayName = 'TecofPicture';

export default TecofPicture;
