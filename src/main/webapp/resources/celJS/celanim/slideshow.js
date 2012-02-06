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
            && (typeof console.debug != 'undefined')) {
          console.debug('loadSlideShowDataAsync: noJSON!!! ', transport.responseText);
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
};

var celSlideShows_initOneSlideShow = function(slideShowConfig) {
  if (slideShowConfig.imageArray && (slideShowConfig.imageArray.size() > 0)) {
    celSlideShowConfig.set(slideShowConfig.htmlId, slideShowConfig);
    var tempImg = new Element('img', {
      'id' : slideShowConfig.htmlId + '_tmpImg',
      'style' : 'position: absolute; top: 0px; left: 0px;'
     }).hide();
    tempImg.observe('load', centerImage);
    var divWrapper = $(slideShowConfig.htmlId).wrap('div', {
        'class' : 'celanim_slideshow_wrapper' }
      ).insert({ top : tempImg });
    if ($(slideShowConfig.htmlId).up('.highslide-html')) {
      var overlayHTMLDiv = $(slideShowConfig.htmlId).up('.highslide-html');
      divWrapper.setStyle({ 'height' : overlayHTMLDiv.getHeight() + 'px' });
      divWrapper.setStyle({ 'width' : overlayHTMLDiv.getWidth() + 'px' });
    } else {
      divWrapper.setStyle({ 'height' : $(slideShowConfig.htmlId).getHeight() + 'px' });
      divWrapper.setStyle({ 'width' : $(slideShowConfig.htmlId).getWidth() + 'px' });
    }
    var slideShowImg = $(slideShowConfig.htmlId);
    moveStyleToWrapper(divWrapper, slideShowImg, 'float');
    moveStyleToWrapper(divWrapper, slideShowImg, 'margin-top');
    moveStyleToWrapper(divWrapper, slideShowImg, 'margin-bottom');
    moveStyleToWrapper(divWrapper, slideShowImg, 'margin-left');
    moveStyleToWrapper(divWrapper, slideShowImg, 'margin-right');
    moveStyleToWrapper(divWrapper, slideShowImg, 'border-top');
    moveStyleToWrapper(divWrapper, slideShowImg, 'border-bottom');
    moveStyleToWrapper(divWrapper, slideShowImg, 'border-right');
    moveStyleToWrapper(divWrapper, slideShowImg, 'border-left');
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
    slideShowImg.src = slideShowImg.src.replace(/(\?.*)$/,
        slideShowConfig.imageSrcQuery);
    /**  END HACK
     **/
    slideShowImg.absolutize();
    removeImageSize(slideShowImg);
    if (slideShowHasNextImage(slideShowConfig)) {
      tempImg.src = slideShowConfig.nextimgsrc;
    }
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
    scheduleChangeImage(elemId);
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
  celSlideShows_initOneSlideShow(newConfig);
//  celSlideShow_startOne(overlayId);
  //TODO stop all other slideshows
};

var celSlideShowManualStartStop = function(event) {
  var imgElem = this.down('.celanim_slideshow');
  if (imgElem && imgElem.id) {
    var elemId = imgElem.id;
    var startButtonDiv = this.down('.slideshowButton');
    if (celSlideShowIsRunning(elemId)
        && (typeof celSlideShowThreads.get(elemId) != "undefined")) {
      celSlideShowIsRunningHash.set(elemId, false);
      window.clearTimeout(celSlideShowThreads.get(elemId));
      celSlideShowThreads.unset(elemId);
      Effect.Appear(startButtonDiv, { duration : 1.0 , to : 0.9 });
    } else {
      celSlideShowIsRunningHash.set(elemId, true);
      changeImage(elemId);
      Effect.Fade(startButtonDiv, { duration : 1.0 });
    }
    event.stop();
  }
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
  fadeimg.src = fadeimgtemp.src;
  fadeimg.setStyle({
    'top' : fadeimgtemp.getStyle('top'),
    'left' : fadeimgtemp.getStyle('left')
  });
  fadeimg.show();
  fadeimgtemp.hide();
  if (slideShowHasNextImage(slideConfig)) {
    removeImageSize(fadeimgtemp);
    fadeimgtemp.src = slideConfig.nextimgsrc;
    if (celSlideShowIsRunning(slideConfig.htmlId)) {
      scheduleChangeImage(slideConfig.htmlId);
    }
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
  var effectKey = celSlideShowGetPart(elemId, 3, 'fade');
  var effectDetails = celSlideShowEffects.get(effectKey) || celSlideShowEffects.get('fade');
  var effectParameters = $H(effectDetails.params).merge({
    'sync' : true
  });
  var duration = effectParameters.get('duration');
  theEffect = effectDetails.effect(elemId + '_tmpImg', effectParameters.toObject());
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
};

var slideShowHasNextImage = function(slideConfig) {
  if (!slideConfig.nextImg) {
    slideConfig.nextImg = 1;
  } else {
    slideConfig.nextImg = slideConfig.nextImg + 1;
  }
  if (slideConfig.nextImg >= slideConfig.imageArray.size()) {
    slideConfig.nextImg = 0;
  }
  if (slideConfig.nextImg >=0) {
    slideConfig.nextimgsrc = slideConfig.imageArray[slideConfig.nextImg]
      + slideConfig.imageSrcQuery;
    return true;
  } else {
    return false;
  }
};

// default effects
celSlideShowAddEffect('fade', { effect : Effect.Appear, params : { duration: 2.0 } });
celSlideShowAddEffect('blinddown', { effect : Effect.BlindDown, params : { duration: 2.0 } });
celSlideShowAddEffect('blindtopleft', { effect : Effect.BlindDown, params : { duration: 2.0,
  scaleX : true, scaleY : true } });
/**
 grow is not working with the new Parallel Effect (added to fade out the old image) 
celSlideShowAddEffect('grow', { effect : Effect.Grow, params : { duration: 2.0 } });
**/
