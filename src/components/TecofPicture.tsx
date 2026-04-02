import { memo } from 'react';
import { useTecof } from './TecofProvider';
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

/* ─── Styles ─── */

const styles = {
  picture: {
    position: 'relative' as const,
    display: 'block',
    overflow: 'hidden' as const,
  },
  img: {
    display: 'block',
    width: '100%',
    height: 'auto',
    objectFit: 'cover' as const,
  },
  imgFill: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
  },
  video: {
    display: 'block',
    width: '100%',
    height: 'auto',
    objectFit: 'cover' as const,
  },
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

  if (!data) return null;

  const fileURL = `${cdnUrl}/${data.name}`;
  const isImageType = isImage(data.type);
  const isVideoType = isVideo(data.type);

  const imgWidth = width || data?.meta?.width || 500;
  const imgHeight = height || data?.meta?.height || 500;
  const sizes = getSizes(size);

  /* ── Video Renderer ── */

  const renderVideo = () => (
    <video
      src={fileURL}
      autoPlay
      loop
      muted
      playsInline
      style={{ ...styles.video, ...imgStyle }}
      className={imgClassName}
    />
  );

  /* ── Image Renderer ── */

  const renderImg = () => {
    const imageStyle = fill
      ? { ...styles.imgFill, ...imgStyle }
      : { ...styles.img, ...imgStyle };

    const altText = alt || data?.name || 'Image';

    const commonProps = {
      src: fileURL,
      alt: altText,
      loading,
      sizes,
      className: imgClassName,
    };

    // If ImageComponent is provided (e.g. Next.js Image), use it
    if (ImageComponent) {
      return (
        <ImageComponent
          {...commonProps}
          width={fill ? undefined : imgWidth}
          height={fill ? undefined : imgHeight}
          style={imageStyle}
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
        style={imageStyle}
      />
    );
  };

  /* ── Container ── */

  const containerStyle: React.CSSProperties = {
    ...styles.picture,
    ...(fill ? { width: '100%', height: '100%' } : {}),
    ...style,
  };

  /* ── Fancybox Wrapper ── */

  if (fancybox && (isImageType || isVideoType)) {
    return (
      <a
        data-fancybox={fancyboxName}
        href={fileURL}
        style={{ display: 'block', textDecoration: 'none' }}
      >
        <div style={containerStyle} className={className}>
          {isVideoType ? renderVideo() : renderImg()}
        </div>
      </a>
    );
  }

  /* ── Standard Render ── */

  if (isVideoType) {
    return (
      <div style={containerStyle} className={className}>
        {renderVideo()}
      </div>
    );
  }

  if (isImageType) {
    return (
      <div style={containerStyle} className={className}>
        {renderImg()}
      </div>
    );
  }

  return null;
});

TecofPicture.displayName = 'TecofPicture';

export default TecofPicture;
