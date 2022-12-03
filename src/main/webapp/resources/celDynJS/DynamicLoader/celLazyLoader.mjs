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

class CelLazyLoaderUtils {
  /** class field definition and private fields only works for > Safari 14.5, Dec 2021,
   don't use it yet. '
  #startupTimeStamp;
  #loadTimeStamp;
  */
  
  constructor() {
    this._loadTimeStamp = new Date().getTime();
    this._startupTimeStamp = this._loadTimeStamp;
    if (window.celExecOnceAfterMessagesLoaded) {
      window.celExecOnceAfterMessagesLoaded(
         celMessages => this._startupTimeStamp = celMessages.celmeta.startupTimeStamp);
    }
  }

  getScriptPath(pathName) {
    let scriptPath = pathName;
    if (!pathName.includes('version=')) {
      if (scriptPath.indexOf('?') > 0) {
        scriptPath += '&';
      } else {
        scriptPath += '?';
      }
      if ((scriptPath.split('/').length > 4) && scriptPath.includes('/resources/')) {
        scriptPath += "version=" + this._startupTimeStamp;
      } else {
        scriptPath += "version=" + this._loadTimeStamp;
      }
    }
    return scriptPath;
  }

  jsIsLoaded(scriptURL) {
    const scriptNewURLLink = new URL(scriptURL, window.location.href);
    const isLoaded = [...document.getElementsByTagName('script')]
      .some(script => script.src === scriptNewURLLink.href);
    console.debug('jsIsLoaded: return ', isLoaded, scriptURL);
    return isLoaded;
  }

  cssIsLoaded(scriptURL) {
    console.debug('cssIsLoaded ', scriptURL);
    const cssNewUrlLink = new URL(scriptURL, window.location.href);
    const isLoaded = [...document.querySelectorAll('link[rel=stylesheet]')]
      .some(loadedCss => loadedCss.href === cssNewUrlLink.href);
    console.log('cssIsLoaded: return ', isLoaded, scriptURL);
    return isLoaded;
  }

  fireLoaded = function(item, eventName) {
    item._reayState = 2;
    item._isSuccessfullLoaded = true;
    console.debug('fireLoaded', eventName, item);
    this.fireEvent(item, eventName, {
      'fileSrc' : item.getAttribute('src'),
      'successful' : true
    });
  }

  fireEvent(item, eventName, detail) {
    const event = new CustomEvent(eventName, {
      'bubbles' : true,
      'cancelable' : true,
      'detail' : detail
    });
    event.stopped = !item.dispatchEvent(event);
    return event;
  }

  fireLoadedErr = function(item, eventName, message, source, lineno, colno, error) {
    item._reayState = 2;
    item._isSuccessfullLoaded = false;
    this.fireEvent(item, eventName, {
       'fileSrc' : source,
       'successful' : false,
       'message' : message,
       'lineno' : lineno,
       'colno' : colno,
       'error' : error
    });
  }

  addRefireOnLoadedOrError(customElem, elem, eventName) {
    elem.addEventListener('load', () => this.fireLoaded(customElem, eventName));
    elem.addEventListener('error', (message, source, lineno, colno, error) => this.fireLoadedErr(
      customElem, eventName, message, source, lineno, colno, error));
  }

}

/************************************************************
 * CelLazyLoaderJs loads the html-response of src attribute
 ************************************************************/
class CelLazyLoaderJs extends HTMLElement {
  /** class field definition and private fields only works for > Safari 14.5, Dec 2021,
   don't use it yet. '
  #lazyLoadUtils = new CelLazyLoaderUtils();
  #readyState  // 0 = initalized , 1 = loading , 2 = loaded
  #isSuccessfullLoaded
  */
  
  constructor() {
    super();
    this._lazyLoadUtils = new CelLazyLoaderUtils();
    this._reayState = 0;
    this._isSuccessfullLoaded = null;
  }

  _getType(jsFileSrc) {
    const jsFileUrl = new URL(jsFileSrc, window.location.href);
    if (jsFileUrl.pathname.endsWith('.mjs')) {
      return 'module';
    }
    return (this.getAttribute('type') || 'text/javascript');
  }

  _addLoadMode(newEle) {
    const loadMode = this.getAttribute('loadMode');
    if (loadMode && (loadMode !== 'sync')) {
      newEle.setAttribute(loadMode, '');
    }
    return newEle;
  }

  _createJsElement(jsFileSrc) {
    const newEle = document.createElement('script');
    this._addLoadMode(newEle);
    newEle.type = this._getType(jsFileSrc);
    newEle.src = jsFileSrc;
    return newEle;
  }

