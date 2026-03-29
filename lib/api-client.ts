// Centralized API client configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const apiClient = {
  baseURL: API_BASE_URL,

  async request(
    endpoint: string,
    options: RequestInit & { timeout?: number } = {}
  ) {
    const { timeout = 5000, ...fetchOptions } = options;
    const url = `${API_BASE_URL}${endpoint}`;

    // Get token from localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    console.log(`[v0] API ${fetchOptions.method || 'GET'} ${url}`);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...fetchOptions,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      let data;
      try {
        data = await response.json();
      } catch (e) {
        console.error('[v0] Failed to parse response as JSON:', response.status, response.statusText);
        throw new Error(`Server returned invalid JSON: ${response.statusText}`);
      }

      if (!response.ok) {
        const errorMsg = data?.message || data?.error || `API error: ${response.status}`;
        console.error(`[v0] API Error: ${response.status} - ${errorMsg}`);
        throw new Error(errorMsg);
      }

      console.log(`[v0] API Success: ${response.status}`);
      return data;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        const msg = `Request timeout (${timeout}ms) - Is backend running on ${API_BASE_URL}?`;
        console.error(`[v0] ${msg}`);
        throw new Error(msg);
      }
      
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        const msg = `Connection failed - Is backend running on ${API_BASE_URL}? Check CORS and firewall.`;
        console.error(`[v0] ${msg}`, error);
        throw new Error(msg);
      }

      console.error('[v0] API Request Error:', error.message);
      throw error;
    }
  },

  get(endpoint: string, options?: RequestInit & { timeout?: number }) {
    return this.request(endpoint, { ...options, method: 'GET' });
  },

  post(endpoint: string, body?: any, options?: RequestInit & { timeout?: number }) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  put(endpoint: string, body?: any, options?: RequestInit & { timeout?: number }) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  delete(endpoint: string, options?: RequestInit & { timeout?: number }) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  },
};
