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

/* HELPERS */
const cmDefaultItems = new Array();
let cmOutliner = null;

const contextMouseOver = function(n) {
  const classAttribute = n.getAttributeNode('class');
  classAttribute.nodeValue = "contextMenuLinkOver";

  $(document).stopObserving('mousedown', myContextMenu.hide);
  return true;
};

const contextMouseOut = function(n) {
  const classAttribute = n.getAttributeNode('class');
  classAttribute.nodeValue = "contextMenuLink";
  
  $(document).observe('mousedown', myContextMenu.hide);
  return true;
};

const confirmURL = function(t, u) {
  if(confirm(t))
    window.location.href=u;
};

/* ContextMenuItem Class */

function ContextMenuItem(link, text, icon, shortcut) {
  const me = this;
  
  this.link = link;
  this.text = text;
  this.icon = icon;
  this.shortcut = shortcut;
  
  this.getHTML = function(nr) {
    let tmpHTML = "<div class='contextMenuItem'><div class='contextMenuIcon'>";
    tmpHTML += "&nbsp;";
    
    tmpHTML += "</div><div class='contextMenuLink' onmouseover='javascript:contextMouseOver(this)' onmouseout='javascript:contextMouseOut(this)' onclick='javascript:";
    tmpHTML += me.link;
    tmpHTML += "'>" + me.text;

    if (me.shortcut) {
      tmpHTML += '<span class="contextMenuItemShortcut">' + me.getShortcutHTML() + '</span>';
    }

    tmpHTML += "</div></div>";
    return tmpHTML;
  };

  this.getShortcutHTML = function() {
    var shortcutStr = '';
       if (me.shortcut.altKey) {
         shortcutStr += ' alt +';
       }
       if (me.shortcut.ctrlKey) {
         shortcutStr += ' crtl +'; 
       }
       if (me.shortcut.keyCode) {
         shortcutStr += ' ' + String.fromCharCode(me.shortcut.keyCode);
       }
       if (me.shortcut.charCode) {
         shortcutStr += ' ' + String.fromCharCode(me.shortcut.charCode);
       }
       return shortcutStr;
  }

}

/* ContextMenu Class */

function ContextMenu() {
  var me = this;
  
  this.config = new Array();
  this.menuDiv = null;
  
  this.show = function(e, config, contextClickElementId) {
    if ((typeof contextClickElementId != 'undefined') && $(contextClickElementId)) {
      getCmOutliner().outlineElement($(contextClickElementId));
    }
    $(document).observe('mousedown', me.hide);
    
    me.config = me.config.concat(config);
    
    var mouseCoord = me.getMousePos(e);

    let y = mouseCoord[1] - 6;
    let x = mouseCoord[0] - 3;
    
    const h = me.config.length * 26 + 6;
    console.log('>>> contextMenu border check2: width', me.menuDiv?.getWidth(),
     'height', me.menuDiv?.getHeight(), 'getBoundingClientRect', me.menuDiv.getBoundingClientRect());
    
    // if the context menu ist too close to the browser border
    if(document.documentElement.clientHeight) { // NOTE: this works only in ff and ie strict mode
      if(document.documentElement.clientHeight - mouseCoord[1] + document.documentElement.scrollTop < h) {
        y = y - h;
      }
/**
      if(document.documentElement.clientWidth - mouseCoord[0] + document.documentElement.scrollLeft < w) {
        x = x - w;
      }
 */
     }
    if(!me.menuDiv) {
      me.menuDiv = new Element('div', {
        'id' : 'contextMenu',
        'class' : 'contextMenu'
      }).setStyle({
        'z-index' : 999,
        'position' : 'absolute'
      });
      $$('body')[0].insert(me.menuDiv);
    } else {
      me.setPosition(y,x);
    }
    me.populate();        
    console.log('>>> contextMenu border check after populate: width', me.menuDiv?.getWidth(),
     'height', me.menuDiv?.getHeight(), 'getBoundingClientRect', me.menuDiv.getBoundingClientRect());
    return false;
  };
  
  this.setPosition = function (y, x) {
    me.menuDiv.setStyle({
      'left' : x + 'px',
      'top' : y + 'px'
    });
  };
  
  this.internal_hide = function() {
    me.config = new Array();
    if(me.menuDiv)
      me.menuDiv.remove();
    me.menuDiv = null;
  
    $(document).stopObserving('mousedown', me.hide);
  };

  this._close = function(element) {
    me.internal_hide();
    getCmOutliner().removeAllOutlines(element);
  };

  this.closeAll = function() {
    me._close($$('body')[0]);
  };

  this.hide = function(e) {
    me._close(e.element());
    e.stop();
  };
  
  this.getMousePos = function(e) {
    var tmpCoord = new Array(0,0);
    
    var posx = 0;
    var posy = 0;
    
    if (!e) var e = window.event;
    if (e.pageX || e.pageY) // Firefox & co.
    {
      posx = e.pageX;
      posy = e.pageY;
    }
    else if (e.clientX || e.clientY) // IE
    {
      // NOTE: Explorer must be in strict mode for documentElement, otherwise use document.body.scrollLeft!
      posx = e.clientX + document.documentElement.scrollLeft - 1;
      posy = e.clientY + document.documentElement.scrollTop + 2;
    }
    
    tmpCoord[0] = posx;
    tmpCoord[1] = posy;
  
    return tmpCoord;
  
  };
  
  this.populate = function() {
  
    var tmpHTML = "<div class='contextMenuCorner'></div>";
    if (!contextMenuLoading) {
      for(var i = 0; i < me.config.length; i++) {
        tmpHTML += me.config[i].getHTML(i);
      }
    } else {
      tmpHTML += "<div class='contextMenuItem'><img style='display:block; margin-right:auto; margin-left:auto;' src='"
        + window.CELEMENTS.getUtils().getPathPrefix() + "/file/celRes/ajax-loader-small.gif'/></div>";
    }
    me.menuDiv.innerHTML = tmpHTML;
  };
  return true;
}

