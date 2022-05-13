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

var startObserversNewUniqueName = function(){
  updateObservers();
  Event.observe(window, 'resize', resizeTab);
  $$('.c3_import_box')[0].observe('filepicker:changed', updateObservers);
  if (typeof preimportChanged !== 'undefined') {
    if ((typeof console != 'undefined') && (typeof console.warn != 'undefined')) {
      console.warn('deprecated usage of direct preimportChanged registration.');
    }
    $('c3_import_box').observe('preimport:changed', preimportChanged);
  }
  $(document.body).fire('preimport:beforeShowBox');
  showTab($$('.c3_import_box')[0]);
  resizeTab();
};

function updateObservers() {
  if((typeof(myDataTable) != 'undefined') && (myDataTable != null)) {
    myDataTable.subscribe('rowClickEvent', clickObserve);
  }
  $$('.c3_import_title').each(function(tab) {
    tab.stopObserving('click', changeTabEvent);
    tab.observe('click', changeTabEvent);
  });
  $$('c3_import_tabbox').each(function(tabbox){
    tabbox.stopObserving();
  });
  resizeTab();
}

var clickObserve = function(event) {
  if (typeof preimport !== 'undefined') {
    if ((typeof console != 'undefined') && (typeof console.warn != 'undefined')) {
      console.warn('deprecated usage of direct "preimport" global function call.');
    }
    preimport(event);
  }
  $('c3_import_box').fire('preimport:clickOnRow', event);
  showTab($$('.c3_import_middle')[0]);
};

var sortObserve = function(event) {
  if((typeof($("c2_ml_content")) != undefined) && ($("c2_ml_content") != null)) {
    $("c2_ml_content").fire("filepicker:changed");
  } else {
    YAHOO.util.Event.onDOMReady(function() {
      $("c2_ml_content").fire("filepicker:changed");
    });
  }
};

/**
 * ensure that last visible sibling has no border-,padding- and margin-bottom.
 * @return
 */
function resizeTab(){
  var tabtitlesheight = 0;
  $$('.c3_import_title').each(function(titleElem){
    tabtitlesheight += titleElem.getHeight();
    tabtitlesheight += parseInt(titleElem.getStyle('margin-top'));
    tabtitlesheight += parseInt(titleElem.getStyle('margin-bottom'));
  });   
  var mainpadding = parseInt($$('.main')[0].getStyle('padding-top'));
  var mainmargin = parseInt($$('.main')[0].getStyle('margin-top'));
  var mainborders = 2 * (mainpadding + mainmargin);
  
  var winHeight = 0;
  if(typeof(window.innerWidth) == 'number') {
    winHeight = window.innerHeight;
  } else if(document.documentElement && document.documentElement.clientHeight) {
    winHeight = document.documentElement.clientHeight;
  } else if(document.body && document.body.clientHeight) {
    winHeight = document.body.clientHeight;
  }
  
  var tabboxsize = winHeight - tabtitlesheight - mainborders;
  $$('.c3_import_tabbox').each(function(box){
    var scrollbox = box.down('.c3_import_scrollable');
    if(scrollbox){
      //there is a bug in prototypejs 1.7.2 cumulativeOffset sometimes not
      //counting margin-auto offsets. Thus we need to use jquery.offset
      var offsetBefore = ((typeof($j(scrollbox).offset()) !== 'undefined') 
              && (typeof($j(box).offset()) !== 'undefined')) 
          ? ($j(scrollbox).offset().top - $j(box).offset().top) : 0;
      var ele = scrollbox;
      var lastElemBottom = $j(scrollbox).offset().top + scrollbox.getHeight();
      while(ele && (!ele.hasClassName('c3_import_tabbox'))){
        ele.siblings().each(function(sibl){
          const siblOffset = $j(sibl).offset();
          if((typeof(siblOffset) !== 'undefined') && (sibl.getStyle('position') != 'absolute')) {
        	// use offsetHeight instead of getHeight() which is wrong for script and link elements}
            lastElemBottom = Math.max(lastElemBottom, siblOffset.top + sibl.offsetHeight);
          }
        });
        ele = ele.up();
      }
      var offsetAfter = lastElemBottom - ($j(scrollbox).offset().top + scrollbox.getHeight());
      var newScrollableHeight = tabboxsize - offsetAfter - offsetBefore;
      scrollbox.setStyle({ height: Math.max(50, newScrollableHeight) + "px" });
    }
    box.setStyle({ height: Math.max(50, tabboxsize) + "px" });
  });
}

function changeTabEvent(event) {
  showTab(event.element().up('.c3_import_box'));
}

function showTab(tab) {
  if (tab) {
    $$('.c3_import_box').each(function(elemTab) {
         hideDisplay(elemTab.down('.c3_import_tabbox'));
      });
    showDisplay(tab.down('.c3_import_tabbox'));
    //needs two resizes!
    resizeTab();
    resizeTab();
  }
}

function showDisplay(tab){
  tab.setStyle({display: ''});
}

function hideDisplay(tab){
  tab.setStyle({display: 'none'});
}

function getProgressBar(title){
  var titlediv = $('c3_import_box').down('.c3_import_title');
  titlediv.innerHTML = title;
  $('c3_import_box').down('.c3_import_tabbox').setStyle({display: 'none'});
  var bardiv = "<div class='c3_import_tabbox'><img src='/skin/skins/albatross/icons/ajax%2Dloader.gif'></div>";
  titlediv.insert( {'after': bardiv} );
  resizeTab();
}

Event.observe(window, 'load', startObserversNewUniqueName);