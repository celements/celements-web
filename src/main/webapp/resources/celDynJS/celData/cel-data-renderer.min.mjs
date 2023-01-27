function _classPrivateMethodInitSpec(obj, privateSet) { _checkPrivateRedeclaration(obj, privateSet); privateSet.add(obj); }
function _classPrivateFieldInitSpec(obj, privateMap, value) { _checkPrivateRedeclaration(obj, privateMap); privateMap.set(obj, value); }
function _checkPrivateRedeclaration(obj, privateCollection) { if (privateCollection.has(obj)) { throw new TypeError("Cannot initialize the same private elements twice on an object"); } }
function _classPrivateMethodGet(receiver, privateSet, fn) { if (!privateSet.has(receiver)) { throw new TypeError("attempted to get private field on non-instance"); } return fn; }
function _classPrivateFieldGet(receiver, privateMap) { var descriptor = _classExtractFieldDescriptor(receiver, privateMap, "get"); return _classApplyDescriptorGet(receiver, descriptor); }
function _classApplyDescriptorGet(receiver, descriptor) { if (descriptor.get) { return descriptor.get.call(receiver); } return descriptor.value; }
function _classPrivateFieldSet(receiver, privateMap, value) { var descriptor = _classExtractFieldDescriptor(receiver, privateMap, "set"); _classApplyDescriptorSet(receiver, descriptor, value); return value; }
function _classExtractFieldDescriptor(receiver, privateMap, action) { if (!privateMap.has(receiver)) { throw new TypeError("attempted to " + action + " private field on non-instance"); } return privateMap.get(receiver); }
function _classApplyDescriptorSet(receiver, descriptor, value) { if (descriptor.set) { descriptor.set.call(receiver, value); } else { if (!descriptor.writable) { throw new TypeError("attempted to set read only private field"); } descriptor.value = value; } }
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
import './cel-data.min.mjs?version=202301171532';
var _htmlElem = /*#__PURE__*/new WeakMap();
var _template = /*#__PURE__*/new WeakMap();
var _insertEntry = /*#__PURE__*/new WeakSet();
export default class CelDataRenderer {
  constructor(htmlElem, template) {
    _classPrivateMethodInitSpec(this, _insertEntry);
    _classPrivateFieldInitSpec(this, _htmlElem, {
      writable: true,
      value: void 0
    });
    _classPrivateFieldInitSpec(this, _template, {
      writable: true,
      value: void 0
    });
    if (htmlElem == null) {
      throw new Error("missing htmlElem");
    }
    _classPrivateFieldSet(this, _htmlElem, htmlElem);
    if (template == null) {
      throw new Error("missing template");
    }
    _classPrivateFieldSet(this, _template, template);
    console.debug('CelDataRenderer init', this.htmlElem, this.template);
  }
  get htmlElem() {
    return _classPrivateFieldGet(this, _htmlElem);
  }
  get template() {
    return _classPrivateFieldGet(this, _template);
  }
  async render(dataPromise) {
    console.debug('render', this);
    this.htmlElem.replaceChildren();
    this.htmlElem.classList.remove('cel-data-rendered');
    this.htmlElem.classList.add('cel-data-rendering');
    try {
      const data = (await dataPromise) || [];
      data.forEach(entryData => _classPrivateMethodGet(this, _insertEntry, _insertEntry2).call(this, entryData));
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
}
function _insertEntry2(entryData) {
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