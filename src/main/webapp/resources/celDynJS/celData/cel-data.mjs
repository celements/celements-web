/*
 * See the NOTICE file distributed with this work for additional
 * information regarding copyright ownership.
 *
 * This is free software; you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as
 * published by the Free Software Foundation; either version 2.1 of
 * the License, or (at your option) any later version.
 *
 * This software is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this software; if not, write to the Free
 * Software Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA
 * 02110-1301 USA, or see the FSF site: http://www.fsf.org.
 */
class CelDataExtractorRegistry {
  #registry = new Map();

  addResolver(shortname, extractFunc) {
    if (typeof extractFunc !== 'function') {
      throw new Error("extractFunc must be a function [" + (typeof extractFunc) + "]");
    }
    this.#registry.set(shortname, extractFunc);
  }

  async evaluate(data, expression, shortname = "jsonata") {
    if (!this.#registry.has(shortname)) {
      throw new Error("no registred extraction function for " + shortname);
    }
    return await this.#registry.get(shortname)(data, expression);
  }
}
export const extractor = new CelDataExtractorRegistry();

extractor.addResolver('jsonata', async (data, expression) => {
  await import("/file/resource/deps/JSONata/jsonata.min.js");
  return await jsonata(expression).evaluate(data);
});

export class CelData extends HTMLElement {
  #rootElem;
  #updateHandler;

  constructor() {
    super();
    this.#updateHandler = async event => await this.updateData(event.detail.data);
  }

  get isDebug() {
    return this.hasAttribute('debug');
  }

  get field() {
    return this.fields[0];
  }

  get fields() {
    return (this.getAttribute('field') || '')
      .split(',')
      .map(f => f.trim())
      .filter(Boolean);
  }

  get select() {
    return (this.getAttribute('select') || '')
      .split(',')
      .map(f => f.trim())
      .filter(Boolean);
  }

  get extract() {
    return this.getAttribute('extract') || undefined;
  }
  
  get extractMode() {
    return this.getAttribute('extract-mode') || this.#rootElem?.getAttribute('extract-mode')
      || undefined;
  }

  connectedCallback() {
    this.#rootElem = this.closest('.cel-data-root') ?? this;
    this.#rootElem?.addEventListener('celData:update', this.#updateHandler);
    console.debug('connected', this, 'listening to', this.#rootElem);
  }

  disconnectedCallback() {
    this.#rootElem?.removeEventListener('celData:update', this.#updateHandler);
    this.#rootElem = null;
    console.debug('disconnected', this);
  }

  async extractValue(data) {
    let extracted = this.#extractForFields(data, this.fields);
    if (this.extract) {
      extracted = await extractor.evaluate(extracted ?? data, this.extract, this.extractMode);
      this.isDebug && console.debug("for fields", this.fields, "extracted values '", extracted, 
          "' from '", extractData, "' with:", this.extract, this.extractMode || '');
    }
    try {
      extracted = this.marshaller?.parse(extracted) ?? extracted;
    } catch (error) {
      console.warn('failed parsing', extracted, 'with', this.marshaller, error);
    }
    return extracted ?? (!this.isDebug ? ''
      : `{'${[this.fields.join(','), this.extract].filter(Boolean).join('.')}' is undefined}`);
  }

  #extractForFields(data, fields) {
    if (fields.length > 1) {
      return Object.fromEntries(fields.map(f => [f, data?.[f]]));
    } else if (fields.length > 0) {
      return data?.[fields[0]];
    }
  }

  async updateData(data) {
    this.replaceContent(await this.extractValue(data));
  }

  replaceContent(value) {
    try {
      value = this.marshaller?.format(value) ?? value;
    } catch (error) {
      console.warn('failed formatting', value, 'with', this.marshaller, error);
    }
    this.replaceChildren();
    this.insertAdjacentHTML('beforeend', value);
  }

}

export class CelDataIf extends CelData {

  get elseRemove() {
    return this.hasAttribute('else-remove');
  }

  async updateData(data) {
    const condition = await this.extractValue(data);
    if (!this.elseRemove) {
      this.style.display = condition ? '' : 'none';
    } else if (!condition) {
      this.remove();
    }
  }

}

export class CelDataDateTime extends CelData {

  get locale() {
    return this.getAttribute('locale') || navigator.language;
  }

