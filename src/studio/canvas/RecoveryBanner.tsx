import { Component, type ReactNode } from 'react';
import { History, X } from 'lucide-react';

interface RecoveryBannerProps {
  /** Called when the user accepts restoring the locally-saved draft. */
  onRestore: () => void;
  /** Called when the user dismisses / discards the local draft. */
  onDismiss: () => void;
}

interface RecoveryBannerState {
  /** Set if the banner's own render throws, so a glitch here can't blank the editor. */
  failed: boolean;
}

/**
 * Class-based recovery toast shown when a newer locally-persisted draft is found
 * that differs from the server copy (e.g. the tab crashed before autosave flushed).
 * Class component per the Core UX spec; also self-contains render errors.
 */
export class RecoveryBanner extends Component<RecoveryBannerProps, RecoveryBannerState> {
  constructor(props: RecoveryBannerProps) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError(): RecoveryBannerState {
    return { failed: true };
  }

  render(): ReactNode {
    if (this.state.failed) return null;

    return (
      <div className="tecof-recovery-banner" role="status">
        <span className="tecof-recovery-banner-icon">
          <History size={16} />
        </span>
        <div className="tecof-recovery-banner-body">
          <p className="tecof-recovery-banner-title">Kaydedilmemiş değişiklikler bulundu</p>
          <p className="tecof-recovery-banner-sub">
            Bu sayfanın bu tarayıcıda saklanmış daha yeni bir taslağı var. Geri yüklemek ister
            misiniz?
          </p>
        </div>
        <div className="tecof-recovery-banner-actions">
          <button
            type="button"
            className="tecof-recovery-banner-btn is-primary"
            onClick={this.props.onRestore}
          >
            Geri Yükle
          </button>
          <button
            type="button"
            className="tecof-recovery-banner-btn"
            onClick={this.props.onDismiss}
          >
            Yoksay
          </button>
        </div>
        <button
          type="button"
          className="tecof-recovery-banner-close"
          onClick={this.props.onDismiss}
          aria-label="Kapat"
        >
          <X size={14} />
        </button>
      </div>
    );
  }
}

export default RecoveryBanner;
