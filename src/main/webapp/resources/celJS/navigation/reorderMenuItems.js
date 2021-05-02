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

(function(window, undefined) {
  "use strict";

  /**
   * Navigation Reordering
   */
  if (typeof window.CELEMENTS == "undefined") { window.CELEMENTS = {}; }
  if (typeof window.CELEMENTS.reorder == "undefined") { window.CELEMENTS.reorder = {}; }

  const Dom = YAHOO.util.Dom;
  const YEvent = YAHOO.util.Event;
  const DDM = YAHOO.util.DragDropMgr;

  //////////////////////////////////////////////////////////////////////////////
  // CELEMENTS drag and drop reorder
  // -> call CELEMENTS.reorder.DDReorder.init() to start reordering
  // -> set minLevel and maxLevel BEFORE calling init().
  //////////////////////////////////////////////////////////////////////////////
  window.CELEMENTS.reorder.DDReorder = function(id, ulSelector, minLevel, maxLevel) {
    // constructor
    this._init(id, ulSelector, minLevel, maxLevel);
  };

  window.CELEMENTS.reorder.DDReorder.prototype = {
    parentElem: undefined,
    _ulSelector: undefined,
    minLevel: undefined,
    maxLevel: undefined,

    _init: function(theElem, ulSelector, minLevel, maxLevel) {
      const _me = this;
      _me.parentElem = $(theElem);
      _me._ulSelector = ulSelector || '.cel_skin_editor_reorder';
      _me.minLevel = minLevel || 1;
      _me.maxLevel = maxLevel || 99;

      $$('ul' + _me._ulSelector + ' li').each(function(listItem) {
        if (!listItem.hasClassName('cel_nodrag')) {
          if (!listItem.id) {
            const menuItemId = (listItem.down('span,a')).id;
            listItem.id = 'LI' + menuItemId;
          }
          _me._addEmptySublists(listItem.id);
          const ddElem = new CELEMENTS.reorder.DDList(listItem.id, undefined, undefined, _me);
          _me._addHandleIfPresent(ddElem, listItem);
        }
      });
      $$('ul' + _me._ulSelector).each(function(listElem) {
        new YAHOO.util.DDTarget(listElem.id);
      });
      _me.parentElem.fire('celreorder_reorderMode:start');
      //      new YAHOO.util.DDTarget('cel_layout_editor_scrollup');
      //      new YAHOO.util.DDTarget('cel_layout_editor_scrolldown');
    },

    _addHandleIfPresent: function(ddElem, listItem) {
      const ddHandle = listItem.down('.cel_dd_handle');
      if (ddHandle) {
        if (!ddHandle.id) {
          ddHandle.id = listItem.id + '_ddhandle';
        }
        ddElem.setHandleElId(ddHandle.id);
      }
    },

    _getLevelOfMenuItem: function(listItemId) {
      let count = 0;
      $(listItemId).ancestors().each(function(parentNode) {
        if (parentNode.tagName.toLowerCase() == 'ul') {
          count++;
        }
      });
      return count;
    },

    _addEmptySublists: function(listItemId) {
      const _me = this;
      const currentLevel = _me._getLevelOfMenuItem(listItemId);
      const subULid = listItemId.replace(/^LI/, 'C');
      if (!$(subULid) && (currentLevel >= _me.minLevel) && (currentLevel < _me.maxLevel)) {
        const emptyList = new Element('ul', {
          'id': subULid,
          'class': 'cel_skin_editor_reorder'
        });
        $(listItemId).insert({ bottom: emptyList });
      }
    },

    getOrder: function() {
      const _me = this;
      const parseList = function(childElems) {
        const listItems = [];
        childElems.each(function(item) {
          listItems.push(item.id);
        });
        return listItems;
      };

      const serialList = new Array();
      $$('ul' + _me._ulSelector).each(function(listElem) {
        const childElems = listElem.childElements('li');
        if (childElems.size() > 0) {
          const parentChild = new Hash();
          parentChild.set(listElem.id, parseList(childElems));
          serialList.push(parentChild);
        }
      });
      return serialList;
    },

    saveOrder: function(callbackFn) {
      const _me = this;
      const orderJSON = Object.toJSON(_me.getOrder());
      console.debug('DDReorder saveOrder before save: ', orderJSON);
      new Ajax.Request(getCelHost(), {
        method: 'post',
        parameters: {
          xpage: 'celements_ajax',
          ajax_mode: 'CelNavReorderSave',
          new_nav_order: orderJSON
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

  //////////////////////////////////////////////////////////////////////////////
  // custom drag and drop implementation
  //////////////////////////////////////////////////////////////////////////////

  window.CELEMENTS.reorder.DDList = function(id, sGroup, config, ddReorder) {

    window.CELEMENTS.reorder.DDList.superclass.constructor.call(this, id, sGroup, config);

    this.ddReorder = ddReorder;
    // this.logger = this.logger || YAHOO;
    const el = this.getDragEl();
    Dom.setStyle(el, "opacity", 0.55); // The proxy is slightly transparent
    Dom.addClass(el, "cel_reorderNodes_proxy");
    Dom.addClass(el, "cel_reorderNodes_parent_" + ddReorder.parentElem.id);
    this.scroll = false; //prevent auto scrolling of the window
    this.lastList = null;
  };

  YAHOO.extend(CELEMENTS.reorder.DDList, YAHOO.util.DDProxy, {
    ddReorder: undefined,
    celLayoutEditorReorderScrollPoll: undefined,
    celLayoutEditorReorderScrollUp: undefined,

    startDrag: function(x, y) {
      const _me = this;
      // _me.logger.log(_me.id + " startDrag");

      // make the proxy look like the source element
      const dragEl = _me.getDragEl();
      const clickEl = _me.getEl();
      Dom.setStyle(clickEl, "height", "0px");
      Dom.setStyle(clickEl, "width", "50px");
      Dom.setStyle(clickEl, "margin", "0px");
      Dom.setStyle(clickEl, "border-top", "2px solid red");
      Dom.setStyle(clickEl, "position", "absolute");
      Dom.setStyle(clickEl, "overflow", "hidden");
      Dom.addClass(clickEl, "cel_reorderNodes_placeholder");

      dragEl.innerHTML = clickEl.innerHTML;

      Dom.setStyle(dragEl, "color", Dom.getStyle(clickEl, "color"));
      Dom.setStyle(dragEl, "backgroundColor", Dom.getStyle(clickEl, "backgroundColor"));
      Dom.setStyle(dragEl, "border", "none");
      YAHOO.util.DDM.mode = YAHOO.util.DDM.INTERSECT;
    },

    endDrag: function(e) {
      const _me = this;
      const srcEl = _me.getEl();
      const proxy = _me.getDragEl();

      // Show the proxy element and animate it to the src element's location
      Dom.setStyle(proxy, "visibility", "");
      const a = new YAHOO.util.Motion(
        proxy, {
        points: {
          to: Dom.getXY(srcEl)
        }
      },
        0.2,
        YAHOO.util.Easing.easeOut
      );
      const proxyid = proxy.id;
      const thisid = _me.id;

      // Hide the proxy and show the source element when finished with the animation
      a.onComplete.subscribe(function() {
        Dom.setStyle(proxyid, "visibility", "hidden");
        Dom.setStyle(thisid, "height", "");
        Dom.setStyle(thisid, "width", "");
        Dom.setStyle(thisid, "margin", "");
        Dom.setStyle(thisid, "border-top", "");
        Dom.setStyle(thisid, "position", "");
        Dom.setStyle(thisid, "overflow", "");
        Dom.removeClass(thisid, "cel_reorderNodes_placeholder");
        _me.ddReorder.parentElem.select('.dragDropHover').each(function(elem) {
          elem.removeClassName('dragDropHover');
        });
      });
      a.animate();
      _me.ddReorder.parentElem.fire('celreorder_dragDrop:endDrag', thisid);
    },

    onDragDrop: function(e, id) {

      // If there is one drop interaction, the li was dropped either on the list,
      // or it was dropped on the current location of the source element.
      if (DDM.interactionInfo.drop.length === 1) {

        // The position of the cursor at the time of the drop (YAHOO.util.Point)
        const pt = DDM.interactionInfo.point;

        // The region occupied by the source element at the time of the drop
        const region = DDM.interactionInfo.sourceRegion;

        // Check to see if we are over the source element's location.  We will
        // append to the bottom of the list once we are sure it was a drop in
        // the negative space (the area of the list without any list items)
        if (!region.intersect(pt)) {
          const destEl = Dom.get(id);
          const destDD = DDM.getDDById(id);
          destEl.appendChild(this.getEl());
          destDD.isEmpty = false;
          DDM.refreshCache();
        }
      }
    },

    onDragOut: function(e, elems) {
      const _me = this;
      $A(elems).each(function(elem) {
        if ($(elem._domRef).hasClassName('cel_layout_editor_scrollArea')) {
          if (_me.celLayoutEditorReorderScrollPoll) {
            clearInterval(_me.celLayoutEditorReorderScrollPoll);
            _me.celLayoutEditorReorderScrollPoll = null;
          }
        }
      });
    },

    onDragOver: function(e, elems) {
      const _me = this;
      const srcEl = _me.getEl();
      const treeDiv = _me.ddReorder.parentElem;
      const y = YEvent.getPageY(e);
      const isOutsideArea = ((y < treeDiv.top) || (y > treeDiv.bottom));
      let destEl = _me.ddReorder.parentElem;
      elems.forEach(function(elem) {
        if (elem.cursorIsOver) {
          if ((!isOutsideArea && (elem._domRef.ancestors().size() > destEl.ancestors().size()))
            || elem._domRef.hasClassName('cel_layout_editor_scrollArea')) {
            destEl = elem._domRef;
          }
        }
      });
      const id = destEl.id;

      const isValidDestElem = !(Dom.getFirstChildBy(srcEl, function(node) {
        return (node.id && (node.id == id));
      }));

      if ($(destEl).hasClassName('cel_layout_editor_scrollArea')) {
        if (_me.celLayoutEditorReorderScrollPoll == null) {
          _me.celLayoutEditorReorderScrollUp = (id == 'cel_layout_editor_scrollup');
          _me.celLayoutEditorReorderScrollPoll = setInterval(_me._celLayoutEditorReorderScrollSome, 100);
        }
      } else if (isValidDestElem) {
        // We are only concerned with list items, we ignore the dragover
        // notifications for the list.
        if (destEl.nodeName.toLowerCase() == "li") {
          const p = destEl.parentNode;
          if (_me._isMouseBeforeMedium(e, destEl)) {
            p.insertBefore(srcEl, destEl); // insert above
          } else {
            p.insertBefore(srcEl, destEl.nextSibling); // insert below
          }
          DDM.refreshCache();
        } else if (destEl.nodeName.toLowerCase() == "ul") {
          if (destEl != srcEl.parentNode) {
            if (!_me._isMouseBeforeMedium(e, destEl)) {
              destEl.insertBefore(srcEl, null); // insert as last
            } else {
              destEl.insertBefore(srcEl, destEl.firstChild); // insert as first
            }
          }
        }
        if (_me.lastList != srcEl.parentNode) {
          if (_me.lastList) {
            $(_me.lastList).removeClassName('dragDropHover');
          }
          $(destEl).addClassName('dragDropHover');
          _me.lastList = destEl;
        }
      } else {
        console.debug('invalid dragOver: ', id, destEl);
      }
    },

    _isMouseBeforeMedium: function(e, destEl) {
      const _me = this;
      const treeDiv = _me.ddReorder.parentElem;
      //there is a bug in prototypejs 1.7.2 cumulativeOffset sometimes not
      //counting margin-auto offsets. Thus we need to use jquery.offset
      const destElOffset = $j(destEl).offset();
      const destElMedium = (destElOffset.top - treeDiv.scrollTop) + (destEl.getHeight() / 2);
      return (YEvent.getPageY(e) < destElMedium);
    },

    _celLayoutEditorReorderScrollSome: function() {
      const _me = this;
      if (_me.celLayoutEditorReorderScrollPoll) {
        const treeDiv = this.ddReorder.parentElem;
        let scrollOffset = 20;
        if (_me.celLayoutEditorReorderScrollUp) {
          scrollOffset = -20;
        }
        treeDiv.scrollTop = treeDiv.scrollTop + scrollOffset;
        window.scrollTo(0, 0);
      }
    }
  });

})(window);