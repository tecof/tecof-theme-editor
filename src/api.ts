import type { ApiResponse, PuckPageData, PageApiData, MerchantInfoData } from './types';

/**
 * Tecof API Client — handles communication with the Tecof backend
 * for page CRUD operations using merchant secret key.
 *
 * Endpoints:
 *  - GET  /api/store/editor/:id   → get page by ID
 *  - PUT  /api/store/editor/:id   → save page by ID
 *  - GET  /api/store/merchant-info → get merchant language config
 */
export class TecofApiClient {
  private apiUrl: string;
  private secretKey: string;
  private customCdnUrl?: string;
  private accessToken?: string;
  private themeId?: string;

  constructor(apiUrl: string, secretKey: string, customCdnUrl?: string, accessToken?: string, themeId?: string) {
    // Remove trailing slash
    this.apiUrl = apiUrl.replace(/\/+$/, '');
    this.secretKey = secretKey;
    this.customCdnUrl = customCdnUrl ? customCdnUrl.replace(/\/+$/, '') : undefined;
    this.accessToken = accessToken;
    /* Çalışılan temanın id'si (NEXT_PUBLIC_THEME_ID). Bir merchant'ın birden
       fazla teması olabilir ve aynı slug birden fazla temada bulunabilir —
       backend, tema şablon sayfası kaydında merchant kopyasını DOĞRU temaya
       yazabilmek için bunu body/query'den okur; yoksa şablonun kendi temasına düşer. */
    this.themeId = themeId;
  }

  /**
   * Set the user's JWT for authenticated editor operations.
   *
   * The secret key is public (it ships in the site's JS bundle), so the backend
   * requires a JWT on top of it for write endpoints. When set, the token is sent
   * as `Authorization` on every request.
   */
  setAccessToken(token?: string): void {
    this.accessToken = token;
  }

  private get headers(): Record<string, string> {
    return {
      'x-secret-key': this.secretKey,
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(this.accessToken && { Authorization: this.accessToken }),
    };
  }