// global variable, the context menu object
var myContextMenu = new ContextMenu();

var getCelHost = function() {
  var celHost = document.location + '?';
  celHost = celHost.substring(0, celHost.indexOf('?'));
  return celHost;
};

var cmContextMenuClassNames = null;
var cmContextMenuClassNamesLoading = false;

var initContextMenuAsync = function() {
  if (!cmContextMenuClassNamesLoading) {
    if (!cmContextMenuClassNames) {
      cmContextMenuClassNamesLoading = true;
      new Ajax.Request(getCelHost(), {
        method: 'post',
        parameters: {
           xpage : 'celements_ajax',
           ajax_mode : 'ContextMenuAjax',
           celCMIdClassName : ''
        },
        onSuccess: function(transport) {
          if (transport.responseText.isJSON()) {
            cmContextMenuClassNames = transport.responseText.evalJSON();
            cmContextMenuClassNamesLoading = false;
            loadContextMenuForClassNames(cmContextMenuClassNames);
          } else {
            console.error('noJSON!!! ', transport.responseText);
          }
        }
      });
    } else {
      loadContextMenuForClassNames(cmContextMenuClassNames);
    }
  }
};

var getElemIdsForClassName = function(cssClassName) {
  var elemNames = new Array();
  $$('.' + cssClassName).each(function(elem) {
    if ((elem.id != '') &&(elemNames.indexOf(elem.id) < 0)) {
     elemNames[elemNames.size()] = elem.id;
    }
  });
  return elemNames;
};

var contextMenuAddValueForKeysToMap = function(resultMap, keysForValue, valueName) {
  var getAndAddValueArray = function(id, theValue) {
    var theValueArray = resultMap.get(id);
    if (!theValueArray) {
      theValueArray = new Array();
    }
    if (theValueArray.indexOf(theValue) < 0) {
      theValueArray.push(theValue);
    }
    return theValueArray;
  };
  keysForValue.each(function(id) {
    resultMap.set(id, getAndAddValueArray(id, valueName));
  });
};

var contextMenuRemoveEqualsFromCssClassNamesMap = function(newCssClassMap,
    oldCssClassMap) {
  var reducedCssClassMap = new Hash(newCssClassMap);
  if (oldCssClassMap) {
    oldCssClassMap.keys().each(function(id) {
      var classNameArrayNew = reducedCssClassMap.get(id);
      var classNameArrayOld = oldCssClassMap.get(id);
      if (classNameArrayNew && classNameArrayOld
          && (classNameArrayOld.size() === classNameArrayNew.size())) {
        var diffArray = classNameArrayOld.without(classNameArrayNew);
        if (diffArray.size() <= 0) {
//          console.log('>>>diffArray: unset ', id, diffArray, classNameArrayOld, classNameArrayNew);
          reducedCssClassMap.unset(id);
        } else {
//          console.log('>>>diffArray: keep ', id, diffArray, classNameArrayOld, classNameArrayNew);
        }
      }
    });
  }
  return reducedCssClassMap;
};

var contextMenuConvertIdClassMapToClassIdMap = function(cssClassMap) {
  var classIdMap = new Hash();
  cssClassMap.keys().each(function(idKey) {
    contextMenuAddValueForKeysToMap(classIdMap, cssClassMap.get(idKey), idKey);
  });
  return classIdMap;
};

