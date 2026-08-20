import React from 'react';

export interface UnderConstructionProps {
  title: string;
  description: string;
  subtitle?: string;
  logoUrl?: string | null;
  accentColor?: string;
}

/**
 * "Yapım aşamasında" sayfası — minimal, light bir tasarım.
 *
 * Tek vurgu rengi (varsayılan: Tecof mavisi #2f7cf6) üzerine kurulu:
 * ince nokta ızgaralı açık zemin, üstten süzülen hafif renk tonu, canlı
 * durum rozeti (ping animasyonlu nokta) ve tek dekoratif öğe olarak akan
 * ilerleme çizgisi. Kart/cam efekti yok — içerik doğrudan zeminde durur.
 *
 * Renk türevleri `color-mix` ile accent'ten hesaplanır, bu yüzden herhangi
 * bir marka rengiyle (accentColor prop) uyumlu kalır.
 */
export const UnderConstruction: React.FC<UnderConstructionProps> = ({
  title,
  description,
  subtitle,
  logoUrl,
  accentColor = '#2f7cf6', // Tecof mavisi (chrome paletiyle aynı)
}) => {
  return (
    <div className="tecof-uc-wrapper">
      <style dangerouslySetInnerHTML={{ __html: `
        .tecof-uc-wrapper {
          --uc-accent: ${accentColor};
          /* Metinde kullanılacak koyu ton: küçük yazıda da okunur kalsın. */
          --uc-accent-ink: color-mix(in srgb, ${accentColor} 68%, #0d2350);
          --uc-accent-tint: color-mix(in srgb, ${accentColor} 10%, transparent);
          --uc-accent-track: color-mix(in srgb, ${accentColor} 14%, #eef3fb);

          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
          padding: 3rem 1.25rem;
          color: #101828;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI',
            Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          background-color: #fafbfe;
          background-image:
            radial-gradient(640px 340px at 50% -120px, var(--uc-accent-tint), transparent 70%),
            radial-gradient(circle, rgba(16, 24, 40, 0.05) 1px, transparent 1px);
          background-size: auto, 24px 24px;
        }

        .tecof-uc-content {
          max-width: 520px;
          width: 100%;
          text-align: center;
          animation: tecof-uc-rise 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        /* ── Logo ── */
        .tecof-uc-logo-area {
          margin-bottom: 2.75rem;
          display: flex;
          justify-content: center;
        }

        .tecof-uc-logo {
          max-height: 44px;
          max-width: 180px;
          object-fit: contain;
        }

        .tecof-uc-logo-fallback {
          font-size: 1.05rem;
          font-weight: 800;
          letter-spacing: 0.24em;
          color: #101828;
        }

        .tecof-uc-logo-fallback em {
          font-style: normal;
          color: var(--uc-accent);
        }

        /* ── Metin ── */
        .tecof-uc-subtitle {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.16em;
          color: var(--uc-accent-ink);
          margin-bottom: 1rem;
        }

        .tecof-uc-title {
          font-size: clamp(1.9rem, 5vw, 2.6rem);
          font-weight: 750;
          line-height: 1.15;
          letter-spacing: -0.03em;
          color: #101828;
          margin: 0 0 1.1rem;
        }

        .tecof-uc-description {
          font-size: 1rem;
          line-height: 1.65;
          color: #667085;
          margin: 0 auto;
          max-width: 400px;
        }

        /* ── Durum rozeti ── */
        .tecof-uc-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.55rem;
          margin-top: 2.4rem;
          padding: 0.5rem 1.1rem;
          background: #ffffff;
          border: 1px solid #e2e8f4;
          border-radius: 999px;
          font-size: 0.8rem;
          font-weight: 600;
          color: #475467;
          box-shadow: 0 1px 2px rgba(16, 24, 40, 0.05);
        }

        .tecof-uc-badge-dot {
          position: relative;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--uc-accent);
          flex: none;
        }

        .tecof-uc-badge-dot::after {
          content: '';
          position: absolute;
          inset: -3px;
          border-radius: 50%;
          border: 1.5px solid var(--uc-accent);
          animation: tecof-uc-ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        /* ── Akan ilerleme çizgisi (tek dekoratif öğe) ── */
        .tecof-uc-progress {
          width: 128px;
          height: 4px;
          margin: 1.6rem auto 0;
          border-radius: 999px;
          background: var(--uc-accent-track);
          overflow: hidden;
        }

        .tecof-uc-progress::before {
          content: '';
          display: block;
          width: 42%;
          height: 100%;
          border-radius: 999px;
          background: var(--uc-accent);
          animation: tecof-uc-slide 2.4s ease-in-out infinite;
        }

        /* ── Animasyonlar ── */
        @keyframes tecof-uc-rise {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes tecof-uc-ping {
          0% { transform: scale(0.55); opacity: 0.8; }
          75%, 100% { transform: scale(1.7); opacity: 0; }
        }

        @keyframes tecof-uc-slide {
          0% { transform: translateX(-110%); }
          60%, 100% { transform: translateX(260%); }
        }

        @media (prefers-reduced-motion: reduce) {
          .tecof-uc-content { animation: none; }
          .tecof-uc-badge-dot::after,
          .tecof-uc-progress::before { animation: none; }
        }

        @media (max-width: 640px) {
          .tecof-uc-logo-area { margin-bottom: 2.1rem; }
          .tecof-uc-description { font-size: 0.95rem; }
        }
      ` }} />

      <div className="tecof-uc-content">
        {/* Logo */}
        <div className="tecof-uc-logo-area">
          {logoUrl ? (
            <img src={logoUrl} alt="Mağaza logosu" className="tecof-uc-logo" />
          ) : (
            <div className="tecof-uc-logo-fallback">
              TECOF<em>.</em>
            </div>
          )}
        </div>

        {/* İçerik */}
        {subtitle && <div className="tecof-uc-subtitle">{subtitle}</div>}
        <h1 className="tecof-uc-title">{title}</h1>
        <p className="tecof-uc-description">{description}</p>

        {/* Durum */}
        <div className="tecof-uc-badge">
          <span className="tecof-uc-badge-dot" aria-hidden="true"></span>
          <span>Yapım Aşamasında</span>
        </div>

        <div className="tecof-uc-progress" aria-hidden="true"></div>
      </div>
    </div>
  );
};

export default UnderConstruction;
