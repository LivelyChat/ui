import { PUBLIC_API_BASE } from '$env/static/public';
import HomeApi from './home';
import MessagesApi from './messages';
import QqApi from './qq';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SendBody = FormData | URLSearchParams | Record<string, any> | string;

enum ContentType {
  JSON = 'application/json',
  FORM_DATA = 'multipart/form-data',
  FORM_URLENCODED = 'application/x-www-form-urlencoded'
}

export default class API {
  constructor(public fetch: typeof globalThis.fetch) {}

  send(path: string, method: string, body?: SendBody): Promise<Response> {
    const headers = new Headers();

    body = JSON.stringify(body);
    headers.append('Content-Type', ContentType.JSON);

    if (import.meta.env.DEV)
      console.log(
        `\x1b[2m${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\x1b[0m \x1b[44mAPI\x1b[0m`,
        path + (body ? ` ${body}` : '')
      );

    return this.fetch(`${PUBLIC_API_BASE}${path}`, { method, headers, body });
  }

  GET(path: string) {
    return this.send(path, 'GET');
  }

  DELETE(path: string) {
    return this.send(path, 'DELETE');
  }

  POST(path: string, body?: SendBody) {
    return this.send(path, 'POST', body);
  }

  PUT(path: string, body?: SendBody) {
    return this.send(path, 'PUT', body);
  }

  HEAD(path: string, body?: SendBody) {
    return this.send(path, 'HEAD', body);
  }

  PATCH(path: string, body?: SendBody) {
    return this.send(path, 'PATCH', body);
  }

  home = new HomeApi(this);
  messages = new MessagesApi(this);
  qq = new QqApi(this);
}

export const stringifyQueryParams = (params: object) => {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  }
  return searchParams.toString();
};

export function createQueryCreator<T, O, K extends string>(key: K, func: (opts: O) => R<T>) {
  return <QueryOpts extends O, QueryOptions extends object = object>(
    opts: QueryOpts,
    options?: QueryOptions
  ) => ({
    queryKey: [key, opts],
    queryFn: async (): Promise<T> => {
      const resp = await func(opts);
      try {
        const data = await resp.json();
        if (resp.ok) return data as T;
        else throw { ...data, httpStatus: resp.status };
      } catch {
        throw { httpStatus: resp.status };
      }
    },
    retry: (failureCount: number, error: { httpStatus: number }) => {
      return ![401, 404, 502].includes(error.httpStatus) && failureCount < 1;
    },
    ...options
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface TypedResponse<T = any> extends Response {
  json(): Promise<T>;
}

export type R<T = void> = Promise<TypedResponse<T>>;
