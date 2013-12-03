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
 * YUI Overlay Celements presentation Slideshow
 * This is the Celements presentation Slideshow controller.
 */
if(typeof CELEMENTS=="undefined"){var CELEMENTS={};};
if(typeof CELEMENTS.presentation=="undefined"){CELEMENTS.presentation={};};

(function() {

  var CPCY_SlideShowObj = undefined;

  getCelSlideShowObj = function() {
    return CPCY_SlideShowObj;
  };

  /**
   * prepare the one and only SlideShow for yuiOverlays
   */
  $j(document).ready(function() {
    if (!CPCY_SlideShowObj) {
      CPCY_SlideShowObj = new CELEMENTS.presentation.SlideShow();
    }
    var bodyElem = $$('body')[0];
    bodyElem.observe('cel_yuiOverlay:afterShowDialog_General',
        CPCY_SlideShowObj._registerOnOpenOverlayCheckerBind);
  });

//////////////////////////////////////////////////////////////////////////////
// Celements presentation Slideshow
//////////////////////////////////////////////////////////////////////////////
CELEMENTS.presentation.SlideShow = function(containerId) {
  containerId = containerId || 'yuiOverlayContainer';
  // constructor
  this._init(containerId);
};

(function() {
  var CPCYOSS = CELEMENTS.presentation.SlideShow;

  CELEMENTS.presentation.SlideShow.prototype = {
      _htmlContainerId : undefined,
      _htmlContainer : undefined,
      _overwritePageLayout : 'SimpleLayout',
      _preloadSlideImagesHash : new Hash(),
      _nextElements : [],
      _prevElements : [],
      _navObj : undefined,
      _registerOnOpenOverlayCheckerBind : undefined,
      _imgLoadedResizeAndCenterSlideBind : undefined,
      _centerSlide : true,
      _autoresize : false,

      _init : function(containerId) {
        var _me = this;
        _me._htmlContainerId = containerId;
        _me._htmlContainer = $(_me._htmlContainerId);
        _me._navObj = new CELEMENTS.presentation.Navigation(_me._preloadSlide.bind(_me),
            _me._showSlide.bind(_me));
        _me._registerOnOpenOverlayCheckerBind = _me._registerOnOpenOverlayChecker.bind(
            _me);
        _me._imgLoadedResizeAndCenterSlideBind = _me._imgLoadedResizeAndCenterSlide.bind(
            _me);
      },

      getHtmlContainer : function() {
        var _me = this;
        return _me._htmlContainer;
      },

      _registerOnOpenOverlayChecker : function(event) {
        var _me = this;
        var bodyElem = $$('body')[0];
        var checkRegisterEvent = bodyElem.fire('cel_slideShow:shouldRegister', {
           'origEvent' : event,
           'slideShow' : _me
         });
        if (checkRegisterEvent.stopped) {
          _me.register();
        }
      },

      register : function() {
        var _me = this;
        if (!_me._htmlContainer) {
          // late initialization needed in overlay
          _me._htmlContainer = $(_me._htmlContainerId);
        }
        if (_me._htmlContainer) {
          if (typeof initContextMenuAsync !== 'undefined') {
            _me._htmlContainer.observe('cel_yuiOverlay:contentChanged',
                initContextMenuAsync);
            initContextMenuAsync();
          }
          if (typeof registerCelAnimMoviePlayer !== 'undefined') {
            _me._htmlContainer.observe('cel_yuiOverlay:contentChanged',
                registerCelAnimMoviePlayer);
            registerCelAnimMoviePlayer();
          }
          _me._htmlContainer.observe('cel_yuiOverlay:contentChanged',
              _me._registerNavLinks.bind(_me));
          _me._registerNavLinks();
          _me._htmlContainer.observe('cel_slideShow:preloadContentFinished',
              _me._preloadSlideImages.bind(_me));
        } else {
          if ((typeof console != 'undefined') && (typeof console.warn != 'undefined')) {
            console.warn('register slideshow failed. Reason: container with id "'
                + _me._htmlContainerId + '" not found!');
          }
        }
      },

      _convertFullNameToViewURL : function(fullName) {
        var _me = this;
        return _me._navObj._convertFullNameToViewURL(fullName);
      },

      loadMainSlides : function(spaceName, startAtIndexOrName, callbackFN) {
        var _me = this;
        callbackFN = callbackFN || function(jsonObj) {};
        new Ajax.Request(getCelHost(), {
          method: 'post',
          parameters: {
            'xpage' : 'celements_ajax',
            'ajax_mode' : 'getMainSlides',
            'spaceName' : spaceName
          },
          onSuccess: function(transport) {
            if (transport.responseText.isJSON()) {
              var jsonObj = transport.responseText.evalJSON();
              var startAtIndex = startAtIndexOrName;
              if (typeof(startAtIndexOrName) === 'string') {
                startAtIndex = jsonObj.indexOf(spaceName + '.' +startAtIndexOrName);
              }
              _me._navObj._setAllSlides(jsonObj, startAtIndex);
              callbackFN(jsonObj);
            } else {
              if ((typeof console != 'undefined') && (typeof console.error != 'undefined')) {
                console.error('getSubSlides returns no Json: ', transport.responseText);
              }
            }
          }
        });
      },

      loadSubSlides : function(parentFN, startAtIndex, callbackFN) {
        var _me = this;
        callbackFN = callbackFN || function(jsonObj) {};
        new Ajax.Request(_me._convertFullNameToViewURL(parentFN), {
          method: 'post',
          parameters: {
            'xpage' : 'celements_ajax',
            'ajax_mode' : 'getSubSlides'
          },
          onSuccess: function(transport) {
            if (transport.responseText.isJSON()) {
              var jsonObj = transport.responseText.evalJSON();
              _me._navObj._setAllSlides(jsonObj, startAtIndex);
              callbackFN(jsonObj);
            } else {
              if ((typeof console != 'undefined') && (typeof console.error != 'undefined')) {
                console.error('getSubSlides returns no Json: ', transport.responseText);
              }
            }
          }
        });
      },

      _registerNavLinks : function() {
        var _me = this;
        _me._registerNext();
        _me._registerPrev();
        _me._registerDirectLinks();
      },

      _registerNext : function() {
        var _me = this;
        _me._nextElements = _me._htmlContainer.select('.celPresSlideShow_next');
        _me._nextElements.each(function(nextElem) {
          var nextSlideFunc = _me._navObj.nextSlide.bind(_me._navObj);
          nextElem.stopObserving('click', nextSlideFunc);
          nextElem.observe('click', nextSlideFunc);
        });
      },

      _registerPrev : function() {
        var _me = this;
        _me._prevElements = _me._htmlContainer.select('.celPresSlideShow_prev');
        _me._prevElements.each(function(prevElem) {
          var prevSlideFunc = _me._navObj.prevSlide.bind(_me._navObj);
          prevElem.stopObserving('click', prevSlideFunc);
          prevElem.observe('click', prevSlideFunc);
        });
      },

      _gotoSlide : function(event) {
        var _me = this;
        event.stop();
        var fullName = event.element().id.split(':')[2];
        var gotoIndex = _me._navObj.indexOf(fullName);
        if (gotoIndex >= 0) {
          _me._navObj.gotoSlide(gotoIndex);
        } else {
          if ((typeof console != 'undefined') && (typeof console.error != 'undefined')) {
            console.error('_gotoSlide failed. Index not found for: ', fullName);
          }
        }
      },

      _registerDirectLinks : function() {
        var _me = this;
        _me._htmlContainer.select('.celPresSlideShow_navigation').each(function(navElem) {
          navElem.select('a').each(function(navLink) {
            navLink.stopObserving('click', _me._gotoSlide.bind(_me));
            navLink.observe('click', _me._gotoSlide.bind(_me));
          });
        });
      },

      setAutoresize : function(doAutoResize) {
        var _me = this;
        _me._autoresize = doAutoResize;
      },

      setOverwritePageLayout : function(overwritePageLayout) {
        var _me = this;
        if (overwritePageLayout && (overwritePageLayout != '')) {
          _me._overwritePageLayout = overwritePageLayout;
        }
      },

      setCenterSlide : function(isCenterSlide) {
        var _me = this;
        _me._centerSlide = isCenterSlide;
      },

      _preloadSlide : function(slideFN, callbackFN) {
        var _me = this;
        callbackFN = callbackFN || function(newSlideContent) {};
        var params = {
          'xpage' : 'celements_ajax',
          'ajax_mode' : 'pageTypeWithLayout',
          'ajax' : '1'
        };
        if (_me._overwritePageLayout != '') {
          params['overwriteLayout'] = _me._overwritePageLayout;
        }
        new Ajax.Request(_me._convertFullNameToViewURL(slideFN), {
          method: 'post',
          parameters: params,
          onSuccess: function(transport) {
            _me._htmlContainer.fire('cel_slideShow:preloadContentFinished', {
              'theSlideShow' : _me,
              'slideFN' : slideFN,
              'responseText' : transport.responseText
            });
            callbackFN(transport.responseText);
            _me._htmlContainer.fire('cel_slideShow:preloadFinished', {
              'theSlideShow' : _me,
              'slideFN' : slideFN,
              'responseText' : transport.responseText
            });
          }
        });
      },

      _preloadSlideImages : function(event) {
        var _me = this;
        var preLoadSlide = event.memo;
        if (!_me._preloadSlideImagesHash.get(preLoadSlide.slideFN)) {
          var preloadElem = new Element('div').update(preLoadSlide.responseText);
          var imgsArray = preloadElem.select('img');
//          console.log('preloadElem: ', preloadElem, imgsArray.toArray());
          _me._preloadSlideImagesHash.set(preLoadSlide.slideFN, preloadElem);
          _me._htmlContainer.fire('cel_slideShow:afterPreloadImages', {
            'theSlideShow' : _me,
            'slideFN' : preLoadSlide.slideFN,
            'images' : imgsArray.toArray()
          });
        }
        
      },

      _getSlideWrapper : function() {
        var _me = this;
        return _me.getHtmlContainer().down('.cel_sideShow_slideWrapper');
      },

      _centerCurrentSlide : function() {
        var _me = this;
        _me._getSlideWrapper().setStyle({
          'position' : 'absolute',
          'width' : 'auto',
          'height' : 'auto',
          'top' : 0,
          'marginLeft' : 0,
          'marginRight' : 0
        });
        var wrapperWidth = $j(_me._getSlideWrapper()).width();
        var wrapperHeight = $j(_me._getSlideWrapper()).height();
//        var containerWidth = $j(_me._htmlContainer).width();
        var containerHeight = $j(_me._htmlContainer).height();
        var wrapperTop = (containerHeight - wrapperHeight) / 2;
        _me._getSlideWrapper().setStyle({
          'position' : 'relative',
          'margin' : '0',
          'marginLeft' : 'auto',
          'marginRight' : 'auto',
          'top' : wrapperTop + 'px',
          'width' : wrapperWidth + 'px',
          'height' : wrapperHeight + 'px'
        });
      },

      _imgLoadedResizeAndCenterSlide : function(imgElem, event) {
        var _me = this;
        imgElem.stopObserving('load', _me._imgLoadedResizeAndCenterSlideBind);
        _me._resizeAndCenterSlide();
      },

      _resizeAndCenterSlide : function() {
        _me._resizeCurrentSlide();
        if (_me._centerSlide) {
          var centerSlideEvent = _me._htmlContainer.fire('cel_slideShow:centerSlide',
              _me);
          if (!centerSlideEvent.stopped) {
            _me._centerCurrentSlide();
          }
        }
      },

      _resizeCurrentSlide : function() {
        var _me = this;
        if (_me._autoresize) {
          var zoomFactor = _me._computeZoomFactor();
          if (zoomFactor <= 1) {
            console.log('_resizeCurrentSlide: ', _me._htmlContainer, _me._getSlideWrapper(), zoomFactor);
            var oldWidth = parseInt(_me._getSlideWrapper().getWidth());
            var oldHeight = parseInt(_me._getSlideWrapper().getHeight());
            newHeight = oldHeight * zoomFactor;
            newWidth = oldWidth * zoomFactor;
            var eventMemo = {
                'fullWidth' : oldWidth,
                'fullHeight' : oldHeight,
                'zoomFactor' : zoomFactor,
                'newWidth' : newWidth,
                'newHeight' : newHeight
            };
            if ((typeof console != 'undefined') && (typeof console.log != 'undefined')) {
              console.log('final resize factor: ', eventMemo);
            }
            var resizeEvent = _me._htmlContainer.fire(
                'cel_slideShow:resizeSlideContent', eventMemo);
            if (!resizeEvent.stopped) {
              _me._getSlideWrapper().setStyle({
                'zoom' : zoomFactor,
                'transform' : 'scale(' + zoomFactor + ')',
                'transformOrigin' : '0 0 0',
                'height' : oldHeight + 'px',  // important for FF
                'width' : oldWidth + 'px' // important for FF
              });
            }
          } else {
            if ((typeof console != 'undefined') && (typeof console.log != 'undefined')) {
              console.log('no resize needed.', zoomFactor);
            }
          }
        }
      },

      _computeZoomFactor : function() {
        var _me = this;
        var oldWidth = parseInt(_me._getSlideWrapper().getWidth());
        var newWidth = oldWidth;
        if (oldWidth > _me._htmlContainer.getWidth()) {
          newWidth = _me._htmlContainer.getWidth();
        }
        var zoomWidthFactor = newWidth / oldWidth;
        var oldHeight = parseInt(_me._getSlideWrapper().getHeight());
        var newHeight = oldHeight;
        if (oldHeight > _me._htmlContainer.getHeight()) {
          newHeight = _me._htmlContainer.getHeight();
        }
        var zoomHeightFactor = newHeight / oldHeight;
        var zoomFactor;
        if (zoomHeightFactor < zoomWidthFactor) {
          zoomFactor = zoomHeightFactor;
        } else {
          zoomFactor = zoomWidthFactor;
        }
        return zoomFactor;
      },

      _showSlide : function(slideContent) {
        var _me = this;
        _me._htmlContainer.fire('cel_yuiOverlay:beforeContentChanged', _me);
        var slideWrapperElem = new Element('div').addClassName(
            'cel_sideShow_slideWrapper').setStyle({
          'position' : 'relative'
        }).update(slideContent);
        _me._htmlContainer.update(slideWrapperElem);
        _me._htmlContainer.fire('cel_yuiOverlay:afterContentChanged', _me);
        var resizeAndCenterSlideEvent = _me._htmlContainer.fire(
            'cel_slideShow:resizeAndCenterSlide', _me);
        if (!resizeAndCenterSlideEvent.stopped) {
          _me._htmlContainer.select('img').each(function(imgElem) {
            imgElem.observe('load', _me._imgLoadedResizeAndCenterSlideBind.curry(imgElem));
          });
          _me._resizeAndCenterSlide();
        }
        _me._htmlContainer.fire('cel_yuiOverlay:contentChanged', _me);
      }

  };
})();

//////////////////////////////////////////////////////////////////////////////
// Celements presentation Navigation
//////////////////////////////////////////////////////////////////////////////
CELEMENTS.presentation.Navigation = function(preloadFunc, showFunc) {
// constructor
this._init(preloadFunc, showFunc);
};

(function() {
  var CPCYON = CELEMENTS.presentation.Navigation;

  CELEMENTS.presentation.Navigation.prototype = {
      _loop : true,

      _allSlides : new Array(),
      _currIndex : undefined,
      _nextIndex : undefined,
      _prevIndex : undefined,

      _currContent : undefined,
      _preloadNext : undefined,
      _preloadPrev : undefined,

      _preloadFunc : undefined,
      _showFunc : undefined,

      _init : function(preloadFunc, showFunc) {
        var _me = this;
        _me._preloadFunc = preloadFunc || function(){};
        _me._showFunc = showFunc || function(){};
      },

      _convertFullNameToViewURL : function(fullName) {
        return '/' + fullName.replace(/\./, '/');
      },

      _setAllSlides : function(slidesFNarray, startIndex) {
        var _me = this;
        _me._allSlides = $A(slidesFNarray);
        if (_me._allSlides.size() > 0) {
          startIndex = startIndex || 0;
          _me.gotoSlide(startIndex);
        } else {
          _me._currIndex = undefined;
        }
      },

      _updateCurrentContent : function(newCurrContent) {
        var _me = this;
        _me._currContent = newCurrContent;
        _me._showFunc(_me._currContent);
        if (!_me._preloadNext) {
          _me._preloadFunc(_me._allSlides[_me.getNextIndex()],
              _me._updateNextContent.bind(_me));
        }
        if (!_me._preloadPrev) {
          _me._preloadFunc(_me._allSlides[_me.getPrevIndex()],
              _me._updatePrevContent.bind(_me));
        }
      },

      _updateNextContent : function(newNextContent) {
        var _me = this;
        _me._preloadNext = newNextContent;
      },

      _updatePrevContent : function(newPrevContent) {
        var _me = this;
        _me._preloadPrev = newPrevContent;
      },

      getNextIndex : function() {
        var _me = this;
        var newNextIdx = _me._currIndex + 1;
        if ((newNextIdx < _me._allSlides.size()) && (newNextIdx >= 0)) {
          _me._nextIndex = newNextIdx;
        } else if (_me._loop && (newNextIdx >= _me._allSlides.size())) {
          _me._nextIndex = 0;
        } else {
          _me._nextIndex = undefined;
        }
        return _me._nextIndex;
      },

      getPrevIndex : function() {
        var _me = this;
        var newPrevIdx = _me._currIndex - 1;
        if ((newPrevIdx < _me._allSlides.size()) && (newPrevIdx >= 0)) {
          _me._prevIndex = newPrevIdx;
        } else if (_me._loop && (newPrevIdx < 0)) {
          _me._prevIndex = _me._allSlides.size() - 1;
        } else {
          _me._prevIndex = undefined;
        }
        return _me._prevIndex;
      },

      indexOf : function(fullName) {
        var _me = this;
        return _me._allSlides.indexOf(fullName);
      },

      nextSlide : function() {
        var _me = this;
        _me._preloadPrev = _me._currContent;
        _me._prevIndex = _me._currIndex;
        var preloadNextContent = _me._preloadNext;
        _me._currIndex = _me._nextIndex;
        _me._preloadNext = null;
        _me._nextIndex = null;
        _me._updateCurrentContent(preloadNextContent);
      },

      prevSlide : function() {
        var _me = this;
        _me._nextIndex = _me._currIndex;
        _me._preloadNext = _me._currContent;
        _me._currIndex = _me._prevIndex;
        var preloadPrevContent = _me._preloadPrev;
        _me._preloadPrev = null;
        _me._prevIndex = null;
        _me._updateCurrentContent(preloadPrevContent);
      },

      gotoSlide : function(gotoIndex) {
        var _me = this;
        gotoIndex = gotoIndex || 0;
        if ((gotoIndex < _me._allSlides.size()) && (gotoIndex >= 0)) {
          _me._currIndex = gotoIndex;
          _me._nextIndex = null;
          _me._prevIndex = null;
          _me._currContent = null;
          _me._preloadNext = null;
          _me._preloadPrev = null;
          _me._preloadFunc(_me._allSlides[_me._currIndex],
              _me._updateCurrentContent.bind(_me));
        }
      }

  };
})();

})();
