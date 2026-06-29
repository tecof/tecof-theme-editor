import { Component, type ReactNode, type ErrorInfo } from 'react';

interface NodeErrorBoundaryProps {
  /** Node type, shown in the fallback + logged for debugging. */
  type: string;
  /** Node id, so we can reset the boundary if the underlying node changes. */
  nodeId: string;
  children: ReactNode;
}

interface NodeErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  /** Tracks which node the current error belongs to (for prop-change resets). */
  forId: string | null;
}

/**
 * Isolates a single canvas node's render. A throwing user component shows a
 * compact `.tecof-node-error` fallback ("‹type› — render hatası") instead of
 * crashing the whole canvas/editor.
 *
 * Resets automatically when `nodeId` changes so re-selecting/editing a fixed
 * component recovers without remounting the entire tree.
 */
export class NodeErrorBoundary extends Component<NodeErrorBoundaryProps, NodeErrorBoundaryState> {
  constructor(props: NodeErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, forId: null };
  }

  static getDerivedStateFromError(error: Error): Partial<NodeErrorBoundaryState> {
    return { hasError: true, error };
  }

  static getDerivedStateFromProps(
    props: NodeErrorBoundaryProps,
    state: NodeErrorBoundaryState
  ): Partial<NodeErrorBoundaryState> | null {
    // A different node now occupies this boundary -> clear a stale error.
    if (state.hasError && state.forId !== null && state.forId !== props.nodeId) {
      return { hasError: false, error: null, forId: null };
    }
    if (state.hasError && state.forId === null) {
      return { forId: props.nodeId };
    }
    return null;
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error(
      `[TecofStudio] Component "${this.props.type}" (${this.props.nodeId}) crashed while rendering:`,
      error,
      errorInfo
    );
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="tecof-node-error" role="alert">
          <span className="tecof-node-error-title">{this.props.type} — render hatası</span>
          {this.state.error?.message && (
            <span className="tecof-node-error-detail">{this.state.error.message}</span>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default NodeErrorBoundary;
