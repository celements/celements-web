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
import './cel-data.mjs?version=202212031733';

export default class CelDataRenderer {

  #htmlElem;
  #template;

  constructor(htmlElem, template) {
    if (htmlElem == null) {
      throw new Error("missing htmlElem");
    }
    this.#htmlElem = htmlElem;
    if (template == null) {
      throw new Error("missing template");
    }
    this.#template = template;
    console.debug('CelDataRenderer init', this.htmlElem, this.template);
  }

  get htmlElem() {
    return this.#htmlElem;
  }

  get template() {
    return this.#template;
  }

  async render(dataPromise) {
    console.debug('render', this);
    this.htmlElem.classList.remove('cel-data-rendered');
    this.htmlElem.classList.add('cel-data-rendering');
    try {
      const data = await dataPromise || [];
      data.forEach((entryData, idx) => this.#insertEntry(entryData, idx === 0));
      if (data.length === 0) {
        this.htmlElem.classList.add('cel-data-empty');
      }
      this.htmlElem.classList.remove('cel-data-error');
    } catch (error) {
      console.error('awaiting data failed', error, this);
      this.htmlElem.classList.add('cel-data-error');
    }
    this.htmlElem.classList.replace('cel-data-rendering', 'cel-data-rendered');
  }

  #insertEntry(entryData, clearContent) {
    const newElem = this.template.content.cloneNode(true);
    const dataRoot = newElem.querySelector('.cel-data-root');
    if (clearContent) {
      this.htmlElem.replaceChildren();
    }
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
