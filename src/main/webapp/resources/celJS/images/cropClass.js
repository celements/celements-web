var zoomfactor = 5;
var mainImgW, mainImgH;
var previewW, previewH;
var mainImgZoom;
var selection = { x : { val : undefined, rounded : undefined }, y : { val : undefined, 
    rounded : undefined }, w : { val : undefined, rounded : undefined }, 
    h : { val : undefined, rounded : undefined }};
var jcrop = null;

var cropSelectionChanged = function(coords) {
  setInputFields(coords);
  setPreviewDelayed(coords);
};

var setPreviewDelayed = function(coords) {
  if($('cropImage').getWidth() * $('cropImage').getHeight() > 0) {
    setPreview(coords);
  } else {
    setPreviewDelayed.delay(.1, coords);
  }
};

var setPreview = function(coords) {
  if(typeof(coords.w) == 'undefined') {
    coords.w = $('cropImage').getWidth();
  }
  if(typeof(coords.h) == 'undefined') {
    coords.h = $('cropImage').getHeight();
  }
  var rx = previewW / coords.w;
  var ry = previewH / coords.h;
  var fact = rx;
  if(rx > ry) {
    fact = ry;
  }
  var newW = Math.round(fact * $('cropImage').getWidth());
  if(coords.w == mainImgW) {
    newW = Math.round(fact * mainImgW);
  }
  var newH = Math.round(fact * $('cropImage').getHeight());
  if(coords.h == mainImgH) {
    newH = Math.round(fact * mainImgH);
  }
  $('cropPreview').setStyle({
    width : newW + 'px',
    height : newH + 'px',
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
    if(selection.x.rounded != coords.x) {
      selection.x.val = Math.round(coords.x / mainImgZoom);
      $('cropX').value = selection.x.val;
      selection.x.rounded = selection.x.val;
    }
    if(selection.y.rounded != coords.y) {
      selection.y.val = Math.round(coords.y / mainImgZoom);
      $('cropY').value = selection.y.val;
      selection.y.rounded = selection.y.val;
    }
    //coords.x2
    //coords.y2
    if(selection.w.rounded != coords.w) {
      selection.w.val = Math.round(coords.w / mainImgZoom);
      $('cropWidth').value = selection.w.val;
      selection.w.rounded = selection.w.val;
    }
    if(selection.h.rounded != coords.h) {
      selection.h.val = Math.round(coords.h / mainImgZoom);
      $('cropHeight').value = selection.h.val;
      selection.h.rounded = selection.h.val;
    }
    if(!$('crop_fixRatio').checked) {
      $('crop_ratio').value = selection.w.rounded / selection.h.rounded;
      $('crop_ratio_label').update((selection.w.rounded / selection.h.rounded).toFixed(2));
    }
  }
};

var initCrop = function(force) {
  if(force || setCropImage()) {
    if(!force) {
      mainImgZoom = -1;
    }
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
    jcrop = $j.Jcrop('#cropImage', {
      onChange : cropSelectionChanged,
      onSelect : cropSelectionChanged,
      onRelease : releaseSelectionEvent
    });
    setAspectRatio();
    observeZoom();
  } else {
    registerCrop.delay(.25);
    first = false;
  }
};

var setCropImage = function() {
  var prevSrc = $('previewImg').src;
  if(typeof(prevSrc) != 'undefined') {
    var params = prevSrc.replace(/.*\?/g, '');
    prevSrc = prevSrc.replace(/\?.*/g, '');
    if(prevSrc != $('cropImage').src) {
      releaseSelection(true);
      $('cropImage').src = prevSrc;
      $('cropImage').setStyle({ width : '', height : ''});
      $('cropZoom').src = prevSrc;
      $('cropPreview').src = prevSrc;
      mainImgW = undefined;
      mainImgH = undefined;
      setZoomSize();
      $('cropX').value = params.replace(/((^|(.*[\?&]))cropX=(\d*)\D?.*)|.*/g, '$4');
      $('cropY').value = params.replace(/((^|(.*[\?&]))cropY=(\d*)\D?.*)|.*/g, '$4');
      $('cropWidth').value = params.replace(/((^|(.*[\?&]))cropW=(\d*)\D?.*)|.*/g, '$4');
      $('cropHeight').value = params.replace(/((^|(.*[\?&]))cropH=(\d*)\D?.*)|.*/g, '$4');
      manualSelectDelayed(false);
      return true;
    }
  }
  return false;
};

var sizeSet = false;
var setZoomSize = function() {
  if($('cropImage').getWidth() * $('cropImage').getHeight() > 0) {
    if((typeof(mainImgW) == 'undefined') || (typeof(mainImgH) == 'undefined')) {
      mainImgW = $('cropImage').getWidth();
      mainImgH = $('cropImage').getHeight();
    }
    $('cropZoom').setStyle({
      width : ($('cropImage').getWidth() * zoomfactor) + 'px',
      height : ($('cropImage').getHeight() * zoomfactor) + 'px'
    });
    mainImgZoom = -1;
    sizeSet = true;
  } else {
    sizeSet = false;
    setZoomSize.delay(.1);
  }
};

var loadCropPanelEvent = function(event) {
  initCrop(false);
  $('fitToScreen').stopObserving('change', setMainImageZoomEvent);
  $('fitToScreen').observe('change', setMainImageZoomEvent);
  setMainImageZoomDelayed(false);
};

var setMainImageZoomEvent = function(event) {
  setMainImageZoomDelayed(false);
};

var setMainImageZoomDelayed = function(fromResize) {
  if(sizeSet) {
    setMainImageZoom(fromResize);
  } else {
    setMainImageZoomDelayed.delay(.1, fromResize);
  }
};

var observeZoom = function() {
  if((typeof(jcrop) != 'undefined') && (jcrop != null)) {
    var cropEle = $('cropImage').next('.jcrop-holder');
    cropEle.stopObserving('mousemove', mouseMoveZoom);
    cropEle.observe('mousemove', mouseMoveZoom);
  } else {
    observeZoom.delay(.1);
  }
};

var mouseMoveZoom = function(event) {
  var x = event.offsetX;
  var y = event.offsetY;
  var eventEle = event.element();
  if((typeof(x) == 'undefined') || (typeof(y) == 'undefined')) { //Firefox fix
    var jQEle = $j(eventEle);
    var jQoffset = jQEle.offset();
    x = event.clientX - jQoffset.left;
    y = event.clientY - jQoffset.top;
  }
  while((typeof(eventEle) != 'undefined') && !eventEle.hasClassName('jcrop-holder')) {
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
};

var setMainImageZoom = function(fromResize) {
  var cw = $('cropContainer').getWidth();
  var ch = $('cropContainer').getHeight();
  if(cw * ch > 0) {
    var zoom = parseFloat($('fitToScreen').value);
    if(zoom == 0) {
      if(mainImgW/mainImgH > cw/ch) {
        zoom = cw/mainImgW;
      } else {
        zoom = ch/mainImgH;
      }
    }
    var w = mainImgW*zoom;
    var h = mainImgH*zoom;
    if(zoom != mainImgZoom) {
      $('cropImage').setStyle({ width : w + 'px', height : h + 'px'});
      if(mainImgZoom != -1) {
        initCrop(true);
      }
      mainImgZoom = zoom;
      manualSelectDelayed(true);
    }
    if(!fromResize) { resizeCrop(); }
  } else {
    setMainImageZoom.delay(.1);
  }
};

var calcAspectRatio = function() {
  var num = getNumber('cropWidth');
  var denom = getNumber('cropHeight');
  if((num != null) && (denom != null)) {
    if(num / denom) {
      num = mainImgW;
      demom = mainImgH;
    }
    $('crop_ratio').value = num / denom;
    $('crop_ratio_label').update((num / denom).toFixed(2));
    setAspectRatio();
  }
};

var manualSelectEvent = function(event) {
  manualSelectDelayed(false);
};

var manualSelectRunning = false;
var manualSelectDelayed = function(isResize) {
  if(!manualSelectRunning && (jcrop != null) && (typeof(jcrop) != 'undefined')) {
    manualSelect(isResize);
  } else {
    manualSelectDelayed.delay(.1, isResize);
  }
};

var animateTo = null;
var manualSelect = function(isResize) {
  manualSelectRunning = true;
  var targetPos = new Array();
  var x = getNumber('cropX');
  if(x != null) {
    if(x > mainImgW) {
      x = mainImgW;
      $('cropX').value = x;
    }
    targetPos.push(Math.round(x * mainImgZoom));
  }
  var y = getNumber('cropY');
  if(y != null) {
    if(y > mainImgH) {
        y = mainImgH;
        $('cropY').value = y;
      }
    targetPos.push(Math.round(y * mainImgZoom));
  }
  var setFix = false;
  var x2 = getNumber('cropWidth');
  if((x != null) && (x2 != null)) {
    if($('crop_fixRatio').checked && (selection.w.val != x2)) {
      var newH = Math.round(getNumber('cropWidth') / getNumber('crop_ratio'));
      if((newH + y) > mainImgH) {
        newH = mainImgH - y;
        x2 = newH * getNumber('crop_ratio');
      } else {
        setFix = true;
      }
      $('cropHeight').value = newH;
    }
    x2 += x;
    if(x2 > mainImgW) {
      x2 = mainImgW;
      $('cropWidth').value = Math.round(x2 - x);
    }
  }
  var y2 = getNumber('cropHeight');
  if((y != null) && (y2 != null)) {
    if(!setFix && $('crop_fixRatio').checked && (selection.h.val != y2)) {
      x2 = (y2 * getNumber('crop_ratio')) + x;
      if(x2 > mainImgW) {
        x2 = mainImgW;
        y2 = (x2 - x) * getNumber('crop_ratio');
      }
      $('cropWidth').value = Math.round(x2 - x);
    }
    y2 += y;
    if(y2 > mainImgH) {
      y2 = mainImgH;
      $('cropHeight').value = Math.round(y2 - y);
    }
  }
  targetPos.push(Math.min(Math.round(x2 * mainImgZoom), mainImgW));
  targetPos.push(Math.min(Math.round(y2 * mainImgZoom), mainImgH));
  if((targetPos.length == 4) && (isResize || (selection.x.val != x) || 
      (selection.y.val != y) || (selection.w.val != x2-x) || (selection.h.val != y2-y))) {
    if(!$('crop_fixRatio').checked) {
      $('crop_ratio').value = (x2 - x)/(y2 - y);
      $('crop_ratio_label').update(((x2 - x)/(y2 - y)).toFixed(2));
    }
    animateTo = targetPos;
    selection.x.val = x;
    selection.x.rounded = targetPos[0];
    selection.y.val = y;
    selection.y.rounded = targetPos[1];
    selection.w.val = x2 - x;
    selection.w.rounded = targetPos[2] - targetPos[0];
    selection.h.val = y2 - y;
    selection.h.rounded = targetPos[3] - targetPos[1];
    if(isResize) {
      jcrop.setSelect(targetPos);
      //Fix to show the drag-resize elements
      jcrop.animateTo(targetPos, animateToCallback);
    } else {
      jcrop.animateTo(targetPos, animateToCallback);
    }
  } else {
    manualSelectRunning = false;
  }
};

var animateToCallback = function() {
  manualSelectRunning = false;
  animateTo = null;
};

var getNumber = function(id) {
  var num = $(id).value.match(/(\d*\.\d+)|\d+/g);
  if((num != null) && (num.length > 0)) {
    return parseFloat(num);
  }
  return null;
};

var releaseSelectionEvent = function() {
  releaseSelection(false);
};

var releaseSelection = function(buttonRelease) {
  if(buttonRelease && (jcrop != null)) {
    jcrop.release();
  }
  setPreviewDelayed({ x: 0, y: 0, x2: mainImgW, y2: mainImgH, w: mainImgW, h: mainImgH });
  $('cropX').value = '';
  $('cropY').value = '';
  $('cropWidth').value = '';
  $('cropHeight').value = '';
  setCropRatioToMainImg();
  $('isCropped').value = '0';
  selection = { x : { val : null, rounded : null }, y : { val : null, rounded : null }, 
      w : { val : null, rounded : null }, h : { val : null, rounded : null }};
};

var setCropRatioToMainImg = function() {
  if((typeof(mainImgW) != 'undefined') && (typeof(mainImgH) != 'undefined') 
      && (mainImgW * mainImgH > 0)) {
    $('crop_ratio').value = mainImgW / mainImgH;
    $('crop_ratio_label').update((mainImgW / mainImgH).toFixed(2));
  } else {
    setCropRatioToMainImg.delay(.1);
  }
};

var setAspectRatio = function() {
  if($('crop_fixRatio').checked) {
    $('crop_ratio_label').hide();
    $('crop_ratio').show();
    var ratio = 1;
    var ratioVal = getNumber('crop_ratio');
    if(ratioVal != null) {
      ratio = ratioVal;
    } else {
      $('crop_ratio').value = 1;
      $('crop_ratio_label').update((1).toFixed(2));
    }
    jcrop.setOptions({ aspectRatio: ratio });
  } else {
    $('crop_ratio_label').show();
    $('crop_ratio').hide();
    jcrop.setOptions({ aspectRatio: 0 });
  }
};

var registerCropInputObservers = function() {
  $('cropX').observe('blur', manualSelectEvent);
  $('cropX').observe('keyup', manualSelectEvent);
  $('cropY').observe('blur', manualSelectEvent);
  $('cropY').observe('keyup', manualSelectEvent);
  $('cropWidth').observe('blur', manualSelectEvent);
  $('cropWidth').observe('keyup', manualSelectEvent);
  $('cropHeight').observe('blur', manualSelectEvent);
  $('cropHeight').observe('keyup', manualSelectEvent);
};

var resizeCrop = function() {
  var panW = $('crop_panel').getWidth();
  var partW = Math.floor((panW - 40) / 3);
  previewH = partW;
  previewW = partW;
  var table = $('crop_panel').down('table');
  table.setStyle({ 'width' : (panW-40) + 'px'});
  var td = table.down('tbody').down('td');
  td.setStyle({ 'width' : ((2*partW)+20) + 'px' });
  $('cropContainer').setStyle({ 'width' : (2*partW) + 'px', 
      'height' : (2*partW) + 'px' });
  td = td.next('td');
  td.setStyle({ 'width' : (partW+10) + 'px' });
  td.select('div.previewContainer').each(function(ele) {
    ele.setStyle({ 'width' : partW + 'px', 'height' : partW + 'px' })
  });
  var pointerW = Math.floor(partW / 2) - 16;
  $('zoomPointer').setStyle({ 'top' : pointerW + 'px', 'left' : pointerW + 'px' });
  setMainImageZoomDelayed(true);
  if((selection.x.val == null) || (selection.y.val == null) || (selection.w.val == null) 
      || (selection.h.val == null)) {
    setPreviewDelayed({ x: 0, y: 0, x2: mainImgW, y2: mainImgH, w: mainImgW, 
      h: mainImgH });
  }
};

var executeCrop = function(event) {
  event.stop();
  var url = $('previewImg').src;
  var cx = $('cropX').value;
  var cy = $('cropY').value;
  var cw = $('cropWidth').value;
  var ch = $('cropHeight').value;
  url = url.replace(/(.*\?.*)(&cropX=\d*|cropX=\d*&)(\D?.*)/g, '$1$3');
  url = url.replace(/(.*\?.*)(&cropY=\d*|cropY=\d*&)(\D?.*)/g, '$1$3');
  url = url.replace(/(.*\?.*)(&cropW=\d*|cropW=\d*&)(\D?.*)/g, '$1$3');
  url = url.replace(/(.*\?.*)(&cropH=\d*|cropH=\d*&)(\D?.*)/g, '$1$3');
  if((cx != '') && (cy != '') && (cw != '') && (ch != '')) {
    if(url.indexOf('?') < 0) {
      url += '?';
    } else if(!url.endsWith('&')) {
      url += '&';
    }
    url += 'cropX=' + cx + '&cropY=' + cy + '&cropW=' + cw + '&cropH=' + ch;
  }
  $('isCropped').value = '1';
  $('celwidth').value = cw;
  $('celheight').value = ch;
  $('previewImg').src = url;
  $('resetMaxLabel').update(cw + ' x ' + ch);
  mcTabs.displayTab('imageDetails_tab','imageDetails_panel');
};

var onLoadInit = function() {
  $('crop_tab').down('a').observe('click', loadCropPanelEvent);
  registerCropInputObservers();
  $('crop_fixRatio').observe('click', setAspectRatio);
  $('crop_ratio').observe('blur', setAspectRatio);
  $('crop_ratio').observe('keyup', setAspectRatio);
  $('crop_release').observe('click', function(event) { 
    releaseSelection(true);
    event.stop();
  });
  $('crop_exec').observe('click', executeCrop);
  Event.observe(window, 'resize', resizeCrop);
  resizeCrop();
};

Event.observe(window, 'load', onLoadInit);
