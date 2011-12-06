Event.observe(window, 'load', function() {
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
};

var celSlideShowConfig = new Hash(); 
var initSlideShows = function(slideShowConfigArray) {
  $A(slideShowConfigArray).each(function(slideShowConfig) {
    if (slideShowConfig.imageArray && (slideShowConfig.imageArray.size() > 0)) {
      celSlideShowConfig.set(slideShowConfig.htmlId, slideShowConfig);
      var tempImg = new Element('img', {
        'id' : slideShowConfig.htmlId + '_tmpImg',
        'style' : 'position: absolute; top: 0px; left: 0px;'
       }).hide();
      var divWrapper = $(slideShowConfig.htmlId).wrap('div', {
          'class' : 'celanim_slideshow_wrapper',
          'style': 'display: inline-block; position: relative;'
            +' font-size: 0px; line-height: 0px;' }
        ).insert({ top : tempImg });
      divWrapper.setStyle({ 'height' : $(slideShowConfig.htmlId).getHeight() + 'px' });
      divWrapper.setStyle({ 'width' : $(slideShowConfig.htmlId).getWidth() + 'px' });
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
      slideShowImg.absolutize();
      removeImageSize(slideShowImg);
      if (slideShowHasNextImage(slideShowConfig)) {
        tempImg.src = slideShowConfig.nextimgsrc;
      }
    }
  });
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
    scheduleChangeImage(pair.key);
  });
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
    fadeimgtemp.src = slideConfig.nextimgsrc;
    removeImageSize(fadeimgtemp);
    scheduleChangeImage(slideConfig.htmlId);
  }
};

var celSlideShowEffects = new Hash();
var celSlideShowAddEffect = function (effectKey, effect) {
  effect.params = effect.params || {};
  celSlideShowEffects.set(effectKey, effect);
};

var changeImage = function(elemId) {
  var effectKey = celSlideShowGetPart(elemId, 3, 'fade');
  var effectDetails = celSlideShowEffects.get(effectKey) || !celSlideShowEffects.get('fade');
  var effectParameters = $H(effectDetails.params).merge({
    'sync' : true
  });
  var tempImg = $(elemId + '_tmpImg');
  var dim = tempImg.getDimensions();
  var wrapDiv = tempImg.up('div');
  var diffHeight = wrapDiv.getHeight() - dim.height;
  var diffWidth = wrapDiv.getWidth() - dim.width;
  tempImg.setStyle({
    'top' : diffHeight / 2 + 'px',
    'left' : diffWidth / 2 + 'px'
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
celSlideShowAddEffect('grow', { effect : Effect.Grow, params : { duration: 2.0 } });
