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
      (this.isDebug ? `{${this.field} is undefined}` : ''));
  }

}

export class CelDataLink extends CelData {

  constructor() {
    super();
  }

  get target() {
    return this.getAttribute('target') || undefined;
  }

  updateData(data) {
    console.debug('updateData', this, data);
    const link = document.createElement('a');
    link.href = data?.[this.field] ?? '#';
    link.target = this.target;
    link.replaceChildren(...this.childNodes);
    this.replaceChildren(link);
  }

}

export class CelDataImage extends CelData {

  constructor() {
    super();
  }

  get alt() {
    return this.getAttribute('alt') || undefined;
  }

  updateData(data) {
    console.debug('updateData', this, data);
    this.replaceChildren();
    const img = document.createElement('img');
    img.src = data?.[this.field] ?? '';
    img.alt = this.alt;
    this.appendChild(img);
  }

}

if (!customElements.get('cel-data')) {
  customElements.define('cel-data', CelData);
}
if (!customElements.get('cel-data-a')) {
  customElements.define('cel-data-a', CelDataLink);
}
if (!customElements.get('cel-data-img')) {
  customElements.define('cel-data-img', CelDataImage);
}
