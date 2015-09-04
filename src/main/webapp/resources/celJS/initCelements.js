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
 * START: patch for missing window.console object or methods
 **/
if (typeof window.console === 'undefined') {
  window.console = {};
}
if (typeof window.console.error === 'undefined') {
  window.console.error = Prototype.emptyFunction;
}
if (typeof window.console.warn === 'undefined') {
  window.console.warn = window.console.error;
}
if (typeof window.console.info === 'undefined') {
  window.console.info = window.console.warn;
}
if (typeof window.console.log === 'undefined') {
  window.console.log = window.console.info;
}
if (typeof window.console.debug === 'undefined') {
  window.console.debug = window.console.log;
}
/**
 * END: patch for missing window.console object or methods
 **/

/**
 * A generic javascript Object observer pattern
 */
(function(window, undefined) {
  "use strict";

  if (typeof window.CELEMENTS=="undefined"){ window.CELEMENTS={};};
  if (typeof window.CELEMENTS.mixins=="undefined"){ window.CELEMENTS.mixins={};};
  window.CELEMENTS.mixins.Observable = {
    _celEventHash : null,
  
    _getCelEventHash : function(eventKey) {
      var _me = this;
      if (!_me._celEventHash) {
        _me._celEventHash = new Hash();
      }
      if (eventKey) {
        if (!_me._celEventHash.get(eventKey)) {
          _me._celEventHash.set(eventKey, new Array());
        }
        return _me._celEventHash.get(eventKey);
      }
      return _me._celEventHash;
    },
  
    celObserve : function(eventKey, callbackFN) {
      console.log('cel celObserve: ', celEventHash, eventKey, callbackFN);
      var _me = this;
      if (!eventKey) {
        throw "undefined eventKey in observe call ";
      }
      this._getCelEventHash(eventKey).push(callbackFN);
    },
  
    celStopObserving : function(eventKey, callbackFN) {
      console.log('cel celStopObserving: ', celEventHash, eventKey, callbackFN);
      var _me = this;
      if (!eventKey) {
        throw "undefined eventKey in celStopObserving call ";
      }
      this._getCelEventHash().set(eventKey, this._getCelEventHash(eventKey
          ).without(callbackFN));
    },
  
    celFire : function(eventKey, memo) {
      console.log('cel celFire: ', celEventHash, eventKey, memo);
      var _me = this;
      if (!eventKey) {
        throw "undefined eventKey in celObserve call ";
      }
      this._getCelEventHash(eventKey).each(function(listenerFN) {
        try {
          listenerFN(_me, memo);
        } catch (exp) {
          console.error('listener in celFire failed for event ', eventKey, listenerFN, exp);
        }
      });
    }
  };
})(window);

/**
 * START: prototype AJAX CORS-fix für IE8 und IE9 (XDomainRequest object needed)
 **/
var Try = {
  logging : false, 
  these : function() {
    var returnValue = undefined;

    for (var i = 0, length = arguments.length; i < length; i++) {
      var lambda = arguments[i];
      try {
        returnValue = lambda();
        break;
      } catch (e) {
        if (Try.logging && (typeof console != 'undefined')
            && (typeof console.log != 'undefined')) {
          console.log('Try.these skip lambda ', lambda, e);
        }
      }
    }

    return returnValue;
  }
};

Ajax.getCORS_Transport = function() {
  return Try.these(
    function() {return new XDomainRequest();},
    function() {return new XMLHttpRequest();},
    function() {return new ActiveXObject('Msxml2.XMLHTTP');},
    function() {return new ActiveXObject('Microsoft.XMLHTTP');}
  ) || false;
};

