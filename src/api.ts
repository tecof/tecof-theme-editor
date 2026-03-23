import type { ApiResponse, PuckPageData, PageApiData } from './types';

/**
 * Tecof API Client — handles communication with the Tecof backend
 * for page CRUD operations using merchant secret key.
 *
 * Endpoints:
 *  - GET  /api/store/editor/:id   → get page by ID
 *  - PUT  /api/store/editor/:id   → save page by ID
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
}

export default TecofApiClient;