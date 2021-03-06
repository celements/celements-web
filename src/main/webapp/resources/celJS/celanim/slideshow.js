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

var slideshowIsDebug = false;

if (typeof getCelHost === 'undefined') {
  var getCelHost = function() {
    var celHost = document.location + '?';
    celHost = celHost.substring(0, celHost.indexOf('?'));
    return celHost;
  };
}

var celSlideShowIds = undefined;
var getSlideShowIds = function() {
  if (typeof celSlideShowIds === 'undefined') {
    celSlideShowIds = [];
    $$('.celanim_slideshow').each(function(elem) {
      if (elem.id && (elem.id != '')) {
        celSlideShowIds.push(elem.id);
      }
    });
  }
  return celSlideShowIds;
};

var loadSlideShowDataAsync = function() {
  if (getSlideShowIds().size() > 0) {
    getSlideShowIds().each(function(elemId) {
      $(elemId).setStyle({
        'visibility' : 'hidden'
      });
    });
    new Ajax.Request(getCelHost(), {
      method: 'post',
      parameters: {
         'xpage' : 'celements_ajax',
         'ajax_mode' : 'SlideShowConfig',
         'celSlideShowIds' : Object.toJSON(getSlideShowIds())
      },
      onSuccess: function(transport) {
        if (transport.responseText.isJSON()) {
          initSlideShows(transport.responseText.evalJSON());
          startSlideShows();
        } else if ((typeof console != 'undefined')
            && (typeof console.warn != 'undefined')) {
          console.warn('loadSlideShowDataAsync: noJSON!!! ', transport.responseText);
        }
      },
      onFailure : function(transport) {
        if ((typeof console != 'undefined')
            && (typeof console.warn != 'undefined')) {
          console.warn('loadSlideShowDataAsync: failed to execute request for'
            + ' celSlideShowIds [' + Object.toJSON(getSlideShowIds()) + ']: ',
            transport.status, transport.statusText);
        }
      }
    });
  }
};

var celSlideShowConfig = new Hash(); 
var initSlideShows = function(slideShowConfigArray) {
  $A(slideShowConfigArray).each(function(slideShowConfig) {
    celSlideShows_initOneSlideShow(slideShowConfig);
  });
  $$('body')[0].stopObserving('celanim_overlay:afterExpandGeneral',
      celSlideShow_AfterExpandGeneralHandler);
  $$('body')[0].observe('celanim_overlay:afterExpandGeneral',
      celSlideShow_AfterExpandGeneralHandler);
  $$('body')[0].stopObserving('celanim_overlay:afterCloseGeneral',
      celSlideShow_AfterCloseGeneralHandler);
  $$('body')[0].observe('celanim_overlay:afterCloseGeneral',
      celSlideShow_AfterCloseGeneralHandler);
};

var celSlideShows_copyBorder = function(borderName, fromElement, toElement) {
  var newBorderStyle = {};
  newBorderStyle[borderName + 'Width'] = fromElement.getStyle(borderName + 'Width');
  newBorderStyle[borderName + 'Color'] = fromElement.getStyle(borderName + 'Color');
  newBorderStyle[borderName + 'Style'] = fromElement.getStyle(borderName + 'Style');
  toElement.setStyle(newBorderStyle);
};