  get options() {
    try {    
      return JSON.parse(this.getAttribute('options'));
    } catch (error) {
      console.warn("failed parsing options", this.getAttribute('options'), error);
      return {};
    }
  }

  get formatter() {
    return this.marshaller.formatter;
  }

  get marshaller() {
    const formatter = new Intl.DateTimeFormat(this.locale, this.options);
    return {
      parse: value => value ? new Date(value) : value,
      format: date => date ? formatter.format(date) : '',
      formatter,
    };
  }

}

export class CelDataTime extends CelDataDateTime {

  get timeStyle () {
    return this.getAttribute('time-style') || 'short';
  }

  get options() {
    return { timeStyle: this.timeStyle };
  }
  
  get isNonZero() {
    return this.hasAttribute('non-zero');  
  }

  get marshaller() {
    const marshaller = super.marshaller;
    return {
      ...marshaller,
      parse: value => marshaller.parse(
        value && !value.includes('T') ? `2000-01-01T${value}` : value
      ),
      format: date => marshaller.format(
        (this.isNonZero && this.#isZero(date)) ? null : date
      ),
    };
  }

  #isZero(date) {
    if (!date) return false;
    const zeroed = new Date(date);
    zeroed.setHours(0, 0, 0, 0);
    return date.getTime() === zeroed.getTime();
  }

}

export class CelDataLink extends CelData {

  get target() {
    return this.getAttribute('target') ?? '';
  }

  /**
   * defines the parts of the href to display in the content of the link if no content is provided.
   * valid values are props of https://developer.mozilla.org/docs/Web/API/HTMLAnchorElement
   */
  get contentHrefParts() {
    return this.getAttribute('content-href-parts')?.split(', ') ?? ['hostname'];
  }

  connectedCallback() {
    super.connectedCallback();
    if (!this.querySelector('a')) {
      const link = document.createElement('a');
      link.replaceChildren(...this.childNodes);
      this.replaceChildren(link);
    }
  }

  async updateData(data) {
    const link = this.querySelector('a');
    const value = await this.extractValue(data);
    if (value) {
      link.href = this.#parseURL(value)?.href ?? '';
      link.target = this.target;
      if (!link.hasChildNodes()) {
        const content = this.contentHrefParts.map(p => link[p]).filter(Boolean).join('');
        link.innerText = content || value;
      }
    } else {
      link.removeAttribute('href');
    }
  }

  #parseURL(value) {
    const parsers = [
      // absolute URL
      x => URL.parse(x),
      // likely URL without protocol, assuming https
      x => (x.indexOf('.') > 0) 
          && ((x.indexOf('/') < 0) || (x.indexOf('.') < x.indexOf('/')))
          && URL.parse(`https://${x}`),
      // assuming host relative URL
      x => URL.parse(x, document.baseURI),
    ];
    return parsers.map(parser => parser(value)).find(x => !!x);
  }

}

export class CelDataImage extends CelData {

  get srcFallback() {
    return this.getAttribute('src-fallback') ?? '';
  }

  get alt() {
    return this.getAttribute('alt') ?? '';
  }

  get loading() {
    return this.getAttribute('loading') ?? '';
  }

  get imgSrcParams() {
    return this.getAttribute('img-src-params') ?? '';
  }

  async urlImageSrc(data) {
    const src = await this.extractValue(data);
    if (src) {
      const url = new URL(src);
      for (const [key, value] of new URLSearchParams(this.imgSrcParams)) {
        url.searchParams.append(key, value);
      }
      return url.href;
    }
    return undefined;
  }

  connectedCallback() {
    super.connectedCallback();
    if (!this.querySelector('img')) {
      const img = document.createElement('img');
      img.alt = this.alt;
      img.loading = this.loading;
      img.src = this.srcFallback;
      this.replaceChildren(img);
    }
  }

  async updateData(data) {
    const img = this.querySelector('img');
    img.src = await this.urlImageSrc(data) || this.srcFallback;
  }

}

const components = [
  ['cel-data', CelData],
  ['cel-data-if', CelDataIf],
  ['cel-data-datetime', CelDataDateTime],
  ['cel-data-time', CelDataTime],
  ['cel-data-a', CelDataLink],
  ['cel-data-img', CelDataImage]
];

components
  .filter(([name]) => !customElements.get(name))
  .forEach(([name, constr]) => customElements.define(name, constr));

export const celDataTags = Object.freeze(components.map(([name]) => name));
