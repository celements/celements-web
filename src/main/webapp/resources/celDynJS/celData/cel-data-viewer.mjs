import CelDataRenderer from '/file/resources/celDynJS/celData/cel-data-renderer.mjs?ver=20240414';
import CelDataLoader from '/file/resources/celDynJS/celData/cel-data-loader.mjs?ver=20240414';

export class Config {
  tagName;
  ParamsClass;

  processParams(params) {
    if (!this.ParamsClass) return params;
    const ret = new this.ParamsClass();
    for (const [key, defaultVal] of Object.entries(ret)) {
      let val = params[key] ?? defaultVal;
      if (Array.isArray(defaultVal) && !Array.isArray(val)) {
        val = [val].filter(v => v != null);
      }
      ret[key] = val;
    }
    return ret;
  }

  extractResults(data) {
    return [];
  }

  extractCount(data) {
    return 0;
  }

  extractHasMore(data) {
    return false;
  }
}

export class CelDataViewerElement extends HTMLElement {
  #config;
  #renderer;
  #loader;
  #currentRenderState = {};

  constructor(config) {
    super();
    if (!(config instanceof Config)) throw new Error('invalid config');
    if (!config.tagName) throw new Error('missing tagName');
    this.#config = Object.freeze(config);
  }

  get origin() {
    return this.getAttribute('origin') || undefined;
  }

  get path() {
    return this.getAttribute('path') || undefined;
  }

  get method() {
    return this.getAttribute('method') || undefined;
  }

  get loader() {
    return this.#loader;
  }

  get template() {
    return this.getAttribute('template') || undefined;
  }

  get mode() {
    return this.getAttribute('mode') || 'paging';
  }

  get size() {
    return Math.max(parseInt(this.getAttribute('size')), 1) || 10;
  }

  set size(value) {
    this.setAttribute('size', Math.max(value, 1));
  }

  get page() {
    return Math.max(parseInt(this.getAttribute('page')), 1) || 1;
  }

  set page(value) {
    value = Math.max(value, 1);
    if ((this.mode !== 'paging') && value < this.page) {
      console.error(this.mode, 'doesnt support page decrease');
    } else if (this.page !== value) {
      this.setAttribute('page', value);
    }
  }

  get params() {
    const json = this.getAttribute('params') || '{}';
    try {
      return JSON.parse(json);
    } catch (error) {
      console.warn("failed parsing params", json, error);
      return {};
    }
  }

  set params(value) {
    this.setAttribute('params', JSON.stringify(value));
  }

  setParams(key, value) {
    this.params = { ...this.params, [key]: value };
  }

  get count() {
    return parseInt(this.getAttribute('count'));
  }

  get hasMore() {
    return this.hasAttribute('has-more');
  }

  connectedCallback() {
    this.#init(this.page);
  }

  #init(page) {
    const hookElem = this.querySelector(`.${this.#config.tagName}-hook, ul, ol`) ?? this;
    const template = document.querySelector(this.template);
    this.#renderer = new CelDataRenderer(hookElem, template);
    this.#loader = new CelDataLoader({
      origin: this.origin,
      path: this.path,
      method: this.method,
      paramsProcessor: params => this.#config.processParams(params),
      defaultParams: { fields: this.#collectFields(template) },
    });
    this.#resetRenderState(page);
    this.#loadmoreTriggers.forEach(t => this.#initLoadmore(t));
  }

  #initLoadmore(trigger) {
    trigger.removeEventListener('click', this.#loadmoreHandler);
    trigger.addEventListener('click', this.#loadmoreHandler);
    trigger.disabled = true;
    console.debug('registered loadmore trigger', trigger, this);
  }

  #loadmoreHandler = (event) => {
    event.preventDefault();
    !event.target?.disabled && this.next();
  }

  #collectFields(template) {
    const fields = [...template?.content.querySelectorAll('[field]') || []]
        .map(e => e.getAttribute('field'))
        .filter(Boolean);
    return [...new Set(fields)];
  }

  next() {
    this.page++;
  }

  previous() {
    this.page--;
  }

  static get initAttributes() {
    return ['origin', 'path', 'method', 'template', 'mode'];
  }

  static get observedAttributes() {
    return ['page', 'size', 'params'].concat(CelDataViewerElement.initAttributes);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    console.debug('attributeChangedCallback', name, oldValue, newValue);
    if (this.isConnected && this.loader && (oldValue !== newValue)) {
      if (name === 'page') {
        this.render();
      } else if (CelDataViewerElement.initAttributes.includes(name)) {
        this.#init();
      } else {
        this.#resetRenderState();
      }
    }
  }

  render() {
    if (this.page === this.#currentRenderState.page) {
      return this.#currentRenderState.promise;
    } else {
      const pagePromise = this.loader?.getPage(this.page, this.size, this.params);
      const renderPromise = this.#renderResults(pagePromise);
      this.#currentRenderState = Object.freeze({
        page: this.page,
        promise: renderPromise,
        loadPromise: pagePromise,
      });
      this.#handleMetaData(pagePromise);
      this.dispatchEvent(new CustomEvent(`progon:${this.#config.tagName}:changed`,
        { detail: this.#currentRenderState }));
      return renderPromise;
    }
  }

  #renderResults(pagePromise) {
    const resultsPromise = pagePromise.then(data => this.#config.extractResults?.(data) ?? []);
    if (this.mode === 'paging') {
      return this.#renderer?.replace(resultsPromise);
    } else if (this.mode === 'loadmore') {
      return this.#renderer?.append(resultsPromise);
    } else {
      throw new Error('unknown mode: ' + this.mode);
    }
  }

  async #handleMetaData(pagePromise) {
    this.#loadmoreTriggers.forEach(trigger => trigger.disabled = true);
    const data = await pagePromise;
    this.setAttribute('count', this.#config.extractCount?.(data) ?? '');
    const hasMore = !!this.#config.extractHasMore?.(data);
    this.toggleAttribute('has-more', hasMore);
    this.#loadmoreTriggers.forEach(trigger => trigger.disabled = !hasMore);
  }

  get #loadmoreTriggers() {
    return this.mode === 'loadmore' 
      ? [...this.querySelectorAll(this.getAttribute('loadmore-selector') || '.loadmore')] 
      : [];
  }

  async #resetRenderState(page = 1) {
    console.debug('resetRenderState', page);
    try {
      this.loader?.abort();
      await this.#currentRenderState.promise;
    } catch (error) {
      console.error('current render failed', error);
    }
    this.#currentRenderState = {};
    this.#renderer?.remove();
    this.setAttribute('page', page);
    return this.render();
  }

  disconnectedCallback() {
    this.#loader = null;
    this.#renderer = null;
    this.#loadmoreTriggers.forEach(trigger => trigger
      .removeEventListener('click', this.#loadmoreHandler));
  }
}
