import React, { useState } from 'react';
import '../src/styles.css';

/* ─── Provider + Fields ─── */
import { TecofProvider } from '../src/components/TecofProvider';
import { LanguageField } from '../src/components/fields/LanguageField';
import { CodeEditorField } from '../src/components/fields/CodeEditorField';
import { ColorField } from '../src/components/fields/ColorField';
import { LinkField } from '../src/components/fields/LinkField';
import { EditorField } from '../src/components/fields/EditorField';
// UploadField gerçek dosya yükleme gerektirdiği için mock ortamda sınırlı çalışır

/* ────────────────────────────────────────────── */
/*  Mock API Server (MSW-free, fetch intercept)  */
/* ────────────────────────────────────────────── */

const MOCK_API_URL = 'https://playground.tecof.local';
const MOCK_SECRET = 'playground-test-key';

// Intercept fetch calls to our mock API
const originalFetch = window.fetch;
window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === 'string' ? input : input.toString();

  if (!url.startsWith(MOCK_API_URL)) {
    return originalFetch(input, init);
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
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}>
        {/* Header */}
        <div style={{
          background: '#18181b',
          color: '#fff',
          padding: '24px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 700, letterSpacing: '-0.02em' }}>
              🧪 Tecof Theme Editor — Playground
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#a1a1aa' }}>
              Tüm field bileşenlerini mock veriyle test edin. Değer değişimleri anlık izlenir.
            </p>
          </div>
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
        </div>

        {/* Content */}
        <div style={{
          maxWidth: '520px',
          margin: '32px auto',
          padding: '0 20px 60px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
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
      </div>
    </TecofProvider>
  );
};

export default App;
