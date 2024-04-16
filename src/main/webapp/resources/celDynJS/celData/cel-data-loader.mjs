import mergeWith from '/file/resource/deps/lodash/mergeWith.js';

export default class CelDataLoader {
  #url;
  #method;
  #paramsProcessor;
  #defaultParams;
  #abortController;

  constructor({
      url,
      method = 'POST',
      paramsProcessor,
      defaultParams = {}
  }) {
    this.#url = new URL(url);
    if (!this.#url) {
      throw new Error('url is required');
    }
    this.#method = method?.toUpperCase();
    if (!['GET', 'POST'].includes(this.#method)) {
      throw new Error('unsupported method: ' + this.#method);
    }
    this.#paramsProcessor = paramsProcessor;
    this.#defaultParams = { ...defaultParams };
    console.debug('CelDataLoader init', this.#url, this.#method);
  }

  get url() {
    return this.#url;
  }

  get method() {
    return this.#method;
  }

  get defaultParams() {
    return { ...this.#defaultParams };
  }

  abort() {
    this.#abortController?.abort();
  }

  async getPage(page, size, params = {}) {
    this.abort();
    params.page = page;
    params.size = size;
    params.limit = Math.max(size, 1);
    params.offset = Math.max(page - 1, 0) * params.limit;
    return this.load(params);
  }

  async load(params = {}) {
    this.abort();
    const request = this.#buildRequest(params);
    try {
      const response = await fetch(request);
      response.ok || console.error('fetch failed', response);
      return response.ok ? await response.json() : {};
    } catch (error) {
      if (error.name === 'AbortError') {
        console.info('aborted', request);
        return {};
      } else {
        throw error;
      }
    }
  }

  #buildRequest(params) {
    this.#abortController = new AbortController();
    const options = {
      signal: this.#abortController.signal,
      method: this.#method,
    }
    if (this.#method === 'GET') {
      this.url.search = this.#buildSearchParams(params).toString();
    } else {
      options.body = this.#buildSearchParams(params);
    }
    const request = new Request(this.url, options);
    console.debug('buildRequest', request);
    return request;
  }

  #buildSearchParams(params) {
    params = mergeWith(this.defaultParams, params, this.#tryMergeArrays);
    params = this.#paramsProcessor?.(params) ?? params;
    return new URLSearchParams(Object.entries(params)
      .map(([key, val]) => [key, Array.isArray(val)
        ? (val.length > 0 ? val.join(',') : null) 
        : val?.toString()
      ]).filter(([, val]) => val != null));
  }

  #tryMergeArrays(v1, v2) {
    if (Array.isArray(v1) || Array.isArray(v2)) {
      const toArray = (v) => Array.isArray(v) ? v : [v].filter(v => v != null);
      return toArray(v1).concat(toArray(v2));
    }
  }
}