  /**
   * Fetch a page by ID (for the editor)
   *
   * @param signal Optional AbortSignal. When the caller aborts (e.g. a newer
   *   page load supersedes this one), the underlying `fetch` rejects with an
   *   `AbortError`, which we RETHROW so the caller's try/catch can distinguish
   *   an abort from a real failure and skip mutating stale state. Non-abort
   *   errors are still swallowed into an `{ success: false }` response.
   */
  async getPage(pageId: string, signal?: AbortSignal, revisionId?: string | null): Promise<ApiResponse<PageApiData>> {
    try {
      // revisionId verilirse backend taslak yerine o revizyonun snapshot'ını döner
      // (salt-okunur revizyon önizlemesi — TecofStudio ?revision= paramından geçirir)
      // themeId verilirse tema şablon sayfası yerine (varsa) bu temadaki merchant kopyası döner
      const qs = new URLSearchParams();
      if (revisionId) qs.set('revision', revisionId);
      if (this.themeId) qs.set('themeId', this.themeId);
      const query = qs.toString();
      const url = `${this.apiUrl}/api/store/editor/${pageId}${query ? `?${query}` : ''}`;
      const res = await fetch(url, {
        method: 'GET',
        headers: this.headers,
        signal,
      });
      return await res.json();
    } catch (error) {
      // Let aborts propagate so the caller can tell them apart from failures.
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw error;
      }
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch page',
      };
    }
  }

  /**
   * Save a page by ID
   */
  async savePage(
    pageId: string,
    draftData: PuckPageData,
    title?: string,
    accessToken?: string
  ): Promise<ApiResponse<PageApiData>> {
    try {
      const res = await fetch(`${this.apiUrl}/api/store/editor/${pageId}`, {
        method: 'PUT',
        headers: {
          ...this.headers,
          ...(accessToken && { Authorization: accessToken }),
        },
        body: JSON.stringify({ draftData, ...(title && { title }), ...(this.themeId && { themeId: this.themeId }) }),
      });
      return await res.json();
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to save page',
      };
    }
  }

  /**
   * Fetch a published page by slug + locale (for rendering)
   */
  async getPublishedPage(
    slug: string,
    locale?: string
  ): Promise<ApiResponse<PageApiData>> {
    try {
      const res = await fetch(`${this.apiUrl}/api/store/render`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({ slug, ...(locale && { locale }), ...(this.themeId && { themeId: this.themeId }) }),
      });
      return await res.json();
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch published page',
      };
    }
  }

  /**
   * Fetch merchant language config (for editor fields)
   */
  async getMerchantInfo(): Promise<ApiResponse<MerchantInfoData>> {
    try {
      const res = await fetch(`${this.apiUrl}/api/store/merchant-info`, {
        method: 'GET',
        headers: this.headers,
      });
      return await res.json();
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch merchant info',
      };
    }
  }

  /**
   * Upload files via secretKey auth (for editor fields)
   * Returns array of file records: [{ _id, name, size, type, meta }]
   */
  async uploadFile(file: File, folder?: string): Promise<ApiResponse<any[]>> {
    try {
      const formData = new FormData();
      formData.append('files', file, file.name);

      const url = folder
        ? `${this.apiUrl}/api/store/upload?folder=${encodeURIComponent(folder)}`
        : `${this.apiUrl}/api/store/upload`;

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'x-secret-key': this.secretKey,
          Accept: 'application/json',
          ...(this.accessToken && { Authorization: this.accessToken }),
          // Do NOT set Content-Type — browser sets multipart boundary automatically
        },
        body: formData,
      });
      return await res.json();
    } catch (error) {
      return {
        success: false,
      };
    }
  }

  /**
   * Fetch previously uploaded files (for media library selector)
   */
  async getUploads(page = 1, limit = 50): Promise<ApiResponse<any[]>> {
    try {
      const res = await fetch(`${this.apiUrl}/api/store/uploads?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: this.headers,
      });
      return await res.json();
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch uploads',
      };
    }
  }

  /**
   * Fetch merchant pages list (for LinkField page selector)
   * Returns pages with: _id, slug, title, status, metaTitle
   */
  async getPages(): Promise<ApiResponse<any[]>> {
    try {
      // themeId gönderilmezse backend merchant'ın AKTİF temasına düşer — editör
      // farklı bir temada çalışıyorsa yanlış temanın sayfaları listelenirdi.
      const qs = new URLSearchParams();
      if (this.themeId) qs.set('themeId', this.themeId);
      const suffix = qs.toString() ? `?${qs}` : '';
      const res = await fetch(`${this.apiUrl}/api/store/pages${suffix}`, {
        method: 'GET',
        headers: this.headers,
      });
      return await res.json();
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch pages',
      };
    }
  }

  /**
   * Search stock photos (Pexels/Pixabay) via the backend, normalized response.
   * Returns { data: StockPhoto[], provider, providers, page, hasMore }.
   */
  async searchStockMedia(
    query: string,
    opts: { provider?: string; page?: number; perPage?: number; orientation?: string } = {}
  ): Promise<ApiResponse<any[]> & { provider?: string; providers?: string[]; page?: number; hasMore?: boolean }> {
    try {
      const params = new URLSearchParams({ q: query });
      if (opts.provider) params.set('provider', opts.provider);
      if (opts.page) params.set('page', String(opts.page));
      if (opts.perPage) params.set('perPage', String(opts.perPage));
      if (opts.orientation) params.set('orientation', opts.orientation);
      const res = await fetch(`${this.apiUrl}/api/store/stock-media/search?${params.toString()}`, {
        method: 'GET',
        headers: this.headers,
      });
      return await res.json();
    } catch (error) {
      return { success: false, data: [], message: error instanceof Error ? error.message : 'Stock search failed' };
    }
  }

  /**
   * Import a stock photo: the backend downloads it and uploads it to the
   * merchant's own storage, returning the resulting UploadedFile record.
   */
  async importStockMedia(item: { provider: string; downloadUrl: string; id?: string; alt?: string }): Promise<ApiResponse<any>> {
    try {
      const res = await fetch(`${this.apiUrl}/api/store/stock-media/import`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(item),
      });
      return await res.json();
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Stock import failed' };
    }
  }

  /**
   * Translate text to multiple languages (for LanguageField)
   * Returns [{code, value}] for each locale
   */
  async translate(
    text: string,
    sourceLang: string,
    locales: string[],
    isHtml = false
  ): Promise<ApiResponse<{ code: string; value: string }[]>> {
    try {
      const res = await fetch(`${this.apiUrl}/api/store/translate`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({ text, sourceLang, locales, isHtml }),
      });
      return await res.json();
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Translation failed',
      };
    }
  }

  /**
   * Get a component preview screenshot as a Blob URL.
   * Calls POST /api/store/component-preview with domain + componentName.
   * Returns a blob:// URL that can be used as an img src.
   * Results are cached client-side in a Map.
   */
  private previewBlobCache = new Map<string, string>();

  async getComponentPreview(domain: string, componentName: string): Promise<string | null> {
    const cacheKey = `${domain}:${componentName}`;

    // Return cached blob URL
    if (this.previewBlobCache.has(cacheKey)) {
      return this.previewBlobCache.get(cacheKey)!;
    }

    try {
      const res = await fetch(`${this.apiUrl}/api/store/component-preview`, {
        method: 'POST',
        headers: {
          'x-secret-key': this.secretKey,
          Accept: 'image/png',
          'Content-Type': 'application/json',
          ...(this.accessToken && { Authorization: this.accessToken }),
        },
        body: JSON.stringify({ domain, componentName }),
      });

      if (!res.ok) return null;

      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);

      // Cache the blob URL
      this.previewBlobCache.set(cacheKey, blobUrl);
      return blobUrl;
    } catch {
      return null;
    }
  }

  /**
   * Fetch CMS collections list (for CmsCollectionField)
   * Returns: [{ _id, name, slug, fields, ... }]
   */
  async getCmsCollections(): Promise<ApiResponse<any[]>> {
    try {
      const res = await fetch(`${this.apiUrl}/api/store/cms/collections`, {
        method: 'POST',
        headers: this.headers,
        // CMS koleksiyonları tema kapsamlı — editörün temasını bildir.
        body: JSON.stringify({ ...(this.themeId && { themeId: this.themeId }) }),
      });
      return await res.json();
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch collections',
      };
    }
  }

  /**
   * Fetch items from a CMS collection by slug
   * Returns: { items: [...], totalData: N }
   */
  async getCmsCollectionItems(
    collectionSlug: string,
    options?: {
      page?: number;
      limit?: number;
      sort?: 'newest' | 'oldest' | 'custom';
      locale?: string;
      /** Gelişmiş data.* filtreleri — backend şema whitelist'iyle doğrular */
      filters?: Array<{ field: string; op: string; value: any }>;
      /** Koleksiyon alanına göre sıralama (shortcode) */
      sortBy?: string;
      sortDir?: 'asc' | 'desc';
    }
  ): Promise<ApiResponse<any>> {
    try {
      const body: Record<string, any> = {
        page: options?.page || 1,
        limit: options?.limit || 50,
        locale: options?.locale,
        // Koleksiyon slug'ı tema kapsamlı çözülür — editörün temasını bildir.
        ...(this.themeId && { themeId: this.themeId }),
      };

      // 'custom' uses backend default (order: 1) — don't send sort field
      const sortValue = options?.sort || 'custom';
      if (sortValue !== 'custom') {
        body.sort = sortValue;
      }

      if (options?.filters?.length) {
        // Değeri boş bırakılan satırlar henüz doldurulmamıştır — gönderme
        const active = options.filters.filter(
          (f) => f.field && f.op && f.value !== '' && f.value !== undefined && f.value !== null
        );
        if (active.length) body.filters = active;
      }
      if (options?.sortBy) {
        body.sortBy = options.sortBy;
        body.sortDir = options.sortDir || 'asc';
      }

      const res = await fetch(`${this.apiUrl}/api/store/cms/collections/${encodeURIComponent(collectionSlug)}/items`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(body),
      });
      return await res.json();
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch collection items',
      };
    }
  }

  /**
   * Fetch all global/shared components for the merchant/theme.
   */
  async getSharedComponents(): Promise<ApiResponse<any>> {
    try {
      const res = await fetch(`${this.apiUrl}/api/store/shared-components`, {
        method: 'GET',
        headers: this.headers,
      });
      return await res.json();
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch shared components',
      };
    }
  }

  /**
   * Create a new global/shared component.
   */
  async createSharedComponent(name: string, type: string, props: any): Promise<ApiResponse<any>> {
    try {
      const res = await fetch(`${this.apiUrl}/api/store/shared-components`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({ name, type, props }),
      });
      return await res.json();
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create shared component',
      };
    }
  }

  /**
   * Delete a global/shared component.
   *
   * Backend silmeden önce ref'leri kullanan sayfalara İŞLER (materialize):
   * kopyalar bağımsızlaşır, hiçbir sayfadan içerik kaybolmaz — yalnız
   * "birinde düzenle → hepsinde güncellensin" bağı kalkar.
   */
  async deleteSharedComponent(id: string): Promise<ApiResponse<any>> {
    try {
      const res = await fetch(`${this.apiUrl}/api/store/shared-components/${id}`, {
        method: 'DELETE',
        headers: this.headers,
      });
      return await res.json();
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete shared component',
      };
    }
  }

  /**
   * Update a global/shared component's props/data.
   */
  async updateSharedComponent(id: string, name: string, type: string, props: any): Promise<ApiResponse<any>> {
    try {
      const res = await fetch(`${this.apiUrl}/api/store/shared-components/${id}`, {
        method: 'PUT',
        headers: this.headers,
        body: JSON.stringify({ name, type, props }),
      });
      return await res.json();
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update shared component',
      };
    }
  }

  /* ═══════════════════════════════════════════════════════════════════
     E-ticaret veri kaynakları — editör içi seçiciler (create*Field)
     ═══════════════════════════════════════════════════════════════════

     Uçlar İKİ ailededir ve bu bir tercih değil, backend'in gerçeği:

       • PUBLIC  (/api/store/ecommerce/*, secretKey)  → marka, kategori, ürün.
         Vitrinin de kullandığı uçlar; yalnız `status: active` kayıtları döner
         ve çok dilli alanlar İSTENEN DİLE ÇEVRİLMİŞ (düz string) gelir.
       • MERCHANT (/api/merchant/ecommerce/*, JWT)    → etiket, özellik,
         varyant tipi, flaş satış, kampanya, kupon. Bunların storefront
         karşılığı YOKTUR.

     Merchant uçları JWT ister; `TecofStudio` mount olurken
     `apiClient.setAccessToken(...)` çağırdığı için editörde sorun değildir.
     Yayınlanmış sayfada token yoktur — bu yüzden seçicilerin prop'a yazdığı
     değer, tema render'ının ek istek atmasına gerek kalmayacak kadar bilgi
     (ad, slug, tarih, renk…) taşır. Bkz. fields/ecommerce/sources.ts.

     Liste uçlarının ortak yanıtı: { success, totalData, data: [...] }.

     ⚠ ARAMA: _crud tabanlı uçlarda (`tags`, `attributes`, `variant-types`,
     `discounts`, `brands`) `?search=` düz metin BEKLENMEZ — backend onu
     `{alan: değer}` sözlüğü sanar ve sessizce yok sayar. Üstelik çok dilli
     `name` bir DİZİ olduğu için regex'lenemez. Bu yüzden seçiciler listeyi
     bir kez çekip aramayı İSTEMCİ TARAFINDA yapar (bu listeler onlarca
     kayıtlıktır, binlerce değil). `flash-sales` ve `campaigns` kendi
     `search` filtresini uygular ama tutarlılık için orada da aynı yol
     izlenir. */

  /**
   * Merchant uçları için ZORUNLU kimlik.
   *
   * `/api/merchant/*` rotaları merchantId'yi JWT'den DEĞİL, `x-merchant-id`
   * header'ından okur (`AuthSrc.getMerchantId`) ve `authorizeRole(["user"])`
   * middleware'i bu alanı doldurmaz. Header gitmezse sorgu
   * `{ merchantId: null }` ile çalışır: yanıt HTTP 200 + `success: true` +
   * `data: []` olur — yani hata gibi görünmez, liste sessizce boş gelir.
   * Bu yüzden kimlik istekten ÖNCE çözülür ve çözülemezse gerçek bir hata
   * döndürülür.
   */
  private merchantId?: string;
  private merchantIdRequest?: Promise<string | undefined>;

  /** Kimlik dışarıdan biliniyorsa (host zaten çekmişse) doğrudan verilebilir. */
  setMerchantId(id?: string): void {
    this.merchantId = id;
  }

  /** merchant-info'dan bir kez çözer; eşzamanlı çağrılar aynı isteği paylaşır. */
  private async ensureMerchantId(): Promise<string | undefined> {
    if (this.merchantId) return this.merchantId;
    if (!this.merchantIdRequest) {
      this.merchantIdRequest = this.getMerchantInfo()
        .then((res) => {
          const id = (res.data as { merchantId?: string } | undefined)?.merchantId;
          this.merchantId = id ? String(id) : undefined;
          return this.merchantId;
        })
        .catch(() => undefined)
        .finally(() => {
          this.merchantIdRequest = undefined;
        });
    }
    return this.merchantIdRequest;
  }

  /**
   * Ortak GET + JSON zarfı.
   *
   * `merchantScoped` verilen uçlar `x-merchant-id` olmadan çağrılmaz; kimlik
   * çözülemezse boş liste yerine HATA döner ki merchant "kaydım yok" sanmasın.
   */
  private async getJson<T>(
    path: string,
    errorMessage: string,
    options: { merchantScoped?: boolean } = {}
  ): Promise<ApiResponse<T[]>> {
    try {
      const headers = { ...this.headers };
      if (options.merchantScoped) {
        const merchantId = await this.ensureMerchantId();
        if (!merchantId) {
          return {
            success: false,
            message: 'Mağaza kimliği çözülemedi — editör oturumunu yenileyin.',
            data: [],
          } as ApiResponse<T[]>;
        }
        headers['X-Merchant-ID'] = merchantId;
      }

      const res = await fetch(`${this.apiUrl}${path}`, { method: 'GET', headers });
      const json = await res.json().catch(() => null);

      /* HTTP hatası JSON gövdesiyle gelmiş olabilir (401 gibi); success
         alanına güvenmek yerine durum kodunu da kontrol et. */
      if (!res.ok && json?.success !== true) {
        return {
          success: false,
          message: json?.message || `${errorMessage} (HTTP ${res.status})`,
          data: [],
        } as ApiResponse<T[]>;
      }
      /* Gövde JSON değilse (proxy/HTML hata sayfası) ham metni kullanıcıya
         yansıtma — sabit mesaj daha anlaşılır. */
      if (!json || typeof json !== 'object' || !('success' in json)) {
        return { success: false, message: errorMessage, data: [] } as ApiResponse<T[]>;
      }
      return json;
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : errorMessage,
        data: [],
      } as ApiResponse<T[]>;
    }
  }

  /** Markalar — PUBLIC uç: yalnız aktif markalar, `name` çevrilmiş string. */
  async getEcommerceBrands(locale = 'tr'): Promise<ApiResponse<any[]>> {
    return this.getJson<any>(
      `/api/store/ecommerce/brands?locale=${encodeURIComponent(locale)}`,
      'Markalar yüklenemedi'
    );
  }

  /** Kategori ağacı — PUBLIC uç (çocuklar `children` altında iç içe). */
  async getEcommerceCategories(locale = 'tr'): Promise<ApiResponse<any[]>> {
    return this.getJson<any>(
      `/api/store/ecommerce/categories?locale=${encodeURIComponent(locale)}`,
      'Kategoriler yüklenemedi'
    );
  }

  /** Ürün araması — PUBLIC uç. Varyant seçici de bunu kullanır. */
  async getEcommerceProducts(
    params: { locale?: string; search?: string; limit?: number; category?: string } = {}
  ): Promise<ApiResponse<any[]>> {
    const qs = new URLSearchParams();
    qs.set('locale', params.locale || 'tr');
    qs.set('limit', String(params.limit ?? 24));
    if (params.search) qs.set('search', params.search);
    if (params.category) qs.set('category', params.category);
    return this.getJson<any>(`/api/store/ecommerce/products?${qs}`, 'Ürünler yüklenemedi');
  }

  /** Etiketler — MERCHANT uç (vitrinde karşılığı yok). */
  async getEcommerceTags(limit = 200): Promise<ApiResponse<any[]>> {
    return this.getJson<any>(`/api/merchant/ecommerce/tags?limit=${limit}`, 'Etiketler yüklenemedi', {
      merchantScoped: true,
    });
  }

  /** Ürün özellikleri (renk/beden gibi filtrelenebilir alanlar) — MERCHANT uç. */
  async getEcommerceAttributes(limit = 200): Promise<ApiResponse<any[]>> {
    return this.getJson<any>(
      `/api/merchant/ecommerce/attributes?limit=${limit}`,
      'Özellikler yüklenemedi',
      { merchantScoped: true }
    );
  }

  /** Varyant tipleri (Renk, Beden…) — MERCHANT uç. */
  async getEcommerceVariantTypes(limit = 200): Promise<ApiResponse<any[]>> {
    return this.getJson<any>(
      `/api/merchant/ecommerce/variant-types?limit=${limit}`,
      'Varyant tipleri yüklenemedi',
      { merchantScoped: true }
    );
  }

  /** Flaş satışlar — MERCHANT uç. Kayıtlara `status` (efektif durum) eklenir. */
  async getEcommerceFlashSales(limit = 100): Promise<ApiResponse<any[]>> {
    return this.getJson<any>(
      `/api/merchant/ecommerce/flash-sales?limit=${limit}`,
      'Flaş satışlar yüklenemedi',
      { merchantScoped: true }
    );
  }

  /** Pazarlama kampanyaları — MERCHANT uç. Kayıtlara `effectiveStatus` eklenir. */
  async getEcommerceCampaigns(limit = 100): Promise<ApiResponse<any[]>> {
    return this.getJson<any>(
      `/api/merchant/ecommerce/campaigns?limit=${limit}`,
      'Kampanyalar yüklenemedi',
      { merchantScoped: true }
    );
  }

  /** Kuponlar / indirim kodları — MERCHANT uç. */
  async getEcommerceDiscounts(limit = 200): Promise<ApiResponse<any[]>> {
    return this.getJson<any>(
      `/api/merchant/ecommerce/discounts?limit=${limit}`,
      'Kuponlar yüklenemedi',
      { merchantScoped: true }
    );
  }

  /** CDN base URL (defaults to apiUrl if not set) */
  get cdnUrl(): string {
    return this.customCdnUrl || this.apiUrl;
  }
}

export default TecofApiClient;