import React, { useState, useMemo } from 'react';
import '../src/styles.css';

/* ─── Provider + Fields ─── */
import { TecofProvider } from '../src/components/TecofProvider';
import { LanguageField } from '../src/components/fields/LanguageField';
import { CodeEditorField } from '../src/components/fields/CodeEditorField';
import { ColorField } from '../src/components/fields/ColorField';
import { LinkField } from '../src/components/fields/LinkField';
import { EditorField } from '../src/components/fields/EditorField';
import { TecofStudio } from '../src/studio/TecofStudio';
import { getSafelist } from '../src/studio/style/tokens';

/* All classes the Style editor can emit — rendered hidden so Tailwind's browser
   JIT generates them; Frame then copies the compiled CSS into the canvas iframe. */
const SAFELIST = getSafelist().join(' ');

/* ────────────────────────────────────────────── */
/*  Mock API Server (MSW-free, fetch intercept)  */
/* ────────────────────────────────────────────── */

const MOCK_API_URL = 'https://playground.tecof.local';
const MOCK_SECRET = 'playground-test-key';

// Mock Config and Document for Studio Testing
const mockConfig = {
  components: {
    Hero: {
      label: 'Hero Section',
      fields: {
        title: { type: 'text' },
      },
      render: ({ title, puck }: any) => (
        <div style={{
          padding: '80px 20px',
          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          color: '#ffffff',
          textAlign: 'center',
          borderRadius: '12px',
          fontFamily: 'sans-serif',
          margin: '16px 0'
        }}>
          <h1 style={{ margin: '0 0 16px', fontSize: '32px' }}>{title || 'Hero Başlığı'}</h1>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
            {puck.renderDropZone({ zone: 'actions', orientation: 'horizontal' })}
          </div>
        </div>
      ),
    },
    Button: {
      label: 'Button Component',
      fields: {
        text: { type: 'text' },
      },
      render: ({ text }: any) => (
        <button style={{
          padding: '10px 20px',
          background: '#ffffff',
          color: '#1d4ed8',
          border: 'none',
          borderRadius: '8px',
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: '0 2px 4px rgba(0,0,0,0.06)'
        }}>
          {text || 'Tıkla'}
        </button>
      ),
    },
    Box: {
      label: 'Kutu (Stil Testi)',
      fields: {
        text: { type: 'text' },
      },
      defaultProps: { text: 'Beni sağdaki "Stil" sekmesinden tasarla' },
      render: ({ text, className }: any) => (
        <div className={className || ''}>
          {text || 'Stil sekmesinden tasarla'}
        </div>
      ),
    },
  },
  // Pre-built section templates — inserted as a whole subtree (fresh ids) from
  // the "Bölüm Ekle" → "Şablonlar" tab.
  templates: [
    {
      id: 'hero-cta',
      label: 'Hero + İki Buton',
      payload: {
        node: { type: 'Hero', props: { id: 'tpl-hero', title: 'Şablon Hero Başlığı' } },
        zones: {
          'tpl-hero:actions': [
            { type: 'Button', props: { id: 'tpl-btn-1', text: 'Başla' } },
            { type: 'Button', props: { id: 'tpl-btn-2', text: 'Daha Fazla' } },
          ],
        },
      },
    },
    {
      id: 'styled-box',
      label: 'Stilli Kutu',
      payload: {
        node: {
          type: 'Box',
          props: {
            id: 'tpl-box',
            text: 'Şablondan gelen stilli kutu',
            _tecofStyles: { base: { p: '8', bg: 'primary-100', radius: 'xl', text: 'primary-900', align: 'center', fontSize: 'xl', fontWeight: 'bold' } },
          },
        },
      },
    },
  ],
};

const mockPageData = {
  content: [
    { type: 'Hero', props: { id: 'hero-1', title: 'Tecof Studio Canlı Önizleme!' } },
    {
      type: 'Box',
      props: {
        id: 'box-1',
        text: 'Beni sağdaki "Stil" sekmesinden tasarla',
        _tecofStyles: { base: { p: '8', bg: 'primary-100', radius: 'xl', text: 'primary-900', align: 'center', fontSize: '2xl', fontWeight: 'bold' } },
      },
    },
  ],
  root: { props: { title: 'Ana Sayfa' } },
  zones: {
    'hero-1:actions': [
      { type: 'Button', props: { id: 'btn-1', text: 'Hemen Keşfet' } },
      { type: 'Button', props: { id: 'btn-2', text: 'Daha Fazla' } }
    ]
  }
};

