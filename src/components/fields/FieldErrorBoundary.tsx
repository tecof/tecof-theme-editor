import { Component, type ReactNode, type ErrorInfo } from 'react';

/* ─── Props ─── */

interface FieldErrorBoundaryProps {
  /** The field name (for error reporting) */
  fieldName?: string;
  /** Fallback UI to show when a field crashes */
  fallback?: ReactNode;
  /** Optional error callback */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  children: ReactNode;
}

interface FieldErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/* ─── Component ─── */

/**
 * Error boundary for Puck custom fields.
 * Catches render errors in child components and shows a friendly fallback
 * instead of crashing the entire editor.
 *
 * @example
 * ```tsx
 * <FieldErrorBoundary fieldName="title">
 *   <LanguageField ... />
 * </FieldErrorBoundary>
 * ```
 */
export class FieldErrorBoundary extends Component<FieldErrorBoundaryProps, FieldErrorBoundaryState> {
  constructor(props: FieldErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): FieldErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error(
      `[TecofEditor] Field "${this.props.fieldName || 'unknown'}" crashed:`,
      error,
      errorInfo
    );
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="tecof-field-error-boundary">
          <div className="tecof-field-error-icon">⚠️</div>
          <div className="tecof-field-error-content">
            <p className="tecof-field-error-title">
              Bu alan yüklenemedi
            </p>
            <p className="tecof-field-error-detail">
              {this.state.error?.message || 'Beklenmeyen bir hata oluştu'}
            </p>
          </div>
          <button
            type="button"
            className="tecof-field-error-retry"
            onClick={this.handleRetry}
          >
            Tekrar Dene
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default FieldErrorBoundary;
