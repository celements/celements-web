var zoomfactor = 5;
var mainImgZoom = -1;
var mainImgW, mainImgH;
var previewW = 170; // review has to be square for calculation to work
var previewH = 170;
var jcrop = null;

var cropSelectionChanged = function(coords) {
  setInputFields(coords);
  setPreview(coords);
};

var setPreview = function(coords) {
  var rx = previewW / coords.w;
  var ry = previewH / coords.h;
  var fact = rx;
  if(rx > ry) {
    fact = ry;
  }
  $('cropPreview').setStyle({
    width : Math.round(fact * $('cropImage').getWidth()) + 'px',
    height : Math.round(fact * $('cropImage').getHeight()) + 'px',
    marginLeft : '-' + Math.round(fact * coords.x) + 'px',
    marginTop : '-' + Math.round(fact * coords.y) + 'px'
  });
  var prevResizeX = fact * coords.w;
  var prevResizeY = fact * coords.h;
  $('cropPreviewWrapper').setStyle({
    width : prevResizeX + 'px',
    height : prevResizeY + 'px'
  });
};

var setInputFields = function(coords) {
  if(animateTo == null) {
    $('cropX').value = Math.round(coords.x / mainImgZoom);
    $('cropY').value = Math.round(coords.y / mainImgZoom);
    //coords.x2
    //coords.y2
    $('cropWidth').value = Math.round(coords.w / mainImgZoom);
    $('cropHeight').value = Math.round(coords.h / mainImgZoom);
  } else {
    if((animateTo.x == coords.x) && (animateTo.y == coords.y)
        && (animateTo.w == coords.w) && (animateTo.h == coords.h)) {
      animateTo = null;
    }
  }
  //TODO celwidth und celheight auf maximale groesse anpassen
  //TODO celwidth und celheight auf seitenverhaeltnisse anpassen
//  $('crop_celwidth').value = ; 
//  $('crop_celheight').value = ;
};

var initCrop = function(force) {
  if(force || setCropImage()) {
    registerCrop();
  }
};

var first = true;
var registerCrop = function() {
  if(jcrop != null) {
    jcrop.destroy();
    jcrop = null;
    first = true;
  }
  if(!first && $('cropImage').getStyle('display') != 'none') {
  //TODO wenn noch keine selection, dann zeige in der selectionvorschau das ganze bild, genauso auch wenn die auswahl geloescht wird 
    jcrop = $j.Jcrop('#cropImage', {
      //TODO setSelect([x, y, x2, y2])
      onChange : cropSelectionChanged,
      onSelect : cropSelectionChanged
    });
  } else {
    registerCrop.delay(.25);
    first = false;
  }
};

var setCropImage = function() {
  var prevSrc = $('previewImg').src;
  if(typeof(prevSrc) != 'undefined') {
    prevSrc = prevSrc.replace(/\?.*/g, '');
    if(prevSrc != $('cropImage').src) {
      $('cropImage').src = prevSrc;
      $('cropZoom').src = prevSrc;
      $('cropPreview').src = prevSrc;
      setZoomSize();
      releaseSelection();
      return true;
    }
  }
  return false;
};

var sizeSet = false;
var setZoomSize = function() {
  if($('cropImage').getWidth() * $('cropImage').getHeight() > 0) {
    mainImgW = $('cropImage').getWidth();
    mainImgH = $('cropImage').getHeight();
    $('cropZoom').setStyle({
      width : ($('cropImage').getWidth() * zoomfactor) + 'px',
      height : ($('cropImage').getHeight() * zoomfactor) + 'px'
    });
    sizeSet = true;
  } else {
    sizeSet = false;
    setZoomSize.delay(.1);
  }
};

var loadCropPanelEvent = function(event) {
  loadCropPanel(false);
  $('fitToScreen').observe('change', setMainImageZoom);
  setMainImageZoomDelayed();
}

var setMainImageZoomDelayed = function() {
  if(sizeSet) {
    setMainImageZoom();
  } else {
    setMainImageZoomDelayed.delay(.1);
  }
}

var loadCropPanel = function(force) {
  initCrop(force);
  observeZoom();
};

var observeZoom = function() {
console.log('observeZoom');
  var cropEle = $('cropImage').next('.jcrop-holder');
  if(typeof(cropEle) != 'undefined') {
    cropEle.observe('mousemove', function(event) {
      var x = event.offsetX;
      var y = event.offsetY;
      var eventEle = event.element();
      while((typeof(eventEle) != 'undefined') && !eventEle.hasClassName('jcrop-holder') && !eventEle.hasClassName('jcrop-tracker')) {
        var style = eventEle.getStyle('left');
        if((style != null) && (style != '')) {
          x += parseInt(style.replace(/px/g, ''));
        }
        style = eventEle.getStyle('top');
        if((style != null) && (style != '')) {
          y += parseInt(style.replace(/px/g, ''));
        }
        eventEle = eventEle.up();
      }
      var posLeft = ((previewW / 2) - ((x * zoomfactor) / mainImgZoom));
      var posTop = ((previewH / 2) - ((y * zoomfactor) / mainImgZoom));
      $('cropZoom').setStyle({
        left: posLeft + 'px',
        top: posTop + 'px'
      });
    });
console.log('observeZoom is set');
  } else {
    observeZoom.delay(.1);
  }
};

