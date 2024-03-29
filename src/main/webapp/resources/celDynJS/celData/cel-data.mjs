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
export const celDERegistry = new CelDataExtractorRegistry();

celDERegistry.addResolver('jsonata', async (data, expression) => {
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
    const fieldValue = data?.[this.field];
    let extracted = fieldValue;
    if (this.extract) {
      const extractData = (this.fields.length > 1)
        ? Object.fromEntries(this.fields.map(f => [f, data?.[f]]))
        : fieldValue;
      extracted = await celDERegistry.evaluate(extractData, this.extract, this.extractMode);
      this.isDebug && console.debug("for fields", this.fields, "extracted values '", extracted, 
          "' from '", extractData, "' with:", this.extract, this.extractMode || '');
    }
    return extracted ?? (!this.isDebug ? ''
      : `{'${[this.fields.join(','), this.extract].filter(Boolean).join('.')}' is undefined}`);
  }

  async updateData(data) {
    this.replaceContent(await this.extractValue(data));
  }

  replaceContent(value) {
    this.replaceChildren();
    this.insertAdjacentHTML('beforeend', value);
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

  async updateData(data) {
    const value = await this.extractValue(data);
    let formatted;
    try {
      formatted = value ? this.formatter.format(new Date(value)) : value;
    } catch (error) {
      console.warn('error formatting date', error, this, value);
    }
    this.replaceContent(formatted || '');
  }

}

export class CelDataLink extends CelData {

  get target() {
    return this.getAttribute('target') ?? '';
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
      link.href = value;
      link.target = this.target;
      if (!link.hasChildNodes()) {
        const [, urlWithoutProtocol] = value.split('://');
        link.innerText = urlWithoutProtocol || value;
      }
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
