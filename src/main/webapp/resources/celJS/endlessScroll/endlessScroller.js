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
var scrollAnims = new Hash();

(function() {
CELEMENTS.anim.EndlessScroll = function(id, action, params) {
  // constructor
  this._init(id, action, params);
};

var CES = CELEMENTS.anim.EndlessScroll;

CELEMENTS.anim.EndlessScroll.prototype = {
  htmlElem : undefined,
  action : undefined,
  overlap : 0,
  isScrollBlockEle : undefined,
  loadAllOnInit : false,
  _elementHeight : 0,
  _observer : undefined,
  _isLoading : false,
  
  _init : function(elemId, action, params) {
    var _me = this;
    _me.htmlElem = $(elemId);
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
      } else {
        var elemOverflow = _me.htmlElem.getStyle('overflow-y');
        if(elemOverflow == 'visible') {
          _me.isScrollBlockEle = false;
        } else {
          _me.isScrollBlockEle = true;
        }
      }
    }
    if(((typeof(params) == 'undefined') || (typeof(params.executeOnInit) == 'undefined') 
        || params.executeOnInit) || _me.loadAllOnInit) {
      _me.isLoading = true;
      _me.action(_me.htmlElem, _me.reloadDoneCallback);
    }
    if(_me.isScrollBlockEle) {
      _me._observer = _me.htmlElem.observe('scroll', _me.checkIsScrollBottom);
    } else {
      _me._observer = Element.observe(window, 'scroll', _me.checkIsScrollBottom);
    }
    scrollAnims.set(_me.htmlElem, _me);
  },
  
  checkIsScrollBottom : function(event) {
    var _me = scrollAnims.get(event.element());
    var pos = 0;
    if(_me.isScrollBlockEle) {
      pos = _me.htmlElem.scrollTop + _me.htmlElem.getHeight() - _me.htmlElem.scrollHeight;
    } else {
      -1*_me.htmlElem.viewportOffset().top + window.innerHeight - _me.htmlElem.scrollHeight;
    }
    if((pos + _me.overlap) >= 0) {
      _me.isLoading = true;
      _me.action(_me.htmlElem, _me.reloadDoneCallback);
    }
  },
  
  reloadDoneCallback : function(keepObserving, _me) {
    if(keepObserving || (((typeof(keepObserving) == 'undefined') || (keepObserving == null)) && (_me._elementHeight < Math.max(_me.htmlElem.scrollHeight, _me.htmlElem.getHeight())))) {
      if(_me.loadAllOnInit || (keepObserving && (_me._elementHeight - _me.overlap <= _me.htmlElem.getHeight()))) {
        _me.action(_me.htmlElem, _me.reloadDoneCallback);
      } else {
        _me.isLoading = false;
      }
    } else {
      if(_me.isScrollBlockEle) {
        _me.htmlElem.stopObserving('scroll');
      } else {
        window.stopObserving('scroll');
      }
    }
    _me._elementHeight = Math.max(_me.htmlElem.scrollHeight, _me.htmlElem.getHeight());
  }
};
})();