var celSlideShows_initOneSlideShow = function(slideShowConfig) {
  if (slideShowConfig.imageArray && (slideShowConfig.imageArray.size() > 0)) {
    celSlideShowConfig.set(slideShowConfig.htmlId, slideShowConfig);
    var slideShowImg = $(slideShowConfig.htmlId);
    var otherCssClassNames = $w(slideShowImg.className).without('celanim_slideshow'
        ).without('celanim_overlay').without('highslide-image');
    var tempImg = new Element('img', {
      'id' : slideShowConfig.htmlId + '_tmpImg',
      'style' : 'position: absolute; top: 0px; left: 0px;',
      'class' : otherCssClassNames.join(' ')
     }).hide();
    tempImg.observe('load', centerImage);
    tempImg.observe('load', celSlideshowImageIsLoadedHandler);
    celSlideShows_copyBorder('borderLeft', slideShowImg, tempImg);
    celSlideShows_copyBorder('borderRight', slideShowImg, tempImg);
    celSlideShows_copyBorder('borderTop', slideShowImg, tempImg);
    celSlideShows_copyBorder('borderBottom', slideShowImg, tempImg);
    var divWrapper = slideShowImg.wrap('div', {
        'class' : 'celanim_slideshow_wrapper' }
      ).insert({ top : tempImg });
    if (slideShowImg.up('.highslide-html')) {
      var overlayHTMLDiv = slideShowImg.up('.highslide-html');
      divWrapper.setStyle({ 'height' : overlayHTMLDiv.getHeight() + 'px' });
      divWrapper.setStyle({ 'width' : overlayHTMLDiv.getWidth() + 'px' });
      slideShowImg.setStyle({
        'margin-top' : '0',
        'margin-bottom' : '0',
        'margin-left' : '0',
        'margin-right' : '0'
      });
    } else {
      //TODO maybe move to onLoad on image
//      console.debug('copy dimensions: ', slideShowImg.getHeight(), slideShowImg.getWidth());
      divWrapper.setStyle({ 'height' : slideShowImg.getHeight() + 'px' });
      divWrapper.setStyle({ 'width' : slideShowImg.getWidth() + 'px' });
    }
    otherCssClassNames.each(function(className) {
          if (!className.startsWith('cel_effekt_')) {
            divWrapper.addClassName(className);
          }
    });
    moveStyleToWrapper(divWrapper, slideShowImg, 'float');
    moveStyleToWrapper(divWrapper, slideShowImg, 'margin-top');
    moveStyleToWrapper(divWrapper, slideShowImg, 'margin-bottom');
    moveStyleToWrapper(divWrapper, slideShowImg, 'margin-left');
    moveStyleToWrapper(divWrapper, slideShowImg, 'margin-right');
// adding border to Wrapper leads to problems with double borders. Thus removed.
//    moveStyleToWrapper(divWrapper, slideShowImg, 'border-top');
//    moveStyleToWrapper(divWrapper, slideShowImg, 'border-bottom');
//    moveStyleToWrapper(divWrapper, slideShowImg, 'border-right');
//    moveStyleToWrapper(divWrapper, slideShowImg, 'border-left');
    slideShowConfig.doImageResize = !slideShowImg.hasClassName('celanim_withoutImageResize');
    slideShowConfig.imageSrcQuery = slideShowImg.src.replace(/.*(\?.*)$/, '$1');
    var celwidth = parseInt(slideShowConfig.imageSrcQuery.replace(/^.*celwidth=(\d+).*/,
        '$1'));
    var celheight = parseInt(slideShowConfig.imageSrcQuery.replace(
        /^.*celheight=(\d+).*/, '$1'));
    var borderHorizontal = parseInt(slideShowImg.getStyle('borderLeftWidth'));
    borderHorizontal += parseInt(slideShowImg.getStyle('borderRightWidth'));
    if (isNaN(borderHorizontal)) {
      borderHorizontal = 0;
    }
    var borderVertical = parseInt(slideShowImg.getStyle('borderTopWidth'));
    borderVertical += parseInt(slideShowImg.getStyle('borderBottomWidth'));
    if (isNaN(borderVertical)) {
      borderVertical = 0;
    }
    celwidth -= borderHorizontal;
    celheight -= borderVertical;
    slideShowConfig.imageSrcQuery = slideShowConfig.imageSrcQuery.replace(
        /celheight=(\d+)/, 'celheight=' + celheight).replace(/celwidth=(\d+)/,
            'celwidth=' + celwidth);
    if (slideShowConfig.doImageResize) {
      slideShowImg.src = slideShowImg.src.replace(/(\?.*)$/,
          slideShowConfig.imageSrcQuery);
    } else {
      slideShowImg.src = slideShowImg.src.replace(/(\?.*)$/, '');
    }
    /**  END HACK
     **/
    slideShowConfig.hasRandomStart = slideShowImg.hasClassName(
        'celanim_slideshowRandomStart');
    slideShowConfig.firstImageNum = parseInt(celSlideShowGetPart(slideShowConfig.htmlId,
        6, 0));
    slideShowConfig.firstImageChange = true;
    slideShowImg.absolutize();
    removeImageSize(slideShowImg);
    removeImageSize(tempImg);
    // fix centering of first image
//    console.debug('recenter image: ',slideShowImg.getHeight(),slideShowImg.getWidth());
    slideShowImg.observe('load', centerImage);
    slideShowImg.src = slideShowImg.src;
    slideShowConfig.delayFinished = false;
    //XXX is this check needed at all? if gallery is empty or does not exist
    //XXX we should not start initSlideshow anyway... 
    if (slideShowConfig && (celSlideShowHasNext(slideShowConfig) > -1)) {
      if (slideshowIsDebug && (typeof console != 'undefined')
          && (typeof console.debug != 'undefined')) {
        console.debug('celSlideShows_initOneSlideShow: set next image to ',
            celSlideShowGetCurrentImageId(slideShowConfig), ", ",
            slideShowConfig.preloadCurrentImage.src);
      }
      slideShowConfig.nextImgIsLoaded = false;
      tempImg.src = slideShowConfig.preloadCurrentImage.src;
    }
    $(slideShowConfig.htmlId).fire('celanim_slideshow:afterInit', slideShowConfig);
  }
};

