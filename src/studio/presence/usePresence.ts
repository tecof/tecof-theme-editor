import { useEffect, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useStudio } from '../context';

/**
 * "Bu sayfada kimler var" — canlı katılım (2026-09-07).
 *
 * Aynı sayfayı aynı anda açan başka biri olduğunda üst çubukta görünür. Amaç
 * işbirliği değil ÇAKIŞMA UYARISI: iki kişi aynı taslağı kaydedince son
 * kaydeden diğerinin işini eziyor ve bu bugüne kadar sessizce oluyordu.
 *
 * SÖZLEŞME (backend `app/src/editorPresence.ts`):
 *   → `editor:join`  { pageId }   — sunucu ÜYELİK doğrular, sonra odaya alır
 *   → `editor:leave` { pageId }
 *   ← `editor:presence` { pageId, users: [{ id, name, avatarUrl, color }] }
 *
 * Kimlik bilgisi (ad/e-posta/avatar) SUNUCUDA token'dan çözülür; bu dosya
 * hiçbir kimlik alanı GÖNDERMEZ — gönderseydi herkes istediği adla görünürdü.
 *
 * Bağlantı yalnız editörde ve yalnız token varken açılır; kapanışta oda
 * terk edilir ve soket kapatılır (sekme kapanınca da sunucu `disconnecting`
 * ile listeyi tazeler).
 */

export interface PresenceUser {
  id: string;
  name: string;
  /* E-posta BİLEREK yok: sunucu yayınlamıyor (odaya yayılan kişisel alan
     asgaride tutulur), bu yüzden tip de taşımıyor. */
  avatarUrl: string | null;
  color: string;
}

export const usePresence = (pageId?: string): PresenceUser[] => {
  const { apiClient } = useStudio();
  const [users, setUsers] = useState<PresenceUser[]>([]);

  useEffect(() => {
    /* `getRealtimeConfig` paketin yeni sürümünde geldi; eski bir apiClient
       enjekte edilmişse (tüketici tema paketi güncellemediyse) gösterge
       sessizce kapalı kalır — editör çalışmaya devam eder. */
    const realtime = typeof (apiClient as any)?.getRealtimeConfig === 'function'
      ? (apiClient as any).getRealtimeConfig()
      : null;
    const url = realtime?.url;
    const token = realtime?.token;

    /* Token yoksa oturum yok demektir: sunucu zaten odaya almaz, boşuna
       bağlantı açılmaz. */
    if (!pageId || !url || !token) {
      setUsers([]);
      return;
    }

    let socket: Socket | null = null;
    let cancelled = false;

    try {
      socket = io(url, {
        /* Backend `io.use` bloğu token'ı handshake QUERY'sinden okuyor
           (`authorization`) — panel istemcisi de aynı alanı kullanıyor. */
        query: { authorization: token },
        transports: ['websocket', 'polling'],
        /* Editör sekmesi uzun süre açık kalır; kopan bağlantı kendiliğinden
           toparlanmalı ve toparlandığında odaya YENİDEN katılınmalı. */
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 10000
      });

      const join = () => socket?.emit('editor:join', { pageId });

      socket.on('connect', join);
      socket.on('reconnect', join);
      socket.on('editor:presence', (payload: any) => {
        if (cancelled) return;
        /* Sunucu sayfa kimliğini de yolluyor: hızlı sayfa geçişlerinde eski
           odanın son yayını yeni sayfanın listesini ezmesin. */
        if (payload?.pageId && String(payload.pageId) !== String(pageId)) return;
        setUsers(Array.isArray(payload?.users) ? payload.users : []);
      });
      /* Bağlantı hataları sessizdir: gösterge bir KOLAYLIK, editörü bozmamalı. */
      socket.on('connect_error', () => { if (!cancelled) setUsers([]); });
      socket.on('disconnect', () => { if (!cancelled) setUsers([]); });
    } catch {
      setUsers([]);
      return;
    }

    return () => {
      cancelled = true;
      try {
        socket?.emit('editor:leave', { pageId });
        socket?.removeAllListeners();
        socket?.disconnect();
      } catch {
        /* kapanış hatası yutulur */
      }
    };
  }, [apiClient, pageId]);

  return users;
};
