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

import { CelOverlayResize } from "./overlayResize.mjs?version=202212031733";
import "../DynamicLoader/celLazyLoader.mjs?version=202212031733";

export class CelOverlay {
  /** class field definition and private fields only works for > Safari 14.5, Dec 2021,
   don't use it yet. '
  #id;
  #overlayElem;
  #overlayBodyElem;
  #overlayBgElem;
  #loadingIndicator;
  #overlayResizer;
  idPrefix;
  customCssClass;
  title;
  */

  constructor(customCssFiles, idPrefix) {
    Object.assign(this, window.CELEMENTS.mixins.Observable);
    this._isOpen = false;
    this._loadingIndicator = new window.CELEMENTS.LoadingIndicator();
    this.idPrefix = idPrefix || "celOverlay_";
    this._id = this._generateNextId(this.idPrefix);
    this._closeBind = this.close.bind(this);
    this._escapeHandlerBind = this._escapeHandler.bind(this);
    const cssFiles = [{
        'src' : '/file/resources/celRes/overlay/celementsOverlayV2.css'
      }];
    if (customCssFiles) {
      cssFiles.push(...customCssFiles);
    }
    this._addOverlayCssFiles(cssFiles);
  }

  _addOverlayCssFiles(cssFiles) {
    for (const theCssFile of cssFiles) {
      const cssSrc = theCssFile.src ?? theCssFile.href;
      if (cssSrc !== '') {
        const cssLazyLoadElem = document.createElement('cel-lazy-load-css');
        cssLazyLoadElem.setAttribute('src', cssSrc);
        document.body.appendChild(cssLazyLoadElem);
      } else {
        console.warn('CelOverlay skipping css file without source', theCssFile);
      }
    }
  }

  isMaxContentHeight() {
    //TODO make configurable
    return true;
  }

  _generateNextId(prefix) {
    let nextId = 1;
    while (document.getElementById(prefix + nextId.toString())) {
      nextId++;
    }
    return prefix + nextId.toString();
  }

  _getOverlayResizer() {
    if (!this._overlayResizer) {
      this._overlayResizer= new CelOverlayResize(this);
    }
    return this._overlayResizer;
  }

  _showBgElem() {
    this._getOverlayBgElem().hidden = false;
    this._getOverlayBgElem().style.display = '';
  }

  _hideBgElem() {
    this._getOverlayBgElem().hidden = true;
    this._getOverlayBgElem().style.display = 'none';
  }

  setZIndex(newZindex) {
    this.getOverlayElem().style.zIndex = newZindex;
    this._getOverlayBgElem().style.zIndex = newZindex - 1;
  }

  _getOverlayBgElem() {
    if (!this._overlayBgElem) {
      const bgDiv = document.createElement('div');
      bgDiv.classList.add('generalOverlay', 'overlayBack');
      bgDiv.hidden = true;
      bgDiv.style.display = 'none';
      document.body.appendChild(bgDiv);
      this._overlayBgElem = bgDiv;
    }
    return this._overlayBgElem;
  }

  _showOverlayElem() {
    this.getOverlayElem().hidden = false;
    this.getOverlayElem().style.display = '';
    this.getOverlayElem().focus();
  }

  _hideOverlayElem() {
    this.getOverlayElem().hidden = true;
    this.getOverlayElem().style.display = 'none';
  }

  getOverlayElem() {
    if (!this._overlayElem) {
      const overlayElem = document.createElement('div');
      overlayElem.tabIndex = -1;
      overlayElem.id = this._id;
      overlayElem.classList.add('generalOverlay', this.customCssClass);
      const layoutSec = document.createElement('div');
      layoutSec.classList.add('main', 'layoutsubsection');
      const closeButton = document.createElement('a');
      closeButton.classList.add('cel_closebutton');
      closeButton.addEventListener('click', this._closeBind);
      layoutSec.appendChild(closeButton);
      layoutSec.appendChild(this.getOverlayBody());
      overlayElem.appendChild(layoutSec);
      overlayElem.hidden = true;
      overlayElem.style.display = 'none';
      document.body.appendChild(overlayElem);
      this._overlayElem = overlayElem;
      this.celFire('celOverlay:afterRender', {
        'overlayElem' : overlayElem,
        'overlay' : this
      });
    }
    return this._overlayElem;
  }