var moveStyleToWrapper = function(divWrapper, element, styleName) {
  var newStyle = new Hash();
  newStyle.set(styleName, element.getStyle(styleName));
  divWrapper.setStyle(newStyle.toObject());
  newStyle.set(styleName, '');
  element.setStyle(newStyle.toObject());
};

var celSlideShowGetPart = function(elemId, num, defaultvalue) {
  var parts = elemId.split(':');
  if ((num < parts.length) && (parts[num] != '')) {
    return parts[num];
  } else {
    return defaultvalue;
  }
};

var celSlideShowThreads = new Hash();
var scheduleChangeImage = function(elemId) {
  if (slideshowIsDebug && (typeof console != 'undefined')
      && (typeof console.debug != 'undefined')) {
    console.debug('scheduleChangeImage: ' + elemId);
  }
  var timeout = celSlideShowGetPart(elemId, 2, 3);
  var slideConfig = celSlideShowConfig.get(elemId);
  slideConfig.delayFinished = false;
  celSlideShowThreads.set(elemId, delayedChangeImage.delay(timeout, elemId));
};

var startSlideShows = function() {
  celSlideShowConfig.each(function(pair){
    celSlideShow_startOne(pair.key);
  });
};

var celSlideShow_startOne = function(elemId) {
  if (slideshowIsDebug && (typeof console != 'undefined')
      && (typeof console.debug != 'undefined')) {
    console.debug('celSlideShow_startOne: ' + elemId);
  }
  var isManualStart = $(elemId).hasClassName('celanim_manualstart');
  var isCelanimOverlay = $(elemId).hasClassName('celanim_overlay');
  if (isCelanimOverlay) {
    $(elemId).stopObserving('celanim_overlay:afterExpand', celSlideShow_AfterExpand);
    $(elemId).observe('celanim_overlay:afterExpand', celSlideShow_AfterExpand);
  }
  celSlideShowIsRunningHash.set(elemId, !isManualStart);
  if (isManualStart) {
    $(elemId).setStyle({
      'visibility' : ''
    });
    var startButtonDiv = new Element('div', { 'class' : 'slideshowButton' });
    startButtonDiv.hide();
    $(elemId).insert({ after : startButtonDiv });
    if (isCelanimOverlay) {
      $(elemId).up('div.celanim_slideshow_wrapper').observe('click',
          celSlideShowStartOverlay);
    } else {
      $(elemId).up('div.celanim_slideshow_wrapper').observe('click',
          celSlideShowManualStartStop);
    }
    Effect.Appear(startButtonDiv, { duration : 3.0 , to : 0.8 });
  } else {
    celSlideShowStartSlideShow(elemId);
  }
  if ($(elemId).hasClassName('celanim_addNavigation')) {
    celSlideShow_InternalAddNavigation(celSlideShowConfig.get(elemId));
  }
};

