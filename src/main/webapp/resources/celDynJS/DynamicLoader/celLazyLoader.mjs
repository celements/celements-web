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
      window.celExecOnceAfterMessagesLoaded(this._setStartupTimeStamp.bind(this));
    }
  }

  _setStartupTimeStamp(celMessages) {
    this._startupTimeStamp = celMessages.celmeta.startupTimeStamp;
  }

  getScriptPath(pathName) {
    let scriptPath = pathName;
    if (scriptPath.indexOf('?') > 0) {
      scriptPath += '&';
    } else {
      scriptPath += '?';
    }
    if (!pathName.includes('version=')) {
      if ((scriptPath.split('/').length > 4) && scriptPath.match('/resources/')) {
        scriptPath += "version=" + this._startupTimeStamp;
      } else {
        scriptPath += "version=" + this._loadTimeStamp;
      }
    }
    return scriptPath;
  }

  jsIsLoaded(scriptURL) {
    let isLoaded = false;
    document.getElementsByTagName('script').forEach(function(loadedScript) {
      const scriptNewURLLink = new URL(scriptURL);
      console.debug('scriptIsLoaded: ', loadedScript.src, scriptNewURLLink);
      if (loadedScript.src === scriptNewURLLink.href) {
        isLoaded = true;
      }
    });
    console.log('scriptIsLoaded: return ', isLoaded, scriptURL);
    return isLoaded;
  }

  cssIsLoaded(scriptURL) {
    let isLoaded = false;
    document.querySelectorAll('link[rel=stylesheet]').forEach(function(loadedCss) {
      const cssNewUrlLink = new URL(scriptURL);
      console.debug('cssIsLoaded: ', loadedCss.href, cssNewUrlLink);
      if (loadedCss.href === cssNewUrlLink.href) {
        isLoaded = true;
      }
    });
    console.log('cssIsLoaded: return ', isLoaded, scriptURL);
    return isLoaded;
  }
}

/************************************************************
 * CelLazyLoaderJs loads the html-response of src attribute
 ************************************************************/
class CelLazyLoaderJs extends HTMLElement {
  /** class field definition and private fields only works for > Safari 14.5, Dec 2021,
   don't use it yet. '
  #lazyLoadUtils = new CelLazyLoaderUtils();
  #jsLoadedBind;
  #jsLoadedErrBind;
  */
  
  constructor() {
    super();
    this._lazyLoadUtils = new CelLazyLoaderUtils();
    this._jsLoadedBind = this._jsLoaded.bind(this);
    this._jsLoadedErrBind = this._jsLoadedErr.bind(this);
    this._loadJsScript();
  }

  _jsLoadedErr = function(message, source, lineno, colno, error) {
    const event = new CustomEvent('celements:jsFileLoaded', { 
      bubles: true,
      memo: {
       'jsFileSrc' : source,
       'successful' : false,
       'message' : message,
       'lineno' : lineno,
       'colno' : colno,
       'error' : error
    }});
    this.dispatchEvent(event);
  }

  _jsLoaded = function() {
    const event = new CustomEvent('celements:jsFileLoaded', { 
      bubles: true,
      memo: {
       'jsFileSrc' : this.getAttribute('src'),
       'successful' : true
    }});
    this.dispatchEvent(event);
  }

  _getType(jsFileSrc) {
    const jsFileUrl = new URL(jsFileSrc);
    if (jsFileUrl.pathname.endsWith('.mjs')) return 'module';
    return (this.getAttribute('type') || 'text/javascript');
  }

