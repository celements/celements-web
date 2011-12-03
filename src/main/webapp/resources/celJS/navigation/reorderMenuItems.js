/**
 * Navigation Reordering
 */
if(typeof Celements=="undefined"){var Celements={};};
if(typeof Celements.reorder=="undefined"){Celements.reorder={};};

(function() {

var Dom = YAHOO.util.Dom;
var YEvent = YAHOO.util.Event;
var DDM = YAHOO.util.DragDropMgr;

//////////////////////////////////////////////////////////////////////////////
// Celements drag and drop reorder
//////////////////////////////////////////////////////////////////////////////
Celements.reorder.DDReorder = {
    init: function() {
		$$('ul.cel_skin_editor_reorder li').each(function(listItem) {
			var menuItemId = listItem.down('span').id;
			listItem.id = 'LI' + menuItemId;
			if (!$('C' + menuItemId)) {
				var emptyList = new Element('ul', {
					'id' : 'C' + menuItemId,
					'class' : 'cel_skin_editor_reorder'
				});
				listItem.down('span').insert({after : emptyList});
			}
            new Celements.reorder.DDList(listItem.id);
		});
		$$('ul.cel_skin_editor_reorder').each(function(listElem) {
            new YAHOO.util.DDTarget(listElem.id);
		});
    	$$('.cel_naveditor_button_saveAndContinue').each(function(button) {
      	  button.observe('click', saveNavReorderHandler);
      	});
    	$$('.cel_naveditor_button_cancel').each(function(button) {
    	  button.observe('click', cancelNavReorderHandler);
    	});
      	$('cel_layout_editor_reorder').show();
      	$('cel_layout_editor_title_cell').hide();
      	$('cel_skin_editor_reorder_tree').addClassName('reorderMode');
//      new YAHOO.util.DDTarget('cel_layout_editor_scrollup');
//      new YAHOO.util.DDTarget('cel_layout_editor_scrolldown');
    },

    getOrder: function() {
        var parseList = function(childElems) {
            var listItems = [];
            childElems.each(function(item) {
              listItems.push(item.id);
            });
            return listItems;
        };

    	var serialList = new Array();
		$$('ul.cel_skin_editor_reorder').each(function(listElem) {
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
	  new Ajax.Request(getCelHost(), {
	    method: 'post',
	    parameters: {
	       xpage : 'celements_ajax',
	       ajax_mode : 'CelNavReorderSave',
	       new_nav_order : Object.toJSON(this.getOrder())
	    },
	    onSuccess: callbackFn
	  });
    }

};

//////////////////////////////////////////////////////////////////////////////
// custom drag and drop implementation
//////////////////////////////////////////////////////////////////////////////

Celements.reorder.DDList = function(id, sGroup, config) {

	Celements.reorder.DDList.superclass.constructor.call(this, id, sGroup, config);

    this.logger = this.logger || YAHOO;
    var el = this.getDragEl();
    Dom.setStyle(el, "opacity", 0.55); // The proxy is slightly transparent
    this.scroll = false; //prevent auto scrolling of the window
    this.lastList = null;
};

YAHOO.extend(Celements.reorder.DDList, YAHOO.util.DDProxy, {

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
        )
        var proxyid = proxy.id;
        var thisid = this.id;

        // Hide the proxy and show the source element when finished with the animation
        a.onComplete.subscribe(function() {
                Dom.setStyle(proxyid, "visibility", "hidden");
                Dom.setStyle(thisid, "height", "");
                Dom.setStyle(thisid, "width", "");
                Dom.setStyle(thisid, "margin", "");
                Dom.setStyle(thisid, "border-top", "");
                Dom.setStyle(thisid, "position", "");
                Dom.setStyle(thisid, "overflow", "");
            	$$('#cel_skin_editor_reorder_tree .dragDropHover').each(function(elem) {
            		elem.removeClassName('dragDropHover');
            	});
            });
        a.animate();
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
        var treeDiv = $('cel_skin_editor_reorder_tree');
        var y = YEvent.getPageY(e);
        var isOutsideArea = ((y < treeDiv.top) || (y > treeDiv.bottom));
        var destEl = $('cel_skin_editor_reorder_tree');
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
            celLayoutEditorReorderScrollPoll = setInterval(celLayoutEditorReorderScrollSome, 100);
          }
        } else if (isValidDestElem) {
	        // We are only concerned with list items, we ignore the dragover
	        // notifications for the list.
	        if (destEl.nodeName.toLowerCase() == "li") {
	            var p = destEl.parentNode;
              if (isMouseBeforeMedium(e, destEl)) {
	                p.insertBefore(srcEl, destEl); // insert above
	            } else {
	                p.insertBefore(srcEl, destEl.nextSibling); // insert below
	            }
	            DDM.refreshCache();
	        } else if (destEl.nodeName.toLowerCase() == "ul") {
	          if (destEl != srcEl.parentNode) {
	            if (!isMouseBeforeMedium(e, destEl)) {
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
    }
});

var isMouseBeforeMedium = function(e, destEl) {
  var treeDiv = $('cel_skin_editor_reorder_tree');
  var destElOffset = destEl.cumulativeOffset();
  var destElMedium = (destElOffset.top - treeDiv.scrollTop) + (destEl.getHeight() /2);
  return (YEvent.getPageY(e) < destElMedium);
};

var celLayoutEditorReorderScrollSome = function() {
  if (celLayoutEditorReorderScrollPoll) {
    var treeDiv = $('cel_skin_editor_reorder_tree');
    var scrollOffset = 20;
    if (celLayoutEditorReorderScrollUp) {
      scrollOffset = -20;
    }
    treeDiv.scrollTop = treeDiv.scrollTop + scrollOffset;
    window.scrollTo(0,0);
  }
};

var saveNavReorderHandler= function(event) {
	var button = event.findElement();
	button.stopObserving('click', saveNavReorderHandler);
    var savingDialog = getCelModalDialog();
	savingDialog.setHeader("Saving..."); 
	savingDialog.setBody('<img style="margin-left: auto; margin-right:auto;" src="/skin/resources/celRes/ajax-loader-small.gif" />'); 
	savingDialog.cfg.queueProperty("buttons", null);
	savingDialog.render();
	savingDialog.show();
	Celements.reorder.DDReorder.saveOrder(function(transport) {
		if (transport.responseText == 'OK') {
			$('cel_layout_editor_reorder').hide();
	      	$('cel_layout_editor_title_cell').show();
	      	$('cel_skin_editor_reorder_tree').removeClassName('reorderMode');
	      	window.location.reload();
		} else {
			if ((typeof console != "undefined") && (typeof console.debug != "undefined")) {
				console.debug('failed saving reorder: ' + transport.responseText);
			}
			alert('Failed saving!');
		}
		savingDialog.hide();
	});
};

var cancelNavReorderHandler = function(event) {
  	window.location.reload();
};

var celementsModalDialog = null;
getCelModalDialog = function() {
  if(!celementsModalDialog) {
	  celementsModalDialog = new YAHOO.widget.SimpleDialog("modal dialog", {
      width: "300px", 
      fixedcenter: true, 
      visible: false, 
      draggable: false, 
      close: false, 
      zindex:4, 
      modal:true,
      monitorresize:false,
      icon: YAHOO.widget.SimpleDialog.ICON_HELP, 
      constraintoviewport: true
    } );
  }
  //add skin-div to get default yui-skin-sam layouting for the dialog
  var yuiSamSkinDiv = new Element('div', {'class' : 'yui-skin-sam'});
  $(document.body).insert(yuiSamSkinDiv);
  celementsModalDialog.render(yuiSamSkinDiv);
  return celementsModalDialog;
};


})();