'use client';

import React, { forwardRef } from 'react';

/**
 * TecofRoot — bir section/element'in KÖK DOM elemanı.
 *
 * NEDEN: editör kimliği (seçim/hover) yalnız `className` kanalında yaşar; bir
 * bileşen `p.className`'i kök elemanına basmazsa kanvasta SEÇİLEMEZ olur (sessiz
 * footgun; NodeRenderer tip başına bir kez uyarır). TecofRoot className +
 * data-/aria- öznitelikleri + ref geçişini tek noktada toplar. `defineSection`/`defineElement`
 * kullanıldığında `p.className` BURAYA otomatik enjekte edilir — sözleşme ihlali
 * imkânsızlaşır. Elle kullanımda `className={cn(..., p.className)}` yine gerekir.
 */
export interface TecofRootProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
}

export const TecofRoot = forwardRef<HTMLElement, TecofRootProps>(
  ({ as: Tag = 'div', children, ...rest }, ref) => {
    return (
      <Tag ref={ref as any} {...rest}>
        {children}
      </Tag>
    );
  }
);
TecofRoot.displayName = 'TecofRoot';

export default TecofRoot;
