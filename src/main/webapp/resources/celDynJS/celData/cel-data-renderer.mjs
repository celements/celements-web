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

export default class CelDataRenderer {

  #htmlElem;
  #dataProvider;
  #template;

  constructor(htmlElem, dataProvider, template) {
    if (htmlElem === undefined) {
      throw new Error("missing htmlElem");
    }
    this.#htmlElem = htmlElem;
    if (dataProvider === undefined) {
      throw new Error("missing dataProvider");
    }
    this.#dataProvider = dataProvider;
    if (template === undefined) {
      throw new Error("missing template");
    }
    this.#template = this.template;
  }

  get htmlElem() {
    return this.#htmlElem;
  }

  get template() {
    return this.#template;
  }

  render() {
    console.debug('rendering data', this);
    this.htmlElem.replaceChildren();
    this.htmlElem.classList.add('cel-data-rendering');
    this.#dataProvider()
      .then(data => this.#renderData(data))
      .catch(error => console.error(this, error));
  }

  #renderData(data) {
    console.debug('rendering', this, data);
    data?.forEach(entryData => this.#insertEntry(entryData));
    this.htmlElem.classList.replace('cel-data-rendering', 'cel-data-rendered');
  }

  #insertEntry(entryData) {
    const newElem = this.template.content.cloneNode(true);
    const dataRoot = newElem.querySelector('.cel-data-root');
    this.htmlElem.appendChild(newElem);
    if (dataRoot) {
      dataRoot.dispatchEvent(new CustomEvent('celData:update', {
        bubbles: false,
        detail: entryData
      }));
    } else {
      console.warn('no cel-data-root in template', newElem);
    }
  }

}
