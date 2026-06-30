import { Component, type ReactNode, type ErrorInfo } from 'react';

/* ─── Props ─── */

interface NodeErrorBoundaryProps {
  /** The component label (for the fallback card) */
  label?: string;
  /** The node type (for error reporting) */
  type?: string;
  /**
   * When this value changes, the boundary resets its error state.
   * Pass the node id and/or a props hash so the component can recover
   * once the user edits the offending prop.
   */
  resetKey?: unknown;
  children: ReactNode;
}

interface NodeErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/* ─── Component ─── */

/**
 * Error boundary for a single canvas node's rendered host component.
 * Catches render errors thrown by `componentConfig.render(...)` and shows a
 * compact fallback card instead of crashing the entire canvas/iframe.
 *
 * Only wraps the host component's output — the editor chrome (drop lines,
 * wrapper div, drag handles) stays outside so selection/drag keep working.
 *
 * @example
 * ```tsx
 * <NodeErrorBoundary label={label} type={node.type} resetKey={resetKey}>
 *   {componentConfig.render(componentProps)}
 * </NodeErrorBoundary>
 * ```
 */
export class NodeErrorBoundary extends Component<NodeErrorBoundaryProps, NodeErrorBoundaryState> {
  constructor(props: NodeErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): NodeErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error(
      `[TecofEditor] Component "${this.props.type || 'unknown'}" render crashed:`,
      error,
      errorInfo
    );
  }

  componentDidUpdate(prevProps: NodeErrorBoundaryProps): void {
    // Recover once the offending prop is edited: a changed resetKey clears the
    // error so the component re-renders instead of staying stuck on the card.
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false, error: null });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="tecof-node-error">
          <div className="tecof-node-error-icon">⚠️</div>
          <div className="tecof-node-error-content">
            <p className="tecof-node-error-title">
              Bileşen render hatası: {this.props.label || this.props.type || 'Bilinmeyen bileşen'}
            </p>
            <p className="tecof-node-error-detail">
              {this.state.error?.message || 'Beklenmeyen bir hata oluştu'}
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default NodeErrorBoundary;
