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

  constructor(apiUrl: string, secretKey: string, customCdnUrl?: string) {
    // Remove trailing slash
    this.apiUrl = apiUrl.replace(/\/+$/, '');
    this.secretKey = secretKey;
    this.customCdnUrl = customCdnUrl ? customCdnUrl.replace(/\/+$/, '') : undefined;
  }

  private get headers(): Record<string, string> {
    return {
      'x-secret-key': this.secretKey,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };
  }

  /**
   * Fetch a page by ID (for the editor)
   */
  async getPage(pageId: string): Promise<ApiResponse<PageApiData>> {
    try {
      const res = await fetch(`${this.apiUrl}/api/store/editor/${pageId}`, {
        method: 'GET',
        headers: this.headers,
      });
      return await res.json();
    } catch (error) {
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
        body: JSON.stringify({ draftData, ...(title && { title }) }),
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
        body: JSON.stringify({ slug, ...(locale && { locale }) }),
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
      const res = await fetch(`${this.apiUrl}/api/store/pages`, {
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
        body: JSON.stringify({}),
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
    options?: { page?: number; limit?: number; sort?: 'newest' | 'oldest' | 'custom'; locale?: string }
  ): Promise<ApiResponse<any>> {
    try {
      const body: Record<string, any> = {
        page: options?.page || 1,
        limit: options?.limit || 50,
        locale: options?.locale,
      };

      // 'custom' uses backend default (order: 1) — don't send sort field
      const sortValue = options?.sort || 'custom';
      if (sortValue !== 'custom') {
        body.sort = sortValue;
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

  /** CDN base URL (defaults to apiUrl if not set) */
  get cdnUrl(): string {
    return this.customCdnUrl || this.apiUrl;
  }
}

export default TecofApiClient;