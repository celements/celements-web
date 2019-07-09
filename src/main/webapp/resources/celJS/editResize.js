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

Event.observe(window, 'load', function() {
  getCelementsTabEditor().addAfterInitListener(startResizeObservers);
});

function startResizeObservers() {
  Event.observe(window, 'resize', resize);
  $$('.celements3_tabMenu .bd').each(function(tabMenu) {
    tabMenu.observe('tabedit:tabchange', resize);
    tabMenu.observe('tabedit:after-tabshow', resize);
  });
  $('tabMenuPanel').observe('tabedit:afterDisplayNow', resize);
  resize();
}

var getActiveEditorTab = function() {
  var activeTab = null;
  $$('.celements3_tabMenu .bd .menuTab').each(function(tab) {
    if(tab.visible()) {
      console.log('getActiveEditorTab: found active tab ', tab.id);
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
    //there is a bug in prototypejs 1.7.2 cumulativeOffset sometimes not
    //counting margin-auto offsets. Thus we need to use jquery.offset
    if(($j(ele).offset().top != 0) || ($j(ele).offset().left != 0)) {
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
  console.log('resize: start');
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
  //there is a bug in prototypejs 1.7.2 cumulativeOffset sometimes not
  //counting margin-auto offsets. Thus we need to use jquery.offset
  var scrollableSize = boxSize - $j(scrollbox).offset().top - bottomBorder;
  console.log('resize: scrollableSize ', boxSize, $j(scrollbox).offset().top, bottomBorder,
      scrollableSize);
  box.setStyle({ height: Math.max(50, boxSize) + "px" });
  scrollbox.setStyle({ height: Math.max(50, scrollableSize) + "px" });
  console.log('resize: finish ', boxSize, scrollableSize, scrollbox);
}