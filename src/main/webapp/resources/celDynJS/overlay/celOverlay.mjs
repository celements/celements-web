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

import { CelOverlayResize } from "./overlayResize.mjs?version=202211202144";
import default from "../DynamicLoader/celLazyLoader.mjs?version=202211202144";

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
    this._loadingIndicator = new window.CELEMENTS.LoadingIndicator();
    this.idPrefix = idPrefix || "celOverlay_";
    this._id = this._generateNextId(this.idPrefix);
    let cssScripts = [{
        'isUrl' : true,
        'href' : '/file/OnePageLayout/WebHome/celementsOverlayV2.css'
      }];
    if (customCssFiles) {
      cssScripts.push(...customCssFiles);
    }
    this._addOverlayCssFiles(cssScripts);
  }

  _addOverlayCssFiles(customCssFiles) {
    for (const theCssFile in customCssFiles) {
      const cssLazyLoadElem = document.createElement('cel-lazy-load-css');
      cssLazyLoadElem.src = theCssFile.src ?? theCssFile.href;
      document.body.appendChild(cssLazyLoadElem);
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
    const _me = this;
    if (!_me._overlayResizer) {
      _me._overlayResizer= new CelOverlayResize(_me);
    }
    return _me._overlayResizer;
  }

  _showBgElem() {
    const _me = this;
    _me._getOverlayBgElem().hidden = false;
    _me._getOverlayBgElem().style.display = '';
  }

  _hideBgElem() {
    const _me = this;
    _me._getOverlayBgElem().hidden = true;
    _me._getOverlayBgElem().style.display = 'none';
  }

  _getOverlayBgElem() {
    const _me = this;
    if (!_me._overlayBgElem) {
      const bgDiv = document.createElement('div');
      bgDiv.classList.add('generalOverlay', 'OverlayBack');
      bgDiv.hidden = true;
      document.body.appendChild(bgDiv);
      _me._overlayBgElem = bgDiv;
    }
    return _me._overlayBgElem;
  }

  _showOverlayElem() {
    const _me = this;
    _me.getOverlayElem().hidden = false;
    _me.getOverlayElem().style.display = '';
  }

  _hideOverlayElem() {
    const _me = this;
    _me.getOverlayElem().hidden = true;
    _me.getOverlayElem().style.display = 'none';
  }

  getOverlayElem() {
    const _me = this;
    if (!_me._overlayElem) {
      const overlayElem = document.createElement('div');
      overlayElem.id = _me._id;
      overlayElem.classList.add('generalOverlay', _me.customCssClass);
      const layoutSec = document.createElement('div');
      layoutSec.classList.add('main', 'layoutsubsection');
      const closeButton = document.createElement('a');
      closeButton.classList.add('cel_closebutton');
      closeButton.addEventListener('click', () => _me.close);
      layoutSec.appendChild(closeButton);
      layoutSec.appendChild(_me.getOverlayBody());
      overlayElem.appendChild(layoutSec);
      overlayElem.hidden = true;
      document.body.appendChild(overlayElem);
      _me._overlayElem = overlayElem;
      _me.celFire('celOverlay:afterRender', {
        'overlayElem' : overlayElem,
        'overlay' : _me
      });
    }
    return _me._overlayElem;
  }

  getOverlayBody() {
    const _me = this;
    if (!_me._overlayBodyElem) {
      const bodyElem = document.createElement('div');
      bodyElem.classList.add('cel_overlaybody');
      _me._overlayBodyElem = bodyElem;
    }
    return _me._overlayBodyElem;
  }

  show() {
    const _me = this;
    _me._showBgElem();
    _me._showOverlayElem();
    _me.celFire('celOverlay:afterShow', _me);
    document.body.style.overflow = 'hidden';
  }

  open() {
    const _me = this;
    _me.resetContent();
    _me.show();
  }
  
  async openCelementsPage(url) {
    const _me = this;
    _me.open();
    if (url) {
      _me._getOverlayResizer.bind(_me).delay(0.5);
      await _me._loadContentAsync({
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
    const _me = this;
    const params = new FormData();
    params.append('xpage', 'json');
    await fetch(loadObj.url, {
      method: 'POST',
      redirect: 'follow',
      body: params
    }).then(resp => {
      console.debug('ajax result: ', resp);
      return resp.json();
    }).then(data => {
      _me.updateContent(_me._parseHTML(data[loadObj.responseField]));
      _me.title = loadObj.title(data);
    }).catch(err => {
      const event = _me.celFire('celOverlay:asyncLoadFailed', {
        'overlay' : _me,
        'error' : err
      });
      if (!event.stopped) {
        _me.updateContent(_me._parseHTML('<p class="celErrMessage">Loading failed.</p>'));
        console.warn('updateContent: failed to load content from ', loadObj.url, err);
      }
    });
  }
  
  _getLoadingImg() {
    const _me = this;
    const loaderimg = _me._loadingIndicator.getLoadingIndicator(64);
    Object.assign(loaderimg.style, {
      display : 'block',
      marginLeft : 'auto',
      marginRight : 'auto'
    });
    return loaderimg;
  }

  resetContent() {
    const _me = this;
    _me.updateContent([_me._getLoadingImg()]);
  }

  updateContent(newChildNodes) {
    const _me = this;
    console.debug('updateContent: ', newChildNodes);
    _me.getOverlayBody().replaceChildren(...newChildNodes);
    _me.getOverlayBody().fire('celements:contentChanged', {
       'htmlElem' : _me.getOverlayBody()
     });
    _me.celFire('celOverlay:contentChanged', _me);
  }

  close() {
    const _me = this;
    _me._hideBgElem();
    _me._hideOverlayElem();
    document.body.style.overflow = '';
    console.debug('Overlay close before fire');
    _me.celFire('celOverlay:closed', _me);
  }

}

window.CELEMENTS_Overlay = CelOverlay;