var celSlideShow_InternalAddNavigation = function(slideConfig, maxRetry) {
  var internalMaxRetry = maxRetry || 20;
  internalMaxRetry = internalMaxRetry - 1;
  var elemId = slideConfig.htmlId;
  var wrapperElement = celSlideShow_getOuterWrapperElement(elemId);
  if ((wrapperElement.getHeight() <=0) && (wrapperElement.getWidth() <=0)) {
    /** There is a bug in FF an IE. If an the page is loaded in an iframe it can happen,
     *  that the dimensions are not yet available in the onLoad event. This can be for an
     *  image or any other element. THUS the only the work around this issue is to retry
     *  after some amount of time. We will retry at most 20 times.
     *  Then we will give up. **/
    if (internalMaxRetry >= 0) {
      if (slideshowIsDebug && (typeof console != 'undefined')
          && (typeof console.log != 'undefined')) {
        console.log('celSlideShow_InternalAddNavigation: failed to add navigation! retry'
            + ' in 0.1 seconds. retries left ', internalMaxRetry);
      }
      celSlideShow_InternalAddNavigation.delay(0.1, slideConfig, internalMaxRetry);
    } else {
      console.error("celSlideShow_InternalAddNavigation: failed to add navigation!"
          + " maxRetry exhausted. I'm giving up!");
    }
  } else {
    celSlideShow_addNavigation(elemId);
    wrapperElement.fire('celanim_slideshow:afterAddNavigation', slideConfig);
  }
};

var celSlideShowStartOverlay = function(event) {
  this.down('img.celanim_slideshow').fire('celanim_overlay:openOverlay', event);
};

var celSlideShow_AfterExpand = function(event) {
  var overlayExpander = event.memo;
  var elemId = overlayExpander.thumb.id; 
  var overlayImg = $$('.celanim_overlay_wrapper img.highslide-image')[0];
  overlayImg.addClassName('celanim_slideshow');
  var overlayId = elemId.replace(/^([^:]*):(.*)$/, '$1_overlay:$2');
  overlayImg.id = overlayId;
  var newConfig = $H(celSlideShowConfig.get(elemId)).toObject(); // make a copy
  newConfig.htmlId = overlayId;
  newConfig.currImgId = undefined;
  newConfig.preloadCurrentImage = undefined;
  newConfig.preloadNextImage = undefined;
  newConfig.preloadPrevImage = undefined;
  celSlideShows_initOneSlideShow(newConfig);
  celSlideShow_startOne(overlayId);
  manualChangeImage(overlayId);
  if ($(overlayId).up('.celanim_addNavigation')) {
    celSlideShow_InternalAddNavigation(newConfig);
  }
};

var celSlideShow_getOuterWrapperElement = function(elemId) {
  var imgElem = $(elemId) || $(elemId + '_tmpImg');
  return imgElem.up('.celanim_overlay_wrapper')
    || imgElem.up('.celanim_slideshow_wrapper');
};

var celSlideShow_addNavigation = function(elemId) {
  var wrapperElem = celSlideShow_getOuterWrapperElement(elemId);
  var leftNavElem = new Element('div').addClassName('celanim_slideShow_navLeft'
      ).update('<');
  leftNavElem.setStyle({
    'height' : (wrapperElem.getHeight() + 'px')
  });
  var rightNavElem = new Element('div').addClassName('celanim_slideShow_navRight'
      ).update('>');
  rightNavElem.setStyle({
    'height' : (wrapperElem.getHeight() + 'px')
  });
  wrapperElem.insert({ bottom : leftNavElem});
  wrapperElem.insert({ bottom : rightNavElem});
  leftNavElem.observe('click', celSlideShow_PrevImage.bind($(elemId)));
  rightNavElem.observe('click', celSlideShow_NextImage.bind($(elemId)));
};

var celSlideShowIsNotChanging = function(elemId) {
  return ($(elemId) && !$(elemId).hasClassName('celanim_isChanging'));
}; 

var manualChangeImage = function(elemId) {
  if (celSlideShowIsNotChanging(elemId)) {
    var beforeIsRunning = celSlideShowIsRunning(elemId);
    if (beforeIsRunning) {
      // stop current scheduled image change. celSlideShowEffectAfterFinish will
      // schedule a new one as long as 'celanim_slideshow_running' css class is
      // not removed.
      celSlideShowCancelNextChange(elemId);
    }
    if (slideshowIsDebug && (typeof console != 'undefined')
        && (typeof console.debug != 'undefined')) {
      console.debug("manualChangeImage: before changing ", elemId);
    }
    var slideConfig = celSlideShowConfig.get(elemId);
    slideConfig.delayFinished = true;
    changeImage(elemId);
  } else {
    if (slideshowIsDebug && (typeof console != 'undefined')
        && (typeof console.warn != 'undefined')) {
      console.warn("manualChangeImage: skip because 'celanim_isChanging' ", elemId);
    }
  }
};

