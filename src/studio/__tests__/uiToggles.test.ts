// @vitest-environment node
import { describe, it, expect, beforeEach } from 'vitest';
import { useUiStore } from '../uiStore';

/** resize ↔ spacing karşılıklı dışlama + varsayılanlar (2026-08 sözleşmesi). */
describe('uiStore — spacing/resize toggle sözleşmesi', () => {
  beforeEach(() => {
    useUiStore.setState({ resizeEnabled: false, spacingEnabled: false, helpModalOpen: false });
  });

  it('spacing VARSAYILAN kapalı (kullanıcı kararı)', () => {
    expect(useUiStore.getState().spacingEnabled).toBe(false);
  });

  it('spacing açılınca resize kapanır (ve tersi) — ikisi aynı kenarları paylaşır', () => {
    useUiStore.getState().toggleResize();
    expect(useUiStore.getState().resizeEnabled).toBe(true);
    useUiStore.getState().toggleSpacing();
    expect(useUiStore.getState().spacingEnabled).toBe(true);
    expect(useUiStore.getState().resizeEnabled).toBe(false);
    useUiStore.getState().toggleResize();
    expect(useUiStore.getState().resizeEnabled).toBe(true);
    expect(useUiStore.getState().spacingEnabled).toBe(false);
  });

  it('helpModalOpen set/clear', () => {
    useUiStore.getState().setHelpModalOpen(true);
    expect(useUiStore.getState().helpModalOpen).toBe(true);
    useUiStore.getState().setHelpModalOpen(false);
    expect(useUiStore.getState().helpModalOpen).toBe(false);
  });
});
