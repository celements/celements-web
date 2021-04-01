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

(function (window, undefined) {
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
  if (typeof window.CELEMENTS === "undefined") { window.CELEMENTS = {}; }
  if (typeof window.CELEMENTS.mixins === "undefined") { window.CELEMENTS.mixins = {}; }
  if (typeof window.CELEMENTS.mixins.Event === 'undefined') {
    window.CELEMENTS.mixins.Event = Class.create({
      memo: undefined,
      stopped: undefined,
      eventName: undefined,

      initialize: function (eventName, memo) {
        const _me = this;
        _me.memo = memo;
        _me.eventName = eventName;
        _me.stopped = false;
      },

      stop: function () {
        const _me = this;
        _me.stopped = true;
      },

      findElement: function () {
        return undefined;
      }

    });
  }
  if (typeof window.CELEMENTS.mixins.Observable === 'undefined') {
    window.CELEMENTS.mixins.Observable = {
      _celEventHash: null,

      _getCelEventHash: function (eventKey) {
        const _me = this;
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

      celObserve: function (eventKey, callbackFN) {
        const _me = this;
        console.debug('cel celObserve: ', _me._celEventHash, eventKey, callbackFN);
        if (!eventKey) {
          throw "undefined eventKey in observe call ";
        }
        this._getCelEventHash(eventKey).push(callbackFN);
      },

      celStopObserving: function (eventKey, callbackFN) {
        const _me = this;
        console.debug('cel celStopObserving: ', _me._celEventHash, eventKey, callbackFN);
        if (!eventKey) {
          throw "undefined eventKey in celStopObserving call ";
        }
        this._getCelEventHash().set(eventKey, this._getCelEventHash(eventKey
        ).without(callbackFN));
      },

      celFire: function (eventKey, memo) {
        const _me = this;
        console.debug('cel celFire: ', _me._celEventHash, eventKey, memo);
        if (!eventKey) {
          throw "undefined eventKey in celObserve call ";
        }
        const event = new CELEMENTS.mixins.Event(eventKey, memo);
        this._getCelEventHash(eventKey).each(function (listenerFN) {
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
  }

  window.celOnBeforeLoadListenerArray = [];

  window.celAddOnBeforeLoadListener = function (listenerFunc) {
    celOnBeforeLoadListenerArray.push(listenerFunc);
  };

  window.celOnFinishHeaderListenerArray = [];

  window.celAddOnFinishHeaderListener = function (listenerFunc) {
    window.celOnFinishHeaderListenerArray.push(listenerFunc);
  };

  window.celFinishHeaderHandler = function () {
    $A(window.celOnFinishHeaderListenerArray).each(function (listener) {
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
    window.getCelDomain = function () {
      const hostName = window.location.host;
      return hostName.replace(/^www\./, '');
    };
  }

  if (typeof window.CELEMENTS.LoadingIndicator === 'undefined') {
    window.CELEMENTS.LoadingIndicator = Class.create({
      _loadingImg: undefined,

      initialize: function () {
        const _me = this;
        _me._loadingImg = new Hash();
      },

      getLoadingIndicator: function (isSmallOrPxSize) {
        const _me = this;
        let loaderType = 'ajax-loader-32px';
        if (typeof isSmallOrPxSize === 'boolean') {
          if (isSmallOrPxSize) {
            loaderType = 'ajax-loader-16px';
          }
        } else if (typeof isSmallOrPxSize === 'number') {
          loaderType = 'ajax-loader-' + isSmallOrPxSize + 'px';
        }
        if (!_me._loadingImg.get(loaderType)) {
          _me._loadingImg.set(loaderType, new Element('img', {
            'src': CELEMENTS.getUtils().getPathPrefix() + '/file/resources/celRes/spinner/'
              + loaderType + '.png',
            'class': 'editorLoading',
            'alt': 'loading...'
          }));
        }
        return _me._loadingImg.get(loaderType).clone();
      }

    });
  }

  if (typeof window.CELEMENTS.Utils === 'undefined') {
    window.CELEMENTS.Utils = Class.create({
      _srcOriginHost: undefined,

      getPathPrefix: function () {
        const _me = this;
        if (!_me._srcOriginHost) {
          let srcOriginHost = null;
          const scripts = document.getElementsByTagName('script');
          let len = scripts.length;
          const re = new RegExp('(https?://[^/]*)/(([^/]*/)*)resources/celJS/initCelements(.min)?\\.js(\\?.*)?$');
          let src;
          while (len--) {
            src = scripts[len].src;
            const srcMatches = src.match(re);
            if (src && srcMatches) {
              srcOriginHost = srcMatches[1];
              const prefixPath = srcMatches[2];
              const prefixPathSplit = prefixPath.split('/');
              const prefixStr = prefixPathSplit.splice(0, prefixPathSplit.length - 2).join('/');
              if (prefixStr != '') {
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

      convertFullNameToViewURL: function (fullName) {
        const _me = this;
        return _me.getPathPrefix()
          + ('/' + fullName.replace(/\./, '/')).replace(/\/Content\//, '/');
      }

    });

    const globalUtilsInstance = new window.CELEMENTS.Utils();

    window.CELEMENTS.getUtils = function () {
      return globalUtilsInstance;
    };
  }

  /**
   * getPathPrefix function
   * @deprecated Instead use window.CELEMENTS.getUtils().getPathPrefix()
   */
  if (typeof window.CELEMENTS.getPathPrefix === 'undefined') {
    window.CELEMENTS.getPathPrefix = function () {
      console.warn('deprecated call of window.CELEMENTS.getPathPrefix.'
        + ' Instead use window.CELEMENTS.getUtils().getPathPrefix()');
      return window.CELEMENTS.getUtils().getPathPrefix();
    };
  }

  /**
   * getCelHost function
   **/
  if (typeof window.getCelHost === 'undefined') {
    window.getCelHost = function () {
      let celHost = document.location + '?';
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

  if (typeof window.CELEMENTS.Ajax.Reconnector === 'undefined') {
    window.CELEMENTS.Ajax.Reconnector = Class.create({
      _htmlElem: undefined,
      _callbackOnSuccess: undefined,
      _reconnectWait: undefined,
      _reconnectorHandlerBind: undefined,
      _cancelAjaxOnTimeoutBind: undefined,
      _reconnectorExecuter: undefined,
      _reconnectWaitStart: undefined,
      _minReconnectWait: undefined,
      _maxReconnectWait: undefined,
      _url: undefined,
      _configObj: undefined,

      initialize: function (htmlElemId, callbackOnSuccess, configObj) {
        const _me = this;
        _me._htmlElem = $(htmlElemId);
        _me._configObj = configObj || {};
        _me._url = _me._configObj.url || window.getCelHost();
        _me._callbackOnSuccess = callbackOnSuccess;
        _me._reconnectorHandlerBind = _me._reconnectorHandler.bind(_me);
        _me._cancelAjaxOnTimeoutBind = _me._cancelAjaxOnTimeout.bind(_me);
        _me._minReconnectWait = _me._configObj.minReconnectWait || 10;
        _me._maxReconnectWait = _me._configObj.maxReconnectWait || 30;
        _me._reset();
      },

      _reset: function () {
        const _me = this;
        _me._reconnectWaitStart = _me._minReconnectWait;
      },

      setMinRecconectWait: function (minReconnectWait) {
        const _me = this;
        _me._minReconnectWait = minReconnectWait;
      },

      setMaxRecconectWait: function (maxReconnectWait) {
        const _me = this;
        _me._maxReconnectWait = maxReconnectWait;
      },

      _reconnectorHandler: function () {
        const _me = this;
        _me._reconnectWait--;
        if (_me._reconnectWait == 0) {
          _me._reconnectorExecuter.stop();
          const tryEv1 = _me._htmlElem.fire('celements:AjaxReconnectTrying', _me._reconnectWait);
          if (!tryEv1.stopped && !_me._configObj.skipRetryMsg) {
            let mesg = "Trying...";
            if (window.celMessages && window.celMessages.Reconnector) {
              mesg = window.celMessages.Reconnector.retryNotice;
            }
            _me._htmlElem.update(mesg);
          }
          _me._connectionTester();
        } else {
          const tryEv2 = _me._htmlElem.fire('celements:AjaxReconnectTrying', _me._reconnectWait);
          if (!tryEv2.stopped && !_me._configObj.skipRetryMsg) {
            let mesg = "Retrying in {} seconds.";
            if (window.celMessages && window.celMessages.Reconnector) {
              mesg = window.celMessages.Reconnector.retryDelayNotice;
            }
            mesg = mesg.replace('{}', _me._reconnectWait);
            _me._htmlElem.update(mesg);
            _me._htmlElem.fire('celements:AjaxReconnectFailed');
          }
        }
      },

      start: function () {
        const _me = this;
        _me._reconnectWait = _me._reconnectWaitStart;
        _me._reconnectorExecuter = new PeriodicalExecuter(_me._reconnectorHandlerBind, 1);
      },

      _cancelAjaxOnTimeout: function (ajaxCall) {
        if (!ajaxCall._complete) {
          ajaxCall.transport.abort();
        }
      },

      _connectionTester: function () {
        const _me = this;
        const connectionTestAjax = new Ajax.Request(_me._url, {
          'parameters': {
            'ajax': 1,
            'xpage': 'celements_ajax',
            'ajax_mode': 'pageTypeWithLayout',
            'overwriteLayout': 'SimpleLayout'
          },
          'onSuccess': function () {
            _me._reset();
            _me._reconnectorExecuter = null;
            _me._callbackOnSuccess();
            _me._htmlElem.fire('celements:AjaxReconnectSuccess');
          },
          'onFailure': function () {
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
    getParams: function (search) {
      const _me = this;
      search = search || window.location.search;
      let paramSplit = search.split(new RegExp('[?&]'))
      paramSplit.unshift(new Hash()); // add initial param as first array element
      return paramSplit.reduce(_me._splitUriSearch.bind(_me)) || new Hash();
    },

    joinParams: function (hash) {
      let paramsArray = [];
      $H(hash).each(function (pair) {
        const pairMapped = pair.value.map(function (elem) { return pair.key + '=' + encodeURI(elem) });
        paramsArray = paramsArray.concat(pairMapped);
      });
      return paramsArray.join('&');
    },

    _splitUriSearch: function (paramHash, elem) {
      let key = elem.split('=', 1);
      if ((key.length > 0) && (key[0].length > 0)) {
        key = key[0];
        const val = decodeURI(elem.substring(key.length + 1));
        if (!paramHash.get(key)) {
          paramHash.set(key, [val]);
        } else {
          paramHash.get(key).push(val);
        }
      }
      return paramHash;
    }
  });

  /**
   * celMessages functions and global variable
   */
  window.celMessages = {};
  window.celMessages.isLoaded = false;

  try {
    new Ajax.Request(window.getCelHost(), {
      method: 'post',
      parameters: {
        xpage: 'celements_ajax',
        ajax_mode: 'Messages'
      },
      onSuccess: function (transport) {
        if (transport.responseText.isJSON()) {
          let newMessages = transport.responseText.evalJSON();
          console.log('initCelements.js: finished getting dictionary messages.');
          newMessages.isLoaded = true;
          window.celMessages = newMessages;
          $(document.body).fire('cel:messagesLoaded', newMessages);
        } else {
          console.error('noJSON!!! ', transport.responseText);
        }
      }
    });
  } catch (exp) {
    console.error('Failed to get Cel-Messages async!', exp);
  }

  window.celExecOnceAfterMessagesLoaded = function (callbackFn) {
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
  if (typeof window.CELEMENTS.CssClassEventHandler === 'undefined') {
    window.CELEMENTS.CssClassEventHandler = Class.create({
      _htmlElement: undefined,
      _eventName: undefined,
      _cssSelector: undefined,
      _className: undefined,
      _actionFunction: undefined,
      _conditionFunction: undefined,
      _actionHandlerBind: undefined,

      initialize: function (htmlElement, eventName, cssSelector, className, actionFunction, condition) {
        const _me = this;
        _me._htmlElement = $(htmlElement);
        _me._eventName = eventName;
        _me._cssSelector = cssSelector;
        _me._className = className;
        _me._actionFunction = actionFunction;
        if (condition && !/\s|;/.test(condition)) {
          _me._conditionFunction = new Function('me', 'origin', 'return ' + condition + ';');
        }
        _me._actionHandlerBind = _me._actionHandler.bind(_me);
        _me._registerActionHandler();
      },

      _registerActionHandler: function () {
        const _me = this;
        Event.stopObserving(_me._htmlElement, _me._eventName, _me._actionHandlerBind);
        Event.observe(_me._htmlElement, _me._eventName, _me._actionHandlerBind);
        console.debug('EventHandler - register: ', _me._eventName, _me._cssSelector,
          _me._className, _me._actionFunction.name, _me._htmlElement);
      },

      _actionHandler: function (event) {
        const _me = this;
        _me._getTargetElements().each(function (targetElement) {
          if (!_me._conditionFunction || _me._conditionFunction(targetElement, _me._htmlElement)) {
            _me._actionFunction(targetElement, _me._className);
            console.debug('EventHandler -  upon', _me._eventName, 'action [',
              _me._actionFunction.name, _me._className, '] executed on', targetElement);
          } else {
            console.debug('EventHandler - action skipped for failed condition [',
              _me._conditionFunction, '] on ', targetElement);
          }
        });
      },

      _getTargetElements: function () {
        const _me = this;
        if (_me._cssSelector.startsWith('^')) { // match up the DOM from origin
          parent = _me._htmlElement.up(_me._cssSelector.substring(1));
          return parent ? [parent] : [];
        } else { // match in the whole DOM
          return $$(_me._cssSelector);
        }
      },

      unregister: function () {
        const _me = this;
        Event.stopObserving(_me._htmlElement, _me._eventName, _me._actionHandlerBind);
        console.debug('EventHandler - unregister: ', _me._eventName, _me._cssSelector,
          _me._className, _me._actionFunction.name, _me._htmlElement);
      }

    });
  }

  if (typeof window.CELEMENTS.EventManager === 'undefined') {
    window.CELEMENTS.EventManager = Class.create({
      _instructionRegex: new RegExp('([\\w:]+)([%+-])([\\w-]+):([^?]+)\\??(.+)?'),
      _actionFunctionMap: {
        // map may be extendend. also extend second group in instructionRegex accordingly
        '+': Element.addClassName,
        '-': Element.removeClassName,
        '%': Element.toggleClassName
      },
      _eventElements: undefined,
      _interpretDataCelEventBind: undefined,
      _contentChangedHandlerBind: undefined,
      updateCelEventHandlersBind: undefined,

      _intersectionObserver: undefined,
      _intersectionValues: [],

      initialize: function () {
        const _me = this;
        _me._eventElements = new Array();
        _me._interpretDataCelEventBind = _me._interpretDataCelEvent.bind(_me);
        _me._contentChangedHandlerBind = _me._contentChangedHandler.bind(_me);
        _me.updateCelEventHandlersBind = _me.updateCelEventHandlers.bind(_me);
        _me._intersectionObserver = new IntersectionObserver(function (entries) {
          entries.forEach(_me._handleIntersection.bind(_me));
        }, { threshold: [0, 0.5, 1] });
      },

      _splitDataCelEventList: function (dataValue) {
        let ret = new Array();
        if (dataValue) {
          // split single '&', avoid splitting double '&&' within condition string
          ret = dataValue.replace(/([^&])&([^&])/g, '$1#SPLIT#$2').split('#SPLIT#');
        }
        return ret;
      },

      _parseEventInstruction: function (instruction) {
        const _me = this;
        const parts = instruction.match(_me._instructionRegex) || [];
        const data = {
          eventName: parts[1],
          action: parts[2],
          className: parts[3],
          cssSelector: parts[4],
          condition: parts[5]
        };
        if (data.eventName && data.action && data.className && data.cssSelector) {
          return data;
        } else {
          throw "parseEventInstruction: unable to parse event instruction '" + instruction + "'";
        }
      },

      _createEventHandler: function (htmlElem, instruction) {
        const _me = this;
        const data = _me._parseEventInstruction(instruction);
        const actionFunction = _me._actionFunctionMap[data.action];
        if (actionFunction) {
          if (data.eventName.startsWith('cel:enter') || data.eventName.startsWith('cel:leave')) {
            _me._intersectionObserver.observe(htmlElem);
            console.debug('observing intersection: ', htmlElem);
          }
          return new window.CELEMENTS.CssClassEventHandler(htmlElem, data.eventName,
            data.cssSelector, data.className, actionFunction, data.condition);
        } else {
          throw "createEventHandler: unknown action '" + data.action + '"';
        }
      },

      _createEventElement: function (htmlElem) {
        const _me = this;
        const dataValue = htmlElem.readAttribute('data-cel-event');
        return {
          'htmlElem': htmlElem,
          'dataValue': dataValue,
          'eventHandlers': _me._splitDataCelEventList(dataValue).map(function (instruction) {
            try {
              return _me._createEventHandler(htmlElem, instruction);
            } catch (exp) {
              console.error('EventManager - interpretData: invalid instruction ', exp, htmlElem);
            }
          }).filter(Boolean)
        };
      },

      _interpretDataCelEvent: function (htmlElem) {
        const _me = this;
        const logPref = 'EventManager - interpretData: ';
        if (htmlElem.hasClassName('celOnEventInit')) {
          console.debug(logPref, 'skip already initialized: ', htmlElem);
        } else if (htmlElem.up('.cel_template')) {
          console.debug(logPref, 'skip template element: ', htmlElem);
        } else {
          const newElem = _me._createEventElement(htmlElem);
          if (newElem.eventHandlers.length > 0) {
            _me._eventElements.push(newElem);
            console.debug(logPref, 'new element ', htmlElem);
          } else {
            console.debug(logPref, 'no valid instructions found on ', htmlElem);
          }
          htmlElem.addClassName('celOnEventInit');
          htmlElem.fire('celEM:init');
        }
      },

      _handleIntersection: function (entry, idx) {
        const _me = this;
        const previous = _me._intersectionValues[idx] || { y: 0, ratio: 0 };
        const current = { y: entry.boundingClientRect.y, ratio: entry.intersectionRatio };
        const type = (entry.isIntersecting && current.ratio > previous.ratio) ? 'enter' : 'leave';
        const direction = (current.y > previous.y) ? 'up' : 'down';
        let ratio = entry.intersectionRatio;
        if (type === 'enter') {
          ratio = (ratio >= 1) ? ':full' : (ratio > 0.5) ? ':half' : '';
        } else {
          ratio = (ratio > 0.5) ? ':full' : (ratio > 0) ? ':half' : '';
        }
        let eventName = 'cel:' + type + ratio;
        console.debug('fire', eventName);
        entry.target.fire(eventName);
        eventName += ':' + direction;
        console.debug('fire', eventName);
        entry.target.fire(eventName);
        _me._intersectionValues[idx] = current;
      },

      _contentChangedHandler: function (event) {
        const _me = this;
        console.debug('EventManager - contentChanged ', event);
        _me.updateCelEventHandlers(event.memo.htmlElem);
      },

      updateCelEventHandlers: function (htmlContainer) {
        const _me = this;
        htmlContainer = htmlContainer || $(document.body);
        Event.stopObserving($(document.body), "celements:contentChanged",
          _me._contentChangedHandlerBind);
        Event.observe($(document.body), "celements:contentChanged", _me._contentChangedHandlerBind);
        _me._removeDisappearedElems();
        $(htmlContainer).select('.celOnEvent').each(_me._interpretDataCelEventBind);
      },

      _removeDisappearedElems: function () {
        const _me = this;
        for (let i = _me._eventElements.length - 1; i >= 0; i--) {
          const elem = _me._eventElements[i];
          const isInBody = $(document.body).contains(elem.htmlElem);
          const changedDataValue = (elem.htmlElem.readAttribute('data-cel-event') !== elem.dataValue);
          if (!isInBody || changedDataValue || !elem.htmlElem.hasClassName('celOnEventInit')) {
            elem.eventHandlers.each(function (handler) { handler.unregister(); });
            _me._eventElements.splice(i, 1);
            elem.htmlElem.removeClassName('celOnEventInit');
            console.debug('EventManager - removeDisappearedElem: ', elem);
          }
        }
      }

    });

    window.CELEMENTS.globalEventManager = new window.CELEMENTS.EventManager();
    celAddOnBeforeLoadListener(window.CELEMENTS.globalEventManager.updateCelEventHandlersBind);
  }
  /**
   *  END: celEventManager
   */

  /**
   *  celements form validations
   */
  let formValidations = new Hash();

  const registerValidation = function (formElem) {
    if (formElem && formElem.id) {
      const valid = new Validation(formElem, {
        immediate: true,
        useTitles: true,
        stopOnFirst: false
      });
      formValidations.set(formElem.id, valid);
    } else {
      console.error('failed to register validation on form with no id. ', formElem);
    }
  };

  celAddOnBeforeLoadListener(function () {
    $$('form.cel_form_validation').each(registerValidation);
    $(document.body).observe('cel_yuiOverlay:contentChanged', function (event) {
      const containerElem = event.findElement();
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
  window.celAddOnFinishHeaderListener(function () {
    //get google Account Number from Meta-Tags
    const metas = $$('meta[name="cel-GAA-Num"]');
    if ((metas.size() > 0) && (metas[0].content != '')) {
      const gaaNum = metas[0].content;

      (function (i, s, o, g, r, a, m) {
        i['GoogleAnalyticsObject'] = r; i[r] = i[r] || function () {
          (i[r].q = i[r].q || []).push(arguments);
        }, i[r].l = 1 * new Date(); a = s.createElement(o),
          m = s.getElementsByTagName(o)[0]; a.async = 1; a.src = g; m.parentNode.insertBefore(a, m);
      })(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');

      ga('create', gaaNum, window.getCelDomain());
      ga('set', 'anonymizeIp', true);
      ga('send', 'pageview');
      console.log('finish initalizing google universal analytics.', gaaNum);
    }
  });

  /**
   * Fluid Design image map support
   */
  celAddOnBeforeLoadListener(function () {
    if (typeof $j('img[usemap]').rwdImageMaps !== 'undefined') {
      $j('img[usemap]').rwdImageMaps();
    }
  });

  /**
   * Register default overlay opener for .cel_yuiOverlay cssSelector
   */
  celAddOnBeforeLoadListener(function () {
    if (CELEMENTS && CELEMENTS.presentation && CELEMENTS.presentation.getOverlayObj
      && CELEMENTS.presentation.getOverlayObj()) {
      CELEMENTS.presentation.getOverlayObj({
        'overlayLayout': 'SimpleLayout'
      }).registerOpenHandler();
    }
  });

  /**
   * Register default orientation css classes setter
   */
  let mobileDim = null;
  const cel_updateOrientationCSSclasses = function () {
    const innerWidth = mobileDim.getInnerWidth();
    const innerHeight = mobileDim.getInnerHeight();
    if (innerWidth > innerHeight) {
      $(document.body).removeClassName('cel_orientation_portrait');
      $(document.body).addClassName('cel_orientation_landscape');
    } else {
      $(document.body).removeClassName('cel_orientation_landscape');
      $(document.body).addClassName('cel_orientation_portrait');
    }
  };

  celAddOnBeforeLoadListener(function () {
    if (CELEMENTS && CELEMENTS.mobile && CELEMENTS.mobile.Dimensions) {
      mobileDim = new CELEMENTS.mobile.Dimensions();
      Event.stopObserving(window, "orientationchange", cel_updateOrientationCSSclasses);
      Event.observe(window, "orientationchange", cel_updateOrientationCSSclasses);
    }
  });

  /**
   * Register all Bootstrap-Multiselect
   */
  const cel_initAllMultiselect = function (event) {
    console.debug('initAllMultiselect');
    if ($j().multiselect != undefined) {
      $j('.celBootstrap,.celMultiselect').filter(":visible,.celForceMultiselect").each(function (index, element) {
        if (!$(element).up('.cel_template')) {
          console.debug('initAllMultiselect: ', element);
          cel_initAllMultiselect_element(element);
        }
      });
    } else {
      console.debug('initAllMultiselect: bootstrap multiselect undefined');
    }
  };

  /**
   * Sample with additional Attribute celBootstrap (single select):
   * <input type="text" class="celBootstrap" data-bootstrapConfig='{"enableCaseInsensitiveFiltering" : true, numberDisplayed" : 6}'>
   */
  const cel_initAllMultiselect_element = function (element) {
    let params = {
      numberDisplayed: 3,
      onDropdownHidden: cel_initAllMultiselect_onDropdownHidden,
      onChange: cel_initAllMultiselect_onChange
    };
    let bootstrapCfg = element.getAttribute('data-bootstrapConfig');
    // check deprecated data-multiselectAttr for backwards compatibility
    if (!bootstrapCfg && element.getAttribute('data-multiselectAttr')) {
      bootstrapCfg = element.getAttribute('data-multiselectAttr');
      console.warn('initAllMultiselect: deprecated data-multiselectAttr in use', element);
    }
    if (bootstrapCfg) {
      params = $j.extend(params, JSON.parse(bootstrapCfg));
    }
    const multiselect = $j(element).multiselect(params);
    $(document.body).fire('cel:multiselectInitialized', {
      'multiselect': multiselect
    });
  };

  const cel_initAllMultiselect_onDropdownHidden = function (event) {
    /*
     * FIXME: In Celements-framework the Multiselect disappears when the dropdown switched to hidden
     * this code is just a workaround, it set the box visible again
     */
    $j(event.target).css('display', '');
    event.target.fire("cel:multiselectOnDropdownHidden");
    /*
     * E.g. to read selected values:
       event.target.previous().select('option:selected').each(function(ele) {
         console.log('initCelements > onDropdownHidden > selected value: ', ele.value);
       });
     */
  };

  const cel_initAllMultiselect_onChange = function (option, checked, select) {
    const multiselectElement = this;
    console.debug('fire cel:multiselectOnChange on: ', multiselectElement);
    $(option[0]).fire("cel:multiselectOnChange", {
      'multiselect': multiselectElement,
      'checked': checked,
      'select': select
    });
  };

  const cel_initAllMultiselect_tabMenuPanel = function (event) {
    $('tabMenuPanel').select('.celBootstrap,.celMultiselect').each(function (element) {
      if (element.visible()) {
        element.addClassName('celForceMultiselect');
      }
    });
    cel_initAllMultiselect(event);
  };

  /**
   * Initialize Bootstrap Multiselect
   */
  celAddOnBeforeLoadListener(function () {
    $(document.body).stopObserving("cel:initMultiselect", cel_initAllMultiselect);
    $(document.body).stopObserving("celements:contentChanged", cel_initAllMultiselect);
    $(document.body).observe("cel:initMultiselect", cel_initAllMultiselect);
    $(document.body).observe("celements:contentChanged", cel_initAllMultiselect);
    if ($('tabMenuPanel')) {
      $('tabMenuPanel').stopObserving("tabedit:tabLoadingFinished", cel_initAllMultiselect_tabMenuPanel);
      $('tabMenuPanel').observe("tabedit:tabLoadingFinished", cel_initAllMultiselect_tabMenuPanel);
    }
    $(document.body).fire('cel:initMultiselect');
  });

  const cel_addMaxDimToFluidImg = function (event) {
    $$("img.cel_fluidresizeWidth").each(function (imgElem) {
      imgElem.setStyle({
        'maxWidth': imgElem.readAttribute('width') + 'px'
      });
    });
    $$("img.cel_fluidresizeHeight").each(function (imgElem) {
      imgElem.setStyle({
        'maxHeight': imgElem.readAttribute('height') + 'px'
      });
    });
  };

  /**
   * Initialize fluid image
   */
  celAddOnBeforeLoadListener(function () {
    $(document.body).stopObserving("cel:initFluidImage", cel_addMaxDimToFluidImg);
    $(document.body).stopObserving("celements:contentChanged", cel_addMaxDimToFluidImg);
    $(document.body).observe("cel:initFluidImage", cel_addMaxDimToFluidImg);
    $(document.body).observe("celements:contentChanged", cel_addMaxDimToFluidImg);
  });

  /**
   * Initialize close Window on Overlay CloseButton
   */
  celAddOnBeforeLoadListener(function () {
    $$(".generalOverlayWrapper .generalOverlay .exitOnClose").each(function (elem) {
      elem.stopObserving("click", cel_closeOverlayWindow)
      elem.observe("click", cel_closeOverlayWindow)
    });
  });

  const cel_closeOverlayWindow = function (event) {
    event.stop();
    window.close();
  };

})(window);