  _loadJsScript() {
    const jsFileSrc = this._lazyLoadUtils.getScriptPath(this.getAttribute('src'))
    if (!this._lazyLoadUtils.jsIsLoaded(jsFileSrc)) {
      const newEle = this._createJsElement(jsFileSrc);
      this._lazyLoadUtils.addRefireOnLoadedOrError(this, newEle, 'celements:jsFileLoaded');
      console.debug('_loadJsScript insert ', newEle);
      this._reayState = 1;
      document.head.appendChild(newEle);
    } else {
      this._reayState = 2;
      console.debug('skip js file already loaded', jsFileSrc);
    }
  }

  connectedCallback() {
    console.log('CelLazyLoaderJs connectedCallback:', this);
    this._loadJsScript();
  }
}

if (!customElements.get('cel-lazy-load-js')) {
  customElements.define('cel-lazy-load-js', CelLazyLoaderJs);
}

/************************************************************
 * CelLazyLoaderCss loads the html-response of src attribute
 ************************************************************/
class CelLazyLoaderCss extends HTMLElement {
  /** class field definition and private fields only works for > Safari 14.5, Dec 2021,
   don't use it yet. '
  #lazyLoadUtils = new CelLazyLoaderUtils();
  #cssLoadedBind;
  #cssLoadedErrBind;
  #readyState  // 0 = initalized , 1 = loading , 2 = loaded
  #isSuccessfullLoaded
  */
  
  constructor() {
    super();
    this._lazyLoadUtils = new CelLazyLoaderUtils();
    this._reayState = 0;
    this._isSuccessfullLoaded = null;
  }

  _createCssElement(cssFileSrc) {
    const newEle = document.createElement('link');
    newEle.rel = 'stylesheet';
    newEle.href = cssFileSrc;
    newEle.type = (this.getAttribute('type') || 'text/css');
    newEle.media = (this.getAttribute('media') || 'screen');
    return newEle;
  }

  _loadCssScript() {
    const cssFileSrc = this._lazyLoadUtils.getScriptPath(this.getAttribute('src'));
    if (!this._lazyLoadUtils.cssIsLoaded(cssFileSrc)) {
      const newEle = this._createCssElement(cssFileSrc);
      this._lazyLoadUtils.addRefireOnLoadedOrError(this, newEle, 'celements:cssFileLoaded');
      console.debug('_loadCssScript insert ', newEle);
      this._reayState = 1;
      document.head.appendChild(newEle);
    } else {
      this._reayState = 2;
      console.debug('skip css file already loaded', cssFileSrc);
    }
  }

  connectedCallback() {
    this._loadCssScript();
  }
}

if (!customElements.get('cel-lazy-load-css')) {
  customElements.define('cel-lazy-load-css', CelLazyLoaderCss);
}

/*********************************************************
 * CelLazyLoader loads the html-response of src attribute
 *********************************************************/
class CelLazyLoader extends HTMLElement {
    
  constructor () {
    super();
    this._lazyLoadUtils = new CelLazyLoaderUtils();
    this.classList.add('celLoadLazyLoading');
    this._fetchResponse = this.src ? fetch(this.src) : null;
    this.attachShadow({ 'mode' : 'open' });
    this._loadingIndicator = new window.CELEMENTS.LoadingIndicator();
    this._showLoadingIndicator();
  }

  get src() {
    return this.getAttribute('src');
  }

  _parseHTML(html) {
    const template = document.createElement('template');
    template.insertAdjacentHTML('afterbegin', html);
    return [...template.childNodes];
  }

  _updateContent(newChildNodes) {
    console.debug('_updateContent: ', newChildNodes);
    const parent = this.parentNode;
    const fragment = new DocumentFragment();
    fragment.replaceChildren(...newChildNodes);
    parent.replaceChild(fragment, this);
    try {
      this._lazyLoadUtils.fireEvent(parent, 'celements:contentChanged', {
        'htmlElem': parent
      });
    } catch (exp) {
      console.error('contentChanged failed on ', parent, exp);
    }
  }

  _showLoadingIndicator() {
    const loaderSize = parseInt(this.getAttribute('size')) || 64;
    const loaderimg = this._loadingIndicator.getLoadingIndicator(loaderSize);
    loaderimg.style.display = 'block';
    loaderimg.style.marginLeft = 'auto';
    loaderimg.style.marginRight = 'auto';
    this.shadowRoot.appendChild(loaderimg);
  }

  async connectedCallback() {
    console.debug('connectedCallback', this, this._fetchResponse);
    let nodes = [];
    if (this._fetchResponse) {
      const response = await this._fetchResponse;
      if (response.ok) {
        nodes = this._parseHTML(await response.text());
      } else {
        console.error('fetch failed', response);
      }
    }
    this._updateContent(nodes);
  }
}

if (!customElements.get('cel-lazy-load')) {
  customElements.define('cel-lazy-load', CelLazyLoader);
}
