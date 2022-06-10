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
    const _me = this;
    _me._loadTimeStamp = new Date().getTime();
    _me._startupTimeStamp = _me._loadTimeStamp;
    if (window.celExecOnceAfterMessagesLoaded) {
      window.celExecOnceAfterMessagesLoaded(_me._setStartupTimeStamp.bind(_me));
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
    if ((scriptPath.split('/').length > 4) && scriptPath.match('/resources/')) {
      scriptPath += "version=" + this._startupTimeStamp;
    } else {
      scriptPath += "version=" + this._loadTimeStamp;
    }
    return scriptPath;
  }

  scriptIsLoaded(scriptURL) {
    let isLoaded = false;
    document.getElementsByTagName('script').forEach(function(loadedScript) {
      //as long as new URL() is not available in IE use a-Element
      const scriptNewURLLink = new URL(scriptURL);
      console.log('scriptIsLoaded: ', loadedScript.src, scriptNewURLLink);
      if (loadedScript.src === scriptNewURLLink.href) {
        isLoaded = true;
      }
    });
    console.log('scriptIsLoaded: return ', isLoaded, scriptURL);
    return isLoaded;
  }
}

export class CelLazyLoaderJs {
  /** class field definition and private fields only works for > Safari 14.5, Dec 2021,
   don't use it yet. '
  #lazyLoadUtils = new CelLazyLoaderUtils();
  #scriptLoading;
  #scriptQueue;
  */
  
  constructor() {
    const _me = this;
    if (window.CELEMENTS.mixins.Observable) {
      Object.assign(_me, window.CELEMENTS.mixins.Observable);
    }
    _me._lazyLoadUtils = new CelLazyLoaderUtils();
    _me._scriptQueue = [];
    _me._scriptLoading = false;
  }

  loadScripts(jsFiles) {
    const _me = this;
    const scriptLoaded = function() {
      _me._scriptLoading = false;
      _me.loadScripts();
    };
    if (!_me._scriptLoading && (_me._scriptQueue.size() > 0)) {
      const loadScript = _me._scriptQueue.first();
      _me._scriptQueue = _me._scriptQueue.slice(1); // remove first element
      if (loadScript.isUrl) {
        const newEle = document.createElement('script');
        Object.assign(newEle, {
           'type' : (loadScript.type || 'text/javascript'),
           'src' : _me._lazyLoadUtils.getScriptPath(loadScript.src || loadScript.value)
         });
         new Date().getTime()
        newEle.addEventListener('load', scriptLoaded);
        newEle.addEventListener('error', scriptLoaded);
        _me._scriptLoading = true;
        console.log('loadScripts insert ', newEle);
        document.head.appendChild(newEle);
      } else {
        console.warn('loadScripts: skiping ', loadScript);
      }
    } else if (jsFiles && (jsFiles.size() > 0)) {
      _me._scriptQueue.push(...jsFiles);
      _me.loadScripts();
    }
    _me._loadScriptsCheckFinished();
  }

  _loadScriptsCheckFinished() {
    const _me = this;
    if (!_me._scriptLoading && _me._scriptQueue.size() <= 0) {
      console.log('_loadScriptsCheckFinished: _loadScriptsCheckFinished firing lazyLoad:scriptsLoaded');
      _me.celFire('lazyLoader:scriptsLoaded');
    }
    console.log('_loadScriptsCheckFinished: finish');
  }
}

export class CelLazyLoaderCss {
  /** class field definition and private fields only works for > Safari 14.5, Dec 2021,
   don't use it yet. '
  #lazyLoadUtils = new CelLazyLoaderUtils();
  #cssLoading;
  #cssQueue;
  */
  
  constructor() {
    const _me = this;
    if (window.CELEMENTS.mixins.Observable) {
      Object.assign(_me, window.CELEMENTS.mixins.Observable);
    }
    _me._lazyLoadUtils = new CelLazyLoaderUtils();
    _me._cssQueue = [];
    _me._cssLoading = false;
  }

  cssIsLoaded(script) {
    const _me = this;
    let isLoaded = false;
    document.querySelectorAll('link[rel="stylesheet"]').forEach(function(loadedScript) {
      if (loadedScript.href === _me.getTMCelDomain() + script) {
        isLoaded = true;
      }
    });
    return isLoaded;
  }

  loadCssScripts(cssFiles) {
    const _me = this;
    const cssLoaded = function() {
      _me._cssLoading = false;
      _me.loadCssScripts();
    };
    if (!_me._cssLoading && (_me._cssQueue.size() > 0)) {
      const loadCss = _me._cssQueue.first();
      _me._cssQueue = _me._cssQueue.slice(1); // remove first element
      if (loadCss.isUrl) {
        const newEle = document.createElement('link');
        Object.assign(newEle, {
          'rel': 'stylesheet',
          'href': _me._lazyLoadUtils.getScriptPath(loadCss.href || loadCss.value),
          'type': (loadCss.type || 'text/css'),
          'media': (loadCss.media || 'screen')
        });
        newEle.addEventListener('load', cssLoaded);
        newEle.addEventListener('error', cssLoaded);
        _me._cssLoading = true;
        document.head.appendChild(newEle);
      } else {
        console.warn('loadCssScripts: skiping ', loadScript);
      }
    } else if (cssFiles && (cssFiles.size() > 0)) {
      _me._cssQueue.push(...cssFiles);
      _me.loadCssScripts();
    }
  }
}

/************************************************************************
 * CelLazyLoader loads the html-response of URL into the given cellToLoad
 ************************************************************************/

class CelLazyLoader extends HTMLElement{
    
  constructor () {
    super();
    this.classList.add('celLoadLazyLoading');
    this._fetchResponse = this._loadCell();
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

  connectedCallback() {
    console.debug('connectedCallback: ', this._fetchResponse);
    this._fetchResponse
      .then(resp => resp.text())
      .then(function(txt){
        console.debug('connectedCallback fetchResponse then: ', txt);
        this._updateContent(this._parseHTML(txt));
      });

  }
}

if (!customElements.get('celLazyLoad')) {
  customElements.define('cel-lazy-load', CelLazyLoader);
}