var setMainImageZoom = function() {
  var zoom = parseFloat($('fitToScreen').value);
  if(zoom == 0) {
    var cw = $('cropContainer').getWidth();
    var ch = $('cropContainer').getHeight();
    if(mainImgW/mainImgH > cw/ch) {
      zoom = cw/mainImgW;
    } else {
      zoom = ch/mainImgH;
    }
  }
  var w = mainImgW*zoom;
  var h = mainImgH*zoom;
console.log(w, h, zoom, mainImgZoom);
  if(zoom != mainImgZoom) {
    $('cropImage').setStyle({ width : w + 'px', height : h + 'px'});
    loadCropPanel(true);
    observeZoom();
    
//    -> jcrop raus und wieder rein und dabei selektion korrekt umrechnen
    //TODO set zoom
    
    
    mainImgZoom = zoom;
  }
};

var calcAspectRatio = function() {
  var num = getNumber('crop_ratio_numerator');
  var denom = getNumber('crop_ratio_denominator');
  if((num != null) && (denom != null)) {
    $('crop_ratio').value = num / denom;
    setAspectRatio();
  } else {
    if(num == null) {
      $('crop_ratio_numerator').value = '';
    }
    if(denom == null) {
      $('crop_ratio_denominator').value = '';
    }
  }
}

var animateTo = null;
var manualSelect = function(event) {
  var targetPos = new Array();
  var target100Percent = new Array();
  var x = getNumber('cropX');
  if(x != null) {
    targetPos.push(x * mainImgZoom);
    target100Percent.push(Math.floor(x * mainImgZoom) / mainImgZoom);
  }
  var y = getNumber('cropY');
  if(y != null) {
    targetPos.push(y * mainImgZoom);
    target100Percent.push(Math.floor(y * mainImgZoom) / mainImgZoom);
  }
  var x2 = getNumber('cropWidth');
  if((x != null) && (x2 != null)) {
    x2 += x;
    if(x2 > mainImgW) { x2 = mainImgW; }
    targetPos.push(x2 * mainImgZoom);
    target100Percent.push(Math.floor(x2 * mainImgZoom) / mainImgZoom);
  }
  var y2 = getNumber('cropHeight');
  if((y != null) && (y2 != null)) {
    y2 += y;
    if(y2 > mainImgH) { y2 = mainImgH; }
    targetPos.push(y2 * mainImgZoom);
    target100Percent.push(Math.floor(y2 * mainImgZoom) / mainImgZoom);
  }
  if(targetPos.length == 4) {
    animateTo = target100Percent;
console.log(animateTo);
    jcrop.animateTo(targetPos);
  }
};

var getNumber = function(id) {
  var num = $(id).value.match(/(\d*\.\d+)|\d+/g);
  if((num != null) && (num.length > 0)) {
    return parseFloat(num);
  }
  return null;
};

var releaseSelection = function() {
  if(jcrop != null) {
    jcrop.release();
  }
  setPreview({ x: 0, y: 0, x2: mainImgW, y2: mainImgH, w: mainImgW, h: mainImgH });
  $('cropX').value = '';
  $('cropY').value = '';
  $('cropWidth').value = '';
  $('cropHeight').value = '';
};

var setAspectRatio = function() {
  if($('crop_fixRatio').checked) {
    var ratio = 1;
    var ratioVal = getNumber('crop_ratio');
    if(ratioVal != null) {
      ratio = ratioVal;
    } else {
      $('crop_ratio').value = 1;
    }
    jcrop.setOptions({ aspectRatio: ratio });
  } else {
    jcrop.setOptions({ aspectRatio: 0 });
  }
  jcrop.focus();
};

var registerCropInputObservers = function(start) {
  if(start) {
    $('cropX').observe('blur', manualSelect);
    $('cropX').observe('keyup', manualSelect);
    $('cropY').observe('blur', manualSelect);
    $('cropY').observe('keyup', manualSelect);
    $('cropWidth').observe('blur', manualSelect);
    $('cropWidth').observe('keyup', manualSelect);
    $('cropHeight').observe('blur', manualSelect);
    $('cropHeight').observe('keyup', manualSelect);
//  } else {
//    $('cropX').stopObserving('blur', manualSelect);
//    $('cropX').stopObserving('keyup', manualSelect);
//    $('cropY').stopObserving('blur', manualSelect);
//    $('cropY').stopObserving('keyup', manualSelect);
//    $('cropWidth').stopObserving('blur', manualSelect);
//    $('cropWidth').stopObserving('keyup', manualSelect);
//    $('cropHeight').stopObserving('blur', manualSelect);
//    $('cropHeight').stopObserving('keyup', manualSelect);
  }
}

var onLoadInit = function() {
  $('crop_tab').down('a').observe('click', loadCropPanelEvent);
  registerCropInputObservers(true);
  $('crop_fixRatio').observe('click', setAspectRatio);
  $('crop_ratio').observe('blur', setAspectRatio);
  $('crop_ratio').observe('keyup', setAspectRatio);
  $('crop_ratio_numerator').observe('blur', calcAspectRatio);
  $('crop_ratio_numerator').observe('keyup', calcAspectRatio);
  $('crop_ratio_denominator').observe('blur', calcAspectRatio);
  $('crop_ratio_denominator').observe('keyup', calcAspectRatio);
  $('crop_release').observe('click', function(event) { 
    releaseSelection();
    event.stop();
  });
};

Event.observe(window, 'load', onLoadInit);