Ajax.Request.logging = false;
Ajax.Request.addMethods({
  _status : undefined,
  _readyState : undefined,

  initialize : function($super, url, options) {
    $super(options);
    this.url = url;
    if (!this.isSameOrigin() || this.options.crossSite) {
      this.transport = Ajax.getCORS_Transport();
    } else {
      this.transport = Ajax.getTransport();
    }
    this.request(url);
  },

  request: function(url) {
    this.url = url;
    this.method = this.options.method;
    this._status = 0;
    if (!this.transport.setRequestHeader) {
      this.method = 'get';
    }
    var params = Object.isString(this.options.parameters) ?
          this.options.parameters :
          Object.toQueryString(this.options.parameters);

    if (!['get', 'post'].include(this.method)) {
      params += (params ? '&' : '') + "_method=" + this.method;
      this.method = 'post';
    }

    if (params && this.method === 'get') {
      this.url += (this.url.include('?') ? '&' : '?') + params;
    }

    this.parameters = params.toQueryParams();

    try {
      var response = new Ajax.Response(this);
      if (this.options.onCreate) this.options.onCreate(response);
      Ajax.Responders.dispatch('onCreate ', this, response);

      this.transport.open(this.method.toUpperCase(), this.url,
        this.options.asynchronous);

      if (this.options.asynchronous) this.respondToReadyState.bind(this).defer(1);

      this.transport.onprogress = Prototype.emptyFunction;
      this.transport.onreadystatechange = this.onStateChange.bind(this);
      this.transport.onload = this.onLoad.bind(this);
      this.transport.onerror = this.onError.bind(this);

      try {
        this.setRequestHeaders();
      } catch (exp) {
        if (Ajax.Request.logging && (typeof console != 'undefined')
            && (typeof console.warn != 'undefined')) {
          console.warn('setRequestHeaders failed ', this.url, exp);
        }
      }

      this.body = this.method == 'post' ? (this.options.postBody || params) : null;
      this.transport.send(this.body);

      /* Force Firefox to handle ready state 4 for synchronous requests */
      if (!this.options.asynchronous && this.transport.overrideMimeType) {
        this.onStateChange();
      }
    }
    catch (e) {
      this.dispatchException(e);
    }
  },

  onStateChange: function() {
    var readyState = this.transport.readyState;
    if (readyState > 1 && !((readyState == 4) && this._complete)) {
      try {
        if ((readyState == 4)) {
          this._status = this.transport.status || 400;
        }
      } catch (e) {
        //IE9 problem if ajax request gets aborted
        this._status = 400;
        this._readyState = 4;
        this._isAbortedBug = true;
      }
      this.respondToReadyState(readyState);
    }
  },
  
  onLoad : function() {
    this._status = this.transport.status || 200;
    this._readyState = this.transport.readyState || 4;
    if (!this._complete) {
      this.respondToReadyState(this._readyState);
    }
  },

  onError : function() {
    this._status = this.transport.status || 400;
    this._readyState = this.transport.readyState || 4;
    if (!this._complete) {
      this.respondToReadyState(4);
    }
  },

  getStatus: function() {
    if (!this._status) {
      this._status = this.transport.status;
    }
    try {
      if (this._status === 1223) return 204;
      return this._status || 0;
    } catch (exp) {
      if (Ajax.Request.logging && (typeof console != 'undefined')
          && (typeof console.warn != 'undefined')) {
        console.warn('failed to getStauts ', exp);
      }
      return 0;
    }
  }

}).bind(Ajax.Request);

Ajax.Response.addMethods({
  _status : undefined,

  initialize: function(request){
    this.request = request;
    var transport  = this.transport  = request.transport;
    var readyState = this.readyState = transport.readyState || request._readyState;
    this._status = request._status;

    if ((readyState > 2 && !Prototype.Browser.IE) || readyState == 4) {
      this.status       = this.getStatus();
      this.statusText   = this.getStatusText();
      if (request._isAbortedBug) {
        this.responseText = '';
      } else {
        this.responseText = String.interpret(transport.responseText);
        this.headerJSON   = this._getHeaderJSON();
      }
    }

    if ((readyState == 4) && !(request._isAbortedBug)) {
      var xml = transport.responseXML;
      this.responseXML  = Object.isUndefined(xml) ? null : xml;
      this.responseJSON = this._getResponseJSON();
    }
  },

  getStatus: Ajax.Request.prototype.getStatus

}).bind(Ajax.Response);

/**
 * END: prototype AJAX CORS-fix für IE8 und IE9 (XDomainRequest object needed)
 **/

var celOnBeforeLoadListenerArray = [];

var celAddOnBeforeLoadListener = function(listenerFunc) {
  celOnBeforeLoadListenerArray.push(listenerFunc);
};

(function(window, undefined) {
  "use strict";

  window.celOnFinishHeaderListenerArray = [];

  window.celAddOnFinishHeaderListener = function(listenerFunc) {
    window.celOnFinishHeaderListenerArray.push(listenerFunc);
  };

  window.celFinishHeaderHandler = function() {
    $A(window.celOnFinishHeaderListenerArray).each(function(listener) {
      try {
        listener();
      } catch (exp) {
        console.error('Failed to execute celOnFinishHeader listener. ', exp);
      }
    });
  };

  /**
   * getCelDomain function
   **/
  if (typeof window.getCelDomain === 'undefined') {
    window.getCelDomain = function() {
      var hostName = window.location.host;
      var domainName = hostName.replace(/^www\./, '');
      return domainName;
    };
  }

})(window);

/**
 * getCelHost function
 **/
