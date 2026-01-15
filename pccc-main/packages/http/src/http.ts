import axios, {
  AxiosInstance,
  AxiosResponse,
  AxiosResponseHeaders,
  RawAxiosResponseHeaders,
} from 'axios';
import { CookieJar } from 'tough-cookie';
import { HttpOptions, HttpResponseType } from './http-options';
import { HttpResponse } from './http-response';

export class Http {
  public constructor(private readonly client: AxiosInstance, private readonly jar?: CookieJar) {}

  static create(
    options: {
      jar?: CookieJar;
      proxy?: { protocol: 'http'; host: string; port: number };
    } = {},
  ) {
    const client = axios.create({ validateStatus: () => true, proxy: options.proxy });
    return new Http(client, options.jar);
  }

  async get(url: string, options: HttpOptions<'buffer'>): Promise<HttpResponse<Buffer>>;
  async get(url: string, options: HttpOptions<'text'>): Promise<HttpResponse<string>>;
  async get(
    url: string,
    options: HttpOptions<HttpResponseType>,
  ): Promise<HttpResponse<string | Buffer>> {
    return await this.request('get', url, options);
  }

  async post(url: string, data: any, options: HttpOptions<'buffer'>): Promise<HttpResponse<Buffer>>;
  async post(url: string, data: any, options: HttpOptions<'text'>): Promise<HttpResponse<string>>;
  async post(
    url: string,
    data: any,
    options: HttpOptions<HttpResponseType>,
  ): Promise<HttpResponse<string | Buffer>> {
    return await this.request('post', url, options, data);
  }

  async request(
    method: 'get' | 'post',
    url: string,
    options: HttpOptions<'buffer'>,
    data?: any,
  ): Promise<HttpResponse<Buffer>>;
  async request(
    method: 'get' | 'post',
    url: string,
    options: HttpOptions<'text'>,
    data?: any,
  ): Promise<HttpResponse<string>>;
  async request(
    method: 'get' | 'post',
    url: string,
    options: HttpOptions<HttpResponseType>,
    data?: any,
  ): Promise<HttpResponse<string | Buffer>>;
  async request(
    method: 'get' | 'post',
    url: string,
    options: HttpOptions<HttpResponseType>,
    data?: any,
  ): Promise<HttpResponse<string | Buffer>> {
    const response = await this.client.request<ArrayBuffer>({
      method,
      url,
      data,
      headers: {
        ...options.headers,
        Cookie: this.jar ? await this.jar.getCookieString(url) : undefined,
      },
      responseType: 'arraybuffer',
    });

    await this.handleSetCookie(url, response);

    return this.toResponse(response, options);
  }

  private async handleSetCookie(urlStr: string, response: AxiosResponse<ArrayBuffer>) {
    const setCookieHeader = response.headers['set-cookie'];
    if (!setCookieHeader || !this.jar) {
      return;
    }

    const url = new URL(urlStr);
    if (Array.isArray(setCookieHeader)) {
      for (const cookie of setCookieHeader) {
        this.jar.setCookie(cookie, url.origin);
      }
      return;
    }

    this.jar.setCookie(setCookieHeader, url.origin);
  }

  private toResponse(
    response: AxiosResponse<ArrayBuffer>,
    options: HttpOptions<HttpResponseType>,
  ): HttpResponse<any> {
    const body = (() => {
      const buffer = Buffer.from(response.data);

      if (options.responseType === 'buffer') {
        return buffer;
      }

      if (options.responseType === 'text') {
        return buffer.toString('utf-8');
      }
      throw new Error(`Invalid response type: ${options.responseType}`);
    })();
    return {
      status: response.status,
      headers: this.toHeaders(response.headers),
      body,
    };
  }

  private toHeaders(raw: RawAxiosResponseHeaders | AxiosResponseHeaders): Record<string, string[]> {
    const headers: Record<string, string[]> = {};

    for (const [key, value] of Object.entries(raw)) {
      if (headers[key]) {
        headers[key].push(value);
      } else {
        headers[key] = [value];
      }
    }

    return headers;
  }
}
