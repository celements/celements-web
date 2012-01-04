Event.observe(window, 'load', startObservers);

function startObservers(event){
  updateObservers();
  Event.observe(window, 'resize', resizeTab);
  $$('.c3_import_box')[0].observe('filepicker:changed', updateObservers);
  $('c3_import_box').observe('preimport:changed', preimportChanged);
  showTab($$('.c3_import_box')[0]);
  resizeTab();
}

function updateObservers() {
  if((typeof(myDataTable) != 'undefined') && (myDataTable != null)) {
    myDataTable.subscribe('rowClickEvent', clickObserve);
  }
  $$('.c3_import_title').each(function(tab) {
    tab.stopObserving('click', changeTabEvent);
    tab.observe('click', changeTabEvent);
  });
  $$('c3_import_tabbox').each(function(tabbox){
    tabbox.stopObserving()
  });
  resizeTab();
}

var clickObserve = function(event) {
  preimport(event);
  showTab($$('.c3_import_middle')[0]);
}

var sortObserve = function(event) {
	alert('sort!');
  if((typeof($("c2_ml_content")) != undefined) && ($("c2_ml_content") != null)) {
    $("c2_ml_content").fire("filepicker:changed");
  } else {
    YAHOO.util.Event.onDOMReady(function() {
      $("c2_ml_content").fire("filepicker:changed");
    });
  }
}

/**
 * ensure that last visible sibling has no border-,padding- and margin-bottom.
 * @return
 */
function resizeTab(){
  var closedtabheight = 0;
  $$('.c3_import_box').each(function(box){
    //consoleMsg('closedtabheight = ' + closedtabheight + ' / boxheight = ' + box.offsetHeight + ' -> ' + box.className);
    if(closedtabheight > 0){
      closedtabheight = Math.min(box.offsetHeight, closedtabheight);
    } else{
      closedtabheight = box.offsetHeight;
    }
  });
  //consoleMsg('tabtitlesheight = ' + $$('.c3_import_box').size() + ' * ' + closedtabheight);
  var tabtitlesheight = $$('.c3_import_box').size() * closedtabheight;
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
//  consoleMsg('tabboxsize: ' + tabboxsize + ' = ' + document.body.clientHeight + ' - ' + tabtitlesheight + ' - ' + mainborders);
  $$('.c3_import_tabbox').each(function(box){
//    consoleMsg('box cum-offset: ' + box.cumulativeOffset());
    var scrollbox = box.down('.c3_import_scrollable');
    if(scrollbox){
//      consoleMsg('scrollable cum-offset: ' + scrollbox.cumulativeOffset());
      var offsetBefore = (scrollbox.cumulativeOffset().top - box.cumulativeOffset().top);
      var ele = scrollbox;
      var lastElemBottom = scrollbox.cumulativeOffset().top + scrollbox.getHeight();
      while(ele && (!ele.hasClassName('c3_import_tabbox'))){
        ele.siblings().each(function(sibl){
          if(sibl.getStyle('position') != 'absolute') {
        	// use offsetHeight instead of getHeight() which is wrong for script and link elements
        	  lastElemBottom = Math.max(lastElemBottom, sibl.cumulativeOffset().top + sibl.offsetHeight);
//            consoleMsg('lastElemBottom after [' + sibl.inspect() + ']: ' + lastElemBottom);
          }
        });
        ele = ele.up();
      }
      var offsetAfter = lastElemBottom - (scrollbox.cumulativeOffset().top + scrollbox.getHeight());
      var newScrollableHeight = tabboxsize - offsetAfter - offsetBefore;
//      consoleMsg('offsetAfter [' + scrollbox.inspect() + ']: ' + offsetAfter);
//      consoleMsg('scrollbox [' + scrollbox.inspect() + '] new height: ' + newScrollableHeight);
      scrollbox.setStyle({ height: Math.max(50, newScrollableHeight) + "px" });
    }
    box.setStyle({ height: Math.max(50, tabboxsize) + "px" });
  })
}

function changeTabEvent(event) {
  showTab(event.element().up('.c3_import_box'));
}

function showTab(tab) {
  if (tab) {
    var i = 1;
    $$('.c3_import_box').each(function(elemTab) {
         //consoleMsg('hide tab ' + elemTab.className);
         hideDisplay(elemTab.down('.c3_import_tabbox'));
      });
    //consoleMsg('show tab ' + tab.className);
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

function consoleMsg(msg){
//  if ((typeof console != 'undefined') && (typeof console.debug != 'undefined')) {
//    console.debug(msg);
//  }
}
