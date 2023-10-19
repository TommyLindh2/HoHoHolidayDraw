export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export class HttpClient {
  constructor(private apiUrl: string) {}

  protected PerformRequest = async (
    method: HttpMethod,
    uri: string,
    options?: { params?: Record<string, string>; headers?: Record<string, string> },
    jsonData?: any,
  ): Promise<Response> => {
    return fetch(this.buildUrl(uri, options?.params), {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: jsonData ? JSON.stringify(jsonData) : undefined,
    });
  };

  private buildParams = (params: Record<string, string>): URLSearchParams => {
    const searchParams = new URLSearchParams();

    for (const key in params) {
      searchParams.append(key, params[key]);
    }

    return searchParams;
  };

  private buildUrl = (uri: string, params?: Record<string, string>) => {
    const url = `${this.apiUrl}/${uri}`;

    if (params) {
      return `${url}?${this.buildParams(params)}`;
    }

    return url;
  };
}
