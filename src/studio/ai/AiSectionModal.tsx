import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { useStudio } from '../context';
import { useUiStore } from '../uiStore';
import { useEditorStore } from '../../engine/store';
import { generateId } from '../../engine/ids';
import { buildSectionSystemPrompt, buildSectionUserPrompt } from './prompt';
import { parseAiSection, AiParseError } from './parse';

/** Prompt idea chips shown under the input for a cold start. */
const SUGGESTIONS = [
  '3 kolonlu fiyatlandırma bölümü',
  'Başlık, açıklama ve buton içeren hero',
  'Müşteri yorumları bölümü',
];

/**
 * "AI ile bölüm üret" — prompt in, section out. The library builds the system
 * prompt from the component catalog and validates the response
 * (`prompt.ts`/`parse.ts`); the HOST's `config.ai.complete` performs the actual
 * LLM call. The validated folded node inserts through the standard
 * `insertNode` path (fresh ids, one undo step) and gets selected.
 *
 * Renders nothing unless the host wired `config.ai` AND the modal is open.
 */
export const AiSectionModal = () => {
  const { config } = useStudio();
  const open = useUiStore((s) => s.aiModalOpen);
  const setOpen = useUiStore((s) => s.setAiModalOpen);
  const insertNode = useEditorStore((s) => s.insertNode);
  const selectNode = useEditorStore((s) => s.selectNode);

  const [prompt, setPrompt] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // The generate call can outlive the modal (close mid-flight) — drop the result.
  const cancelledRef = useRef(false);

  const close = useCallback(() => {
    cancelledRef.current = true;
    setOpen(false);
  }, [setOpen]);

  // Fresh state per open.
  useEffect(() => {
    if (open) {
      cancelledRef.current = false;
      setPrompt('');
      setError(null);
      setBusy(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        close();
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [open, close]);

  const ai = config.ai;
  if (!open || !ai) return null;

  const generate = async () => {
    const request = prompt.trim();
    if (!request || busy) return;
    setBusy(true);
    setError(null);
    try {
      const text = await ai.complete({
        system: buildSectionSystemPrompt(config),
        prompt: buildSectionUserPrompt(request),
      });
      if (cancelledRef.current) return;
      const node = parseAiSection(text, config);
      // Root id upfront so we can select what we just inserted (children get
      // fresh ids inside insertNode via extractDefaultSlots).
      node.props.id = generateId();
      insertNode(node); // appends to root content — one undo step
      selectNode(node.props.id);
      setOpen(false);
    } catch (e) {
      if (cancelledRef.current) return;
      setError(
        e instanceof AiParseError
          ? e.message
          : 'Üretim başarısız oldu — bağlantıyı kontrol edip tekrar deneyin.',
      );
    } finally {
      if (!cancelledRef.current) setBusy(false);
    }
  };

  return (
    <div className="tecof-modal-overlay" onClick={close}>
      <div
        className="tecof-ai-modal"
        role="dialog"
        aria-modal="true"
        aria-label="AI ile bölüm üret"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="tecof-ai-modal-head">
          <span className="tecof-ai-modal-title">
            <Sparkles size={15} aria-hidden="true" />
            AI ile bölüm üret
          </span>
          <button type="button" className="tecof-modal-close" onClick={close} title="Kapat">
            <X size={16} />
          </button>
        </div>

        <textarea
          className="tecof-ai-modal-input"
          placeholder="Ne eklemek istiyorsun? Örn: 3 kolonlu fiyatlandırma bölümü…"
          value={prompt}
          autoFocus
          rows={3}
          disabled={busy}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              generate();
            }
          }}
        />

        <div className="tecof-ai-modal-suggestions">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              className="tecof-ai-modal-chip"
              disabled={busy}
              onClick={() => setPrompt(s)}
            >
              {s}
            </button>
          ))}
        </div>

        {error && (
          <div className="tecof-ai-modal-error" role="alert">
            {error}
          </div>
        )}

        <div className="tecof-ai-modal-actions">
          <span className="tecof-ai-modal-hint">⌘⏎ ile üret · sonuç geri alınabilir</span>
          <button
            type="button"
            className="tecof-btn-primary"
            disabled={!prompt.trim() || busy}
            onClick={generate}
          >
            <Sparkles size={14} />
            {busy ? 'Üretiliyor…' : 'Üret'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiSectionModal;
