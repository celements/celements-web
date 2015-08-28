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

/**
 * Celements cookie helper class
 * This class allows to check if third party are allowed on the client.
 * 
 * usage:
 * config options
 * - thirdPartyURL: The third party URL checking for cookies and returning the result as 
 *     JSON in a postMessage
 * - (optional) frameId: ID for the iframe in which the third party URL gets loaded
 * - (optional) callback: the function which should be called after running the check
 * - (optional) cookiesEnabledMessageURL: URL to the content shown in an overlay message
 *     when using the default callback and third party cookies are enabled.
 * - (optional) cookiesDisabledMessageURL: URL to the content shown in an overlay message
 *     when using the default callback and third party cookies are disabled.
 * 
 * optional: when using the default callback function include before this js-file the 
 * following required components
css files for media="screen"
:celJS/yui/container/assets/skins/sam/container.css
:celJS/yui/button/assets/skins/sam/button.css
external js-files
:celJS/yui/yahoo/yahoo-min.js
:celJS/yui/dom/dom-min.js
:celJS/yui/event/event-min.js
:celJS/yui/element/element-min.js
:celJS/yui/button/button-min.js
:celJS/yui/container/container-min.js

 * Don't use setBody("...") on overlay dialog, instead set content of 
 * div with id="yuiOverlayContainer".
 */
if(typeof CELEMENTS=="undefined"){var CELEMENTS={};};
if(typeof CELEMENTS.cookie=="undefined"){CELEMENTS.cookie={};};

(function() {

//////////////////////////////////////////////////////////////////////////////
// Celements check third party cookies enabled class
//////////////////////////////////////////////////////////////////////////////
  CELEMENTS.cookie.CookiesEnabled = function(configObj) {
    // constructor
    configObj = configObj || {};
    this._init(configObj);
  };

(function() {
  var CCE = CELEMENTS.cookie.CookiesEnabled;

  CELEMENTS.cookie.CookiesEnabled.prototype = {
      _frameId : undefined,
      _thirdPartyURL : undefined,
      _cookiesDisabledMessageURL : undefined,
      _cookiesEnabledMessageURL : undefined,
      _callbackFucntion : undefined,
      
      _init : function(configObj) {
        var _me = this;
        configObj = configObj || {};
        _me._frameId = configObj.frameId || 'cel_checkThirdPartyCookiesEnabled';
        _me._thirdPartyURL = configObj.thirdPartyURL;
        _me._cookiesDisabledMessageURL = configObj.cookiesDisabledMessageURL;
        _me._cookiesEnabledMessageURL = configObj.cookiesEnabledMessageURL;
        _me._callbackFucntion = configObj.callback;
      },
      
      _defaultCallback : function(response) {
        var _me = this;
        var cookiesEnabled = response.data.thirdPartyCookiesEnabled;
        console.log('thirdPartyCookiesEnabled', cookiesEnabled);
        $(_me._frameId).remove();
        var overlayConf = {
            fixedcenter: true,
            close: true,
            additionalCssClass: 'testclass'
        };
        if(cookiesEnabled && _me._cookiesEnabledMessageURL) {
          overlayConf.overlayURL = _me._cookiesEnabledMessageURL;
        } else if(!cookiesEnabled && _me._cookiesDisabledMessageURL) {
          overlayConf.overlayURL = _me._cookiesDisabledMessageURL;
        }
        if(overlayConf.overlayURL) {
          var overlay = new CELEMENTS.presentation.Overlay();
          overlay.openCelPageInOverlay(overlayConf);
        }
      },
      
      checkIsThirdPartyCookiesEnabled : function(callback) {
        var _me = this;
        callback = callback || _me._callbackFucntion || _me._defaultCallback;
        if(_me._thirdPartyURL) {
          var url = _me._thirdPartyURL + '&domain=' + window.location.origin;
          var checkFrame = new Element('iframe', { id : _me._frameId, src : url });
          checkFrame.hide();
          $(document.body).insert(checkFrame);
          Event.observe(window, 'message', callback);
        } else {
          console.log('No external URL to check third party cookies configured.');
        }
      }
  };
})();

})();