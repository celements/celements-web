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

(function(window, undefined) {
  "use strict";

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
  if (typeof window.CELEMENTS=="undefined"){ window.CELEMENTS={};};
  if (typeof window.CELEMENTS.mixins=="undefined"){ window.CELEMENTS.mixins={};};
  window.CELEMENTS.mixins.Event = Class.create({
    memo : undefined,
    stopped : undefined,
    eventName : undefined,

    initialize : function(eventName, memo) {
      var _me = this;
      _me.memo = memo;
      _me.eventName = eventName;
      _me.stopped = false;
    },

    stop : function() {
      var _me = this;
      _me.stopped = true;
    },

    findElement : function() {
      return undefined;
    }

  });
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
      var _me = this;
      console.log('cel celObserve: ', _me._celEventHash, eventKey, callbackFN);
      if (!eventKey) {
        throw "undefined eventKey in observe call ";
      }
      this._getCelEventHash(eventKey).push(callbackFN);
    },

    celStopObserving : function(eventKey, callbackFN) {
      var _me = this;
      console.log('cel celStopObserving: ', _me._celEventHash, eventKey, callbackFN);
      if (!eventKey) {
        throw "undefined eventKey in celStopObserving call ";
      }
      this._getCelEventHash().set(eventKey, this._getCelEventHash(eventKey
          ).without(callbackFN));
    },

    celFire : function(eventKey, memo) {
      var _me = this;
      console.log('cel celFire: ', _me._celEventHash, eventKey, memo);
      if (!eventKey) {
        throw "undefined eventKey in celObserve call ";
      }
      var event = new CELEMENTS.mixins.Event(eventKey, memo);
      this._getCelEventHash(eventKey).each(function(listenerFN) {
        try {
          listenerFN(event);
        } catch (exp) {
          console.error('listener in celFire failed for event ', eventKey, listenerFN,
              exp);
        }
      });
      return event;
    }
  };

  /**
   * START: prototype AJAX CORS-fix für IE8 und IE9 (XDomainRequest object needed)
   **/
  if (typeof window.CELEMENTS.Ajax=="undefined"){ window.CELEMENTS.Ajax={};};
  if(window.Ajax && !window.CELEMENTS.Ajax_CORSfixInstalled) {
    window.Try = {
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

    window.Ajax.getCORS_Transport = function() {
      return Try.these(
        function() {return new XDomainRequest();},
        function() {return new XMLHttpRequest();},
        function() {return new ActiveXObject('Msxml2.XMLHTTP');},
        function() {return new ActiveXObject('Microsoft.XMLHTTP');}
      ) || false;
    };

    window.Ajax.Request.logging = false;
    window.Ajax.Request.addMethods({
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

    }).bind(window.Ajax.Request);

    window.Ajax.Response.addMethods({
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

    }).bind(window.Ajax.Response);

    window.CELEMENTS.Ajax_CORSfixInstalled = true;
  }

  /**
   * END: prototype AJAX CORS-fix für IE8 und IE9 (XDomainRequest object needed)
   **/

  window.celOnBeforeLoadListenerArray = [];

  window.celAddOnBeforeLoadListener = function(listenerFunc) {
    celOnBeforeLoadListenerArray.push(listenerFunc);
  };

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

  if(typeof window.CELEMENTS.LoadingIndicator === 'undefined') {
    window.CELEMENTS.LoadingIndicator = Class.create({
      _loadingImg : undefined,

      initialize : function() {
        var _me = this;
        _me._loadingImg = new Hash();
      },

      getLoadingIndicator : function(isSmall) {
        var _me = this;
        var loaderType = 'ajax-loader';
        if (isSmall) {
          loaderType = 'ajax-loader-small';
        }
        if (!_me._loadingImg.get(loaderType)) {
          _me._loadingImg.set(loaderType, new Element('img', {
            'src' : CELEMENTS.getUtils().getPathPrefix() + '/file/resources/celRes/' + loaderType + '.gif',
            'class' : 'editorLoading',
            'alt' : 'loading...'
          }));
        }
        return _me._loadingImg.get(loaderType).clone();
      }

    });
  }

  if(typeof window.CELEMENTS.Utils === 'undefined') {
    window.CELEMENTS.Utils = Class.create({
      _srcOriginHost : undefined,

      initialize : function() {
        var _me = this;
      },

      getPathPrefix : function() {
        var _me = this;
        if (!_me._srcOriginHost) {
          var srcOriginHost = null;
          var scripts = document.getElementsByTagName('script');
          var len = scripts.length;
          var re = new RegExp('(https?://[^/]*)/(([^/]*/)*)resources/celJS/initCelements\\.js(\\?.*)?$');
          var src;
          while (len--) {
            src = scripts[len].src;
            var srcMatches = src.match(re);
            if (src && srcMatches) {
              srcOriginHost = srcMatches[1];
              var prefixPath = srcMatches[2];
              var prefixPathSplit = prefixPath.split('/');
              var prefixStr = prefixPathSplit.splice(0, prefixPathSplit.length - 2).join('/');
              if(prefixStr != '') {
                srcOriginHost += '/' + prefixStr;
              }
              break;
            }
          }
          console.log('getPathPrefix computed prefixPath: ', srcOriginHost);
          _me._srcOriginHost = srcOriginHost;
        }
        return _me._srcOriginHost;
      },

      convertFullNameToViewURL : function(fullName) {
        var _me = this;
        return _me.getPathPrefix()
          + ('/' + fullName.replace(/\./, '/')).replace(/\/Content\//, '/');
      }

    });

    var globalUtilsInstance = new window.CELEMENTS.Utils();

    window.CELEMENTS.getUtils = function() {
      return globalUtilsInstance;
    };
  }

  /**
   * getPathPrefix function
   * @deprecated Instead use window.CELEMENTS.getUtils().getPathPrefix()
   */
  if (typeof window.CELEMENTS.getPathPrefix === 'undefined') {
    window.CELEMENTS.getPathPrefix = function() {
      console.warn('deprecated call of window.CELEMENTS.getPathPrefix.'
          + ' Instead use window.CELEMENTS.getUtils().getPathPrefix()');
      return window.CELEMENTS.getUtils().getPathPrefix();
    };
  }

  if (typeof window.CELEMENTS=="undefined"){ window.CELEMENTS={};};
  if (typeof window.CELEMENTS.Ajax.Reconnector === 'undefined') {
    window.CELEMENTS.Ajax.Reconnector = Class.create({
      _htmlElem : undefined,
      _callbackOnSuccess : undefined,
      _reconnectWait : undefined,
      _reconnectorHandlerBind : undefined,
      _cancelAjaxOnTimeoutBind : undefined,
      _reconnectorExecuter : undefined,
      _reconnectWaitStart : undefined,
      _minReconnectWait : undefined,
      _maxReconnectWait : undefined,
      _url : undefined,
      _configObj : undefined,

      initialize : function(htmlElemId, callbackOnSuccess, configObj) {
        var _me = this;
        _me._htmlElem = $(htmlElemId);
        _me._configObj = configObj || {};
        _me._url = _me._configObj.url || getCelHost();
        _me._callbackOnSuccess = callbackOnSuccess;
        _me._reconnectorHandlerBind = _me._reconnectorHandler.bind(_me);
        _me._cancelAjaxOnTimeoutBind = _me._cancelAjaxOnTimeout.bind(_me);
        _me._minReconnectWait = _me._configObj.minReconnectWait || 10;
        _me._maxReconnectWait = _me._configObj.maxReconnectWait || 30;
        _me._reset();
      },

      _reset : function() {
        var _me = this;
        _me._reconnectWaitStart = _me._minReconnectWait;
      },

      setMinRecconectWait : function(minReconnectWait) {
        var _me = this;
        _me._minReconnectWait = minReconnectWait;
      },

      setMaxRecconectWait : function(maxReconnectWait) {
        var _me = this;
        _me._maxReconnectWait = maxReconnectWait;
      },

      _reconnectorHandler : function() {
        var _me = this;
        _me._reconnectWait--;
        if (_me._reconnectWait == 0) {
          _me._reconnectorExecuter.stop();
          var tryEv = _me._htmlElem.fire('celements:AjaxReconnectTrying', _me._reconnectWait);
          if (!tryEv.stopped && !_me._configObj.skipRetryMsg) {
            var mesg = "Trying...";
            if (window.celMessages && window.celMessages.Reconnector) {
              mesg = window.celMessages.Reconnector.retryNotice;
            }
            _me._htmlElem.update(mesg);
          }
          _me._connectionTester();
        } else {
          var tryEv = _me._htmlElem.fire('celements:AjaxReconnectTrying', _me._reconnectWait);
          if (!tryEv.stopped && !_me._configObj.skipRetryMsg) {
            var mesg = "Retrying in {} seconds.";
            if (window.celMessages && window.celMessages.Reconnector) {
              mesg = window.celMessages.Reconnector.retryDelayNotice;
            }
            mesg = mesg.replace('{}', _me._reconnectWait);
            _me._htmlElem.update(mesg);
            _me._htmlElem.fire('celements:AjaxReconnectFailed');
          }
        }
      },

      start : function() {
        var _me = this;
        _me._reconnectWait = _me._reconnectWaitStart;
        _me._reconnectorExecuter = new PeriodicalExecuter(_me._reconnectorHandlerBind, 1);
      },

      _cancelAjaxOnTimeout : function(ajaxCall) {
        if (!ajaxCall._complete) {
          ajaxCall.transport.abort();
        }
      },

      _connectionTester : function() {
        var _me = this;
        var connectionTestAjax = new Ajax.Request(_me._url, {
          'parameters' : {
            'ajax' : 1,
            'xpage' : 'celements_ajax',
            'ajax_mode' : 'pageTypeWithLayout',
            'overwriteLayout' : 'SimpleLayout'
          },
          'onSuccess' : function() {
            _me._reset();
            _me._reconnectorExecuter = null;
            _me._callbackOnSuccess();
            _me._htmlElem.fire('celements:AjaxReconnectSuccess');
          },
          'onFailure' : function() {
            _me._reconnectWaitStart = Math.min(_me._reconnectWaitStart * 2,
                  _me._maxReconnectWait);
            _me.start();
          }
        });
        _me._cancelAjaxOnTimeoutBind.delay(10, connectionTestAjax);
      }

    });
  }

  window.CELEMENTS.UrlUtils = Class.create({
    getParams : function(search) {
      var _me = this;
      search = search || window.location.search;
      var paramSplit = search.split(new RegExp('[?&]'))
      paramSplit.unshift(new Hash()); // add initial param as first array element
      return paramSplit.reduce(_me._splitUriSearch.bind(_me)) || new Hash();
    },

    joinParams : function(hash) {
      var paramsArray = [];
      $H(hash).each(function(pair) {
        var pairMapped = pair.value.map(function(elem) { return pair.key + '=' + encodeURI(elem) });
        paramsArray = paramsArray.concat(pairMapped);
      });
      return paramsArray.join('&');
    },

    _splitUriSearch : function(paramHash, elem){
      var key = elem.split('=', 1);
      if((key.length > 0) && (key[0].length > 0)) {
        key = key[0];
        var val = decodeURI(elem.substring(key.length + 1));
        if(!paramHash.get(key)) {
          paramHash.set(key, [val]);
        } else {
          paramHash.get(key).push(val);
        }
      }
      return paramHash;
    }
  });

  /**
   * getCelHost function
   **/
  if (typeof window.getCelHost === 'undefined') {
    window.getCelHost = function() {
      var celHost = document.location + '?';
      if (document.location.pathname.indexOf('/skin/resources/') > -1) {
        celHost = celHost.substring(0, celHost.indexOf('/skin/resources/'));
      } else if (document.location.pathname.indexOf('/file/resources/') > -1) {
        celHost = celHost.substring(0, celHost.indexOf('/file/resources/'));
      } else {
        celHost = celHost.substring(0, celHost.indexOf('?'));
      }
      return celHost;
    };
  }

  /**
   * celMessages functions and global variable
   */
  window.celMessages = {};
  window.celMessages.isLoaded = false;

  try {
    var topFrame = top || window;
    new Ajax.Request(window.getCelHost(), {
      method : 'post',
      parameters : {
        xpage : 'celements_ajax',
        ajax_mode : 'Messages'
      },
      onSuccess : function(transport) {
        if (transport.responseText.isJSON()) {
          var newMessages = transport.responseText.evalJSON();
          if ((typeof console != 'undefined') && (typeof console.log != 'undefined')) {
            console.log('initCelements.js: finished getting dictionary messages.');
          }
          newMessages.isLoaded = true;
          window.celMessages = newMessages;
          $(document.body).fire('cel:messagesLoaded', newMessages);
        } else if ((typeof console != 'undefined') && (typeof console.error != 'undefined')) {
          console.error('noJSON!!! ', transport.responseText);
        }
      }
    });
  } catch (exp) {
    console.error('Failed to get Cel-Messages async!', exp);
  }

  window.celExecOnceAfterMessagesLoaded = function(callbackFn) {
    if (!window.celMessages.isLoaded) {
      $(document.body).stopObserving('cel:messagesLoaded', callbackFn);
      $(document.body).observe('cel:messagesLoaded', callbackFn);
    } else {
      callbackFn(window.celMessages);
    }
  };
 /**
  * END of celMessages
  */

  /**
   *  celEventManager
   */
  if(typeof window.CELEMENTS.CssClassEventHandler === 'undefined') {
    window.CELEMENTS.CssClassEventHandler = Class.create({
      _htmlElement : undefined,
      _eventName : undefined,
      _cssSelector : undefined,
      _className : undefined,
      _action : undefined,
  
      initialize : function(htmlElement, eventName, cssSelector, className, action) {
        var _me = this;
        _me._htmlElement = $(htmlElement);
        _me._eventName = eventName;
        _me._cssSelector = cssSelector;
        _me._className = className;
        _me._action = action;
        //TODO implement listener and action handler
        console.debug('create CssClassEventHanlder for ',htmlElement, eventName, cssSelector,
            className, action);
      }
  
    });
  }

  if(typeof window.CELEMENTS.EventManager === 'undefined') {
    window.CELEMENTS.EventManager = Class.create({
      _parseEventInstrRegex : new RegExp('([\\w:]+)([-+%])([\\w]+):(.+)'),
      _eventHandlerList : undefined,
      _interpretDataCelEventBind : undefined,
      registerCelEventHandlerBind : undefined,

      initialize : function() {
        var _me = this;
        _me._interpretDataCelEventBind = _me._interpretDataCelEvent.bind(_me);
        _me.registerCelEventHandlerBind = _me.registerCelEventHandler.bind(_me);

        _me._eventHandlerList = new Array();
        //TODO implement contentChanged/beforeLoad listener and implement updating eventHanlder
      },
      
      _splitDataCelEventList : function(dataAttribute) {
        var _me = this;
        return dataAttribute.split('&');
      },

      _parseEventInstruction : function(celEventInstruction) {
        var _me = this;
        var instrParts = celEventInstruction.match(_me._parseEventInstrRegex);
        if (instrParts.length == 5) {
          return { 
            'eventName' : instrParts[1],
            'action' : instrParts[2],
            'className' : instrParts[3],
            'cssSelector' : instrParts[4],
          };
        } else {
          throw "unable to parse event instruction '" + celEventInstruction + "'"; 
        }
      },

      _createEventHandler : function(htmlElem, celEventInstruction) {
        var _me = this;
        var eventInstrData = _me._parseEventInstruction(celEventInstruction);
        return new window.CELEMENTS.CssClassEventHandler(htmlElem, eventInstrData.eventName,
            eventInstrData.cssSelector, eventInstrData.className, eventInstrData.action);
      },

      _interpretDataCelEvent : function(htmlElem) {
        var _me = this;
        var instrAttr = htmlElem.dataset.celEvent;
        var newElem = {
            'htmlElem' : htmlElem,
            'dataValue' : instrAttr, 
            'eventHandler' : new Array()
        };
        var instrList = _me._splitDataCelEventList(instrAttr);
        for (var i = 0; i < instrList.length; i++) {
          try {
            newElem.eventHandler.push(_me._createEventHandler(htmlElem, instrList[i]));
          } catch(exp) {
            console.error('skipping invalid celEvent instruction: ', exp, htmlElem, newElem);
          }
        }
        //TODO prevent double initialization by adding celOnEventInitialized class
        _me._eventHandlerList.push(newElem);
      },

      registerCelEventHandler : function(htmlContainer) {
        var _me = this;
        var theContainerElem = htmlContainer || $(document.body);
        _me._removeDisappearedElem();
        $(theContainerElem).select('.celOnEvent').each(_me._interpretDataCelEventBind);
      },

      _removeDisappearedElem : function() {
        var _me = this;
        //TODO remove disappeared html elem on contentChange event
      }

    });

    window.CELEMENTS.globalEventManager = new window.CELEMENTS.EventManager();
    celAddOnBeforeLoadListener(window.CELEMENTS.globalEventManager.registerCelEventHandlerBind);
  }
  /**
   *  END: celEventManager
   */

  /**
   *  celements form validations
   */
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
   *  END: celements form validations
   */

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
      ga('set', 'anonymizeIp', true);
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

  /**
   * Register all Bootstrap-Multiselect
   */
  var cel_initAllMultiselect = function(event) {
    if($j().multiselect != undefined) {
      $$('.celMultiselect:not([style*="display: none"])').each(function(element) {
        /**
         * Sample with additional Attribute celMultiselect:
         * <input type="text" class="celMultiselect" data-multiselectAttr='{"enableCaseInsensitiveFiltering" : true, numberDisplayed" : 6}'>
         */
        var params = {
            numberDisplayed : 3,
            onDropdownHidden : function(event) {
              var element = event.target;
              /*
               * FIXME: In Celements-framework the Multiselect disappears when the dropdown switched to hidden
               * this code is just a workaround, it set the box visible again
               */
              var jElement = $j(event.target);
              jElement.css('display', '');
              element.fire("cel:multiselectOnDropdownHidden");
              /*
               * Bsp Read selected values:
                 element.previous().select('option:selected').each(function(ele) {
                   console.log('initCelements > onDropdownHidden > selected value: ', ele.value);
                 });
               */
            },
            onChange: function(option, checked, select) {
              $(option)[0].fire("cel:multiselectOnChange", {
                'multiselect' : this,
                'checked' : checked,
                'select' : select
              });
            }
        };
        var multiselectDataAttrObj = JSON.parse(element.getAttribute('data-multiselectAttr'));
        if(multiselectDataAttrObj) {
          params = $j.extend(params, multiselectDataAttrObj);
        }
        var multiselect = $j(element).multiselect(params);
        $(document.body).fire('cel:multiselectInitialized', {
          'multiselect' : multiselect
        });
      });
    }
  };

  var cel_addMaxDimToFluidImg = function(event) {
    $$("img.cel_fluidresizeWidth").each(function(imgElem) {
      imgElem.setStyle({
        'maxWidth' : imgElem.readAttribute('width') + 'px'
      });
    });
    $$("img.cel_fluidresizeHeight").each(function(imgElem) {
      imgElem.setStyle({
        'maxHeight' : imgElem.readAttribute('height') + 'px'
      });
    });
  };

  var cel_initDateTimePicker = function(event) {
    var dateTimePickerGenerator = new CELEMENTS.DATETIMEPICKER.DateTimePickerGenerator("body");
    dateTimePickerGenerator.generateDateTimePicker();
    $(document.body).stopObserving("celements:contentChanged", cel_initDateTimePicker);
    $(document.body).observe("celements:contentChanged", cel_initDateTimePicker);
  };

  /**
   * Initialize all Multiselect-Boxes
   */
  celAddOnBeforeLoadListener(function() {
    $(document.body).stopObserving("cel:initMultiselect", cel_initAllMultiselect);
    $(document.body).stopObserving("cel:initFluidImage", cel_addMaxDimToFluidImg);
    $(document.body).stopObserving("celements:contentChanged", cel_initAllMultiselect);
    $(document.body).stopObserving("celements:contentChanged", cel_addMaxDimToFluidImg);
    $(document.body).observe("cel:initMultiselect", cel_initAllMultiselect);
    $(document.body).observe("cel:initFluidImage", cel_addMaxDimToFluidImg);
    $(document.body).observe("celements:contentChanged", cel_initAllMultiselect);
    $(document.body).observe("celements:contentChanged", cel_addMaxDimToFluidImg);
    $(document.body).fire('cel:initMultiselect');
  });

  /**
   * Initialize all DateTimePicker
   */
  celAddOnBeforeLoadListener(function() {
    cel_initDateTimePicker();
  });

  /**
   * Initialize close Window on Overlay CloseButton
   */
  celAddOnBeforeLoadListener(function() {
    $$(".generalOverlayWrapper .generalOverlay .exitOnClose").each(function(elem) {
      elem.stopObserving("click", cel_closeOverlayWindow)
      elem.observe("click", cel_closeOverlayWindow)
    });
  });

  var cel_closeOverlayWindow = function(event) {
    event.stop();
    window.close();
  }

})(window);
