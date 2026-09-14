// @vitest-environment node
import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { TecofProvider } from '../TecofProvider';
import { TecofPicture } from '../TecofPicture';
import {
  clampFocalPoint,
  focalPointToObjectPosition,
  isDefaultFocalPoint,
} from '../../utils/focalPoint';
import type { UploadedFile } from '../../types';

/* TecofPicture `useTecof()` ister — testte gerçek TecofProvider ile sarılır;
   apiClient yalnız cdnUrl için okunur, ağ isteği atılmaz. */
const wrap = (node: React.ReactNode) =>
  renderToStaticMarkup(
    <TecofProvider apiUrl="https://api.test" secretKey="sk" cdnUrl="https://cdn.test">
      {node}
    </TecofProvider>,
  );

const image: UploadedFile = { name: 'hero.png', size: 10, type: 'png', meta: { width: 800, height: 600 } };
const video: UploadedFile = { name: 'clip.mp4', size: 10, type: 'mp4' };

describe('focalPoint helpers', () => {
  it('clampFocalPoint aralığı 0..100 yapar, eksik/geçersiz ekseni merkeze düşürür', () => {
    expect(clampFocalPoint({ x: -20, y: 140 })).toEqual({ x: 0, y: 100 });
    expect(clampFocalPoint({ x: 30 })).toEqual({ x: 30, y: 50 });
    expect(clampFocalPoint({ x: Number.NaN, y: 'abc' as any })).toEqual({ x: 50, y: 50 });
    expect(clampFocalPoint(null)).toEqual({ x: 50, y: 50 });
    expect(clampFocalPoint(undefined)).toEqual({ x: 50, y: 50 });
  });

  it('isDefaultFocalPoint yok/merkez için true, aksi hâlde false', () => {
    expect(isDefaultFocalPoint(undefined)).toBe(true);
    expect(isDefaultFocalPoint(null)).toBe(true);
    expect(isDefaultFocalPoint({ x: 50, y: 50 })).toBe(true);
    expect(isDefaultFocalPoint({ x: 50, y: 51 })).toBe(false);
    // Sınır dışı değer sıkıştırılınca merkeze düşerse varsayılan sayılmaz mı? 140→100, merkez değil.
    expect(isDefaultFocalPoint({ x: 50, y: 140 })).toBe(false);
  });

  it('focalPointToObjectPosition "x% y%" üretir; yok/merkezde undefined', () => {
    expect(focalPointToObjectPosition({ x: 30, y: 70 })).toBe('30% 70%');
    expect(focalPointToObjectPosition({ x: 0, y: 100 })).toBe('0% 100%');
    expect(focalPointToObjectPosition({ x: 33.333, y: 50 })).toBe('33.33% 50%');
    expect(focalPointToObjectPosition({ x: 50, y: 50 })).toBeUndefined();
    expect(focalPointToObjectPosition(undefined)).toBeUndefined();
    expect(focalPointToObjectPosition(null)).toBeUndefined();
    // Aralık dışı değer sıkıştırılır
    expect(focalPointToObjectPosition({ x: -5, y: 250 })).toBe('0% 100%');
  });
});

describe('TecofPicture objectPosition', () => {
  it('odak yoksa style/object-position yazılmaz (regresyon yok)', () => {
    const html = wrap(<TecofPicture data={image} alt="a" />);
    expect(html).not.toContain('object-position');
    // <img> etiketi kendisi style taşımaz (sarmalayıcıdaki blur placeholder ayrı)
    const img = html.match(/<img[^>]*>/)?.[0] ?? '';
    expect(img).toContain('src="https://cdn.test/hero.png"');
    expect(img).not.toContain('style=');
  });

  it('merkez odak da DOM çıktısını değiştirmez', () => {
    const html = wrap(<TecofPicture data={{ ...image, focalPoint: { x: 50, y: 50 } }} alt="a" />);
    expect(html).not.toContain('object-position');
  });

  it('odak varsa img style object-position alır', () => {
    const html = wrap(<TecofPicture data={{ ...image, focalPoint: { x: 30, y: 70 } }} alt="a" />);
    expect(html).toContain('object-position:30% 70%');
  });

  it('imgStyle.objectPosition verilmişse o kazanır', () => {
    const html = wrap(
      <TecofPicture
        data={{ ...image, focalPoint: { x: 30, y: 70 } }}
        alt="a"
        imgStyle={{ objectPosition: '10% 20%', objectFit: 'cover' }}
      />,
    );
    expect(html).toContain('object-position:10% 20%');
    expect(html).not.toContain('30% 70%');
    // Diğer imgStyle anahtarları korunur
    expect(html).toContain('object-fit:cover');
  });

  it('odak, mevcut imgStyle ile birleşir', () => {
    const html = wrap(
      <TecofPicture data={{ ...image, focalPoint: { x: 30, y: 70 } }} alt="a" imgStyle={{ opacity: 0.5 }} />,
    );
    expect(html).toContain('opacity:0.5');
    expect(html).toContain('object-position:30% 70%');
  });

  it('video için de object-position uygulanır', () => {
    const html = wrap(<TecofPicture data={{ ...video, focalPoint: { x: 20, y: 80 } }} />);
    expect(html).toContain('<video');
    expect(html).toContain('object-position:20% 80%');
  });

  it('harici (stok) görselde de çalışır', () => {
    const ext: UploadedFile = {
      name: 'stock',
      size: 0,
      type: 'external',
      url: 'https://img.test/photo.jpg',
      focalPoint: { x: 75, y: 25 },
    };
    const html = wrap(<TecofPicture data={ext} alt="s" />);
    expect(html).toContain('src="https://img.test/photo.jpg"');
    expect(html).toContain('object-position:75% 25%');
  });

  it('ImageComponent verilince style aynı şekilde geçer', () => {
    const Img = (props: any) => <span data-style={JSON.stringify(props.style)} />;
    const html = wrap(
      <TecofPicture data={{ ...image, focalPoint: { x: 30, y: 70 } }} alt="a" ImageComponent={Img} />,
    );
    expect(html).toContain('30% 70%');
  });
});