var celSlideShow_PrevImage = function(event) {
  event.stop();
  var elemId = this.id;
  var slideConfig = celSlideShowConfig.get(elemId);
  celSlideShow_getOuterWrapperElement(elemId).fire(
      'celanim_slideshow:beforeClickPrevImage', slideConfig);
  if (celSlideShowIsNotChanging(elemId) && celSlideShowMoveToPrev(slideConfig)) {
    celSlideShowSetTempImgSrc(slideConfig);
    manualChangeImage(elemId);
  }
  celSlideShow_getOuterWrapperElement(elemId).fire(
      'celanim_slideshow:afterClickPrevImage', slideConfig);
};

var celSlideShow_NextImage = function(event) {
  event.stop();
  var elemId = this.id;
  var slideConfig = celSlideShowConfig.get(elemId);
  celSlideShow_getOuterWrapperElement(elemId).fire(
      'celanim_slideshow:beforeClickNextImage', slideConfig);
  if (celSlideShowIsNotChanging(elemId) && celSlideShowMoveToNext(slideConfig)) {
    celSlideShowSetTempImgSrc(slideConfig);
    manualChangeImage(elemId);
  }
  celSlideShow_getOuterWrapperElement(elemId).fire(
      'celanim_slideshow:afterClickNextImage', slideConfig);
};

var celSlideShow_AfterExpandGeneralHandler = function(event){
  celSlideShowPauseAllSlideShows();
};

var celSlideShow_AfterCloseGeneralHandler = function(event) {
  celSlideShowResumeAllSlideShows();
};

var celSlideShowManualStartStop = function(event) {
  var imgElem = this.down('.celanim_slideshow');
  if (imgElem && imgElem.id) {
    var elemId = imgElem.id;
    var startButtonDiv = this.down('.slideshowButton');
    if (celSlideShowIsRunning(elemId)
        && (typeof celSlideShowThreads.get(elemId) != "undefined")) {
      celSlideShowStopSlideShow(elemId);
      Effect.Appear(startButtonDiv, { duration : 1.0 , to : 0.9 });
    } else {
      celSlideShowStartSlideShow(elemId);
      Effect.Fade(startButtonDiv, { duration : 1.0 });
    }
    event.stop();
  }
};

var celSlideShowStopSlideShow = function(elemId) {
  celSlideShowCancelNextChange(elemId);
  celSlideShowIsRunningHash.set(elemId, false);
  celSlideShow_getOuterWrapperElement(elemId).removeClassName(
      'celanim_slideshow_running');
};

var celSlideShowCancelNextChange = function(elemId) {
  if (typeof celSlideShowThreads.get(elemId) != "undefined") {
    window.clearTimeout(celSlideShowThreads.get(elemId));
    celSlideShowThreads.unset(elemId);
    if (slideshowIsDebug && (typeof console != 'undefined')
        && (typeof console.debug != 'undefined')) {
      console.debug("celSlideShowCancelNextChange: canceled next change ", elemId);
    }
  }
};

var celSlideShowStartSlideShow = function(elemId) {
  celSlideShowIsRunningHash.set(elemId, true);
  celSlideShow_getOuterWrapperElement(elemId).removeClassName('celanim_slideshow_paused');
  celSlideShow_getOuterWrapperElement(elemId).addClassName('celanim_slideshow_running');
  var slideConfig = celSlideShowConfig.get(elemId);
  slideConfig.delayFinished = true;
  changeImage(elemId);
};

var celSlideShowPausedSlideShowIds = new Array();
var celSlideShowPauseAllSlideShows = function() {
  celSlideShowThreads.each(function(pair) {
    if ($(pair.key) && !celSlideShow_isInOverlay(pair.key)) {
      celSlideShowStopSlideShow(pair.key);
      celSlideShowPausedSlideShowIds.push(pair.key);
      celSlideShow_getOuterWrapperElement(pair.key).addClassName(
          'celanim_slideshow_paused');
    }
  });
};

var celSlideShow_isInOverlay = function(elemId) {
  if (slideshowIsDebug && (typeof console != 'undefined')
      && (typeof console.debug != 'undefined')) {
    console.debug('celSlideShow_isInOverlay: ' + elemId);
  }
  return ($(elemId) && (typeof $(elemId).up('.highslide-container') != "undefined"));
};

