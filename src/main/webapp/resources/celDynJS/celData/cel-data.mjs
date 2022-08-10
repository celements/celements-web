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
export default class CelData extends HTMLElement {

  #rootElem;
  #updateHandler;

  constructor() {
    super();
    this.#updateHandler = event => this.updateData(event.detail);
  }

  get #isDebug() {
    return (this.getAttribute('debug') || '').toLowerCase() === 'true';
  }

  get field() {
    return this.getAttribute('field') || null;
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
    this.textContent = data?.[this.field] ??
      (this.#isDebug ? `{${this.field} is undefined}` : '');
  }

}

if (!customElements.get('cel-data')) {
  customElements.define('cel-data', CelData);
}
