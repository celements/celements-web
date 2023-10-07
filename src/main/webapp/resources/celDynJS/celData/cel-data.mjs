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

  getLoadedPromise(elem) {
    return new Promise((resolve, reject) => {
      elem.addEventListener('load', () => {
        resolve();
      });
      elem.addEventListener('error', (message, source, lineno, colno, error) => {
        reject(message, source, lineno, colno, error);
      });
    });
  }

  addResolver(shortname, extractFunc) {
    if (typeof extractFunc !== 'function') {
      throw new Error("extractFunc must be a function [" + (typeof extractFunc) + "]");
    }
    this.#registry.set(shortname, extractFunc);
  }

  async evaluate(shortname = "jsonata", data, expression) {
    if (!this.#registry.has(shortname)) {
      throw new Error("no registred extraction function for " + shortname);
    }
    return await this.#registry.get(shortname)(data, expression);
  }
}
export const celDERegistry = new CelDataExtractorRegistry();

class JSONataAdaptor {
  #loaded;
  #SCRIPT_ID = 'JSONata';
  
  constructor() {
    const newEle = document.createElement('script');
    newEle.id = this.#SCRIPT_ID;
    newEle.type = "text/javascript";
    newEle.src = "/file/resource/celDynJS/JSONata/jsonata.min.js";
    if (this.#isNotLoaded()) {
      document.head.appendChild(newEle);
    }
    this.#loaded = celDERegistry.getLoadedPromise(newEle);
  }

  #isNotLoaded() {
    return !document.head.querySelector("script#" + this.#SCRIPT_ID);
  }

  async evaluate(data, expression) {
    await this.#loaded;
    const result = await jsonata(expression).evaluate(data);
    console.log('JSONataAdaptor.evaluate', data, expression, result);
    return result;
  }
}
let jsonataAdaptor;
celDERegistry.addResolver('jsonata', async (data, expression) => {
  jsonataAdaptor = jsonataAdaptor ?? new JSONataAdaptor();
  return await jsonataAdaptor.evaluate(data, expression);
});

export class CelData extends HTMLElement {

  #rootElem;
  #updateHandler;

  constructor() {
    super();
    this.#updateHandler = async event => await this.updateData(event.detail.data,
      event.detail.extractMode);
  }

  get isDebug() {
    return this.hasAttribute('debug');
  }

  get field() {
    return this.getAttribute('field') || undefined;
  }

  get extract() {
    return this.getAttribute('extract') || undefined;
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

  async extractValue(data, extractMode) {
    let fieldValue = data?.[this.field];
    console.debug("extractValue fieldValue", this.field, fieldValue);
    if (this.extract && extractMode) {
      fieldValue = await celDERegistry.evaluate(extractMode, fieldValue, this.extract);
      console.debug("extractValue fieldValue after evaluate", this.field, fieldValue);
    }
    return fieldValue ??
      (this.isDebug ? `{'${this.field}' is undefined}` : '');
  }

  async updateData(data, extractMode) {
    console.debug('updateData', this, data);
    this.replaceChildren();
    this.insertAdjacentHTML('beforeend', await this.extractValue(data, extractMode));
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
    return new Intl.DateTimeFormat(this.locale, this.options);
  }

  async updateData(data, extractMode) {
    console.debug('updateData', this, data);
    const value = await this.extractValue(data, extractMode);
    let formatted;
    try {
      formatted = this.formatter.format(new Date(value));
    } catch (error) {
      console.warn('error formatting date', error, value);
    }
    await super.updateData({ [this.field]: formatted });
  }

}

export class CelDataLink extends CelData {

  get target() {
    return this.getAttribute('target') ?? '';
  }

  async connectedCallback() {
    super.connectedCallback();
    if (!this.querySelector('a')) {
      const link = document.createElement('a');
      link.replaceChildren(...this.childNodes);
      this.replaceChildren(link);
      await this.updateData({});
    }
  }

  async updateData(data, extractMode) {
    console.debug('updateData', this, data);
    const link = this.querySelector('a');
    const value = await this.extractValue(data, extractMode);
    if (value) {
      link.href = value;
      link.target = this.target;
    } else {
      link.removeAttribute('href');
    }
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

  async urlImageSrc(data, extractMode) {
    const src = await this.extractValue(data, extractMode);
    console.debug('urlImageSrc after extractValue', this.field, data, extractMode, src);
    if (src) {
      const url = new URL(src);
      for (const [key, value] of new URLSearchParams(this.imgSrcParams)) {
        url.searchParams.append(key, value);
      }
      return url.href;
    }
    return undefined;
  }

  async connectedCallback() {
    super.connectedCallback();
    if (!this.querySelector('img')) {
      this.replaceChildren(document.createElement('img'));
      await this.updateData({});
    }
  }

  async updateData(data, extractMode) {
    console.debug('updateData', this.field, data);
    const img = this.querySelector('img');
    img.src = await this.urlImageSrc(data, extractMode) || this.srcFallback;
    img.alt = this.alt;
    img.loading = this.loading;
  }

}

if (!customElements.get('cel-data')) {
  customElements.define('cel-data', CelData);
}
if (!customElements.get('cel-data-datetime')) {
  customElements.define('cel-data-datetime', CelDataDateTime);
}
if (!customElements.get('cel-data-a')) {
  customElements.define('cel-data-a', CelDataLink);
}
if (!customElements.get('cel-data-img')) {
  customElements.define('cel-data-img', CelDataImage);
}
