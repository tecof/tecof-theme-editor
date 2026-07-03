'use strict';

var jsxRuntime = require('react/jsx-runtime');

// src/components/UnderConstruction.tsx
var UnderConstruction = ({
  title,
  description,
  subtitle,
  logoUrl,
  accentColor = "#74b500"
  // Tecof primary (ana renk)
}) => {
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-uc-wrapper", children: [
    /* @__PURE__ */ jsxRuntime.jsx("style", { dangerouslySetInnerHTML: { __html: `
        .tecof-uc-wrapper {
          --uc-accent: ${accentColor};
          /* Metinde kullan\u0131lacak koyu ton: k\xFC\xE7\xFCk yaz\u0131da da okunur kals\u0131n. */
          --uc-accent-ink: color-mix(in srgb, ${accentColor} 68%, #223005);
          --uc-accent-tint: color-mix(in srgb, ${accentColor} 10%, transparent);
          --uc-accent-track: color-mix(in srgb, ${accentColor} 14%, #f1f2ec);

          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
          padding: 3rem 1.25rem;
          color: #101828;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI',
            Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          background-color: #fbfcf9;
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

        /* \u2500\u2500 Logo \u2500\u2500 */
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

        /* \u2500\u2500 Metin \u2500\u2500 */
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

        /* \u2500\u2500 Durum rozeti \u2500\u2500 */
        .tecof-uc-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.55rem;
          margin-top: 2.4rem;
          padding: 0.5rem 1.1rem;
          background: #ffffff;
          border: 1px solid #e7eae0;
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

        /* \u2500\u2500 Akan ilerleme \xE7izgisi (tek dekoratif \xF6\u011Fe) \u2500\u2500 */
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

        /* \u2500\u2500 Animasyonlar \u2500\u2500 */
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
      ` } }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-uc-content", children: [
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-uc-logo-area", children: logoUrl ? /* @__PURE__ */ jsxRuntime.jsx("img", { src: logoUrl, alt: "Ma\u011Faza logosu", className: "tecof-uc-logo" }) : /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-uc-logo-fallback", children: [
        "TECOF",
        /* @__PURE__ */ jsxRuntime.jsx("em", { children: "." })
      ] }) }),
      subtitle && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-uc-subtitle", children: subtitle }),
      /* @__PURE__ */ jsxRuntime.jsx("h1", { className: "tecof-uc-title", children: title }),
      /* @__PURE__ */ jsxRuntime.jsx("p", { className: "tecof-uc-description", children: description }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "tecof-uc-badge", children: [
        /* @__PURE__ */ jsxRuntime.jsx("span", { className: "tecof-uc-badge-dot", "aria-hidden": "true" }),
        /* @__PURE__ */ jsxRuntime.jsx("span", { children: "Yap\u0131m A\u015Famas\u0131nda" })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "tecof-uc-progress", "aria-hidden": "true" })
    ] })
  ] });
};
var UnderConstruction_default = UnderConstruction;

exports.UnderConstruction = UnderConstruction;
exports.UnderConstruction_default = UnderConstruction_default;
//# sourceMappingURL=chunk-X52JFTUZ.js.map
//# sourceMappingURL=chunk-X52JFTUZ.js.map