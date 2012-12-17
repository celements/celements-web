/**
 * Navigation Reordering
 */
if(typeof CELEMENTS=="undefined"){var CELEMENTS={};};
if(typeof CELEMENTS.reorder=="undefined"){CELEMENTS.reorder={};};

(function() {

var Dom = YAHOO.util.Dom;
var YEvent = YAHOO.util.Event;
var DDM = YAHOO.util.DragDropMgr;

//////////////////////////////////////////////////////////////////////////////
// CELEMENTS drag and drop reorder
// -> call CELEMENTS.reorder.DDReorder.init() to start reordering
// -> set minLevel and maxLevel BEFORE calling init().
//////////////////////////////////////////////////////////////////////////////
CELEMENTS.reorder.DDReorder = function(id, ulSelector, minLevel, maxLevel) {
  // constructor
  ulSelector = ulSelector || '.cel_skin_editor_reorder';
  this._init(id, ulSelector, minLevel, maxLevel);
};

(function() {
var CDDR = CELEMENTS.reorder.DDReorder;

CELEMENTS.reorder.DDReorder.prototype = {

  parentElem : null,

  _ulSelector : null,

  minLevel: 1,

  maxLevel: 99,

  _init: function(theElem, ulSelector, minLevel, maxLevel) {
    var _me = this;
    _me.parentElem = $(theElem);
    _me._ulSelector = ulSelector;
    if (minLevel) {
      _me.minLevel = minLevel;
    }
    if (maxLevel) {
      _me.maxLevel = maxLevel;
    }
    
		$$('ul' + _me._ulSelector + ' li').each(function(listItem) {
		  if (!listItem.id) {
		    var menuItemId = listItem.down('span').id;
		    listItem.id = 'LI' + menuItemId;
		  }
		  _me._addEmptySublists(listItem.id);
      var ddElem = new CELEMENTS.reorder.DDList(listItem.id, undefined, undefined, _me);
      _me._addHandleIfPresent(ddElem, listItem);
		});
		$$('ul' + _me._ulSelector).each(function(listElem) {
      new YAHOO.util.DDTarget(listElem.id);
		});
  	_me.parentElem.fire('celreorder_reorderMode:start');
//      new YAHOO.util.DDTarget('cel_layout_editor_scrollup');
//      new YAHOO.util.DDTarget('cel_layout_editor_scrolldown');
  },

  _addHandleIfPresent : function(ddElem, listItem) {
    var ddHandle = listItem.down('.cel_dd_handle');
    if (ddHandle) {
      if (!ddHandle.id) {
        ddHandle.id = listItem.id + '_ddhandle';
      }
      ddElem.setHandleElId(ddHandle.id);
    }
  },

  _getLevelOfMenuItem : function(listItemId) {
    var count = 0;
    $(listItemId).ancestors().each(function(parentNode) {
      if (parentNode.tagName.toLowerCase() == 'ul') {
        count++;
      }
    });
    return count;
  },

  _addEmptySublists : function(listItemId) {
    var _me = this;
    var currentLevel = _me._getLevelOfMenuItem(listItemId);
    var subULid = listItemId.replace(/^LI/, 'C');
    if (!$(subULid) && (currentLevel >= _me.minLevel) && (currentLevel < _me.maxLevel)) {
      var emptyList = new Element('ul', {
        'id' : subULid,
        'class' : 'cel_skin_editor_reorder'
      });
      $(listItemId).insert({ bottom : emptyList});
    }
  },

  getOrder: function() {
    var _me = this;
    var parseList = function(childElems) {
        var listItems = [];
        childElems.each(function(item) {
          listItems.push(item.id);
        });
        return listItems;
    };

  	var serialList = new Array();
		$$('ul' + _me._ulSelector).each(function(listElem) {
			var childElems = listElem.childElements('li');
			if (childElems.size() > 0) {
		    	var parentChild = new Hash();
		    	parentChild.set(listElem.id, parseList(childElems));
		    	serialList.push(parentChild);
			}
		});
		return serialList;
  },

  saveOrder : function(callbackFn) {
    var _me = this;
	  new Ajax.Request(getCelHost(), {
	    method: 'post',
	    parameters: {
	       xpage : 'celements_ajax',
	       ajax_mode : 'CelNavReorderSave',
	       new_nav_order : Object.toJSON(this.getOrder())
	    },
	    onSuccess: function(transport) {
	      _me.parentElem.fire('celreorder_reorderMode:end');
	      if (callbackFn) {
	        callbackFn(transport);
	      }
	    }
	  });
  }

};
})();

//////////////////////////////////////////////////////////////////////////////
// custom drag and drop implementation
//////////////////////////////////////////////////////////////////////////////

CELEMENTS.reorder.DDList = function(id, sGroup, config, ddReorder) {

  CELEMENTS.reorder.DDList.superclass.constructor.call(this, id, sGroup, config);
  
  this.ddReorder = ddReorder;
  this.logger = this.logger || YAHOO;
  var el = this.getDragEl();
  Dom.setStyle(el, "opacity", 0.55); // The proxy is slightly transparent
  this.scroll = false; //prevent auto scrolling of the window
  this.lastList = null;
};

YAHOO.extend(CELEMENTS.reorder.DDList, YAHOO.util.DDProxy, {
  ddReorder : null,
  
    startDrag: function(x, y) {
        this.logger.log(this.id + " startDrag");

        // make the proxy look like the source element
        var dragEl = this.getDragEl();
        var clickEl = this.getEl();
        Dom.setStyle(clickEl, "height", "0px");
        Dom.setStyle(clickEl, "width", "50px");
        Dom.setStyle(clickEl, "margin", "0px");
        Dom.setStyle(clickEl, "border-top", "2px solid red");
        Dom.setStyle(clickEl, "position", "absolute");
        Dom.setStyle(clickEl, "overflow", "hidden");

        dragEl.innerHTML = clickEl.innerHTML;

        Dom.setStyle(dragEl, "color", Dom.getStyle(clickEl, "color"));
        Dom.setStyle(dragEl, "backgroundColor", Dom.getStyle(clickEl, "backgroundColor"));
        Dom.setStyle(dragEl, "border", "none");
        YAHOO.util.DDM.mode = YAHOO.util.DDM.INTERSECT;
    },

    endDrag: function(e) {

        var srcEl = this.getEl();
        var proxy = this.getDragEl();

        // Show the proxy element and animate it to the src element's location
        Dom.setStyle(proxy, "visibility", "");
        var a = new YAHOO.util.Motion( 
            proxy, { 
                points: { 
                    to: Dom.getXY(srcEl)
                }
            }, 
            0.2, 
            YAHOO.util.Easing.easeOut 
        );
        var proxyid = proxy.id;
        var thisid = this.id;
        var ddReorder = this.ddReorder;

        // Hide the proxy and show the source element when finished with the animation
        a.onComplete.subscribe(function() {
                Dom.setStyle(proxyid, "visibility", "hidden");
                Dom.setStyle(thisid, "height", "");
                Dom.setStyle(thisid, "width", "");
                Dom.setStyle(thisid, "margin", "");
                Dom.setStyle(thisid, "border-top", "");
                Dom.setStyle(thisid, "position", "");
                Dom.setStyle(thisid, "overflow", "");
                ddReorder.parentElem.select('.dragDropHover').each(function(elem) {
            		elem.removeClassName('dragDropHover');
            	});
            });
        a.animate();
        ddReorder.parentElem.fire('celreorder_dragDrop:endDrag', thisid);
    },

    onDragDrop: function(e, id) {

        // If there is one drop interaction, the li was dropped either on the list,
        // or it was dropped on the current location of the source element.
        if (DDM.interactionInfo.drop.length === 1) {

            // The position of the cursor at the time of the drop (YAHOO.util.Point)
            var pt = DDM.interactionInfo.point; 

            // The region occupied by the source element at the time of the drop
            var region = DDM.interactionInfo.sourceRegion; 

            // Check to see if we are over the source element's location.  We will
            // append to the bottom of the list once we are sure it was a drop in
            // the negative space (the area of the list without any list items)
            if (!region.intersect(pt)) {
                var destEl = Dom.get(id);
                var destDD = DDM.getDDById(id);
                destEl.appendChild(this.getEl());
                destDD.isEmpty = false;
                DDM.refreshCache();
            }
        }
    },

    onDragOut: function(e, elems) {
      $A(elems).each(function(elem) {
        if ($(elem._domRef).hasClassName('cel_layout_editor_scrollArea')) {
          if (celLayoutEditorReorderScrollPoll) {
            clearInterval(celLayoutEditorReorderScrollPoll);
            celLayoutEditorReorderScrollPoll = null;
          }
        }
      });
    },

    onDragOver: function(e, elems) {
        var srcEl = this.getEl();
        var treeDiv = this.ddReorder.parentElem;
        var y = YEvent.getPageY(e);
        var isOutsideArea = ((y < treeDiv.top) || (y > treeDiv.bottom));
        var destEl = this.ddReorder.parentElem;
        $A(elems).each(function(elem) {
          if (elem.cursorIsOver) {
            if ((!isOutsideArea && (elem._domRef.ancestors().size() > destEl.ancestors().size()))
                || elem._domRef.hasClassName('cel_layout_editor_scrollArea')) {
              destEl = elem._domRef;
            }
          }
        });
        var id = destEl.id;

        var isValidDestElem = !(Dom.getFirstChildBy(srcEl, function(node) {
        	return (node.id && (node.id == id));
        }));

        if ($(destEl).hasClassName('cel_layout_editor_scrollArea')) {
          if (celLayoutEditorReorderScrollPoll == null) {
            celLayoutEditorReorderScrollUp = (id == 'cel_layout_editor_scrollup');
            var ddReorder = this.ddReorder;
            celLayoutEditorReorderScrollPoll = setInterval(this._celLayoutEditorReorderScrollSome, 100);
          }
        } else if (isValidDestElem) {
	        // We are only concerned with list items, we ignore the dragover
	        // notifications for the list.
	        if (destEl.nodeName.toLowerCase() == "li") {
	            var p = destEl.parentNode;
              if (this._isMouseBeforeMedium(e, destEl)) {
	                p.insertBefore(srcEl, destEl); // insert above
	            } else {
	                p.insertBefore(srcEl, destEl.nextSibling); // insert below
	            }
	            DDM.refreshCache();
	        } else if (destEl.nodeName.toLowerCase() == "ul") {
	          if (destEl != srcEl.parentNode) {
	            if (!this._isMouseBeforeMedium(e, destEl)) {
	              destEl.insertBefore(srcEl, null); // insert as last
	            } else {
                destEl.insertBefore(srcEl, destEl.firstChild); // insert as first
	            }
	          }
	        }
          if (this.lastList != srcEl.parentNode) {
            if (this.lastList) {
              $(this.lastList).removeClassName('dragDropHover');
            }
            $(destEl).addClassName('dragDropHover');
            this.lastList = destEl;
          }
        } else if ((typeof console != "undefined") && (typeof console.debug != "undefined")) {
          console.debug('invalid dragOver: ', id, destEl);
        }
    },

    _isMouseBeforeMedium : function(e, destEl) {
      var treeDiv = this.ddReorder.parentElem;
      var destElOffset = destEl.cumulativeOffset();
      var destElMedium = (destElOffset.top - treeDiv.scrollTop) + (destEl.getHeight() /2);
      return (YEvent.getPageY(e) < destElMedium);
    },

    _celLayoutEditorReorderScrollSome : function() {
//      console.debug('_celLayoutEditorReorderScrollSome', this, ddReorder);
      if (celLayoutEditorReorderScrollPoll) {
        var treeDiv = this.ddReorder.parentElem;
        var scrollOffset = 20;
        if (celLayoutEditorReorderScrollUp) {
          scrollOffset = -20;
        }
        treeDiv.scrollTop = treeDiv.scrollTop + scrollOffset;
        window.scrollTo(0,0);
      }
    }
});

})();
