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
      _preloadingImageQueue : [],
      _navObj : undefined,
      _registerOnOpenOverlayCheckerBind : undefined,
      _imgLoadedResizeAndCenterSlideBind : undefined,
      _cleanupSlideTransitionBind : undefined,
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
        _me._cleanupSlideTransitionBind = _me._cleanupSlideTransition.bind(_me);
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
        return _me.getHtmlContainer().down('.cel_slideShow_slideWrapper');
      },

      /**
       * if the slide is scaled down to fit in the _me._htmlContainer element then
       * we need an additional div between the slideWrapper and the _htmlContainer
       * to get the reduced dimensions of the slide. This intermediate div must
       * present the .cel_slideShow_slideRoot css class.
       */
      _centerCurrentSlide : function(slideWrapperIn) {
        var _me = this;
        var slideWrapper = slideWrapperIn || _me._getSlideWrapper();
        var slideRoot = _me._getSlideRootElem(slideWrapper);
        slideWrapper.setStyle({
          'position' : 'absolute',
          'width' : 'auto',
          'height' : 'auto',
        });
        slideRoot.setStyle({
          'position' : 'relative',
          'top' : 0,
          'marginLeft' : 0,
          'marginRight' : 0
        });
        //use jquery to get dimensions, because it works correctly inside iframes.
        var slideWidth = $j(slideWrapper).width();
        var slideHeight = $j(slideWrapper).height();
        var slideOuterHeight = $j(slideRoot).height();
        var parentDiv = _me._htmlContainer;
        var parentHeight = parentDiv.getHeight();
        var topPos = (parentHeight - slideOuterHeight) / 2;
        slideWrapper.setStyle({
          'position' : 'relative',
          'width' : slideWidth + 'px',
          'height' : slideHeight + 'px',
        });
        slideRoot.setStyle({
          'position' : 'relative',
          'margin' : '0',
          'marginLeft' : 'auto',
          'marginRight' : 'auto',
          'top' : topPos + 'px'
        });
      },

      _imgLoadedResizeAndCenterSlide : function(imgElem, slideWrapper, callbackFN, event) {
        var _me = this;
        imgElem.stopObserving('load', _me._imgLoadedResizeAndCenterSlideBind);
        _me._preloadingImageQueue = _me._preloadingImageQueue.without(imgElem);
        if (_me._preloadingImageQueue.length == 0) {
          _me._resizeAndCenterSlide(slideWrapper);
          if (callbackFN) {
            callbackFN();
          }
        }
      },

      _resizeAndCenterSlide : function(slideWrapper) {
        var _me = this;
        _me._resizeCurrentSlide(slideWrapper);
        if (_me._centerSlide) {
          var centerSlideEvent = _me._htmlContainer.fire('cel_slideShow:centerSlide',
              _me);
          if (!centerSlideEvent.stopped) {
            _me._centerCurrentSlide(slideWrapper);
          }
        }
      },

      _resizeCurrentSlide : function(slideWrapperIn) {
        var _me = this;
        if (_me._autoresize) {
          var slideWrapper = slideWrapperIn || _me._getSlideWrapper();
          var zoomFactor = _me._computeZoomFactor(slideWrapper);
          if (zoomFactor <= 1) {
            var oldWidth = parseInt(slideWrapper.getWidth());
            var oldHeight = parseInt(slideWrapper.getHeight());
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
              slideWrapper.setStyle({
                'zoom' : zoomFactor,
                'transform' : 'scale(' + zoomFactor + ')',
                'transformOrigin' : '0 0 0',
                'height' : oldHeight + 'px',  // important for FF
                'width' : oldWidth + 'px' // important for FF
              });
            }
            var parentDiv = _me._getSlideRootElem();
            if (parentDiv.hasClassName('cel_slideShow_slideRoot')) {
              parentDiv.setStyle({
                'width' : newWidth + 'px',
                'height' : newHeight + 'px'
              });
            }
          } else {
            if ((typeof console != 'undefined') && (typeof console.log != 'undefined')) {
              console.log('no resize needed.', zoomFactor);
            }
          }
        }
      },

      _computeZoomFactor : function(slideWrapperIn) {
        var _me = this;
        var slideWrapper = slideWrapperIn || _me._getSlideWrapper();
        var oldWidth = parseInt(slideWrapper.getWidth());
        var newWidth = oldWidth;
        if (oldWidth > _me._htmlContainer.getWidth()) {
          newWidth = _me._htmlContainer.getWidth();
        }
        var zoomWidthFactor = newWidth / oldWidth;
        var oldHeight = parseInt(slideWrapper.getHeight());
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

      _getSlideRootElem : function(defaultElem) {
        var _me = this;
        defaultElem = defaultElem || _me._htmlContainer;
        var slideRootElem = _me._getSlideWrapper().up('.cel_slideShow_slideRoot'
            ) || defaultElem;
        //console.log('_getSlideRootElem: ', slideRootElem);
        return slideRootElem;
      },

      _showSlide : function(slideContent) {
        var _me = this;
        _me._getSlideRootElem().addClassName('celanim_isChanging');
        _me._htmlContainer.fire('cel_yuiOverlay:beforeContentChanged', _me);
        var slideWrapperElem = new Element('div').addClassName(
            'cel_slideShow_slideWrapper').setStyle({
          'position' : 'relative'
        }).update(slideContent).hide();
        _me._getSlideRootElem().insert({ bottom: slideWrapperElem });
        var resizeAndCenterSlideEvent = _me._htmlContainer.fire(
            'cel_slideShow:resizeAndCenterSlide', _me);
        if (!resizeAndCenterSlideEvent.stopped) {
          _me._preloadingImageQueue = new Array();
          slideWrapperElem.select('img').each(function(imgElem) {
            if (!imgElem.complete) {
              imgElem.observe('load', _me._imgLoadedResizeAndCenterSlideBind.curry(
                  imgElem, slideWrapperElem, _me._showSlideAfterPreloadingImg.bind(_me)));
              _me._preloadingImageQueue.push(imgElem);
            }
          });
          if (_me._preloadingImageQueue.length == 0) {
            _me._resizeAndCenterSlide(slideWrapperElem);
            _me._showSlideAfterPreloadingImg();
          }
        } else {
          _me._showSlideAfterPreloadingImg();
        }
      },

      _showSlideAfterPreloadingImg : function() {
        var _me = this;
        //TODO add second slideRootElem to allow proper positioning of both slides
        var slides = _me._getSlideRootElem().select('.cel_slideShow_slideWrapper');
        _me._htmlContainer.stopObserving('cel_slideShow:slideTransitionFinished',
            _me._cleanupSlideTransitionBind);
        _me._htmlContainer.observe('cel_slideShow:slideTransitionFinished',
            _me._cleanupSlideTransitionBind);
        var contentChangeEvent = _me._htmlContainer.fire('cel_yuiOverlay:changeContent', {
          'slideShowObj' : _me,
          'slides' : slides
        });
        if (!contentChangeEvent.stopped) {
          if (slides.length > 1) {
            slides[0].hide();
            slides[1].show();
          } else {
            slides[0].show();
          }
          _me._cleanupSlideTransition();
        }
      },

      _cleanupSlideTransition : function() {
        var _me = this;
        _me._htmlContainer.stopObserving('cel_slideShow:slideTransitionFinished',
            _me._cleanupSlideTransitionBind);
        var slides = _me._getSlideRootElem().select('.cel_slideShow_slideWrapper');
        slides.each(function(slideElem) {
          if (!slideElem.visible()) {
            slideElem.remove();
          }
        });
        _me._htmlContainer.fire('cel_yuiOverlay:afterContentChanged', _me);
        _me._getSlideRootElem().removeClassName('celanim_isChanging');
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
        var preloadNextContent = _me._preloadNext;
        if (preloadNextContent) {
          _me._preloadPrev = _me._currContent;
          _me._prevIndex = _me._currIndex;
          _me._currIndex = _me._nextIndex;
          _me._preloadNext = null;
          _me._nextIndex = null;
          _me._updateCurrentContent(preloadNextContent);
        } else {
          if ((typeof console != 'undefined') && (typeof console.warn != 'undefined')) {
            console.warn('skip nextSlide because preload not yet finished.');
          }
        }
      },

      prevSlide : function() {
        var _me = this;
        var preloadPrevContent = _me._preloadPrev;
        if (preloadPrevContent) {
          _me._nextIndex = _me._currIndex;
          _me._preloadNext = _me._currContent;
          _me._currIndex = _me._prevIndex;
          _me._preloadPrev = null;
          _me._prevIndex = null;
          _me._updateCurrentContent(preloadPrevContent);
        } else {
          if ((typeof console != 'undefined') && (typeof console.warn != 'undefined')) {
            console.warn('skip prevSlide because preload not yet finished.');
          }
        }
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
