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
import './cel-data.mjs';

export default class CelDataLoader {

  #htmlElem;
  #template;
  #dataProvider;

  constructor(htmlElem, dataProvider) {
    if (htmlElem === undefined)
      throw new Error("missing htmlElem");
    this.#htmlElem = htmlElem;
    this.#template = document.getElementById(htmlElem.dataset.template);
    if (this.template === undefined)
      throw new Error("missing template");
    this.#dataProvider = dataProvider ?? 
      (() => Promise.reject('no data provider given'));
  }

  get htmlElem() {
    return this.#htmlElem;
  }

  get template() {
    return this.#template;
  }

  loadData() {
    this.#addSpinner();
    console.debug('loading data', this);
    this.#dataProvider()
      .then(data => this.#handleLoadSuccess(data))
      .catch(error => this.#handleLoadError(error));
  }

  #addSpinner() {
    this.htmlElem.textContent = '';
    const spinner = document.createElement('img');
    spinner.src = this.htmlElem.dataset.spinnerSrc;
    spinner.alt = 'loading';
    spinner.classList.add('spinner');
    this.htmlElem.appendChild(spinner);
  }

  #handleLoadSuccess(data) {
    console.debug('loaded', this, data);
    data.forEach(entryData => this.#insertEntry(entryData));
    this.htmlElem.querySelector('img.spinner')?.remove();
  }

  #insertEntry(data) {
    const newElem = this.template.content.cloneNode(true);
    const dataRoot = newElem.querySelector('.cel-data-root');
    this.htmlElem.appendChild(newElem);
    if (dataRoot) {
      dataRoot.dispatchEvent(new CustomEvent('celData:update', {
        bubbles: false,
        detail: data
      }));
    } else {
      console.warn('no cel-data-root in template', newElem);
    }
  }

  #handleLoadError(error) {
    console.error('loading failed', this, error);
  }

}
