'use client';

import React from 'react';
import { Slot, type SlotLayout, type SlotGap } from './Slot';
import type { ComponentConfig, FieldConfig } from '../types';

/**
 * defineSection / defineElement — bir bileşeni bildirimsel bir spec'ten üretir ve
 * tema kodlamasının tekrar eden tuzaklarını yazarın gözünden gizler:
 *
 *  • slot'lar tek yerde tanımlanır → hem `fields` (type:'slot') hem `defaultChildren`
 *    otomatik üretilir (defaultProps'a slot dizisi yazma tuzağı biter),
 *  • `render`'a HAZIR `<Slot>` map'i verilir (renderSlot çağrısı bile gerekmez,
 *    yerleşim `layout`/`gap`'ten gelir — inline-stil/duplicate-style yok),
 *  • dönen kök elemanın className'ine `p.className` OTOMATİK eklenir → editör
 *    "seçilemiyor" (className kök sözleşmesi) footgun'u imkânsızlaşır.
 *
 * Çıktı düz bir `ComponentConfig`'tir; app/components.tsx ve editor-config'e
 * mevcut bileşenlerle birebir aynı biçimde kaydedilir.
 */

export type SlotSpec = {
  label?: string;
  allow?: string[];
  /** Yerleşim — <Slot>'a geçer ve field orientation'ını belirler (row → horizontal). */
  layout?: SlotLayout;
  gap?: SlotGap;
  maxItems?: number;
  /** Eklenince otomatik doğan çocuklar (çocuk KENDİ defaultProps'uyla birleşir). */
  default?: Array<string | { type: string; props?: Record<string, any> }>;
  /** Ek slot field alanları (repeatSource vb.). */
  fieldExtra?: Partial<FieldConfig>;
};

/** render'a geçen hazır slot map'i: `slots.contentSlot` doğrudan JSX'e basılır. */
export type RenderedSlots = Record<string, React.ReactNode>;

export interface SectionDefinition {
  label: string;
  category?: string;
  /** Slot tanımları — field + defaultChildren + <Slot> buradan türetilir. */
  slots?: Record<string, SlotSpec>;
  /** Slot OLMAYAN alanlar (radio/select/language …). */
  fields?: Record<string, FieldConfig>;
  fieldsGroups?: ComponentConfig['fieldsGroups'];
  defaultProps?: Record<string, any>;
  variants?: ComponentConfig['variants'];
  resizable?: boolean;
  permissions?: ComponentConfig['permissions'];
  metadata?: ComponentConfig['metadata'];
  /** (props, slots) → JSX. Kök className'e p.className otomatik eklenir. */
  render: (props: any, slots: RenderedSlots) => React.ReactNode;
}

export type ElementDefinition = SectionDefinition;

const cx = (...v: Array<string | false | null | undefined>) => v.filter(Boolean).join(' ');

const orientationFor = (layout?: SlotLayout): 'horizontal' | 'vertical' =>
  layout === 'row' || layout === 'row-wrap' ? 'horizontal' : 'vertical';

function build(def: SectionDefinition): ComponentConfig {
  const slots = def.slots ?? {};

  // 1) Slot field'ları + kullanıcı field'ları
  const slotFields: Record<string, FieldConfig> = {};
  const defaultChildren: ComponentConfig['defaultChildren'] = {};
  for (const [name, spec] of Object.entries(slots)) {
    slotFields[name] = {
      type: 'slot',
      label: spec.label ?? name,
      ...(spec.allow ? { allow: spec.allow } : {}),
      ...(spec.maxItems != null ? { maxItems: spec.maxItems } : {}),
      orientation: orientationFor(spec.layout),
      ...(spec.fieldExtra as any),
    } as FieldConfig;
    if (spec.default && spec.default.length) {
      defaultChildren[name] = spec.default;
    }
  }

  const fields: Record<string, FieldConfig> = { ...slotFields, ...(def.fields ?? {}) };

  // 2) render sarmalayıcı: hazır <Slot> map'i + kök className garantisi
  const render = (props: any): React.ReactNode => {
    const rendered: RenderedSlots = {};
    for (const [name, spec] of Object.entries(slots)) {
      rendered[name] = (
        <Slot
          key={name}
          value={props[name]}
          layout={spec.layout ?? 'none'}
          gap={spec.gap}
        />
      );
    }
    const out = def.render(props, rendered);
    // Kök className sözleşmesi: dönen elemanın className'ine p.className eklenir.
    if (React.isValidElement(out)) {
      const el = out as React.ReactElement<{ className?: string }>;
      return React.cloneElement(el, { className: cx(el.props.className, props.className) });
    }
    return out;
  };

  return {
    label: def.label,
    ...(def.category ? { category: def.category } : {}),
    fields,
    ...(def.fieldsGroups ? { fieldsGroups: def.fieldsGroups } : {}),
    ...(def.defaultProps ? { defaultProps: def.defaultProps } : {}),
    ...(Object.keys(defaultChildren).length ? { defaultChildren } : {}),
    ...(def.variants ? { variants: def.variants } : {}),
    ...(def.resizable != null ? { resizable: def.resizable } : {}),
    ...(def.permissions ? { permissions: def.permissions } : {}),
    ...(def.metadata ? { metadata: def.metadata } : {}),
    render,
  };
}

export const defineSection = (def: SectionDefinition): ComponentConfig => build(def);
export const defineElement = (def: ElementDefinition): ComponentConfig => build(def);
