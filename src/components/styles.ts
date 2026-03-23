/**
 * Scoped styles for TecofEditor — inlined to avoid CSS module build issues.
 * These are internal styles, not exposed to consumers.
 */
export const editorStyles = {
  wrapper: {
    position: 'relative' as const,
    width: '100%',
    height: '100%',
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: '#fafafa',
  },
  loadingInner: {
    textAlign: 'center' as const,
  },
  loadingText: {
    fontSize: '14px',
    color: '#71717a',
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  error: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '200px',
    padding: '24px',
    fontSize: '14px',
    color: '#ef4444',
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  saveIndicator: {
    position: 'fixed' as const,
    bottom: '20px',
    right: '20px',
    padding: '8px 16px',
    background: '#18181b',
    color: '#ffffff',
    fontSize: '13px',
    fontWeight: 500,
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    zIndex: 9999,
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid #e4e4e7',
    borderTopColor: '#18181b',
    borderRadius: '50%',
    margin: '0 auto 12px',
    animation: 'tecof-spin 0.7s linear infinite',
  },
} as const;

/** Spinner keyframes — injected once into the document */
let keyframesInjected = false;
export const injectKeyframes = () => {
  if (keyframesInjected || typeof document === 'undefined') return;
  const style = document.createElement('style');
  style.textContent = `@keyframes tecof-spin { to { transform: rotate(360deg); } }`;
  document.head.appendChild(style);
  keyframesInjected = true;
};