var contextMenuWriteReqArray = function(cssClassNameIdMap) {
  var reqArray = new Array();
  cssClassNameIdMap.keys().each(function(cssClass) {
    var idsForCssClass = cssClassNameIdMap.get(cssClass);
    if (idsForCssClass.size() > 0) {
      var reqDict = new Hash();
      reqDict.set('cmClassName', cssClass);
      reqDict.set('elemIds', idsForCssClass);
      reqArray.push(reqDict);
    }
  });
  return reqArray;
};

var contextMenuItemDataForElemId = new Hash();
var contextMenuIdCssClassNamesMap = null;
var loadContextMenuForClassNames = function (cssClassNames) {
  var cssClassMap = new Hash();
  cssClassNames.each(function(cssClass) {
    var idsForCssClass = getElemIdsForClassName(cssClass);
    contextMenuAddValueForKeysToMap(cssClassMap, idsForCssClass, cssClass);
  });

  var reducedCssClassMap = contextMenuRemoveEqualsFromCssClassNamesMap(cssClassMap,
      contextMenuIdCssClassNamesMap);
  
  if (reducedCssClassMap.size() > 0) {
    var reducedClassNameIdMap = contextMenuConvertIdClassMapToClassIdMap(reducedCssClassMap);
    var reqArray = contextMenuWriteReqArray(reducedClassNameIdMap);
    new Ajax.Request(getCelHost(), {
      method: 'post',
      parameters: {
         xpage : 'celements_ajax',
         ajax_mode : 'ContextMenuAjax',
       celCMIdClassName : Object.toJSON(cssClassNames),
         cmiByElements : Object.toJSON(reqArray)
      },
      onSuccess: function(transport) {
        if (transport.responseText.isJSON()) {
          transport.responseText.evalJSON().each(function(elemIdMenuItems) {
            try {
              var htmlElem = $(elemIdMenuItems.elemId);
              if (htmlElem) {
                var articleCMenu = new Array();
                elemIdMenuItems.cmItems.each(function(menuItemObj) {
                  articleCMenu[articleCMenu.size()] = new ContextMenuItem(menuItemObj.link,
                      menuItemObj.text, menuItemObj.icon, menuItemObj.shortcut);
                });
                contextMenuItemDataForElemId.set(elemIdMenuItems.elemId, articleCMenu);
                htmlElem.stopObserving('contextmenu', contextClickHandler);
                htmlElem.observe('contextmenu', contextClickHandler);
              }
            } catch (exp) {
              console.error('ContextMenuAjax failed to process elemIdMenuItems: ',
                  exp, elemIdMenuItems);
            }
          });
          cm_mark_loading_finished();
        }
      }
    });
    contextMenuIdCssClassNamesMap = cssClassMap;
  } else {
//    console.log('>>>skip contextmenu reloading.');
    cm_mark_loading_finished();
  }
};

var cm_mark_loading_finished = function() {
  if(myContextMenu.menuDiv) {
    myContextMenu.internal_hide();
  }
  contextMenuLoading = false;
  Event.fire(window, 'celcontextmenu:loadingfinished');
};

var contextClickElement = null;

var contextClickHandler = function(event) {
  contextClickElement = this; // use 'this' to get the element on which the clickHandler
                  // is installed. event.element() returns the clicked element
  if (!event.shiftKey && (contextClickElement.id != "")
      && contextMenuItemDataForElemId.get(contextClickElement.id)) {
    myContextMenu.show(event, contextMenuItemDataForElemId.get(contextClickElement.id),
        contextClickElement.id);
  }
};

var contextKeydownExecuter = function(ev, nodeId) {
   var cmi_action_found = false;
   if(nodeId && contextMenuItemDataForElemId.get(nodeId)) {
     contextMenuItemDataForElemId.get(nodeId).each(function(cmiElem) {
       if ((!cmiElem.shortcut.altKey || ev.altKey)
          && (!cmiElem.shortcut.ctrlKey || ev.ctrlKey)
          && ((cmiElem.shortcut.keyCode && (cmiElem.shortcut.keyCode == ev.keyCode))
            || (cmiElem.shortcut.charCode && (cmiElem.shortcut.charCode == ev.charCode)))) {
         contextClickElement = $(nodeId);
         eval(cmiElem.link.replace(/&quot;/g,'"'));
         cmi_action_found = true;
       }
     });
   }
   return cmi_action_found;
};

var getCmOutliner = function() {
  if(cmOutliner == null) {
    cmOutliner = new CELEMENTS.layout.Outliner;
  }
  return cmOutliner;
}

const documentContextClickHandler = function(event) {
  if (!event.shiftKey && !myContextMenu.show(event, cmDefaultItems)) {
    event.preventDefault();
    return false;
  }
  return true;
};

let contextMenuLoading = true;
$j(document).ready(initContextMenuAsync);

window.addEventListener('load', function() {
  if (document.body.classList.contains('cel_show_cm')) {
    document.addEventListener('contextmenu', documentContextClickHandler);
  }
});

