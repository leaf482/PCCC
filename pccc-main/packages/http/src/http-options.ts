export type HttpOptions<T extends HttpResponseType> = {
  responseType: T;
  headers: Record<string, string>;
};

export type HttpResponseType = 'text' | 'buffer';
