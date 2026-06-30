import { jsxs, jsx } from 'react/jsx-runtime';

// src/components/UnderConstruction.tsx
var UnderConstruction = ({
  title,
  description,
  subtitle,
  logoUrl,
  accentColor = "#2563eb"
  // Default elegant blue
}) => {
  return /* @__PURE__ */ jsxs("div", { className: "tecof-uc-wrapper", children: [
    /* @__PURE__ */ jsx("style", { dangerouslySetInnerHTML: { __html: `
        .tecof-uc-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at top right, rgba(37, 99, 235, 0.08) 0%, transparent 40%),
                      radial-gradient(circle at bottom left, rgba(37, 99, 235, 0.05) 0%, transparent 50%),
                      #090d16;
          color: #f8fafc;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          padding: 2rem 1rem;
          box-sizing: border-box;
          position: relative;
          overflow: hidden;
        }

        /* Ambient glowing circles */
        .tecof-uc-glow-1 {
          position: absolute;
          top: 20%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 500px;
          height: 500px;
          background: ${accentColor};
          filter: blur(150px);
          opacity: 0.12;
          pointer-events: none;
          z-index: 1;
          border-radius: 50%;
          animation: tecof-uc-pulse 8s infinite alternate ease-in-out;
        }

        .tecof-uc-container {
          position: relative;
          z-index: 2;
          max-width: 540px;
          width: 100%;
          background: rgba(17, 24, 39, 0.55);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 24px;
          padding: 3.5rem 2.5rem;
          text-align: center;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4),
                      inset 0 1px 0 rgba(255, 255, 255, 0.1);
          animation: tecof-uc-fade-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .tecof-uc-logo-area {
          margin-bottom: 2.5rem;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .tecof-uc-logo {
          max-height: 56px;
          max-width: 200px;
          object-fit: contain;
          filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.2));
        }

        .tecof-uc-logo-fallback {
          font-size: 1.5rem;
          font-weight: 700;
          letter-spacing: -0.025em;
          background: linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.7) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .tecof-uc-icon-wrapper {
          width: 80px;
          height: 80px;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 2.2rem auto;
          color: ${accentColor};
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
          position: relative;
        }

        .tecof-uc-icon-glow {
          position: absolute;
          inset: -2px;
          border-radius: 22px;
          background: linear-gradient(135deg, ${accentColor}, transparent);
          opacity: 0.3;
          z-index: -1;
          filter: blur(4px);
        }

        .tecof-uc-icon-wrapper svg {
          width: 36px;
          height: 36px;
          stroke-width: 1.5;
          animation: tecof-uc-float 4s ease-in-out infinite;
        }

        .tecof-uc-subtitle {
          font-size: 0.875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: ${accentColor};
          margin-bottom: 0.75rem;
        }

        .tecof-uc-title {
          font-size: 2.25rem;
          font-weight: 800;
          line-height: 1.2;
          letter-spacing: -0.025em;
          color: #ffffff;
          margin-top: 0;
          margin-bottom: 1.25rem;
          background: linear-gradient(to bottom, #ffffff 0%, #cbd5e1 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .tecof-uc-description {
          font-size: 1.05rem;
          line-height: 1.6;
          color: #94a3b8;
          margin: 0 auto 2.5rem auto;
          max-width: 420px;
        }

        .tecof-uc-divider {
          height: 1px;
          background: radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 100%);
          margin-bottom: 2rem;
        }

        .tecof-uc-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 99px;
          padding: 0.5rem 1.25rem;
          font-size: 0.825rem;
          font-weight: 500;
          color: #94a3b8;
          text-decoration: none;
          transition: all 0.2s ease-in-out;
        }

        .tecof-uc-badge:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.15);
          color: #f8fafc;
          transform: translateY(-1px);
        }

        .tecof-uc-badge-dot {
          width: 6px;
          height: 6px;
          background-color: ${accentColor};
          border-radius: 50%;
          box-shadow: 0 0 10px ${accentColor};
          animation: tecof-uc-blink 1.5s infinite alternate;
        }

        /* Animations */
        @keyframes tecof-uc-pulse {
          0% { opacity: 0.08; transform: translate(-50%, -50%) scale(0.95); }
          100% { opacity: 0.15; transform: translate(-50%, -50%) scale(1.05); }
        }

        @keyframes tecof-uc-fade-in {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes tecof-uc-float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-5px) rotate(3deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }

        @keyframes tecof-uc-blink {
          0% { opacity: 0.3; }
          100% { opacity: 1; }
        }

        @media (max-width: 640px) {
          .tecof-uc-container {
            padding: 2.5rem 1.5rem;
            border-radius: 20px;
          }
          .tecof-uc-title {
            font-size: 1.75rem;
          }
          .tecof-uc-description {
            font-size: 0.95rem;
            margin-bottom: 2rem;
          }
        }
      ` } }),
    /* @__PURE__ */ jsx("div", { className: "tecof-uc-glow-1" }),
    /* @__PURE__ */ jsxs("div", { className: "tecof-uc-container", children: [
      logoUrl ? /* @__PURE__ */ jsx("div", { className: "tecof-uc-logo-area", children: /* @__PURE__ */ jsx("img", { src: logoUrl, alt: "Store Logo", className: "tecof-uc-logo" }) }) : /* @__PURE__ */ jsx("div", { className: "tecof-uc-logo-area", children: /* @__PURE__ */ jsx("div", { className: "tecof-uc-logo-fallback", children: "TECOF" }) }),
      /* @__PURE__ */ jsxs("div", { className: "tecof-uc-icon-wrapper", children: [
        /* @__PURE__ */ jsx("div", { className: "tecof-uc-icon-glow" }),
        /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", xmlns: "http://www.w3.org/2000/svg", children: /* @__PURE__ */ jsx("path", { d: "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z", strokeLinecap: "round", strokeLinejoin: "round" }) })
      ] }),
      subtitle && /* @__PURE__ */ jsx("div", { className: "tecof-uc-subtitle", children: subtitle }),
      /* @__PURE__ */ jsx("h1", { className: "tecof-uc-title", children: title }),
      /* @__PURE__ */ jsx("p", { className: "tecof-uc-description", children: description }),
      /* @__PURE__ */ jsx("div", { className: "tecof-uc-divider" }),
      /* @__PURE__ */ jsxs("div", { className: "tecof-uc-badge", children: [
        /* @__PURE__ */ jsx("span", { className: "tecof-uc-badge-dot" }),
        /* @__PURE__ */ jsx("span", { children: "Yap\u0131m A\u015Famas\u0131nda" })
      ] })
    ] })
  ] });
};
var UnderConstruction_default = UnderConstruction;

export { UnderConstruction, UnderConstruction_default };
//# sourceMappingURL=chunk-XMQYB77V.mjs.map
//# sourceMappingURL=chunk-XMQYB77V.mjs.map