var slideshowIsDebug = false;
  
YAHOO.util.Event.onDOMReady(function() {
  loadSlideShowDataAsync();
});

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

var celSlideShows_initOneSlideShow = function(slideShowConfig) {
  if (slideShowConfig.imageArray && (slideShowConfig.imageArray.size() > 0)) {
    celSlideShowConfig.set(slideShowConfig.htmlId, slideShowConfig);
    var slideShowImg = $(slideShowConfig.htmlId);
    var tempImg = new Element('img', {
      'id' : slideShowConfig.htmlId + '_tmpImg',
      'style' : 'position: absolute; top: 0px; left: 0px;',
      'class' : slideShowImg.className
     }).hide();
    tempImg.observe('load', centerImage);
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
    $w(slideShowImg.className).without('celanim_slideshow').without('celanim_overlay'
        ).each(function(className) {
          if (!className.startsWith('cel_effekt_')) {
            divWrapper.addClassName(className);
          }
    });
    moveStyleToWrapper(divWrapper, slideShowImg, 'float');
    moveStyleToWrapper(divWrapper, slideShowImg, 'margin-top');
    moveStyleToWrapper(divWrapper, slideShowImg, 'margin-bottom');
    moveStyleToWrapper(divWrapper, slideShowImg, 'margin-left');
    moveStyleToWrapper(divWrapper, slideShowImg, 'margin-right');
    moveStyleToWrapper(divWrapper, slideShowImg, 'border-top');
    moveStyleToWrapper(divWrapper, slideShowImg, 'border-bottom');
    moveStyleToWrapper(divWrapper, slideShowImg, 'border-right');
    moveStyleToWrapper(divWrapper, slideShowImg, 'border-left');
    slideShowConfig.doImageResize = !slideShowImg.hasClassName('celanim_withoutImageResize');
    slideShowConfig.imageSrcQuery = slideShowImg.src.replace(/.*(\?.*)$/, '$1');
    /** START HACK: increase height and width by one to fix problem in celements-photo
     *              which sometimes returns images too small by one in both dimensions.
     **/
    var celwidth = parseInt(slideShowConfig.imageSrcQuery.replace(/^.*celwidth=(\d+).*/,
        '$1')) + 1;
    var celheight = parseInt(slideShowConfig.imageSrcQuery.replace(
        /^.*celheight=(\d+).*/, '$1')) + 1;
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
    slideShowImg.absolutize();
    removeImageSize(slideShowImg);
    // fix centering of first image
//    console.debug('recenter image: ',slideShowImg.getHeight(),slideShowImg.getWidth());
    slideShowImg.observe('load', centerImage);
    slideShowImg.src = slideShowImg.src;
    if (slideShowHasNextImage(slideShowConfig)) {
      if (slideshowIsDebug && (typeof console != 'undefined')
          && (typeof console.debug != 'undefined')) {
        console.debug('celSlideShows_initOneSlideShow: set next image to ',
            slideShowConfig.nextImg, ", ", slideShowConfig.nextimgsrc);
      }
      tempImg.src = slideShowConfig.nextimgsrc;
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
  var timeout = celSlideShowGetPart(elemId, 2, 3);
  celSlideShowThreads.set(elemId, changeImage.delay(timeout, elemId));
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
    celSlideShow_addNavigation(elemId);
    celSlideShow_getOuterWrapperElement(elemId).fire(
        'celanim_slideshow:afterAddNavigation', celSlideShowConfig.get(elemId));
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
  newConfig.nextImg = undefined;
  celSlideShows_initOneSlideShow(newConfig);
  celSlideShow_startOne(overlayId);
  changeImage(overlayId);
  if ($(overlayId).up('.celanim_addNavigation')) {
    celSlideShow_addNavigation(overlayId);
    $(overlayId).fire('celanim_slideshow:afterAddNavigation', newConfig);
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

var celSlideShow_PrevImage = function(event) {
  event.stop();
  var elemId = this.id;
  var slideConfig = celSlideShowConfig.get(elemId);
  celSlideShow_getOuterWrapperElement(elemId).fire(
      'celanim_slideshow:beforeClickPrevImage', slideConfig);
  if (slideShowHasPrevImage(slideConfig)) {
    changeImage(elemId);
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
  if (slideConfig.nextImg >=0) {
    changeImage(elemId);
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
  celSlideShowIsRunningHash.set(elemId, false);
  window.clearTimeout(celSlideShowThreads.get(elemId));
  celSlideShowThreads.unset(elemId);
};

var celSlideShowStartSlideShow = function(elemId) {
  celSlideShowIsRunningHash.set(elemId, true);
  celSlideShow_getOuterWrapperElement(elemId).removeClassName('celanim_slideshow_paused');
  celSlideShow_getOuterWrapperElement(elemId).addClassName('celanim_slideshow_running');
  changeImage(elemId);
};

var celSlideShowPausedSlideShowIds = new Array();
var celSlideShowPauseAllSlideShows = function() {
  celSlideShowThreads.each(function(pair) {
    if ($(pair.key) && !celSlideShow_isInOverlay(pair.key)) {
      celSlideShowStopSlideShow(pair.key);
      celSlideShowPausedSlideShowIds.push(pair.key);
      celSlideShow_getOuterWrapperElement(pair.key).removeClassName(
          'celanim_slideshow_running');
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

var celSlideShowEffectAfterFinish = function(effect) {
  var slideConfig = celSlideShowConfig.get(effect.options.slideShowElemId);
  var fadeimgtemp = $(slideConfig.htmlId + '_tmpImg');
  var fadeimg = $(slideConfig.htmlId);
  if (fadeimg && fadeimgtemp) {
    fadeimg.src = fadeimgtemp.src;
    fadeimg.setStyle({
      'top' : fadeimgtemp.getStyle('top'),
      'left' : fadeimgtemp.getStyle('left')
    });
    fadeimg.show();
    fadeimgtemp.hide();
    $(slideConfig.htmlId).fire('celanim_slideshow:afterChangeImage', slideConfig);
    if (slideShowHasNextImage(slideConfig)) {
      removeImageSize(fadeimgtemp);
      var isNewImage = !fadeimgtemp.src.endsWith(slideConfig.nextimgsrc);
      fadeimgtemp.src = slideConfig.nextimgsrc;
      if (isNewImage && celSlideShowIsRunning(slideConfig.htmlId)) {
        scheduleChangeImage(slideConfig.htmlId);
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

var centerImage = function(event) {
  var tempImg = event.findElement();
  celSlideShowInternalCenterImage(tempImg);
};

var celSlideShowInternalCenterImage = function(tempImg) {
  var dim = tempImg.getDimensions();
  var wrapDiv = tempImg.up('div');
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
};

var changeImage = function(elemId) {
  if ($(elemId) && !$(elemId).hasClassName('celanim_isChanging')) {
    $(elemId).addClassName('celanim_isChanging');
    var effectKey = celSlideShowGetPart(elemId, 3, 'fade');
    var effectDetails = celSlideShowEffects.get(effectKey) || celSlideShowEffects.get(
        'fade');
    var effectParameters = $H(effectDetails.params).merge({
      'sync' : true
    });
    var duration = effectParameters.get('duration');
    theEffect = effectDetails.effect(elemId + '_tmpImg', effectParameters.toObject());
    celSlideShow_getOuterWrapperElement(elemId).fire(
        'celanim_slideshow:beforeChangeImage', celSlideShowConfig.get(elemId));
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
  }
};

var slideShowHasNextImage = function(slideConfig) {
  if (typeof slideConfig.nextImg != 'number') {
    slideShowInitFirstImage(slideConfig);
  } else {
    slideConfig.nextImg = slideConfig.nextImg + 1;
  }
  if (slideConfig.nextImg >= slideConfig.imageArray.size()) {
    slideConfig.nextImg = 0;
  }
  if (slideshowIsDebug && (typeof console != 'undefined')
      && (typeof console.debug != 'undefined')) {
    console.debug('slideShowHasNextImage: ', slideConfig.htmlId, ", ",
        slideConfig.nextImg);
  }
  if (slideConfig.nextImg >=0) {
    slideConfig.nextimgsrc = slideConfig.imageArray[slideConfig.nextImg];
    if (slideConfig.doImageResize) {
      slideConfig.nextimgsrc += slideConfig.imageSrcQuery;
    }
    return true;
  } else {
    return false;
  }
};

var slideShowInitFirstImage = function(slideConfig) {
  $(slideConfig.htmlId).fire('celanim_slideshow:initFirstImage', slideConfig);
  if ((typeof slideConfig.nextImg != 'number') || (slideConfig.nextImg < 0)) {
    if (slideConfig.hasRandomStart) {
      slideConfig.nextImg = slideShowGetRandomStartNum(slideConfig);
    } else {
      slideConfig.nextImg = 0;
    }
  }
};

var slideShowGetRandomStartNum = function(slideConfig) {
  return Math.round(Math.random() * (slideConfig.imageArray.size() - 1));
};

var slideShowMoveToPrevImage = function(slideConfig) {
  if (typeof slideConfig.nextImg != 'number') {
    slideConfig.nextImg = 0;
  } else {
    slideConfig.nextImg = slideConfig.nextImg - 1;
  }
  if (slideConfig.nextImg < 0) {
    slideConfig.nextImg = slideConfig.imageArray.size() - 1;
  }
};

var slideShowHasPrevImage = function(slideConfig) {
  slideShowMoveToPrevImage(slideConfig);
  slideShowMoveToPrevImage(slideConfig);
  if (slideConfig.nextImg >=0) {
    slideConfig.nextimgsrc = slideConfig.imageArray[slideConfig.nextImg];
    if (slideConfig.doImageResize) {
      slideConfig.nextimgsrc += slideConfig.imageSrcQuery;
    }
    return true;
  } else {
    return false;
  }
};

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
