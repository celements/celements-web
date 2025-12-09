import pick from '/file/resource/deps/lodash/pick.js';
import uniq from '/file/resource/deps/lodash/uniq.js';
import CelDataRenderer from './cel-data-renderer.mjs?version=20250901';
import CelDataLoader from './cel-data-loader.mjs?version=20250901';
import { celDataRegistry } from './cel-data.mjs?version=20250901';

export class Config {
  tagName;
  ParamsClass;

  createParams(props) {
    if (!(this.ParamsClass instanceof Function)) return;
    const params = new this.ParamsClass();
    if (props) {
      const defaults = { ...params };
      Object.assign(params, pick(props, Object.keys(params)));
      Object.entries(defaults)
        .filter(([key, val]) => Array.isArray(val) && !Array.isArray(params[key]))
        .forEach(([key, val]) => params[key] = [params[key]].filter(v => v != null));
    }
    return params;
  }

  processParams(params) {
    params.fields = uniq(params?.fields ?? []);
    return params;
  }

  extractResults(data) {
    return Array.isArray(data) ? data : [data];
  }

  extractCount(data) {
    return undefined;
  }

  extractHasMore(data) {
    return false;
  }
}

export class CelDataViewerElement extends HTMLElement {
  #config;
  #loader;
  #renderer;
  #currentRenderState = {};

  constructor(config) {
    super();
    if (!(config instanceof Config)) throw new Error('invalid config');
    if (!config.tagName) throw new Error('missing tagName');
    this.#config = Object.freeze(config);
  }

  get config() {
    return this.#config;
  }

  get loader() {
    return this.#loader;
  }

  get renderer() {
    return this.#renderer;
  }

  get origin() {
    return this.getAttribute('origin') || this.#documentOrigin;
  }

  get #documentOrigin() {
    const parser = document.createElement('a');
    parser.href = import.meta.url;
    return parser.origin;
  }

  get method() {
    return this.getAttribute('method') || undefined;
  }

  get path() {
    return this.getAttribute('path') || undefined;
  }

  get template() {
    return this.getAttribute('template') || undefined;
  }

  get selectTags() {
    return this.getAttribute('select-tags') || '';
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
      console.error(this.tagName, this.mode, 'doesnt support page decrease');
    } else if (this.page !== value) {
      this.setAttribute('page', value);
    }
  }

  get params() {
    const json = this.getAttribute('params') || '{}';
    let params = {};
    try {
      params = JSON.parse(json);
    } catch (error) {
      console.warn(this.tagName, "failed parsing params", json, error);
    }
    return this.#config.createParams(params) ?? params;
  }

  set params(value) {
    const params = this.#config.createParams(value) ?? value;
    this.setAttribute('params', JSON.stringify(params));
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
    console.info(this.tagName, 'init', { page });
    const template = document.querySelector(this.template);
    this.#loader = new CelDataLoader({
      url: this.origin + this.path,
      method: this.method,
      paramsProcessor: params => this.#processParams(params),
      defaultParams: { fields: this.#collectFields(template) },
    });
    const hookElem = this.querySelector(`.${this.#config.tagName}-hook, ul, ol`) ?? this;
    this.#renderer = new CelDataRenderer(hookElem, template);
    this.#resetRenderState(page);
    this.#loadmoreTriggers.forEach(t => this.#initLoadmore(t));
  }

  #processParams(params) {
    params = this.#config.processParams(params);
    return this.#config.createParams(params) ?? params;
  }

  #collectFields(template) {
    if (!template) return [];
    const selectTags = [...celDataRegistry.tags, this.selectTags.trim()].filter(Boolean);
    return uniq([template, ...template.content.querySelectorAll(selectTags.join(', '))]
      .map(e => e.getAttribute('select') || e.getAttribute('field') || '')
      .flatMap(s => s.split(','))
      .map(s => s.trim())
      .filter(Boolean));
  }

  #initLoadmore(trigger) {
    trigger.removeEventListener('click', this.#loadmoreHandler);
    trigger.addEventListener('click', this.#loadmoreHandler);
    trigger.disabled = true;
    console.debug(this.tagName, 'registered loadmore trigger', trigger, this);
  }

  #loadmoreHandler = (event) => {
    event.preventDefault();
    !event.target?.disabled && this.next();
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
    return ['page', 'size', 'params'].concat(this.initAttributes);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    console.debug(this.tagName, 'attributeChangedCallback', name, oldValue, newValue);
    if (this.isConnected && this.loader && (oldValue !== newValue)) {
      if (name === 'page') {
        this.render();
      } else if (this.constructor.initAttributes.includes(name)) {
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
      const id = (this.#currentRenderState?.id ?? 0) + 1;
      const pagePromise = this.loader?.getPage(this.page, this.size, this.params);
      console.debug(this.tagName, 'schedule render', { id, page: this.page });
      const renderPromise = (this.#currentRenderState.promise ?? Promise.resolve())
        .catch(() => {}) // ignore previous errors
        .then(() => this.#triggerRender(id, pagePromise)); // chain rendering
      this.#currentRenderState = Object.freeze({
        id,
        page: this.page,
        promise: renderPromise,
        loadPromise: pagePromise,
      });
      this.#handleMetaData(pagePromise);
      this.dispatchEvent(new CustomEvent(`cel:${this.#config.tagName}:changed`,
        { detail: this.#currentRenderState }));
      return renderPromise;
    }
  }

  #triggerRender(id, pagePromise) {
    console.debug(this.tagName, 'trigger render', { id });
    const resultsPromise = pagePromise.then(data => this.#config.extractResults(data) ?? []);
    if (this.mode === 'paging') {
      return this.#renderer?.replace(resultsPromise);
    } else if (this.mode === 'loadmore') {
      return this.#renderer?.append(resultsPromise);
    } else {
      throw new Error('unknown mode: ' + this.mode);
    }
  }

  async #handleMetaData(pagePromise) {
    this.#setMetaData(null, false);
    const data = await pagePromise;
    const count = this.#config.extractCount(data);
    const hasMore = this.#config.extractHasMore(data);
    this.#setMetaData(count, hasMore);
  }

  #setMetaData(count, hasMore) {
    this.setAttribute('count', count ?? '');
    this.toggleAttribute('has-more', !!hasMore);
    this.#loadmoreTriggers.forEach(trigger => trigger.disabled = !hasMore);
  }

  get #loadmoreTriggers() {
    return this.mode === 'loadmore' 
      ? [...this.querySelectorAll(this.getAttribute('loadmore-selector') || '.loadmore')] 
      : [];
  }

  async #resetRenderState(page = 1) {
    console.debug(this.tagName, 'resetRenderState', page);
    try {
      this.loader?.abort();
      await this.#currentRenderState.promise;
    } catch (error) {
      console.error(this.tagName, 'current render failed', error);
    }
    this.#currentRenderState = Object.freeze({ ...this.#currentRenderState, page: null });
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
