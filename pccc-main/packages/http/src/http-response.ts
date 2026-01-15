export type HttpResponse<T = any> = {
  status: number;
  headers: Record<string, string[]>;
  body: T;
};