var celSlideShowResumeAllSlideShows = function() {
  celSlideShowPausedSlideShowIds.each(function(elemId) {
    celSlideShowStartSlideShow(elemId);
    celSlideShowPausedSlideShowIds.splice(elemId);
    celSlideShow_getOuterWrapperElement(elemId).removeClassName(
        'celanim_slideshow_paused');
    celSlideShow_getOuterWrapperElement(elemId).addClassName('celanim_slideshow_running');
  });
};

var celSlideShowIsRunningHash = new Hash();
var celSlideShowIsRunning = function(elemId) {
  return (celSlideShowIsRunningHash.get(elemId) == true); 
};

var removeImageSize = function(tempImage) {
  tempImage.setStyle({
    'height' : 'auto',
    'width' : 'auto'
  });
  tempImage.writeAttribute({
    'height' : '',
    'width' : ''
  });
};

var celSlideShowSetTempImgSrc = function(slideConfig) {
  var fadeimgtemp = $(slideConfig.htmlId + '_tmpImg');
  slideConfig.nextImgIsLoaded = false;
  fadeimgtemp.src = slideConfig.preloadCurrentImage.src;
};

var celSlideShowEffectAfterFinish = function(effect) {
  var slideConfig = celSlideShowConfig.get(effect.options.slideShowElemId);
  var fadeimgtemp = $(slideConfig.htmlId + '_tmpImg');
  var fadeimg = $(slideConfig.htmlId);
  if (fadeimg && fadeimgtemp) {
    if (slideshowIsDebug && (typeof console != 'undefined')
        && (typeof console.debug != 'undefined')) {
      console.debug('celSlideShowEffectAfterFinish: ', slideConfig.htmlId, fadeimg.src,
          fadeimgtemp.src);
    }
    fadeimg.src = fadeimgtemp.src;
    fadeimg.setStyle({
      'top' : fadeimgtemp.getStyle('top'),
      'left' : fadeimgtemp.getStyle('left')
    });
    fadeimg.show();
    fadeimgtemp.hide();
    $(slideConfig.htmlId).fire('celanim_slideshow:afterChangeImage', slideConfig);
    if (celSlideShowIsRunning(slideConfig.htmlId)) {
      if (celSlideShowHasNext(slideConfig)) {
          scheduleChangeImage(slideConfig.htmlId);
      } else {
        celSlideShowStopSlideShow(slideConfig.htmlId);
      }
    }
    $(slideConfig.htmlId).removeClassName('celanim_isChanging');
  }
};

var celSlideShowEffects = new Hash();
var celSlideShowAddEffect = function (effectKey, effect) {
  effect.params = effect.params || {};
  celSlideShowEffects.set(effectKey, effect);
};

var getCenteredValue = function(diffValue) {
  if (diffValue < 0) {
    return 0;
  } else {
    return Math.floor(diffValue / 2);
  }
};

var celSlideshowImageIsLoadedHandler = function(event) {
  var tempImg = event.findElement();
  var elemId = tempImg.id.replace(/_tmpImg$/,'');
  var slideConfig = celSlideShowConfig.get(elemId);
  slideConfig.nextImgIsLoaded = true;
  if (slideConfig.delayFinished) {
    if (slideshowIsDebug && (typeof console != 'undefined')
        && (typeof console.debug != 'undefined')) {
      console.debug("celSlideshowImageIsLoadedHandler: delayFinished thus executing"
          + " changeImage ", elemId);
    }
    changeImage(elemId);
  }
};

var centerImage = function(event) {
  var tempImg = event.findElement();
  celSlideShowInternalCenterImage(tempImg);
  if (slideshowIsDebug && (typeof console != 'undefined')
      && (typeof console.debug != 'undefined')) {
    console.debug("centerImage: done for ", tempImg.id);
  }
};

