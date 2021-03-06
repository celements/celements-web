Event.observe(window, 'load', startResizeObservers);
var delayExec = null;
var ieCount = 1;

function startResizeObservers(event){
  Event.observe(window, 'resize', resizeFileBase);
  Event.observe(window, 'filepicker:changed', resizeFileBase);
  $$('.celements3_filebase')[0].observe('filepicker:changed', resizeFileBase);
  //TODO find an event which fires after all browser resizes.
  window.setTimeout("resizeFileBase()", 1200);
}

var resizeFileBase = function(delayed) {
  if(delayed) {
    delayExec = null;
  }
  resizeFileBase();
}

var resizeFileBase = function(){
  var fileBaseBox = $$('.celements3_filebase')[0];
  var filesBox = $('c2_ml_content');
  var browserBox = $('c2_ml_browser');
  var scrollBox = filesBox.down('.c3_import_scrollable');
  
  var titleHeight = 0;
  if($$('.c3_import_title') && ($$('.c3_import_title').length > 0)) {
      $$('.c3_import_title').each(function(titleElem){
  	  titleHeight += titleElem.getHeight();
  	  titleHeight += parseInt(titleElem.getStyle('margin-top'));
  	  titleHeight += parseInt(titleElem.getStyle('margin-bottom'));
  	});
  }
  
  var uploadHeight = 0;
  if($$('.c3_filebase_upload') && ($$('.c3_filebase_upload').length > 0)) {
    uploadHeight = $$('.c3_filebase_upload')[0].offsetHeight;
  }
  var mainPadding = parseInt($$('.main')[0].getStyle('padding-top'));
  var mainMargin = parseInt($$('.main')[0].getStyle('margin-top'));
  var mainBorders = 2 * (mainPadding + mainMargin);
  
  var siblingHeight = 0;
  if(scrollBox){
    scrollBox.siblings().each(function(sibl){
      if(sibl.getStyle('position') != 'absolute'){
        siblingHeight += sibl.offsetHeight;
      }
    });
  }
    
  var winHeight = 0;
  if(typeof(window.innerWidth) == 'number') {
    winHeight = window.innerHeight;
  } else if(document.documentElement && document.documentElement.clientHeight) {
    winHeight = document.documentElement.clientHeight;
  } else if(document.body && document.body.clientHeight) {
    winHeight = document.body.clientHeight;
  }
  
  var fileBaseBoxSize = winHeight - mainBorders - titleHeight;
  var filesBoxSize = fileBaseBoxSize - uploadHeight;
  var scrollableSize = filesBoxSize - siblingHeight;
  fileBaseBox.setStyle({
    'height' : Math.max(50, fileBaseBoxSize) + "px"
  });
  filesBox.setStyle({
    'height' : Math.max(50, filesBoxSize) + "px"
  });
  browserBox.setStyle({
    'height' : Math.max(50, filesBoxSize) + "px"
  });
  if(scrollBox){
    scrollBox.setStyle({ height: Math.max(50, scrollableSize) + "px" });
    if (Prototype.Browser.IE && (ieCount > 0)) {
      if ((typeof console != 'undefined') && (typeof console.log != 'undefined')) {
        console.log('found IE browser. Starting delayed fileBaseResize.', ieCount);
      }
      startDelayed();
      ieCount--;
    }
  } else {
    if ((typeof console != 'undefined') && (typeof console.log != 'undefined')) {
      console.log('no scrollbox found. Starting delayed fileBaseResize.');
    }
    startDelayed();
  }
};

var startDelayed = function() {
  if(delayExec != null) {
    window.clearTimeout(delayExec);
  }
  delayExec = resizeFileBase.delay(.5, true);
}