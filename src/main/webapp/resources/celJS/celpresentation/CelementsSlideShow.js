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
(function (window, undefined) {

  if (typeof window.CELEMENTS == "undefined") { window.CELEMENTS = {}; }
  if (typeof window.CELEMENTS.presentation == "undefined") { window.CELEMENTS.presentation = {}; }

  let CPCY_SlideShowObj = undefined;

  window.getCelSlideShowObj = function () {
    return CPCY_SlideShowObj;
  };

  /**
   * prepare the one and only SlideShow for yuiOverlays
   */
  $j(document).ready(function () {
    if (!CPCY_SlideShowObj) {
      CPCY_SlideShowObj = new CELEMENTS.presentation.SlideShow();
    }
    $(document.body).observe('cel_yuiOverlay:afterShowDialog_General',
      CPCY_SlideShowObj._registerOnOpenOverlayCheckerBind);
  });

  //////////////////////////////////////////////////////////////////////////////
  // Celements presentation Slideshow
  //////////////////////////////////////////////////////////////////////////////
  if (typeof window.CELEMENTS.presentation.SlideShow === 'undefined') {
    window.CELEMENTS.presentation.SlideShow = Class.create({
      _htmlContainerId: undefined,
      _htmlContainer: undefined,
      _overwritePageLayout: undefined,
      _preloadSlideAjaxMode: undefined,
      _preloadSlideParams: undefined,
      _preloadSlideImagesHash: undefined,
      _nextElements: undefined,
      _prevElements: undefined,
      _preloadingImageQueue: undefined,
      _navObj: undefined,
      _nextSlideBind: undefined,
      _prevSlideBind: undefined,
      _registerOnOpenOverlayCheckerBind: undefined,
      _imgLoadedResizeAndCenterSlideBind: undefined,
      _cleanupSlideTransitionBind: undefined,
      _gotoSlideClickHandlerBind: undefined,
      _counterLeadingZeros: undefined,
      _centerSlide: undefined,
      _resizeSlide: undefined,
      _autoresize: undefined,
      _mobileDim: undefined,
      _debug: undefined,

      initialize: function (containerId) {
        const _me = this;
        _me._mobileDim = new CELEMENTS.mobile.Dimensions();
        _me._overwritePageLayout = 'SimpleLayout';
        _me._preloadSlideAjaxMode = '';
        _me._preloadSlideParams = new Hash();
        _me._counterLeadingZeros = false;
        _me._centerSlide = true;
        _me._resizeSlide = true;
        _me._autoresize = false;
        _me._preloadSlideImagesHash = new Hash();
        _me._nextElements = [];
        _me._prevElements = [];
        _me._preloadingImageQueue = [];
        _me._htmlContainerId = containerId || 'yuiOverlayContainer';
        _me._htmlContainer = $(_me._htmlContainerId);
        _me._navObj = new CELEMENTS.presentation.Navigation(_me._preloadSlide.bind(_me),
          _me._showSlide.bind(_me), _me._waitingLoad.bind(_me));
        _me._nextSlideBind = _me._nextSlideClickHandler.bind(_me);
        _me._prevSlideBind = _me._prevSlideClickHandler.bind(_me);
        _me._registerOnOpenOverlayCheckerBind = _me._registerOnOpenOverlayChecker.bind(
          _me);
        _me._imgLoadedResizeAndCenterSlideBind = _me._imgLoadedResizeAndCenterSlide.bind(
          _me);
        _me._cleanupSlideTransitionBind = _me._cleanupSlideTransition.bind(_me);
        _me._gotoSlideClickHandlerBind = _me._gotoSlideClickHandler.bind(_me);
      },

      setCounterLeadingZeros: function (useLeadingZeros) {
        const _me = this;
        _me._counterLeadingZeros = useLeadingZeros;
      },

      _nextSlideClickHandler: function (event) {
        const _me = this;
        event.stop();
        _me._navObj.nextSlide();
      },

      _prevSlideClickHandler: function (event) {
        const _me = this;
        event.stop();
        _me._navObj.prevSlide();
      },

      getHtmlContainer: function () {
        const _me = this;
        return _me._htmlContainer;
      },

      _registerOnOpenOverlayChecker: function (event) {
        const _me = this;
        const celOverlayObj = event.memo;
        const checkRegisterEvent = $(document.body).fire('cel_slideShow:shouldRegister', {
          'origEvent': event,
          'slideShow': _me,
          'celOverlay': celOverlayObj
        });
        if (checkRegisterEvent.stopped
          && (_me._htmlContainerId === celOverlayObj.getContainerId())) {
          _me._htmlContainer = null;
          _me.register();
        }
      },

      _waitingLoad: function (waitingObj) {
        const _me = this;
        if (waitingObj.waitingMode == 'next') {
          if (waitingObj.waitingState == 'start') {
            _me._nextElements.each(function (nextElem) {
              nextElem.addClassName('cel_slideShow_loadingNext');
            });
            _me._htmlContainer.addClassName('cel_slideShow_loadingNext');
          } else {
            _me._nextElements.each(function (nextElem) {
              nextElem.removeClassName('cel_slideShow_loadingNext');
            });
            _me._htmlContainer.removeClassName('cel_slideShow_loadingNext');
          }
          _me._htmlContainer.fire('cel_slideShow:waitingNextLoad-'
            + waitingObj.waitingState, waitingObj);
        } else if (waitingObj.waitingMode == 'prev') {
          if (waitingObj.waitingState == 'start') {
            _me._nextElements.each(function (nextElem) {
              nextElem.addClassName('cel_slideShow_loadingPrev');
            });
            _me._htmlContainer.addClassName('cel_slideShow_loadingPrev');
          } else {
            _me._nextElements.each(function (nextElem) {
              nextElem.removeClassName('cel_slideShow_loadingPrev');
            });
            _me._htmlContainer.removeClassName('cel_slideShow_loadingPrev');
          }
          _me._htmlContainer.fire('cel_slideShow:waitingPrevLoad-'
            + waitingObj.waitingState, waitingObj);
        } else {
          if (waitingObj.waitingState == 'start') {
            _me._nextElements.each(function (nextElem) {
              nextElem.addClassName('cel_slideShow_loading');
            });
            _me._htmlContainer.addClassName('cel_slideShow_loading');
          } else {
            _me._nextElements.each(function (nextElem) {
              nextElem.removeClassName('cel_slideShow_loading');
            });
            _me._htmlContainer.removeClassName('cel_slideShow_loading');
          }
          _me._htmlContainer.fire('cel_slideShow:waitingLoad-' + waitingObj.waitingState,
            waitingObj);
        }
      },

      _addContentWrapper: function () {
        const _me = this;
        if (!_me._htmlContainer.down('.cel_slideShow_slideRoot')) {
          const oldContent = _me._htmlContainer.innerHTML;
          _me._htmlContainer.update(_me._addWrapperElements(oldContent));
          const slideWrapper = _me._getSlideWrapper();
          slideWrapper.down().setStyle({
            'position': '',
            'top': '',
            'left': '',
            'right': '',
            'bottom': ''
          });
        }
        _me._preloadImagesAndResizeCenterSlide(_me._getSlideWrapper());
      },

      _addWrapperElements: function (slideContent) {
        const slideWrapperElem = new Element('div').addClassName(
          'cel_slideShow_slideWrapper').setStyle({
            'position': 'relative'
          }).update(slideContent);
        const slideRootElem = new Element('div').addClassName(
          'cel_slideShow_slideRoot').setStyle({
            'position': 'absolute'
          }).update(slideWrapperElem);
        return slideRootElem;
      },

      register: function () {
        const _me = this;
        if (!_me._htmlContainer) {
          // late initialization needed in overlay
          _me._htmlContainer = $(_me._htmlContainerId);
        }
        if (_me._htmlContainer) {
          _me._addContentWrapper();
          if (typeof initContextMenuAsync !== 'undefined') {
            _me._htmlContainer.observe('cel_yuiOverlay:contentChanged',
              initContextMenuAsync);
            initContextMenuAsync();
          }
          _me._htmlContainer.observe('cel_yuiOverlay:contentChanged',
            _me._registerDynamicProviderAfterContentChanged.bind(_me));
          _me._htmlContainer.observe('cel_yuiOverlay:afterSlideInsert',
            _me._registerNavLinks.bind(_me));
          _me._registerNavLinks();
          _me._htmlContainer.observe('cel_yuiOverlay:afterSlideInsert',
            _me._updateSlideCounterHandler.bind(_me));
          _me._htmlContainer.observe('cel_slideShow:preloadContentFinished',
            _me._preloadSlideImages.bind(_me));
          $(document.body).observe('cel_yuiOverlay:hideEvent', _me._resetContainerElem.bind(_me));
        } else {
          if ((typeof console != 'undefined') && (typeof console.warn != 'undefined')) {
            console.warn('register slideshow failed. Reason: container with id "'
              + _me._htmlContainerId + '" not found!');
          }
        }
      },

      _registerDynamicProviderAfterContentChanged: function () {
        const _me = this;
        //TODO move to independent CelementsSlideShowMovieExtender
        if (typeof registerCelAnimMoviePlayerInsideParent !== 'undefined') {
          _me._htmlContainer.observe('cel_yuiOverlay:contentChanged',
            registerCelAnimMoviePlayerInsideParent.curry(_me._htmlContainer));
        }
        $(document.body).fire('cel_slideShow:registerAfterContentChanged',
          _me._htmlContainer);
      },

      _resetContainerElem: function (event) {
        const _me = this;
        const celOverlayObj = event.memo;
        if (_me._debug) {
          console.log('_resetContainerElem: for htmlElem ', _me.getHtmlContainer());
        }
        if (celOverlayObj.getContainerId() == _me._htmlContainerId) {
          _me._htmlContainer = null;
        }
      },

      _convertFullNameToViewURL: function (fullName) {
        const _me = this;
        return _me._navObj._convertFullNameToViewURL(fullName);
      },

      loadAndAddMainSlides: function (spaceName, callbackFN) {
        const _me = this;
        callbackFN = callbackFN || function (jsonObj) { };
        new Ajax.Request(getCelHost(), {
          method: 'post',
          parameters: {
            'xpage': 'celements_ajax',
            'ajax_mode': 'getMainSlides',
            'spaceName': spaceName
          },
          onSuccess: function (transport) {
            if (transport.responseText.isJSON()) {
              const jsonObj = transport.responseText.evalJSON();
              _me._navObj._addSlides(jsonObj);
              callbackFN(jsonObj);
            } else {
              if ((typeof console != 'undefined')
                && (typeof console.error != 'undefined')) {
                console.error('loadAndAddMainSlides returns no Json: ',
                  transport.responseText);
              }
            }
          },
          onFailure: function (transport) {
            console.warn('loadAndAddMainSlides failed for: ', spaceName);
          }
        });
      },

      loadMainSlides: function (spaceName, startAtIndexOrName, callbackFN) {
        const _me = this;
        callbackFN = callbackFN || function (jsonObj) { };
        new Ajax.Request(getCelHost(), {
          method: 'post',
          parameters: {
            'xpage': 'celements_ajax',
            'ajax_mode': 'getMainSlides',
            'spaceName': spaceName
          },
          onSuccess: function (transport) {
            if (transport.responseText.isJSON()) {
              const jsonObj = transport.responseText.evalJSON();
              let startAtIndex = startAtIndexOrName;
              if (typeof (startAtIndexOrName) === 'string') {
                if (startAtIndexOrName === '!RANDOM!') {
                  startAtIndex = Math.floor(Math.random() * (jsonObj.length - 1));
                } else {
                  startAtIndex = jsonObj.indexOf(spaceName + '.' + startAtIndexOrName);
                }
              }
              _me._navObj._setAllSlides(jsonObj, startAtIndex);
              callbackFN(jsonObj);
            } else {
              if ((typeof console != 'undefined')
                && (typeof console.error != 'undefined')) {
                console.error('loadMainSlides returns no Json: ', transport.responseText);
              }
            }
          },
          onFailure: function (transport) {
            console.warn('loadMainSlides failed for: ', spaceName, startAtIndexOrName);
          }
        });
      },

      loadAndAddSubSlides: function (parentFN, callbackFN) {
        const _me = this;
        callbackFN = callbackFN || function (jsonObj) { };
        new Ajax.Request(_me._convertFullNameToViewURL(parentFN), {
          method: 'post',
          parameters: {
            'xpage': 'celements_ajax',
            'ajax_mode': 'getSubSlides'
          },
          onSuccess: function (transport) {
            if (transport.responseText.isJSON()) {
              const jsonObj = transport.responseText.evalJSON();
              _me._navObj._addSlides(jsonObj);
              callbackFN(jsonObj);
            } else {
              if ((typeof console != 'undefined')
                && (typeof console.error != 'undefined')) {
                console.error('loadAndAddSubSlides returns no Json: ',
                  transport.responseText);
              }
            }
          },
          onFailure: function (transport) {
            console.warn('loadAndAddSubSlides failed for: ', parentFN);
          }
        });
      },

      loadSubSlides: function (parentFN, startAtIndex, callbackFN) {
        const _me = this;
        callbackFN = callbackFN || function (jsonObj) { };
        new Ajax.Request(_me._convertFullNameToViewURL(parentFN), {
          method: 'post',
          parameters: {
            'xpage': 'celements_ajax',
            'ajax_mode': 'getSubSlides'
          },
          onSuccess: function (transport) {
            if (transport.responseText.isJSON()) {
              const jsonObj = transport.responseText.evalJSON();
              _me._navObj._setAllSlides(jsonObj, startAtIndex);
              callbackFN(jsonObj);
            } else {
              if ((typeof console != 'undefined')
                && (typeof console.error != 'undefined')) {
                console.error('loadSubSlides returns no Json: ', transport.responseText);
              }
            }
          },
          onFailure: function (transport) {
            console.warn('loadSubSlides failed for: ', parentFN, startAtIndex);
          }
        });
      },

      _updateSlideCounterHandler: function (event) {
        const _me = this;
        _me._updateSlideCounter(event.memo.newSlideWrapperElem);
      },

      _updateSlideCounter: function (newSlideWrapperElem) {
        const _me = this;
        const numSlides = _me._navObj.getNumSlides();
        if (_me._debug) {
          console.debug('_updateSlideCounter: ', numSlides, _me._htmlContainer.select(
            '.celPresSlideShow_countSlideNum'));
        }
        _me._htmlContainer.select('.celPresSlideShow_countSlideNum').each(
          function (countSlideElem) {
            countSlideElem.update(numSlides);
          });
        let currentSlideNum = _me._navObj.getCurrentSlideNum();
        if (_me._counterLeadingZeros) {
          currentSlideNum = '0000000000' + currentSlideNum;
          currentSlideNum = currentSlideNum.substring(
            currentSlideNum.length - numSlides.toString().length,
            currentSlideNum.length);
        }
        _me._htmlContainer.select(
          '.celPresSlideShow_currentSlideNum').each(
            function (currentSlideElem) {
              currentSlideElem.update(currentSlideNum);
            });
      },

      _registerNavLinks: function () {
        const _me = this;
        _me._registerNext();
        _me._registerPrev();
        _me._registerDirectLinks();
      },

      _registerNext: function () {
        const _me = this;
        _me._nextElements = _me._htmlContainer.select('.celPresSlideShow_next');
        _me._nextElements.each(function (nextElem) {
          nextElem.stopObserving('click', _me._nextSlideBind);
          nextElem.observe('click', _me._nextSlideBind);
        });
      },

      _registerPrev: function () {
        const _me = this;
        _me._prevElements = _me._htmlContainer.select('.celPresSlideShow_prev');
        _me._prevElements.each(function (prevElem) {
          prevElem.stopObserving('click', _me._prevSlideBind);
          prevElem.observe('click', _me._prevSlideBind);
        });
      },

      addSlides: function (fullNameArray) {
        const _me = this;
        _me._navObj._addSlides(fullNameArray);
      },

      gotoSlide: function (fullName) {
        const _me = this;
        const gotoIndex = _me._navObj.indexOf(fullName);
        if (gotoIndex >= 0) {
          _me._navObj.gotoSlide(gotoIndex);
          return true;
        }
        return false;
      },

      _gotoSlideClickHandler: function (event) {
        const _me = this;
        let fullName = event.element().id.split(':')[2];
        if ((typeof fullName === 'undefined') && event.findElement('a')) {
          fullName = event.findElement('a').id.split(':')[2];
        }
        if (_me.gotoSlide(fullName)) {
          event.stop();
        } else {
          const nonSlideClickEvent = _me._htmlContainer.fire('cel_slideShow:nonSlideClick',
            {
              'theSlideShow': _me,
              'fullName': fullName,
              'clickEvent': event
            });
          if (!nonSlideClickEvent.stopped) {
            if ((typeof console != 'undefined')
              && (typeof console.error != 'undefined')) {
              console.error('_gotoSlideClickHandler failed. Index not found for: ',
                fullName, ' and cel_slideShow:nonSlideClick event not handled');
            }
          }
        }
      },

      _registerDirectLinks: function () {
        const _me = this;
        _me._htmlContainer.select('.celPresSlideShow_navigation').each(function (navElem) {
          navElem.select('a').each(function (navLink) {
            navLink.stopObserving('click', _me._gotoSlideClickHandlerBind);
            navLink.observe('click', _me._gotoSlideClickHandlerBind);
          });
        });
      },

      setAutoresize: function (doAutoResize) {
        const _me = this;
        _me._autoresize = doAutoResize;
      },

      setOverwritePageLayout: function (overwritePageLayout) {
        const _me = this;
        _me._overwritePageLayout = overwritePageLayout;
      },

      setPreloadSlideAjaxMode: function (preloadSlideAjaxMode) {
        const _me = this;
        //        console.log('setPreloadSlideAjaxMode: ', preloadSlideAjaxMode);
        _me._preloadSlideAjaxMode = preloadSlideAjaxMode;
      },

      addPreloadSlideParam: function (params) {
        const _me = this;
        //        console.log('addPreloadSlideParam: ', params);
        _me._preloadSlideParams = _me._preloadSlideParams.merge(params);
      },

      setResizeSlide: function (isResizeSlide) {
        const _me = this;
        _me._resizeSlide = isResizeSlide;
      },

      setCenterSlide: function (isCenterSlide) {
        const _me = this;
        _me._centerSlide = isCenterSlide;
      },

      _preloadSlide: function (slideFN, callbackFN) {
        const _me = this;
        callbackFN = callbackFN || function (newSlideContent) { };
        let params = {
          'xpage': 'celements_ajax',
          'ajax_mode': 'pageTypeWithLayout',
          'ajax': '1'
        };
        if (_me._htmlContainer) {
          params['maxHeight'] = _me._htmlContainer.getHeight();
          params['maxWidth'] = _me._htmlContainer.getWidth();
        }
        if (_me._overwritePageLayout != '') {
          params['overwriteLayout'] = _me._overwritePageLayout;
        }
        if (_me._preloadSlideAjaxMode != '') {
          params['ajax_mode'] = _me._preloadSlideAjaxMode;
        }
        params = _me._preloadSlideParams.merge(params).toObject();
        new Ajax.Request(_me._convertFullNameToViewURL(slideFN), {
          method: 'post',
          parameters: params,
          onSuccess: function (transport) {
            const jsonObj = transport.headerJSON;
            if (jsonObj && jsonObj.redirectFN && (jsonObj.redirectFN != '')
              && (jsonObj.redirectFN != slideFN)) {
              const beforeRedirEvent = _me._htmlContainer.fire(
                'cel_slideShow:preloadContentBeforeRedirect', {
                'theSlideShow': _me,
                'slideFN': slideFN,
                'jsonObj': jsonObj
              });
              if (!beforeRedirEvent.stopped) {
                if (!_me.gotoSlide(jsonObj.redirectFN)) {
                  _me._htmlContainer.fire('cel_slideShow:preloadContentRedirectFailed', {
                    'theSlideShow': _me,
                    'slideFN': slideFN,
                    'jsonObj': jsonObj
                  });
                }
              }
            } else {
              _me._htmlContainer.fire('cel_slideShow:preloadContentFinished', {
                'theSlideShow': _me,
                'slideFN': slideFN,
                'responseText': transport.responseText
              });
              callbackFN(transport.responseText);
              _me._htmlContainer.fire('cel_slideShow:preloadFinished', {
                'theSlideShow': _me,
                'slideFN': slideFN,
                'responseText': transport.responseText
              });
            }
          },
          onFailure: function (transport) {
            console.warn('_preloadSlide failed for: ', slideFN);
            _me._htmlContainer.fire('cel_slideShow:preloadContentFailed', {
              'theSlideShow': _me,
              'slideFN': slideFN,
              'responseText': transport.responseText
            });
          }
        });
      },

      _preloadSlideImages: function (event) {
        const _me = this;
        const preLoadSlide = event.memo;
        if (!_me._preloadSlideImagesHash.get(preLoadSlide.slideFN)) {
          const preloadElem = new Element('div').update(preLoadSlide.responseText);
          const imgsArray = preloadElem.select('img');
          _me._preloadSlideImagesHash.set(preLoadSlide.slideFN, preloadElem);
          _me._htmlContainer.fire('cel_slideShow:afterPreloadImages', {
            'theSlideShow': _me,
            'slideFN': preLoadSlide.slideFN,
            'images': imgsArray.toArray()
          });
        }

      },

      _getSlideWrapper: function () {
        const _me = this;
        return _me.getHtmlContainer().down('.cel_slideShow_slideWrapper');
      },

      _getAllSlideWrappers: function () {
        const _me = this;
        return _me.getHtmlContainer().select('.cel_slideShow_slideWrapper');
      },

      /**
       * if the slide is scaled down to fit in the _me._htmlContainer element then
       * we need an additional div between the slideWrapper and the _htmlContainer
       * to get the reduced dimensions of the slide. This intermediate div must
       * present the .cel_slideShow_slideRoot css class.
       * 
       * prerequisite: slideWrapper MUST have a height and width asigned (e.g. by resize)
       * @TODO move to CelementsSlides js class.
       */
      _centerCurrentSlide: function (slideWrapperIn) {
        const _me = this;
        const slideWrapper = slideWrapperIn || _me._getSlideWrapper();
        const slideRoot = _me._getSlideRootElem(slideWrapper);
        //we cannot read element dimension if any parent is hidden (display:none)
        const hiddenParentElems = [];
        slideWrapper.ancestors().each(function (parentElem) {
          if (!parentElem.visible()) {
            hiddenParentElems.push(parentElem);
            parentElem.show();
          }
        });
        //ensure that the width is not influenced by the parents by setting position to absolute
        slideRoot.setStyle({
          'position': 'absolute'
        });
        //use scrollWidth and scrollHeight, because it works correctly inside iframes.
        const slideOuterHeight = slideRoot.scrollHeight;
        const slideOuterWidth = slideRoot.scrollWidth;
        if (_me._debug) {
          console.debug('_centerCurrentSlide slideRoot dim: ', _me._htmlContainerId, slideOuterWidth,
            slideOuterHeight, slideRoot.getStyle('position'), slideRoot);
        }
        const parentDiv = _me._htmlContainer;
        const parentHeight = parentDiv.getHeight();
        const parentWidth = parentDiv.getWidth();
        if (_me._debug) {
          console.debug('_centerCurrentSlide parentDiv dim: ', _me._htmlContainerId, parentWidth,
            parentHeight, parentDiv.scrollWidth, parentDiv.scrollHeight);
        }
        //FIXED: why slideOuterHeight? !!! FP; 2/1/2014
        //--> it must be slideOuterHeight to get correct size of scaled down slides.
        //--> see method comment
        const topPos = (parentHeight - slideOuterHeight) / 2;
        const leftPos = (parentWidth - slideOuterWidth) / 2;
        hiddenParentElems.each(Element.hide);
        slideWrapper.setStyle({
          'position': 'relative',
          'margin': '0'
        });
        // horizontal centering with absolut left position needed, because FF gets
        // conflict with transform-origin and margin auto
        slideRoot.setStyle({
          'position': 'absolute',
          'left': leftPos + 'px',
          'top': topPos + 'px',
          'margin': '0'
        });
      },

      _imgLoadedResizeAndCenterSlide: function (imgElem, slideWrapper, callbackFN, event) {
        const _me = this;
        imgElem.stopObserving('load', _me._imgLoadedResizeAndCenterSlideBind);
        imgElem.stopObserving('error', _me._imgLoadedResizeAndCenterSlideBind);
        imgElem.stopObserving('abort', _me._imgLoadedResizeAndCenterSlideBind);
        if (_me._debug) {
          console.debug('_imgLoadedResizeAndCenterSlide: preloading finished for ',
            imgElem.inspect());
        }
        _me._preloadingImageQueue = _me._preloadingImageQueue.without(imgElem);
        if (_me._preloadingImageQueue.length == 0) {
          if (_me._debug) {
            console.log('_imgLoadedResizeAndCenterSlide before _resizeAndCenterSlidefor ',
              slideWrapper);
            slideWrapper.select('img').each(function (imgElem) {
              console.debug('_imgLoadedResizeAndCenterSlide: img loaded ', imgElem.inspect(),
                imgElem.complete);
            });
          }
          _me._resizeAndCenterSlide(slideWrapper);
          if (callbackFN) {
            callbackFN();
          }
        }
      },

      _resizeAndCenterSlide: function (slideWrapper) {
        const _me = this;
        if (_me._debug) {
          console.debug('_resizeAndCenterSlide: ', slideWrapper, _me._resizeSlide,
            _me._centerSlide);
        }
        slideWrapper.select('img').each(function (imgElem) {
          //reset possible image css 'possition' : absolute settings
          imgElem.setStyle({
            'position': 'relative'
          });
        });
        _me._htmlContainer.fire('cel_slideShow:beforeResizeAndCenterSlide', _me);
        if (_me._resizeSlide) {
          const resizeSlideEvent = _me._htmlContainer.fire('cel_slideShow:resizeSlide',
            _me);
          if (!resizeSlideEvent.stopped) {
            _me._resizeCurrentSlide(slideWrapper);
          } else {
            console.log('_resizeAndCenterSlide: resizeSlideEvent.stopped ', slideWrapper);
          }
        }
        if (_me._centerSlide) {
          const centerSlideEvent = _me._htmlContainer.fire('cel_slideShow:centerSlide',
            _me);
          if (!centerSlideEvent.stopped) {
            _me._centerCurrentSlide(slideWrapper);
          } else {
            console.log('_resizeAndCenterSlide: centerSlideEvent.stopped ', slideWrapper);
          }
        }
        slideWrapper.select('img').each(function (imgElem) {
          //reset img elem position values
          imgElem.setStyle({
            'position': ''
          });
        });
        _me._htmlContainer.fire('cel_slideShow:afterResizeAndCenterSlide', _me);
      },

      getZoomStyles: function (zoomFactor, fullWidth, fullHeight) {
        const _me = this;
        return _me._mobileDim.getZoomStyles(zoomFactor, fullWidth, fullHeight);
      },

      _resizeCurrentSlide: function (slideWrapperIn) {
        const _me = this;
        const slideWrapper = slideWrapperIn || _me._getSlideWrapper();
        const zoomFactorObj = _me._computeZoomFactor(slideWrapper);
        if ((_me._autoresize) && (zoomFactorObj.zoomFactor <= 1)) {
          const eventMemo = {
            'fullWidth': zoomFactorObj.oldWidth,
            'fullHeight': zoomFactorObj.oldHeight,
            'zoomFactor': zoomFactorObj.zoomFactor,
            'newWidth': zoomFactorObj.newWidth,
            'newHeight': zoomFactorObj.newHeight
          };
          if (_me._debug) {
            console.log('final resize factor: ', _me._htmlContainer, eventMemo);
          }
          const resizeEvent = _me._htmlContainer.fire(
            'cel_slideShow:resizeSlideContent', eventMemo);
          if (!resizeEvent.stopped) {
            slideWrapper.setStyle(_me.getZoomStyles(zoomFactorObj.zoomFactor,
              zoomFactorObj.oldWidth, zoomFactorObj.oldHeight));
          }
          const parentDiv = _me._getSlideRootElem(slideWrapper);
          if (parentDiv.hasClassName('cel_slideShow_slideRoot')) {
            if (_me._debug) {
              console.debug('_resizeCurrentSlide: setting rootElem new size ', _me._htmlContainerId,
                zoomFactorObj.newWidth, zoomFactorObj.newHeight);
            }
            parentDiv.setStyle({
              'width': zoomFactorObj.newWidth + 'px',
              'height': zoomFactorObj.newHeight + 'px'
            });
          }
        } else {
          if (zoomFactorObj.zoomFactor > 1) {
            console.log('no resize needed.', zoomFactorObj.zoomFactor);
          } else {
            console.log('resize skipped.', {
              'zoomFactor': zoomFactorObj.zoomFactor,
              '_autoresize': _me._autoresize, 'zoomFactorObj': zoomFactorObj
            });
          }
          //set sizes without zoom too. Important for centering
          if (_me._debug) {
            console.debug('_resizeCurrentSlide: setting wrapper size ',
              zoomFactorObj.oldWidth, zoomFactorObj.oldHeight);
          }
          slideWrapper.setStyle({
            'height': zoomFactorObj.oldHeight + 'px',
            'width': zoomFactorObj.oldWidth + 'px'
          });
          const parentDiv = _me._getSlideRootElem(slideWrapper);
          if (parentDiv.hasClassName('cel_slideShow_slideRoot')) {
            if (_me._debug) {
              console.debug('_resizeCurrentSlide: setting rootElem old size ', _me._htmlContainerId,
                zoomFactorObj.oldWidth, zoomFactorObj.oldHeight);
            }
            parentDiv.setStyle({
              'width': zoomFactorObj.oldWidth + 'px',
              'height': zoomFactorObj.oldHeight + 'px'
            });
          }
        }
      },

      _computeZoomFactor: function (slideWrapperIn) {
        const _me = this;
        const slideWrapper = slideWrapperIn || _me._getSlideWrapper();
        const slideRoot = _me._getSlideRootElem(slideWrapper);
        const rootPositionValue = slideRoot.getStyle('position');
        slideRoot.setStyle({
          'position': 'absolute',
          'visibility': 'hidden'
        });
        const hiddenParentElems = [];
        slideWrapper.ancestors().each(function (parentElem) {
          if (!parentElem.visible()) {
            hiddenParentElems.push(parentElem);
            parentElem.show();
          }
        });
        const oldWidth = parseInt(slideWrapper.getWidth());
        let newWidth = oldWidth;
        if (oldWidth > _me._htmlContainer.getWidth()) {
          newWidth = _me._htmlContainer.getWidth();
        }
        const zoomWidthFactor = newWidth / oldWidth;
        const oldHeight = parseInt(slideWrapper.getHeight());
        let newHeight = oldHeight;
        if (oldHeight > _me._htmlContainer.getHeight()) {
          newHeight = _me._htmlContainer.getHeight();
        }
        const zoomHeightFactor = newHeight / oldHeight;
        let zoomFactor;
        if (zoomHeightFactor < zoomWidthFactor) {
          zoomFactor = zoomHeightFactor;
        } else {
          zoomFactor = zoomWidthFactor;
        }
        slideRoot.setStyle({
          'position': rootPositionValue,
          'visibility': ''
        });
        hiddenParentElems.each(Element.hide);
        return {
          'zoomFactor': zoomFactor,
          'oldHeight': oldHeight,
          'oldWidth': oldWidth,
          'newHeight': oldHeight * zoomFactor,
          'newWidth': oldWidth * zoomFactor
        };
      },

      _getSlideRootElem: function (slideWrapper) {
        const _me = this;
        defaultElem = slideWrapper || _me._htmlContainer;
        return slideWrapper.up('.cel_slideShow_slideRoot') || defaultElem;
      },

      _showSlide: function (slideContent) {
        const _me = this;
        _me.getHtmlContainer().addClassName('celanim_isChanging');
        _me._htmlContainer.fire('cel_yuiOverlay:beforeContentChanged', _me);
        const slideRootElem = _me._addWrapperElements(slideContent).hide();
        const slideWrapperElem = slideRootElem.down('.cel_slideShow_slideWrapper');
        if (_me._debug) {
          console.debug('_showSlide: before cel_yuiOverlay:beforeSlideInsert ',
            _me._htmlContainer);
        }
        _me._htmlContainer.fire('cel_yuiOverlay:beforeSlideInsert', {
          'celSlideShow': _me,
          'newSlideWrapperElem': slideWrapperElem,
          'newSlideRootElem': slideRootElem
        });
        _me.getHtmlContainer().insert({ bottom: slideRootElem });
        if (_me._debug) {
          console.debug('_showSlide: before cel_yuiOverlay:afterSlideInsert event ',
            _me.getHtmlContainer());
        }
        _me._htmlContainer.fire('cel_yuiOverlay:afterSlideInsert', {
          'celSlideShow': _me,
          'newSlideWrapperElem': slideWrapperElem,
          'newSlideRootElem': slideRootElem
        });
        const resizeAndCenterSlideEvent = _me._htmlContainer.fire(
          'cel_slideShow:resizeAndCenterSlide', _me);
        if (!resizeAndCenterSlideEvent.stopped) {
          _me._preloadImagesAndResizeCenterSlide(slideWrapperElem,
            _me._showSlideAfterPreloadingImg.bind(_me));
        } else {
          _me._showSlideAfterPreloadingImg();
        }
      },

      _preloadImagesAndResizeCenterSlide: function (slideWrapperElem, callbackFN) {
        const _me = this;
        _me._preloadingImageQueue = new Array();
        slideWrapperElem.select('img').each(function (imgElem) {
          if (!imgElem.complete) {
            const finishFnc = _me._imgLoadedResizeAndCenterSlideBind.curry(
              imgElem, slideWrapperElem, callbackFN);
            imgElem.observe('load', finishFnc);
            imgElem.observe('error', finishFnc);
            imgElem.observe('abort', finishFnc);
            _me._preloadingImageQueue.push(imgElem);
            if (_me._debug) {
              console.debug('_preloadImagesAndResizeCenterSlide: preloading started for ',
                imgElem.inspect());
            }
          } else if (_me._debug) {
            console.log('_preloadImagesAndResizeCenterSlide: NO preloading for ',
              imgElem.inspect());
          }
        });
        if (_me._preloadingImageQueue.size() == 0) {
          if (_me._debug) {
            console.log('_preloadImagesAndResizeCenterSlide before _resizeAndCenterSlide'
              + 'for ', slideWrapperElem);
            slideWrapperElem.select('img').each(function (imgElem) {
              console.debug('_preloadImagesAndResizeCenterSlide: img loaded ', imgElem.inspect(),
                imgElem.complete);
            });
          }
          _me._resizeAndCenterSlide(slideWrapperElem);
          if (callbackFN) {
            callbackFN();
          }
        }
      },

      /**
       * needed for responsive design changing container sizes
       */
      changeContainerSize: function (newMaxWidth, newMaxHeight) {
        const _me = this;
        const currentWidth = $j(_me.getHtmlContainer()).width();
        const currentHeight = $j(_me.getHtmlContainer()).height();
        const newWidth = newMaxWidth || currentWidth;
        const newHeight = newMaxHeight || currentHeight;
        _me.getHtmlContainer().setStyle({
          'height': newHeight + 'px',
          'width': newWidth + 'px'
        });
        _me._getAllSlideWrappers().each(function (slideWrapper) {
          _me._resizeAndCenterSlide(slideWrapper);
        });
      },

      _showSlideAfterPreloadingImg: function () {
        const _me = this;
        const slides = _me.getHtmlContainer().select('> .cel_slideShow_slideRoot');
        _me._htmlContainer.stopObserving('cel_slideShow:slideTransitionFinished',
          _me._cleanupSlideTransitionBind);
        _me._htmlContainer.observe('cel_slideShow:slideTransitionFinished',
          _me._cleanupSlideTransitionBind);
        const contentChangeEvent = _me._htmlContainer.fire('cel_yuiOverlay:changeContent', {
          'slideShowObj': _me,
          'slides': slides
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

      _cleanupSlideTransition: function () {
        const _me = this;
        _me._htmlContainer.stopObserving('cel_slideShow:slideTransitionFinished',
          _me._cleanupSlideTransitionBind);
        const slides = _me.getHtmlContainer().select('> .cel_slideShow_slideRoot');
        slides.each(function (slideElem) {
          if (!slideElem.visible()) {
            slideElem.remove();
          }
        });
        _me._htmlContainer.fire('cel_yuiOverlay:afterContentChanged', _me);
        _me.getHtmlContainer().removeClassName('celanim_isChanging');
        _me._htmlContainer.fire('cel_yuiOverlay:contentChanged', _me);
      },

      getCurrentSlideFN: function () {
        const _me = this;
        return _me._navObj.getCurrentSlideFN();
      },

      getCurrentSlideURL: function () {
        const _me = this;
        return _me._convertFullNameToViewURL(_me.getCurrentSlideFN());
      }

    });
  }

  //////////////////////////////////////////////////////////////////////////////
  // Celements presentation Navigation
  //////////////////////////////////////////////////////////////////////////////
  if (typeof window.CELEMENTS.presentation.Navigation === 'undefined') {
    window.CELEMENTS.presentation.Navigation = Class.create({
      _loop: true,

      _allSlides: undefined,
      _currIndex: undefined,
      _nextIndex: undefined,
      _prevIndex: undefined,

      _currContent: undefined,
      _preloadNext: undefined,
      _preloadPrev: undefined,
      _waitingNextSlide: undefined,
      _waitingPrevSlide: undefined,
      _hasSlidePreload: undefined,

      _preloadFunc: undefined,
      _showFunc: undefined,
      _waitingFunc: undefined,

      initialize: function (preloadFunc, showFunc, waitingFunc) {
        const _me = this;
        _me._waitingNextSlide = false;
        _me._waitingPrevSlide = false;
        _me._hasSlidePreload = true;
        _me._allSlides = new Array();
        _me._preloadFunc = preloadFunc || function () { };
        _me._showFunc = showFunc || function () { };
        _me._waitingFunc = waitingFunc || function () { };
      },

      _convertFullNameToViewURL: function (fullName) {
        return window.CELEMENTS.getUtils().convertFullNameToViewURL(fullName);
      },

      _setAllSlides: function (slidesFNarray, startIndex) {
        const _me = this;
        _me._allSlides = $A(slidesFNarray);
        if (_me._allSlides.size() > 0) {
          const maxIndex = (_me._allSlides.size() - 1);
          startIndex = startIndex || 0;
          if (startIndex < 0) {
            startIndex = 0;
          }
          if (startIndex > maxIndex) {
            startIndex = maxIndex;
          }
          _me.gotoSlide(startIndex);
        } else {
          _me._currIndex = undefined;
        }
      },

      _addSlides: function (slidesFNarray) {
        const _me = this;
        _me._allSlides = _me._allSlides.concat(slidesFNarray);
      },

      setHasSlidePreload: function (hasSlidePreload) {
        const _me = this;
        _me._hasSlidePreload = hasSlidePreload;
      },

      getCurrentSlideFN: function () {
        const _me = this;
        return _me._allSlides[_me.getCurrentSlideNum() - 1];
      },

      _updateCurrentContent: function (newCurrContent) {
        const _me = this;
        _me._currContent = newCurrContent;
        _me._showFunc(_me._currContent);
        if (_me._hasSlidePreload && !_me._preloadNext) {
          _me._preloadFunc(_me._allSlides[_me.getNextIndex()],
            _me._updateNextContent.bind(_me));
        }
        if (_me._hasSlidePreload && !_me._preloadPrev) {
          _me._preloadFunc(_me._allSlides[_me.getPrevIndex()],
            _me._updatePrevContent.bind(_me));
        }
      },

      _updateNextContent: function (newNextContent) {
        const _me = this;
        _me._preloadNext = newNextContent;
        if (_me._waitingNextSlide) {
          _me._waitingNextSlide = false;
          _me._waitingFunc({
            'waitingMode': 'next',
            'waitingState': 'finished'
          });
          _me.nextSlide();
        }
      },

      _updatePrevContent: function (newPrevContent) {
        const _me = this;
        _me._preloadPrev = newPrevContent;
        if (_me._waitingPrevSlide) {
          _me._waitingPrevSlide = false;
          _me._waitingFunc({
            'waitingMode': 'prev',
            'waitingState': 'finished'
          });
          _me.prevSlide();
        }
      },

      getCurrentSlideNum: function () {
        const _me = this;
        return _me._currIndex + 1;
      },

      getNextIndex: function () {
        const _me = this;
        const newNextIdx = _me._currIndex + 1;
        if ((newNextIdx < _me._allSlides.size()) && (newNextIdx >= 0)) {
          _me._nextIndex = newNextIdx;
        } else if (_me._loop && (newNextIdx >= _me._allSlides.size())) {
          _me._nextIndex = 0;
        } else {
          _me._nextIndex = undefined;
        }
        return _me._nextIndex;
      },

      getPrevIndex: function () {
        const _me = this;
        const newPrevIdx = _me._currIndex - 1;
        if ((newPrevIdx < _me._allSlides.size()) && (newPrevIdx >= 0)) {
          _me._prevIndex = newPrevIdx;
        } else if (_me._loop && (newPrevIdx < 0)) {
          _me._prevIndex = _me._allSlides.size() - 1;
        } else {
          _me._prevIndex = undefined;
        }
        return _me._prevIndex;
      },

      indexOf: function (fullName) {
        const _me = this;
        return _me._allSlides.indexOf(fullName);
      },

      getNumSlides: function () {
        const _me = this;
        return _me._allSlides.size();
      },

      _cancelWaitingNext: function () {
        const _me = this;
        if (_me._waitingNextSlide) {
          _me._waitingFunc({
            'waitingMode': 'next',
            'waitingState': 'cancel'
          });
          _me._waitingNextSlide = false;
        }
      },

      _cancelWaitingPrev: function () {
        const _me = this;
        if (_me._waitingPrevSlide) {
          _me._waitingFunc({
            'waitingMode': 'prev',
            'waitingState': 'cancel'
          });
          _me._waitingPrevSlide = false;
        }
      },

      nextSlide: function () {
        const _me = this;
        const preloadNextContent = _me._preloadNext;
        _me._cancelWaitingPrev();
        if (preloadNextContent) {
          _me._waitingNextSlide = false;
          _me._preloadPrev = _me._currContent;
          _me._prevIndex = _me._currIndex;
          _me._currIndex = _me._nextIndex;
          _me._preloadNext = null;
          _me._nextIndex = null;
          _me._updateCurrentContent(preloadNextContent);
        } else if (!_me._waitingNextSlide) {
          _me._waitingNextSlide = true;
          _me._waitingFunc({
            'waitingMode': 'next',
            'waitingState': 'start'
          });
        }
      },

      prevSlide: function () {
        const _me = this;
        _me._cancelWaitingNext();
        const preloadPrevContent = _me._preloadPrev;
        if (preloadPrevContent) {
          _me._waitingPrevSlide = false;
          _me._nextIndex = _me._currIndex;
          _me._preloadNext = _me._currContent;
          _me._currIndex = _me._prevIndex;
          _me._preloadPrev = null;
          _me._prevIndex = null;
          _me._updateCurrentContent(preloadPrevContent);
        } else if (!_me._waitingPrevSlide) {
          _me._waitingPrevSlide = true;
          _me._waitingFunc({
            'waitingMode': 'prev',
            'waitingState': 'start'
          });
        }
      },

      gotoSlide: function (gotoIndex) {
        const _me = this;
        gotoIndex = gotoIndex || 0;
        _me._cancelWaitingPrev();
        _me._cancelWaitingNext();
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

    });
  }
})(window);
