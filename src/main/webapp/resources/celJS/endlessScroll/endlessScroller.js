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
 * Celements endless scrolling
 * Allows to add an endless scrolling effect to an element.
 * id Id or Element with the growing content.
 * action Function to execute when scrolling reaches the bottom. As parameters the 
 *     function gets the growing element and a callback function to execute when the 
 *     added data is inserted. You can tell the callback function to stop or to go on.
 * params
 *   overlap When to start loading the next content in number of pixels before reaching 
 *       the bottom. (default = 0)
 *   isScrollBlockEle Whether the whole page should scroll or just a block (with overflow 
 *       scroll / auto). (default = if(overflow == visible) false else true)
 *   executeOnInit Execute action function once while initialising. (default = true)
 *   loadAllOnInit Execute action function untill it returnes false while initialising.
 *       (default = false)
 */
if(typeof CELEMENTS=="undefined"){var CELEMENTS={};};
if(typeof CELEMENTS.anim=="undefined"){CELEMENTS.anim={};};

(function(window, undefined) {
  "use strict";

  CELEMENTS.anim.EndlessScroll = function(id, action, params) {
    // constructor
    this._init(id, action, params);
  };

  CELEMENTS.anim.EndlessScroll.prototype = {
    htmlElem : undefined,
    action : undefined,
    overlap : undefined,
    isScrollBlockEle : undefined,
    loadAllOnInit : undefined,
    _elementHeight : undefined,
    _observer : undefined,
    _isLoading : undefined,
    _reloadDoneCallbackBind : undefined,
    _checkIsScrollBottomBind : undefined,
    
    _init : function(elemId, action, params) {
      var _me = this;
      _me._reloadDoneCallbackBind = _me.reloadDoneCallback.bind(_me);
      _me._checkIsScrollBottomBind = _me._checkIsScrollBottom.bind(_me);
      _me._isLoading = false;
      _me._elementHeight = 0;
      _me.loadAllOnInit = false;
      _me.overlap = 0;
      _me.htmlElem = $(elemId);
      if (_me.htmlElem) {
        var elemOverflow = _me.htmlElem.getStyle('overflow-y');
        if(elemOverflow == 'visible') {
          _me.isScrollBlockEle = false;
        } else {
          _me.isScrollBlockEle = true;
        }
        _me._elementHeight = Math.max(_me.htmlElem.scrollHeight, _me.htmlElem.getHeight());
        _me.action = action;
        _me.loadAllOnInit = (typeof(params) != 'undefined') 
            && (typeof(params.loadAllOnInit) != 'undefined') && params.loadAllOnInit;
        if(typeof(params) != 'undefined') {
          if(typeof(params.overlap) != 'undefined') {
            _me.overlap = params.overlap;
          }
          if(typeof(params.isScrollBlockEle) != 'undefined') {
            _me.isScrollBlockEle = params.isScrollBlockEle;
          }
        }
        if(((typeof(params) == 'undefined') || (typeof(params.executeOnInit) == 'undefined') 
            || params.executeOnInit) || _me.loadAllOnInit) {
          _me.isLoading = true;
          _me._executeActionCallback();
        }
        if(_me.isScrollBlockEle) {
          _me._observer = _me.htmlElem.observe('scroll', _me._checkIsScrollBottomBind);
        } else {
          _me._observer = Event.observe(window, 'scroll', _me._checkIsScrollBottomBind);
        }
      }
    },

    _executeActionCallback : function() {
      var _me = this;
      try {
        _me.action(_me.htmlElem, _me, _me._reloadDoneCallbackBind);
      } catch (exp) {
        if ((typeof console != 'undefined')
            && (typeof console.error != 'undefined')) {
          console.error('endlessScroller failed in action callback. ', exp);
        }
      }
    },

    _checkIsScrollBottom : function(event) {
      var _me = this;
      var pos = 0;
      if(_me.isScrollBlockEle) {
        pos = _me.htmlElem.scrollTop + _me.htmlElem.getHeight() - _me.htmlElem.scrollHeight;
      } else {
        pos = -1*_me.htmlElem.viewportOffset().top + window.innerHeight - _me.htmlElem.scrollHeight;
      }
      if((pos + _me.overlap) >= 0) {
        _me.isLoading = true;
        _me._executeActionCallback();
      }
    },
    
    reloadDoneCallback : function(keepObserving) {
      var _me = this;
      var maxHeight = Math.max(_me.htmlElem.scrollHeight, _me.htmlElem.getHeight());
      if(keepObserving || (((typeof(keepObserving) == 'undefined')
          || (keepObserving == null)) && (_me._elementHeight < maxHeight))) {
        if(_me.loadAllOnInit || (keepObserving && (_me._elementHeight - _me.overlap <= _me.htmlElem.getHeight()))) {
          _me._executeActionCallback();
        } else {
          _me.isLoading = false;
        }
      } else {
        if(_me.isScrollBlockEle) {
          _me.htmlElem.stopObserving('scroll', _me._checkIsScrollBottomBind);
        } else {
          Event.stopObserving(window, 'scroll', _me._checkIsScrollBottomBind);
        }
      }
      _me._elementHeight = Math.max(_me.htmlElem.scrollHeight, _me.htmlElem.getHeight());
    }

  };
})(window);