  getOverlayBody() {
    if (!this._overlayBodyElem) {
      const bodyElem = document.createElement('div');
      bodyElem.classList.add('cel_overlaybody');
      this._overlayBodyElem = bodyElem;
    }
    return this._overlayBodyElem;
  }

  show() {
    this._showBgElem();
    this._showOverlayElem();
    this.celFire('celOverlay:afterShow', this);
    document.body.style.overflow = 'hidden';
  }

  _escapeHandler(ev) {
    if(ev.key === "Escape"){
      ev.preventDefault();
      ev.stopPropagation();
      this.close();
    }
  }

  _registerEscapeListener() {
    document.removeEventListener('keydown', this._escapeHandlerBind);
    document.addEventListener('keydown', this._escapeHandlerBind);
  }

  _unregisterEscapeListener() {
    document.removeEventListener('keydown', this._escapeHandlerBind);
  }

  open() {
    if (!this._isOpen) {
      this._isOpen = true;
      this._activeBeforeElem = document.activeElement;
      this.resetContent();
      this.show();
      this._registerEscapeListener();
      this._getOverlayResizer.bind(this).delay(0.5);
    } else {
      console.warn('skip "open" because overlay is already opened. Call "close" first');
    }
  }
  
  async openCelementsPage(url) {
    this.open();
    if (url) {
      await this._loadContentAsync({
       'url' : url,
        'responseField' : 'celrenderedcontent',
        'title' : data => (data.title || data.name)
      });
    }
  }
  
  _parseHTML(html) {
    const elem = document.createElement('div');
    elem.insertAdjacentHTML('afterbegin', html);
    return Array.from(elem.childNodes);
  }

  async _loadContentAsync(loadObj) {
    const params = new FormData();
    params.append('xpage', 'json');
    try {
      const response = await fetch(loadObj.url, {
        method: 'POST',
        redirect: 'follow',
        body: params
      });
      if (response.ok) {
        const data = await response.json() ?? {};
        this.updateContent(this._parseHTML(data[loadObj.responseField]));
        this.title = loadObj.title(data);
      } else {
        throw new Error('fetch failed: ', response.statusText);
      }
    } catch (error) {
      const event = this.celFire('celOverlay:asyncLoadFailed', {
        'overlay' : this,
        'error' : err
      });
      if (!event.stopped) {
        this.updateContent(this._parseHTML('<p class="celErrMessage">Loading failed.</p>'));
        console.warn('updateContent: failed to load content from ', loadObj.url, err);
      }
    }
  }
  
  _getLoadingImg() {
    const loaderimg = this._loadingIndicator.getLoadingIndicator(64);
    Object.assign(loaderimg.style, {
      display : 'block',
      marginLeft : 'auto',
      marginRight : 'auto'
    });
    return loaderimg;
  }

  resetContent() {
    this.updateContent([this._getLoadingImg()]);
  }

  updateContent(newChildNodes) {
    console.debug('updateContent: ', newChildNodes);
    this.getOverlayBody().replaceChildren(...newChildNodes);
    this.celFire('celOverlay:contentChanged', this);
  }

  close() {
    if (this._isOpen) {
      this._isOpen = false;
      this._unregisterEscapeListener();
      this._hideBgElem();
      this._hideOverlayElem();
      document.body.style.overflow = '';
      if (this._activeBeforeElem) {
        this._activeBeforeElem.focus();
      }
      console.debug('Overlay close before fire');
      this.celFire('celOverlay:closed', this);
    } else {
      console.warn('skip "close" because overlay is already closed. Call "open" first');
    }
  }

}

// For non module javascripts
window.CELEMENTS_Overlay = CelOverlay;