  _loadJsScript() {
    const me = this;
    const jsFileSrc = me._lazyLoadUtils.getScriptPath(this.getAttribute('src'))
    if (!this._lazyLoadUtils.jsIsLoaded(jsFileSrc)) {
        const newEle = document.createElement('script');
        Object.assign(newEle, {
           'type' : me._getType(jsFileSrc),
           'src' : me._lazyLoadUtils.getScriptPath(jsFileSrc)
        });
        const loadMode = this.getAttribute('loadMode');
        if (loadMode && (loadMode != 'sync')) {
          newEle.setAttribute(loadMode, '');
        }
        newEle.addEventListener('load', this._jsLoadedBind);
        newEle.addEventListener('error', this._jsLoadedErrBind);
        console.log('loadScripts insert ', newEle);
        document.head.appendChild(newEle);
    } else {
      console.debug('skip js file already loaded', jsFileSrc);
    }
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
  */
  
  constructor() {
    super();
    if (window.CELEMENTS.mixins.Observable) {
      Object.assign(this, window.CELEMENTS.mixins.Observable);
    }
    this._lazyLoadUtils = new CelLazyLoaderUtils();
    this._cssLoadedBind = this._cssLoaded.bind(this);
    this._cssLoadedErrBind = this._cssLoadedErr.bind(this);
    this._loadCssScript();
  }

  _cssLoadedErr = function(message, source, lineno, colno, error) {
    const event = new CustomEvent('celements:cssFileLoaded', { 
      bubles: true,
      memo: {
       'cssFileSrc' : source,
       'successful' : false,
       'message' : message,
       'lineno' : lineno,
       'colno' : colno,
       'error' : error
    }});
    this.dispatchEvent(event);
  }

  _cssLoaded = function() {
    const event = new CustomEvent('celements:cssFileLoaded', { 
      bubles: true,
      memo: {
       'cssFileSrc' : this.getAttribute('src'),
       'successful' : true
    }});
    this.dispatchEvent(event);
  }

  _loadCssScript() {
    const me = this;
    const cssFileSrc = this.getAttribute('src');
    if (!this._lazyLoadUtils.cssIsLoaded(cssFileSrc)) {
      const newEle = document.createElement('link');
      Object.assign(newEle, {
        'rel': 'stylesheet',
        'href': me._lazyLoadUtils.getScriptPath(cssFileSrc),
        'type': (this.getAttribute('type') || 'text/css'),
        'media': (this.getAttribute('media') || 'screen')
      });
      newEle.addEventListener('load', this._cssLoadedBind);
      newEle.addEventListener('error', this._cssLoadedErrBind);
      document.head.appendChild(newEle);
    } else {
      console.debug('skip css file already loaded', cssFileSrc);
    }
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
    this.classList.add('celLoadLazyLoading');
    this._fetchResponse = this._loadCell();
    this.attachShadow({mode: 'open'});
    this._loadingIndicator = new window.CELEMENTS.LoadingIndicator();
    this._showLoadingIndicator();
  }

  _loadCell() {
    return fetch(this.getAttribute('src'));
  }

  _parseHTML(html) {
    const elem = document.createElement('div');
    elem.insertAdjacentHTML('afterbegin', html);
    return Array.from(elem.childNodes);
  }

  _updateContent(newChildNodes) {
    console.debug('_updateContent: ', newChildNodes);
    for (let item of newChildNodes) {
      this.parentNode.insertBefore(item, this);
      const event = new CustomEvent('celements:contentChanged', { 
        bubles: true,
        memo: {
         'htmlElem' : item
      }});
      item.dispatchEvent(event);
    }
    this.remove();
  }

  _showLoadingIndicator() {
    const loaderSize = parseInt(this.getAttribute('size')) || 64;
    const loaderimg = this._loadingIndicator.getLoadingIndicator(loaderSize);
    Object.assign(loaderimg.style, {
      display : 'block',
      marginLeft : 'auto',
      marginRight : 'auto'
    });
    this.shadowRoot.appendChild(loaderimg);
  }

  connectedCallback() {
    const me = this;
    console.debug('connectedCallback: ', this._fetchResponse);
    me._fetchResponse
      .then(resp => resp.text())
      .then(function(txt){
        me._updateContent(me._parseHTML(txt));
      });
  }
}

if (!customElements.get('cel-lazy-load')) {
  customElements.define('cel-lazy-load', CelLazyLoader);
}