if (typeof window.getCelHost === 'undefined') {
  window.getCelHost = function() {
    var celHost = document.location + '?';
    if (document.location.pathname.startsWith('/skin/resources/')) {
      celHost = celHost.substring(0, celHost.indexOf('/skin/resources/'));
    } else if (document.location.pathname.startsWith('/file/resources/')) {
      celHost = celHost.substring(0, celHost.indexOf('/file/resources/'));
    } else {
      celHost = celHost.substring(0, celHost.indexOf('?'));
    }
    return celHost;
  };
}

var celMessages = {};

(function(window, undefined) {
  "use strict";

  try {
    var topFrame = top || window;
    new Ajax.Request(topFrame.getCelHost(), {
      method : 'post',
      parameters : {
        xpage : 'celements_ajax',
        ajax_mode : 'Messages'
      },
      onSuccess : function(transport) {
        if (transport.responseText.isJSON()) {
          celMessages = transport.responseText.evalJSON();
          if ((typeof console != 'undefined') && (typeof console.log != 'undefined')) {
            console.log('initCelements.js: finished getting dictionary messages.');
          }
          $(document.body).fire('cel:messagesLoaded', celMessages);
        } else if ((typeof console != 'undefined') && (typeof console.error != 'undefined')) {
          console.error('noJSON!!! ', transport.responseText);
        }
      }
    });
  } catch (exp) {
    console.error('Failed to get Cel-Messages async!', exp);
  }

  var formValidations = new Hash();

  var registerValidation = function(formElem) {
    if (formElem && formElem.id) {
      var valid = new Validation(formElem, {
        immediate : true,
        useTitles : true,
        stopOnFirst : false
      });
      formValidations.set(formElem.id, valid);
    } else if ((typeof console != 'undefined') && (typeof console.error != 'undefined')) {
      console.error('failed to register validation on form with no id. ', formElem);
    }
  };

  celAddOnBeforeLoadListener(function() {
    $$('form.cel_form_validation').each(registerValidation);
    $(document.body).observe('cel_yuiOverlay:contentChanged', function(event) {
      var containerElem = event.findElement();
      if (containerElem) {
        containerElem.select('form.cel_form_validation').each(registerValidation);
      }
    });
  });

  /**
   * Google Analytics integration
   **/
  window.celAddOnFinishHeaderListener(function() {
    //get google Account Number from Meta-Tags
    var metas = $$('meta[name="cel-GAA-Num"]');
    if ((metas.size() > 0) && (metas[0].content != '')) {
      var gaaNum = metas[0].content;

      (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
        (i[r].q=i[r].q||[]).push(arguments);},i[r].l=1*new Date();a=s.createElement(o),
        m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m);
      })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

      ga('create', gaaNum, window.getCelDomain());
      ga('send', 'pageview');
      console.log('finish initalizing google universal analytics.', gaaNum);
    }
  });

  /**
   * Fluid Design image map support
   */
  celAddOnBeforeLoadListener(function() {
    if (typeof $j('img[usemap]').rwdImageMaps !== 'undefined') {
      $j('img[usemap]').rwdImageMaps();
    }
  });

  /**
   * Register default overlay opener for .cel_yuiOverlay cssSelector
   */
  celAddOnBeforeLoadListener(function() {
    if (CELEMENTS && CELEMENTS.presentation && CELEMENTS.presentation.getOverlayObj
        && CELEMENTS.presentation.getOverlayObj()) {
      CELEMENTS.presentation.getOverlayObj({
        'overlayLayout' : 'SimpleLayout'
      }).registerOpenHandler();
    }
  });

  /**
   * Register default orientation css classes setter
   */
  var mobileDim = null;
  var cel_updateOrientationCSSclasses = function() {
    var innerWidth = mobileDim.getInnerWidth();
    var innerHeight = mobileDim.getInnerHeight();
    if (innerWidth > innerHeight) {
      $(document.body).removeClassName('cel_orientation_portrait');
      $(document.body).addClassName('cel_orientation_landscape');
    } else {
      $(document.body).removeClassName('cel_orientation_landscape');
      $(document.body).addClassName('cel_orientation_portrait');
    }
  };

  celAddOnBeforeLoadListener(function() {
    if (CELEMENTS && CELEMENTS.mobile && CELEMENTS.mobile.Dimensions) {
      mobileDim = new CELEMENTS.mobile.Dimensions();
      Event.stopObserving(window, "orientationchange", cel_updateOrientationCSSclasses);
      Event.observe(window, "orientationchange", cel_updateOrientationCSSclasses);
    }
  });

})(window);
