import { useEffect, useMemo, useState } from 'react';
import { useTecof } from '../TecofProvider';
import type { MerchantInfoData } from '../../types';

/* ─── Cache for merchant info (per apiUrl+secretKey combo) ─── */

const merchantInfoCache = new Map<string, { data: MerchantInfoData; ts: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Shared hook that fetches merchant language config via secretKey.
 * Returns { merchantInfo, loading, error, activeTab, setActiveTab }.
 * Cached for 5 minutes per apiUrl+secretKey combination.
 */
export function useLanguages() {
  const { apiClient, secretKey, apiUrl } = useTecof();

  const [merchantInfo, setMerchantInfo] = useState<MerchantInfoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('');

  const cacheKey = useMemo(() => `${apiUrl}::${secretKey}`, [apiUrl, secretKey]);

  useEffect(() => {
    let cancelled = false;

    const fetchInfo = async () => {
      // Check cache
      const cached = merchantInfoCache.get(cacheKey);
      if (cached && Date.now() - cached.ts < CACHE_TTL) {
        setMerchantInfo(cached.data);
        if (!activeTab) setActiveTab(cached.data.defaultLanguage);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const res = await apiClient.getMerchantInfo();
      if (cancelled) return;

      if (res.success && res.data) {
        merchantInfoCache.set(cacheKey, { data: res.data, ts: Date.now() });
        setMerchantInfo(res.data);
        if (!activeTab) setActiveTab(res.data.defaultLanguage);
      } else {
        setError(res.message || 'Failed to load languages');
        const fallback: MerchantInfoData = { languages: ['tr'], defaultLanguage: 'tr' };
        setMerchantInfo(fallback);
        if (!activeTab) setActiveTab('tr');
      }

      setLoading(false);
    };

    fetchInfo();
    return () => { cancelled = true; };
  }, [apiClient, cacheKey]);

  return { merchantInfo, loading, error, activeTab, setActiveTab };
}
