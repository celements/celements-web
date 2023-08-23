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
export class CelData extends HTMLElement {

  #rootElem;
  #updateHandler;

  constructor() {
    super();
    this.#updateHandler = event => this.updateData(event.detail);
  }

  get isDebug() {
    return this.hasAttribute('debug');
  }

  get field() {
    return this.getAttribute('field') || undefined;
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

  updateData(data) {
    console.debug('updateData', this, data);
    this.replaceChildren();
    this.insertAdjacentHTML('beforeend', data?.[this.field] ??
      (this.isDebug ? `{'${this.field}' is undefined}` : ''));
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

  updateData(data) {
    console.debug('updateData', this, data);
    const value = data?.[this.field];
    let formatted;
    try {
      formatted = this.formatter.format(new Date(value));
    } catch (error) {
      console.warn('error formatting date', error, value);
    }
    super.updateData({ [this.field]: formatted });
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
      this.updateData({});
    }
  }

  updateData(data) {
    console.debug('updateData', this, data);
    const link = this.querySelector('a');
    const value = data?.[this.field];
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

  get additionalParams() {
    return this.getAttribute('additional-params') ?? '';
  }

  urlImageSrc(data) {
    const src = data?.[this.field];
    if (src) {
      const del = (src.indexOf('?') > -1) ? '&' : '?';
      return src + del + this.additionalParams;
    }
    return undefined;
  }

  connectedCallback() {
    super.connectedCallback();
    if (!this.querySelector('img')) {
      this.replaceChildren(document.createElement('img'));
      this.updateData({});
    }
  }

  updateData(data) {
    console.debug('updateData', this, data);
    const img = this.querySelector('img');
    img.src = this.urlImageSrc(data) || this.srcFallback;
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
