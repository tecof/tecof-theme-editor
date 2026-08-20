/**
 * revealNodeInCanvas — bir düğümü canvas iframe'inde görünür alana kaydırır.
 *
 * Katman panelinden ya da bir düğüm eklenince çağrılır: seçim store'da yapılır
 * ama canvas kendiliğinden o düğüme kaymaz; kullanıcı seçtiği bölümü ekranda
 * göremiyordu. Düğüm, senkron `tecof-node-<id>` işaret sınıfıyla bulunur
 * (async `data-tecof-id`'den önce hazırdır). Gömülü (panel iframe) ve bağımsız
 * modda aynı selector çalışır; bulunamazsa sessizce hiçbir şey yapmaz.
 */
export function revealNodeInCanvas(id: string): void {
  if (!id || typeof document === 'undefined') return;
  requestAnimationFrame(() => {
    const iframe = document.querySelector<HTMLIFrameElement>('.tecof-canvas-viewport iframe');
    const el = iframe?.contentDocument?.querySelector(`[class~="tecof-node-${id}"]`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}
