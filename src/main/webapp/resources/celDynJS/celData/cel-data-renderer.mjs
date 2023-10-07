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
import './cel-data.mjs?version=202310071330';

export default class CelDataRenderer {

  #htmlElem;
  #template;
  #extractMode;
  #entryRootTag;
  #cssClasses = {};
  #defaultCssClasses = Object.freeze({
    render: 'cel-data-render', // added on the htmlElem while rendering
    empty: 'cel-data-empty', // added on the htmlElem if it is empty after rendering
    error: 'cel-data-error', // added on the htmlElem if the dataPromise fails
    entry: 'cel-data-entry', // added to each created entry
    creating: 'cel-data-creating', // toggled on each created entry over an animation frame
    removing: 'cel-data-removing' // toggled on each removed entry over an animation frame
  });

  constructor(htmlElem, template, extractMode = "jsonata") {
    if (htmlElem == null) {
      throw new Error("missing htmlElem");
    }
    this.#htmlElem = htmlElem;
    if (template == null) {
      throw new Error("missing template");
    }
    this.#template = template;
    this.#extractMode = extractMode;
    this.withCssClasses();
    console.debug('CelDataRenderer init', this.htmlElem, this.template);
  }

  get htmlElem() {
    return this.#htmlElem;
  }

  get template() {
    return this.#template;
  }

  get entryRootTag() {
    return this.#entryRootTag;
  }

  get cssClasses() {
    return this.#cssClasses;
  }

  /**
   * @param {string} tagName - new entries will be wrapped in a single tag with the given name if
   *                           the template doesn't already have the root element
   */
  withEntryRoot(tagName) {
    this.#entryRootTag = tagName?.toUpperCase();
    return this;
  }

  /**
   * adds additional css classes to be managed by the renderer
   * 
   * @param {object} classes - optional, see #defaultCssClasses
   */
  withCssClasses(cssClasses = {}) {
    const classes = {};
    for (const [key, value] of Object.entries(this.#defaultCssClasses)) {
      classes[key] = new Set([value].concat((cssClasses[key] || '').split(' ').filter(Boolean)));
    }
    this.#cssClasses = Object.freeze(classes);
    return this;
  }

  /**
   * @param {Promise} dataPromise - the data to append to the htmlElem
   * @param {function} preInserter - optional, see `render`
   * @returns {Promise} - the entries that were inserted
   */
  async append(dataPromise, preInserter) {
    return this.render(dataPromise, preInserter, HTMLElement.prototype.append);
  }

  /**
   * @param {Promise} dataPromise - the data to prepend to the htmlElem
   * @param {function} preInserter - optional, see `render`
   * @returns {Promise} - the entries that were inserted
   */
  async prepend(dataPromise, preInserter) {
    return this.render(dataPromise, preInserter, HTMLElement.prototype.prepend);
  }

  /**
   * @param {Promise} dataPromise - the data to replace the htmlElem content
   * @param {string} removeSelector - optional, the selector to remove the old entries
   * @param {function} preInserter - optional, see `render`
   * @returns {Promise} - the entries that were inserted
   */
  async replace(dataPromise, removeSelector = '*', preInserter) {
    const loadThenReplacePromise = (async () => {
      const data = await dataPromise;
      await this.remove(removeSelector);
      return data;
    })();
    return this.#render(loadThenReplacePromise, preInserter);
  }

  /**
   * @param {Promise} dataPromise - the data to add to the htmlElem content
   * @param {function} preInserter - optional, params: `(entry, data)`
   *        called before the entry is inserted into the DOM.
   *        may call `entry.remove()` to prevent DOM insertion.
   * @param {function} inserter - optional, params: `(elem, fragment)`
   *        the function which inserts the entries into the DOM
   * @returns {Promise} - array of inserted entries
   */
  async render(dataPromise, preInserter, inserter) {
    if (inserter) {
      return this.#render(dataPromise, preInserter, inserter);
    } else {
      return this.replace(dataPromise, '*', preInserter);
    }
  }

  async #render(dataPromise, preInserter, inserter) {
    console.debug('render', this);
    this.htmlElem.classList.remove(...this.cssClasses.error);
    this.htmlElem.classList.add(...this.cssClasses.render);
    try {
      const result = await dataPromise;
      return (Array.isArray(result) ? result : [result].filter(Boolean))
        .map(data => this.#insert(data, preInserter, inserter));
    } catch (error) {
      console.error('awaiting data failed', error, this);
      this.htmlElem.classList.add(...this.cssClasses.error);
      return [];
    } finally {
      this.cssClasses.empty.forEach(cssClass => this.htmlElem.classList
        .toggle(cssClass, this.htmlElem.children.length == 0));
      this.htmlElem.classList.remove(...this.cssClasses.render);
    }
  }

  /**
   * creates entries from the template, inserts them into the DOM and dispatches events
   */
  #insert(data, preInserter = (entry, data) => undefined, inserter = HTMLElement.prototype.append) {
    if (typeof preInserter !== 'function') {
      throw new TypeError('preInserter must be a function');
    }
    if (typeof inserter !== 'function') {
      throw new TypeError('inserter must be a function');
    }
    const fragment = this.#cloneTemplate();
    for (const entry of fragment.children) {
      entry.classList.add(...this.cssClasses.entry);
      entry.classList.add(...this.cssClasses.creating);
      preInserter(entry, data); // may call entry.remove()
    }
    const children = [...fragment.children]; // copy the children to know which were inserted
    inserter.call(this.htmlElem, fragment); // may empty the fragment
    for (const entry of children) {
      this.#dispatchEntryEvents(entry, data);
      // trigger create animation if any, double requestAnimationFrame to ensure consistency
      requestAnimationFrame(() => requestAnimationFrame(() => entry.classList
        .remove(...this.cssClasses.creating)));
    }
    return children;
  }

  /**
   * clones the template and wraps it in a single element of tag this.entryRootTag if necessary
   * 
   * @returns {DocumentFragment} - a clone of the template
   */
  #cloneTemplate() {
    const fragment = this.template.content.cloneNode(true);
    if (!this.entryRootTag) {
      return fragment;
    }
    const hasSingleChild = fragment.children.length === 1;
    const hasEntryRoot = this.entryRootTag === fragment.children[0]?.tagName;
    if (hasSingleChild && hasEntryRoot) {
      return fragment;
    }
    // root the fragment in a single element of tag this.entryRootTag
    const rootedFragment = document.createDocumentFragment();
    const root = document.createElement(this.entryRootTag);
    rootedFragment.append(root);
    root.append(fragment);
    return rootedFragment;
  }

  #dispatchEntryEvents(entry, data) {
    const dataRoot = entry.classList.contains('cel-data-root')
      ? entry : entry.querySelector('.cel-data-root');
    console.trace('dispatching events for entry', entry, 'on data root', dataRoot);
    dataRoot?.dispatchEvent(new CustomEvent('celData:update', {
      bubbles: false,
      detail: {
        data : data,
        extractMode : this.#extractMode
      }
    }));
    if (entry.fire) {
      entry.fire('celements:contentChanged', { 'htmlElem' : entry });
    }
  }

  /**
   * @param {string} removeSelector - optional, selector to remove entries, default '*'
   * @param {function} remover - optional, params: `(entry)`
   *        called to remove the entry
   * @returns {Promise} - array of removed entries
   */
  async remove(removeSelector = '*', remover) {
    const toRemoveEntries = removeSelector 
      ? [...this.htmlElem.querySelectorAll(':scope > ' + removeSelector)]
      : [];
    return Promise.all(toRemoveEntries.map(entry => this
      .removeEntry(entry, remover)
      .then(() => entry)));
  }

  /**
   * @param {HTMLElement} entry - the entry to remove
   * @param {function} remover - optional, params: `(entry)`
   *        called to remove the entry
   * @returns {Promise} - whatever the remover returns
   */
  async removeEntry(entry, remover = (entry) => entry.remove()) {
    if (!entry || entry.parentElement !== this.htmlElem) {
      return; // ignore non-entries of this.htmlElem
    }
    if (typeof remover !== 'function') {
      throw new TypeError('remover must be a function');
    }
    await this.#animateRemove(entry);
    return remover(entry);
  }

  /**
   * triggers and awaits the remove animation if any, else returns an empty promise
   */
  async #animateRemove(entry) {
    entry.classList.add(...this.cssClasses.removing);
    console.debug('animateRemove - awaiting', entry.getAnimations());
    const animationResult = await Promise.all(entry.getAnimations()
      .map((animation) => animation.finished));
    entry.classList.remove(...this.cssClasses.removing);
    return animationResult;
  }

  /**
   * @param {HTMLElement} entry - the entry to hide
   * @returns {Promise} - the entry that was hidden
   */
  hideEntry(entry) {
    this.removeEntry(entry, entry => entry.style.display = 'none');
  }

}