let savedPageData = { ...mockPageData };

// Intercept fetch calls to our mock API
const originalFetch = window.fetch;
window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === 'string' ? input : input.toString();

  if (!url.startsWith(MOCK_API_URL)) {
    return originalFetch(input, init);
  }

  // Mock: editor page data load & save
  if (url.includes('/api/store/editor/')) {
    if (init?.method === 'PUT') {
      const body = JSON.parse(init.body as string);
      savedPageData = body;
      return new Response(JSON.stringify({
        success: true,
        data: { _id: 'test-page', slug: 'home', draftData: savedPageData },
      }), { headers: { 'Content-Type': 'application/json' } });
    }
    return new Response(JSON.stringify({
      success: true,
      data: { _id: 'test-page', slug: 'home', draftData: savedPageData },
    }), { headers: { 'Content-Type': 'application/json' } });
  }

  // Mock: merchant-info
  if (url.includes('/api/store/merchant-info')) {
    return new Response(JSON.stringify({
      success: true,
      data: { languages: ['tr', 'en', 'de'], defaultLanguage: 'tr' },
    }), { headers: { 'Content-Type': 'application/json' } });
  }

  // Mock: pages
  if (url.includes('/api/store/pages')) {
    return new Response(JSON.stringify({
      success: true,
      data: [
        { _id: '1', slug: 'hakkimizda', title: 'Hakkımızda', status: 'published' },
        { _id: '2', slug: 'hizmetler', title: 'Hizmetler', status: 'published' },
        { _id: '3', slug: 'iletisim', title: 'İletişim', status: 'published' },
        { _id: '4', slug: 'blog', title: 'Blog', status: 'draft' },
        { _id: '5', slug: 'kariyer', title: 'Kariyer', status: 'draft' },
      ],
    }), { headers: { 'Content-Type': 'application/json' } });
  }

  // Mock: uploads
  if (url.includes('/api/store/uploads')) {
    return new Response(JSON.stringify({
      success: true,
      data: [],
    }), { headers: { 'Content-Type': 'application/json' } });
  }

  // Mock: translate
  if (url.includes('/api/store/translate')) {
    const body = init?.body ? JSON.parse(init.body as string) : {};
    const result = (body.locales || []).map((code: string) => ({
      code,
      value: `[${code.toUpperCase()}] ${body.text}`,
    }));
    return new Response(JSON.stringify({
      success: true,
      data: result,
    }), { headers: { 'Content-Type': 'application/json' } });
  }

  // Fallback
  return new Response(JSON.stringify({ success: false, message: 'Not found' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' },
  });
};

/* ────────────────────────────────────────────── */
/*  UI Components                                 */
/* ────────────────────────────────────────────── */

const FieldCard = ({ title, status, children }: {
  title: string;
  status: 'ok' | 'error' | 'pending';
  children: React.ReactNode;
}) => {
  const statusColors = {
    ok: { bg: '#dcfce7', text: '#16a34a', label: '✓ Çalışıyor' },
    error: { bg: '#fef2f2', text: '#dc2626', label: '✗ Hata' },
    pending: { bg: '#fef9c3', text: '#ca8a04', label: '◌ Bekliyor' },
  };
  const s = statusColors[status];

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e4e4e7',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '14px 20px',
        borderBottom: '1px solid #f4f4f5',
        background: '#fafafa',
      }}>
        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#18181b' }}>{title}</h3>
        <span style={{
          fontSize: '11px',
          fontWeight: 600,
          padding: '3px 10px',
          borderRadius: '20px',
          background: s.bg,
          color: s.text,
        }}>{s.label}</span>
      </div>
      <div style={{ padding: '20px' }}>
        {children}
      </div>
    </div>
  );
};

