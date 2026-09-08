import React from 'react';
import { usePresence } from './usePresence';
import { useStudio } from '../context';

/**
 * "Bu sayfada kimler var" rozeti — üst çubuk.
 *
 * YALNIZ BİRDEN FAZLA KİŞİ VARSA çizilir (istek birebir buydu): tek başına
 * çalışırken hiçbir şey görünmez, çubuk kalabalıklaşmaz. İkinci kişi girdiği
 * anda avatar yığını belirir ve üzerine gelince kim olduğu yazılır.
 *
 * Avatarı olmayan kullanıcı, kimliğinden türetilen SABİT renkli baş harf
 * rozetiyle gösterilir (renk sunucudan gelir; aynı kişi her yerde aynı renk).
 */

const initialsOf = (name: string): string =>
  String(name || '?')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toLocaleUpperCase('tr-TR'))
    .join('') || '?';

/** En fazla bu kadar avatar çizilir; kalanı "+N" olur. */
const MAX_VISIBLE = 4;

export const PresenceBar: React.FC = () => {
  const { pageId } = useStudio();
  const users = usePresence(pageId);

  /* Tek kişi = kendisi. Uyarı ancak İKİNCİ kişiyle anlam kazanır. */
  if (users.length < 2) return null;

  const visible = users.slice(0, MAX_VISIBLE);
  const overflow = users.length - visible.length;
  const names = users.map((u) => u.name).join(', ');

  return (
    <div
      className="tecof-presence"
      title={`Bu sayfada ${users.length} kişi çalışıyor: ${names}`}
      aria-label={`Bu sayfada ${users.length} kişi çalışıyor`}
      style={{ display: 'flex', alignItems: 'center', gap: 6 }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {visible.map((user, index) => (
          <span
            key={user.id}
            title={user.name}
            style={{
              width: 26,
              height: 26,
              borderRadius: '50%',
              /* Yığın görünümü: soldan sağa binerek dizilir */
              marginLeft: index === 0 ? 0 : -8,
              zIndex: visible.length - index,
              border: '2px solid var(--tecof-surface, #fff)',
              backgroundColor: user.color || '#64748b',
              backgroundImage: user.avatarUrl ? `url(${user.avatarUrl})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              color: '#fff',
              fontSize: 10,
              fontWeight: 700,
              lineHeight: '22px',
              textAlign: 'center',
              display: 'inline-block',
              overflow: 'hidden',
              flexShrink: 0
            }}
          >
            {user.avatarUrl ? '' : initialsOf(user.name)}
          </span>
        ))}
        {overflow > 0 && (
          <span
            style={{
              width: 26,
              height: 26,
              borderRadius: '50%',
              marginLeft: -8,
              border: '2px solid var(--tecof-surface, #fff)',
              backgroundColor: '#475569',
              color: '#fff',
              fontSize: 10,
              fontWeight: 700,
              lineHeight: '22px',
              textAlign: 'center',
              display: 'inline-block',
              flexShrink: 0
            }}
          >
            +{overflow}
          </span>
        )}
      </div>
      {/* Metin ipucu: rozetin ne anlama geldiği ilk bakışta anlaşılsın —
          "birileri de bu sayfada" uyarısı görsel olarak sessiz kalmamalı. */}
      <span style={{ fontSize: 11, fontWeight: 600, color: '#b45309', whiteSpace: 'nowrap' }}>
        {users.length} kişi
      </span>
    </div>
  );
};
