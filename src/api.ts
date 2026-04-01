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

  constructor(apiUrl: string, secretKey: string) {
    // Remove trailing slash
    this.apiUrl = apiUrl.replace(/\/+$/, '');
    this.secretKey = secretKey;
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
    puckData: PuckPageData,
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
        body: JSON.stringify({ puckData, ...(title && { title }) }),
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

  /** CDN base URL (derived from apiUrl) */
  get cdnUrl(): string {
    return this.apiUrl;
  }
}

export default TecofApiClient;