const ValuePreview = ({ value, label }: { value: any; label?: string }) => (
  <pre style={{
    marginTop: '12px',
    padding: '10px',
    background: '#f4f4f5',
    borderRadius: '8px',
    fontSize: '11px',
    color: '#52525b',
    overflow: 'auto',
    maxHeight: '100px',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
  }}>
    {label && <strong>{label}: </strong>}
    {typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
  </pre>
);

/* ────────────────────────────────────────────── */
/*  App                                           */
/* ────────────────────────────────────────────── */

const App = () => {
  /* ── State ── */
  const [view, setView] = useState<'fields' | 'studio'>('fields');

  const [langValue, setLangValue] = useState([
    { code: 'tr', value: 'Merhaba Dünya' },
    { code: 'en', value: 'Hello World' },
    { code: 'de', value: 'Hallo Welt' },
  ]);
  const [langChanged, setLangChanged] = useState(false);

  const [codeValue, setCodeValue] = useState('console.log("Hello Tecof!");\n\n// Kodu değiştirin → onChange tetiklenecek');
  const [codeChanged, setCodeChanged] = useState(false);

  const [colorValue, setColorValue] = useState('#3b82f6');
  const [colorChanged, setColorChanged] = useState(false);

  const [linkValue, setLinkValue] = useState<any[]>([
    { code: 'tr', value: { url: '/iletisim', label: 'İletişim', target: '_self', type: 'page' } },
    { code: 'en', value: { url: '/contact', label: 'Contact', target: '_self', type: 'page' } },
  ]);
  const [linkChanged, setLinkChanged] = useState(false);

  const [editorValue, setEditorValue] = useState([
    { code: 'tr', value: '<p>Bu bir <strong>zengin metin</strong> editörüdür.</p>' },
    { code: 'en', value: '<p>This is a <strong>rich text</strong> editor.</p>' },
  ]);
  const [editorChanged, setEditorChanged] = useState(false);

  const fields = [langChanged, codeChanged, colorChanged, linkChanged, editorChanged];
  const okCount = fields.filter(Boolean).length;

  return (
    <TecofProvider apiUrl={MOCK_API_URL} secretKey={MOCK_SECRET}>
      {/* Hidden: forces Tailwind's browser JIT to emit every Style-editor class
          so Frame can copy the compiled CSS into the canvas iframe. */}
      <div aria-hidden className={SAFELIST} style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden', opacity: 0, pointerEvents: 'none' }} />
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        fontFamily: "'Inter', system-ui, sans-serif",
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          background: '#18181b',
          color: '#fff',
          padding: '16px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxSizing: 'border-box'
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 700, letterSpacing: '-0.02em' }}>
              🧪 Tecof Theme Editor — Playground
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#a1a1aa' }}>
              {view === 'fields'
                ? 'Tüm field bileşenlerini mock veriyle test edin. Değer değişimleri anlık izlenir.'
                : 'Yeni görsel canvas editörünü test edin.'}
            </p>
          </div>

          {/* View Switcher */}
          <div style={{ display: 'flex', gap: '8px', background: '#27272a', padding: '4px', borderRadius: '8px' }}>
            <button
              onClick={() => setView('fields')}
              style={{
                background: view === 'fields' ? '#3f3f46' : 'transparent',
                color: '#fff',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              Field Listesi
            </button>
            <button
              onClick={() => setView('studio')}
              style={{
                background: view === 'studio' ? '#3f3f46' : 'transparent',
                color: '#fff',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              Tecof Studio
            </button>
          </div>

          {view === 'fields' ? (
            <div style={{
              background: okCount === fields.length ? '#22c55e' : '#f59e0b',
              color: '#fff',
              padding: '6px 16px',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: 600,
            }}>
              {okCount}/{fields.length} Alan Aktif
            </div>
          ) : (
            <div style={{ fontSize: '13px', color: '#a1a1aa' }}>
              Mod: Tasarım Modu
            </div>
          )}
        </div>

        {view === 'fields' ? (
          /* Content */
          <div style={{
            maxWidth: '520px',
            margin: '32px auto',
            padding: '0 20px 60px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            width: '100%',
            boxSizing: 'border-box'
          }}>

            {/* LanguageField */}
            <FieldCard title="LanguageField" status={langChanged ? 'ok' : 'pending'}>
              <p style={{ fontSize: '12px', color: '#71717a', marginBottom: '12px' }}>
                Çok dilli metin. Sekmeleri değiştirip yazın, çeviri butonunu deneyin.
              </p>
              <LanguageField
                field={{}}
                name="test-lang"
                id="test-lang"
                value={langValue}
                onChange={(v: any) => { setLangValue(v); setLangChanged(true); }}
              />
              <ValuePreview value={langValue} />
            </FieldCard>

            {/* CodeEditorField */}
            <FieldCard title="CodeEditorField (Monaco)" status={codeChanged ? 'ok' : 'pending'}>
              <p style={{ fontSize: '12px', color: '#71717a', marginBottom: '12px' }}>
                Monaco kod editörü. Yazarak onChange tetiklendiğini doğrulayın.
              </p>
              <CodeEditorField
                field={{}}
                name="test-code"
                id="test-code"
                value={codeValue}
                onChange={(v: string) => { setCodeValue(v); setCodeChanged(true); }}
                height="200px"
              />
              <ValuePreview value={codeChanged ? '✓ onChange tetiklendi' : '◌ Henüz tetiklenmedi'} label="Durum" />
            </FieldCard>

            {/* ColorField */}
            <FieldCard title="ColorField" status={colorChanged ? 'ok' : 'pending'}>
              <p style={{ fontSize: '12px', color: '#71717a', marginBottom: '12px' }}>
                Renk seçici. Rengi değiştirin.
              </p>
              <ColorField
                field={{}}
                name="test-color"
                id="test-color"
                value={colorValue}
                onChange={(v: string) => { setColorValue(v); setColorChanged(true); }}
              />
              <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  background: colorValue, border: '2px solid #e4e4e7',
                }} />
                <code style={{ fontSize: '13px', color: '#52525b' }}>{colorValue}</code>
              </div>
            </FieldCard>

            {/* LinkField */}
            <FieldCard title="LinkField" status={linkChanged ? 'ok' : 'pending'}>
              <p style={{ fontSize: '12px', color: '#71717a', marginBottom: '12px' }}>
                Çok dilli bağlantı alanı. Sayfa seçici veya manuel link ekleyin.
              </p>
              <LinkField
                field={{}}
                name="test-link"
                id="test-link"
                value={linkValue}
                onChange={(v: any) => { setLinkValue(v); setLinkChanged(true); }}
                showTarget={true}
              />
              <ValuePreview value={linkValue} />
            </FieldCard>

            {/* EditorField */}
            <FieldCard title="EditorField (TipTap)" status={editorChanged ? 'ok' : 'pending'}>
              <p style={{ fontSize: '12px', color: '#71717a', marginBottom: '12px' }}>
                Zengin metin editörü. İçerik düzenleyin.
              </p>
              <EditorField
                field={{}}
                name="test-editor"
                id="test-editor"
                value={editorValue}
                onChange={(v: any) => { setEditorValue(v); setEditorChanged(true); }}
              />
              <ValuePreview value={editorValue} />
            </FieldCard>

            {/* UploadField Info */}
            <FieldCard title="UploadField" status="pending">
              <p style={{ fontSize: '12px', color: '#71717a' }}>
                ⚠️ UploadField gerçek dosya yükleme gerektirir. Mock ortamda dosya transfer edilemez.
                <br />Tam test için <strong>tecof-theme-core</strong> editöründen deneyin.
              </p>
            </FieldCard>

            {/* Full State JSON */}
            <div style={{
              background: '#18181b',
              borderRadius: '16px',
              padding: '20px',
              color: '#e4e4e7',
            }}>
              <h3 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 600, color: '#fff' }}>
                📦 Tüm State Özeti
              </h3>
              <pre style={{
                fontSize: '11px',
                lineHeight: '1.6',
                overflow: 'auto',
                maxHeight: '300px',
                color: '#a1a1aa',
              }}>
                {JSON.stringify({
                  languageField: langValue,
                  codeEditorField: codeValue.substring(0, 60) + '...',
                  colorField: colorValue,
                  linkField: linkValue,
                  editorField: editorValue,
                }, null, 2)}
              </pre>
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, height: 'calc(100vh - 56px)', position: 'relative' }}>
            <TecofStudio
              pageId="test-page-id"
              config={mockConfig}
              onSave={(data) => console.log('Studio Page Saved:', data)}
              onChange={(data) => console.log('Studio Page Changed:', data)}
            />
          </div>
        )}
      </div>
    </TecofProvider>
  );
};

export default App;
