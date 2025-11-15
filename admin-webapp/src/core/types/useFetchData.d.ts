export type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export type FetchConfig = {
  url: URL;
  method: RequestMethod;
  body?: BodyInit;
  requiresAuth?: boolean;
  contentType?: string;
};