var celSlideShowInternalCenterImage = function(tempImg, maxRetry) {
  var internalMaxRetry = maxRetry || 20;
  internalMaxRetry = internalMaxRetry - 1;
  var dim = tempImg.getDimensions();
  var wrapDiv = tempImg.up('div');
  if ((wrapDiv.getHeight() <=0) && (wrapDiv.getWidth() <=0)) {
    /** There is a bug in FF an IE. If an the page is loaded in an iframe it can happen,
     *  that the dimensions are not yet available in the onLoad event. This can be for an
     *  image or any other element. THUS the only the work around this issue is to retry
     *  after some amount of time. We will retry at most 20 times.
     *  Then we will give up. **/
    if (internalMaxRetry >= 0) {
      if (slideshowIsDebug && (typeof console != 'undefined')
          && (typeof console.log != 'undefined')) {
        console.log('celSlideShowInternalCenterImage: failed to center image! retry'
            + ' in 0.1 seconds. retries left ', internalMaxRetry);
      }
      celSlideShowInternalCenterImage.delay(0.1, tempImg, internalMaxRetry);
    } else {
      console.error("celSlideShowInternalCenterImage: failed to center image!"
          + " maxRetry exhausted. I'm giving up!");
    }
  } else {
    var centeredTop = getCenteredValue(wrapDiv.getHeight() - dim.height);
    var centeredLeft = getCenteredValue(wrapDiv.getWidth() - dim.width);
    var slideConfig = celSlideShowConfig.get(tempImg.id.replace(/_tmpImg$/,''));
    if (slideConfig) {
      slideConfig.centeredTop = centeredTop;
      slideConfig.centeredLeft = centeredLeft;
    }
    tempImg.setStyle({
      'top' : centeredTop + 'px',
      'left' : centeredLeft + 'px'
    });
  }
};

var delayedChangeImage = function(elemId) {
  var slideConfig = celSlideShowConfig.get(elemId);
  slideConfig.delayFinished = true;
  if (celSlideShowIsNotChanging(elemId) && celSlideShowMoveToNext(slideConfig)) {
    celSlideShowSetTempImgSrc(slideConfig);
    changeImage(elemId);
  }
};

var isLoadedAndDelayed = function(elemId) {
  var slideConfig = celSlideShowConfig.get(elemId);
  return slideConfig.delayFinished && slideConfig.nextImgIsLoaded;
};

var changeImage = function(elemId) {
  if (celSlideShowIsNotChanging(elemId) && isLoadedAndDelayed(elemId)) {
    $(elemId).addClassName('celanim_isChanging');
    var effectKey = celSlideShowGetPart(elemId, 3, 'fade');
    //TODO force "none" effect if _tmpImg.src = current img.
    //TODO maybe forece "none" for first image loaded!
    if (celSlideShowConfig.get(elemId).firstImageChange) {
      effectKey = 'none';
      $(elemId).setStyle({
        'visibility' : ''
      });
    }
    var effectDetails = celSlideShowEffects.get(effectKey) || celSlideShowEffects.get(
        'fade');
    var effectParameters = $H(effectDetails.params).merge({
      'sync' : true
    });
    var duration = effectParameters.get('duration');
    theEffect = effectDetails.effect(elemId + '_tmpImg', effectParameters.toObject());
    celSlideShow_getOuterWrapperElement(elemId).fire(
        'celanim_slideshow:beforeChangeImage', celSlideShowConfig.get(elemId));
    celSlideShowConfig.get(elemId).firstImageChange = false;
    new Effect.Parallel(
        [
          theEffect,
          new Effect.Fade(elemId, { from : 1, to : 0, sync: true })
        ],
        {
          'duration' : duration,
          'slideShowElemId' : elemId,
          'afterFinish' : celSlideShowEffectAfterFinish
        }
    );
  } else {
    if (slideshowIsDebug && $(elemId) && (typeof console != 'undefined')
        && (typeof console.debug != 'undefined')) {
      console.debug("changeImage: skip for [", elemId, '] because ',
          !$(elemId).hasClassName('celanim_isChanging'),  isLoadedAndDelayed(elemId));
    }
  }
};

var celSlideShowInitFirstImage = function(slideConfig) {
  $(slideConfig.htmlId).fire('celanim_slideshow:initFirstImage', slideConfig);
  if ((typeof(slideConfig.currImgId) != 'number') || (slideConfig.currImgId < 0)) {
    if (slideConfig.hasRandomStart) {
      celSlideShowSetCurrentImgId(slideConfig, slideShowGetRandomStartNum(slideConfig));
    } else {
      celSlideShowSetCurrentImgId(slideConfig, slideConfig.firstImageNum);
    }
  }
};

var celSlideShowGetCurrentImageId = function(slideConfig) {
  if (typeof(slideConfig.currImgId) != 'number') {
    celSlideShowInitFirstImage(slideConfig);
  }
  return slideConfig.currImgId;
};

