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

  constructor() {
    super();
  }

  get locale() {
    return this.getAttribute('locale') || navigator.language;
  }

  get dateStyle() {
    return this.getAttribute('date-style') || undefined;
  }

  get timeStyle() {
    return this.getAttribute('time-style') || undefined;
  }

  get formatter() {
    return new Intl.DateTimeFormat(this.locale, {
      dateStyle: this.dateStyle,
      timeStyle: this.timeStyle
    });
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

  constructor() {
    super();
  }

  get target() {
    return this.getAttribute('target') || undefined;
  }

  connectedCallback() {
    super.connectedCallback();
    if (!this.querySelector('a')) {
      const link = document.createElement('a');
      link.replaceChildren(...this.childNodes);
      this.replaceChildren(link);
    }
  }

  updateData(data) {
    console.debug('updateData', this, data);
    const value = data?.[this.field];
    Object.assign(this.querySelector('a'), value 
      ? { href: value, target: this.target } 
      : { href: 'javascript:void(0)', target: '_self' });
  }

}

export class CelDataImage extends CelData {

  constructor() {
    super();
  }

  get alt() {
    return this.getAttribute('alt') || undefined;
  }

  connectedCallback() {
    super.connectedCallback();
    if (!this.querySelector('img')) {
      this.replaceChildren(document.createElement('img'));
    }
  }

  updateData(data) {
    console.debug('updateData', this, data);
    const img = this.querySelector('img');
    img.src = data?.[this.field] ?? '';
    img.alt = this.alt;
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
