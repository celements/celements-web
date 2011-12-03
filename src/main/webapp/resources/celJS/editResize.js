Event.observe(window, 'load', function() {
  getCelementsTabEditor().addAfterInitListener(startResizeObservers);
});

function startResizeObservers() {
  Event.observe(window, 'resize', resize);
  $$('.celements3_tabMenu .bd').each(function(tabMenu) {
    tabMenu.observe('tabedit:tabchange', resize);
  });
  resize();
}

var getActiveEditorTab = function() {
  var activeTab = null;
  $$('.celements3_tabMenu .bd .menuTab').each(function(tab) {
    if(tab.visible()) {
      activeTab = tab;
    }
  });
  return activeTab;
};

var getInnerMostScrollableElement = function(tab) {
  var elementFound = null;
  var elements = tab.select('.c3_scrollable');
  if(tab.down('form#edit') && (elements.size() == 0)) {
    elements.push($('edit'));
    if((typeof console != 'undefined') && (typeof console.warn != 'undefined')) {
      console.warn('Deprecated usage of resize on form "edit".');
    }
  }
  elements.each(function(ele) {
    if((ele.cumulativeOffset().top != 0) || (ele.cumulativeOffset().left != 0)) {
      elementFound = ele;
    }
  });
  return elementFound;
};

var getScrollbox = function() {
  // ele.visible() does not work for scrollable if not the scrollable part itself, but a 
  // parent element (the tab) is set to display: none
  var activeTab = getActiveEditorTab();
  var scrollElem = getInnerMostScrollableElement(activeTab);
  if (scrollElem) {
    return scrollElem;
  }
  return activeTab;
};

var setOverflow = function() {
	// getStyle('overflow-y') returns null for 'auto'
	var scrollbox = getScrollbox();
	if ((scrollbox.getStyle('overflow-y') != null)
		&& (scrollbox.getStyle('overflow-y') != 'scroll')) {
		scrollbox.setStyle({'overflowY' : 'auto'}); //IE6 only supports overflowY
	}
};

function resize(){
  setOverflow();
  var box = $('tabMenuPanel');
  var bottomBorder = 15;
  
  var winHeight = 0;
  if(typeof(window.innerWidth) == 'number') {
    winHeight = window.innerHeight;
  } else if(document.documentElement && document.documentElement.clientHeight) {
    winHeight = document.documentElement.clientHeight;
  } else if(document.body && document.body.clientHeight) {
    winHeight = document.body.clientHeight;
  }
  
  var boxSize = winHeight - bottomBorder;
  var scrollbox = getScrollbox();
  var scrollableSize = boxSize - scrollbox.cumulativeOffset().top - bottomBorder;
  box.setStyle({ height: Math.max(50, boxSize) + "px" });
  scrollbox.setStyle({ height: Math.max(50, scrollableSize) + "px" });
}