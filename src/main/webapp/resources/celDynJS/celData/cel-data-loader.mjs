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
    // TODO replace content with spinner
    // TODO paging params
    console.debug('loading data', this);
    this.#dataProvider()
      .then(data => this.#handleLoadSuccess(data))
      .catch(error => this.#handleLoadError(error));
  }

  #handleLoadSuccess(loadedData) {
    console.debug('data loaded', this, loadedData);
    loadedData.forEach(data => this.#insert(data));
    // TODO remove spinner
    this.htmlElem.querySelectorAll('.cel-replace')
    .forEach(elem => elem.style.display = "none");
  }

  #insert(data) {
    console.debug('insert', data);
    const newElem = this.template.content.cloneNode(true);
    const dataRoot = newElem?.querySelector('.cel-data-root');
    if (dataRoot) {
      this.htmlElem.appendChild(newElem);
      dataRoot.dispatchEvent(new CustomEvent('celData:update', {
        bubbles: false,
        detail: data
      }));
    } else {
      console.error('no template with cel-data-root defined');
    }
  }

  #handleLoadError(error) {
    console.error('data loading failed', this, error);
  }

}
