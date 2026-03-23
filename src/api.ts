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
    title?: string
  ): Promise<ApiResponse<PageApiData>> {
    try {
      const res = await fetch(`${this.apiUrl}/api/store/editor/${pageId}`, {
        method: 'PUT',
        headers: this.headers,
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
}

export default TecofApiClient;