var celSlideShowGetNextId = function(slideConfig) {
  var nextImgId = celSlideShowGetCurrentImageId(slideConfig) + 1;
  if (nextImgId >= slideConfig.imageArray.size()) {
    if (slideConfig.doNotCycling) {
      nextImgId = null;
    } else {
      nextImgId = 0;
    }
  }
  return nextImgId;
};

var celSlideShowGetPrevId = function(slideConfig) {
  var prevImgId = celSlideShowGetCurrentImageId(slideConfig) - 1;
  if (prevImgId < 0) {
    if (slideConfig.doNotCycling) {
      prevImgId = null;
    } else {
      prevImgId = slideConfig.imageArray.size() - 1;
    }
  }
  return prevImgId;
};

var celSlideShowHasNext = function(slideConfig) {
  var nextImgId = celSlideShowGetNextId(slideConfig);
  return ((nextImgId != null)
      && (nextImgId != celSlideShowGetCurrentImageId(slideConfig)));
};

var celSlideShowHasPrev = function(slideConfig) {
  var prevImgId = celSlideShowGetPrevId(slideConfig);
  return ((prevImgId != null)
      && (prevImgId != celSlideShowGetCurrentImageId(slideConfig)));
};

var celSlideShowMoveToNext = function(slideConfig) {
  if (celSlideShowHasNext(slideConfig)) {
    celSlideShowSetCurrentImgId(slideConfig, celSlideShowGetNextId(slideConfig));
    return true;
  }
  return false;
};

var celSlideShowMoveToPrev = function(slideConfig) {
  if (celSlideShowHasPrev(slideConfig)) {
    celSlideShowSetCurrentImgId(slideConfig, celSlideShowGetPrevId(slideConfig));
    return true;
  }
  return false;
};

var celSlideShowSetCurrentImgId = function(slideConfig, newImgId) {
  slideConfig.currImgId = newImgId;
  var newCurrentImage = new Image();
  newCurrentImage.src = celSlideShowGetImgSrcForId(slideConfig, newImgId);
  slideConfig.preloadCurrentImage = newCurrentImage;
  if (celSlideShowHasPrev(slideConfig)) {
    var newPrevImage = new Image();
    var newPrevId = celSlideShowGetPrevId(slideConfig);
    newPrevImage.src = celSlideShowGetImgSrcForId(slideConfig, newPrevId);
    slideConfig.preloadPrevImage = newPrevImage;
    if (slideshowIsDebug && (typeof console != 'undefined')
        && (typeof console.debug != 'undefined')) {
      console.debug('celSlideShowSetCurrentImgId preloading prev: ', newPrevId, ", ",
          newPrevImage.src);
    }
  } else {
    slideConfig.preloadPrevImage = undefined;
  }
  if (celSlideShowHasNext(slideConfig)) {
    var newNextImage = new Image();
    var newNextId = celSlideShowGetNextId(slideConfig);
    newNextImage.src = celSlideShowGetImgSrcForId(slideConfig, newNextId);
    slideConfig.preloadNextImage = newNextImage;
    if (slideshowIsDebug && (typeof console != 'undefined')
        && (typeof console.debug != 'undefined')) {
      console.debug('celSlideShowSetCurrentImgId preloading next: ', newNextId, ", ",
          newNextImage.src);
    }
  } else {
    slideConfig.preloadNextImage = undefined;
  }
};

var celSlideShowGetImgSrcForId = function(slideConfig, newImgId) {
  var imgSrc = slideConfig.imageArray[newImgId];
  if (slideConfig.doImageResize) {
    imgSrc += slideConfig.imageSrcQuery;
  }
  return imgSrc;
};

var slideShowGetRandomStartNum = function(slideConfig) {
  return Math.round(Math.random() * (slideConfig.imageArray.size() - 1));
};

celAddOnBeforeLoadListener(loadSlideShowDataAsync);

// default effects
celSlideShowAddEffect('none', { effect : Effect.Appear, params : { duration: 0.0 } });
celSlideShowAddEffect('fade', { effect : Effect.Appear, params : { duration: 2.0 } });
celSlideShowAddEffect('blinddown', { effect : Effect.BlindDown, params : { duration: 2.0 } });
celSlideShowAddEffect('blindtopleft', { effect : Effect.BlindDown, params : { duration: 2.0,
  scaleX : true, scaleY : true } });
/**
 grow is not working with the new Parallel Effect (added to fade out the old image) 
celSlideShowAddEffect('grow', { effect : Effect.Grow, params : { duration: 2.0 } });
**/
