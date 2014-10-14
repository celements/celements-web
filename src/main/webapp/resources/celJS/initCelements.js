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
      if (!this.options.asynchronous && this.transport.overrideMimeType)
        this.onStateChange();

    }
    catch (e) {
      this.dispatchException(e);
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
      this.responseText = String.interpret(transport.responseText);
      this.headerJSON   = this._getHeaderJSON();
    }

    if (readyState == 4) {
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

if (typeof getCelHost === 'undefined') {
var getCelHost = function() {
  var celHost = document.location + '?';
  celHost = celHost.substring(0, celHost.indexOf('?'));
  return celHost;
};
}

var celMessages = {};

(function(window, undefined) {
  "use strict";

  new Ajax.Request(getCelHost(), {
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

})(window);
