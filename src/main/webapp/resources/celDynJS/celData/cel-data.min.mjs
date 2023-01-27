function _classPrivateFieldInitSpec(obj, privateMap, value) { _checkPrivateRedeclaration(obj, privateMap); privateMap.set(obj, value); }
function _checkPrivateRedeclaration(obj, privateCollection) { if (privateCollection.has(obj)) { throw new TypeError("Cannot initialize the same private elements twice on an object"); } }
function _classPrivateFieldGet(receiver, privateMap) { var descriptor = _classExtractFieldDescriptor(receiver, privateMap, "get"); return _classApplyDescriptorGet(receiver, descriptor); }
function _classApplyDescriptorGet(receiver, descriptor) { if (descriptor.get) { return descriptor.get.call(receiver); } return descriptor.value; }
function _classPrivateFieldSet(receiver, privateMap, value) { var descriptor = _classExtractFieldDescriptor(receiver, privateMap, "set"); _classApplyDescriptorSet(receiver, descriptor, value); return value; }
function _classExtractFieldDescriptor(receiver, privateMap, action) { if (!privateMap.has(receiver)) { throw new TypeError("attempted to " + action + " private field on non-instance"); } return privateMap.get(receiver); }
function _classApplyDescriptorSet(receiver, descriptor, value) { if (descriptor.set) { descriptor.set.call(receiver, value); } else { if (!descriptor.writable) { throw new TypeError("attempted to set read only private field"); } descriptor.value = value; } }
var _rootElem = /*#__PURE__*/new WeakMap();
var _updateHandler = /*#__PURE__*/new WeakMap();
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
  constructor() {
    super();
    _classPrivateFieldInitSpec(this, _rootElem, {
      writable: true,
      value: void 0
    });
    _classPrivateFieldInitSpec(this, _updateHandler, {
      writable: true,
      value: void 0
    });
    _classPrivateFieldSet(this, _updateHandler, event => this.updateData(event.detail));
  }
  get isDebug() {
    return this.hasAttribute('debug');
  }
  get field() {
    return this.getAttribute('field') || undefined;
  }
  connectedCallback() {
    var _this$closest, _classPrivateFieldGet2;
    _classPrivateFieldSet(this, _rootElem, (_this$closest = this.closest('.cel-data-root')) !== null && _this$closest !== void 0 ? _this$closest : this);
    (_classPrivateFieldGet2 = _classPrivateFieldGet(this, _rootElem)) === null || _classPrivateFieldGet2 === void 0 ? void 0 : _classPrivateFieldGet2.addEventListener('celData:update', _classPrivateFieldGet(this, _updateHandler));
    console.debug('connected', this, 'listening to', _classPrivateFieldGet(this, _rootElem));
  }
  disconnectedCallback() {
    var _classPrivateFieldGet3;
    (_classPrivateFieldGet3 = _classPrivateFieldGet(this, _rootElem)) === null || _classPrivateFieldGet3 === void 0 ? void 0 : _classPrivateFieldGet3.removeEventListener('celData:update', _classPrivateFieldGet(this, _updateHandler));
    _classPrivateFieldSet(this, _rootElem, null);
    console.debug('disconnected', this);
  }
  updateData(data) {
    var _data$this$field;
    console.debug('updateData', this, data);
    this.replaceChildren();
    this.insertAdjacentHTML('beforeend', (_data$this$field = data === null || data === void 0 ? void 0 : data[this.field]) !== null && _data$this$field !== void 0 ? _data$this$field : this.isDebug ? `{'${this.field}' is undefined}` : '');
  }
}
export class CelDataDateTime extends CelData {
  constructor() {
    super();
  }
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
    const value = data === null || data === void 0 ? void 0 : data[this.field];
    let formatted;
    try {
      formatted = this.formatter.format(new Date(value));
    } catch (error) {
      console.warn('error formatting date', error, value);
    }
    super.updateData({
      [this.field]: formatted
    });
  }
}
export class CelDataLink extends CelData {
  constructor() {
    super();
  }
  get target() {
    var _this$getAttribute;
    return (_this$getAttribute = this.getAttribute('target')) !== null && _this$getAttribute !== void 0 ? _this$getAttribute : '';
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
    const value = data === null || data === void 0 ? void 0 : data[this.field];
    if (value) {
      link.href = value;
      link.target = this.target;
    } else {
      link.removeAttribute('href');
    }
  }
}
export class CelDataImage extends CelData {
  constructor() {
    super();
  }
  get srcFallback() {
    var _this$getAttribute2;
    return (_this$getAttribute2 = this.getAttribute('src-fallback')) !== null && _this$getAttribute2 !== void 0 ? _this$getAttribute2 : '';
  }
  get alt() {
    var _this$getAttribute3;
    return (_this$getAttribute3 = this.getAttribute('alt')) !== null && _this$getAttribute3 !== void 0 ? _this$getAttribute3 : '';
  }
  get loading() {
    var _this$getAttribute4;
    return (_this$getAttribute4 = this.getAttribute('loading')) !== null && _this$getAttribute4 !== void 0 ? _this$getAttribute4 : '';
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
    img.src = (data === null || data === void 0 ? void 0 : data[this.field]) || this.srcFallback;
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