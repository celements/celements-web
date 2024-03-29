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
  document.removeEventListener('mousedown', myContextMenu.hideHandler);
  return true;
};

const contextMouseOut = function(n) {
  const classAttribute = n.getAttributeNode('class');
  classAttribute.nodeValue = "contextMenuLink";
  document.addEventListener('mousedown', myContextMenu.hideHandler);
  return true;
};

const confirmURL = function(t, u) {
  if (confirm(t)) {
    window.location.href=u;
  }
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
class ContextMenu {

  #config;
  #menuDiv;
  
  hideHandler;
  
  constructor() {
    this.#config = [];
    this.hideHandler = this.hide.bind(this);
  }

  get menuDiv() {
    if (!this.#menuDiv) {
      this.#menuDiv = document.createElement('div');
      this.#menuDiv.id = 'contextMenu';
      this.#menuDiv.classList.add('contextMenu');
      this.#menuDiv.style.zIndex = 999;
      this.#menuDiv.style.position = 'absolute';
    }
    return this.#menuDiv;
  }

  show(e, config, contextClickElementId) {
    this.#config = this.#config.concat(config || []);
    if (!contextMenuLoading && this.#config.length == 0) {
      return false; // nothin to show
    }
    if (contextClickElementId && $(contextClickElementId)) {
      getCmOutliner().outlineElement($(contextClickElementId));
    }
    document.addEventListener('mousedown', this.hideHandler);
    
    const mouseCoord = this.getMousePos(e);
    let y = mouseCoord[1] - 6;
    let x = mouseCoord[0] - 3;
    const menuDivDim = this.menuDiv.getBoundingClientRect();
    const distanceToBottom = document.documentElement.clientHeight - mouseCoord[1] + document.documentElement.scrollTop;
    const distanceToRight = document.documentElement.clientWidth - mouseCoord[0] + document.documentElement.scrollLeft;
    // if the context menu ist too close to the browser border
    if (distanceToBottom < menuDivDim.height) {
      y = y - menuDivDim.height;
    }
    if (distanceToRight < menuDivDim.width) {
      x = x - menuDivDim.width;
    }
    document.body.appendChild(this.menuDiv);
    this.setPosition(y,x);
    this.populate();
    return false;
  }

  setPosition(y, x) {
    this.menuDiv.style.left = x + 'px';
    this.menuDiv.style.top = y + 'px';
  }

  internal_hide() {
    this.#config = [];
    if (this.#menuDiv && this.#menuDiv.parentNode) {
      this.#menuDiv.remove();
    }
    this.#menuDiv = null;
  
    document.removeEventListener('mousedown', this.hideHandler);
  }

  _close(element) {
    this.internal_hide();
    getCmOutliner().removeAllOutlines(element);
  }

  closeAll() {
    this._close($$('body')[0]);
  }

  hide(e) {
    this._close(e.element());
    e.stop();
  }
  
  getMousePos(ev) {
    let e = ev;
    const tmpCoord = [0,0];
    
    let posx = 0;
    let posy = 0;
    
    if (!e) e = window.event;
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
  
  }
  
  populate() {
    let tmpHTML = "<div class='contextMenuCorner'></div>";
    if (!contextMenuLoading) {
      for (let i = 0; i < this.#config.length; i++) {
        tmpHTML += this.#config[i].getHTML(i);
      }
    } else {
      tmpHTML += "<div class='contextMenuItem'><img style='display:block; margin-right:auto; margin-left:auto;' src='"
        + window.CELEMENTS.getUtils().getPathPrefix() + "/file/celRes/ajax-loader-small.gif'/></div>";
    }
    this.menuDiv.innerHTML = tmpHTML;
  }
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

const getElemIdsForClassName = function(cssClassName) {
  const elemNames = new Array();
  $$('.' + cssClassName).each(function(elem) {
    if ((elem.id != '') &&(elemNames.indexOf(elem.id) < 0)) {
     elemNames[elemNames.size()] = elem.id;
    }
  });
  return elemNames;
};

const contextMenuAddValueForKeysToMap = function(resultMap, keysForValue, valueName) {
  const getAndAddValueArray = function(id, theValue) {
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

const contextMenuRemoveEqualsFromCssClassNamesMap = function(newCssClassMap,
    oldCssClassMap) {
  var reducedCssClassMap = new Hash(newCssClassMap);
  if (oldCssClassMap) {
    oldCssClassMap.keys().each(function(id) {
      var classNameArrayNew = reducedCssClassMap.get(id);
      var classNameArrayOld = oldCssClassMap.get(id);
      if (classNameArrayNew && classNameArrayOld
          && (classNameArrayOld.size() === classNameArrayNew.size())) {
        const diffArray = classNameArrayOld.without(classNameArrayNew);
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

const contextMenuConvertIdClassMapToClassIdMap = function(cssClassMap) {
  const classIdMap = new Hash();
  cssClassMap.keys().each(function(idKey) {
    contextMenuAddValueForKeysToMap(classIdMap, cssClassMap.get(idKey), idKey);
  });
  return classIdMap;
};

const contextMenuWriteReqArray = function(cssClassNameIdMap) {
  const reqArray = new Array();
  cssClassNameIdMap.keys().each(function(cssClass) {
    const idsForCssClass = cssClassNameIdMap.get(cssClass);
    if (idsForCssClass.size() > 0) {
      const reqDict = new Hash();
      reqDict.set('cmClassName', cssClass);
      reqDict.set('elemIds', idsForCssClass);
      reqArray.push(reqDict);
    }
  });
  return reqArray;
};

const contextMenuItemDataForElemId = new Hash();
let contextMenuIdCssClassNamesMap = null;
const loadContextMenuForClassNames = function (cssClassNames) {
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
                htmlElem.removeEventListener('contextmenu', contextClickHandler);
                htmlElem.addEventListener('contextmenu', contextClickHandler);
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
    cm_mark_loading_finished();
  }
};

const cm_mark_loading_finished = function() {
  if (myContextMenu.menuDiv) {
    myContextMenu.internal_hide();
  }
  contextMenuLoading = false;
  Event.fire(window, 'celcontextmenu:loadingfinished');
};

let contextClickElement = null;

const contextClickHandler = function(event) {
  contextClickElement = this; // use 'this' to get the element on which the clickHandler
                  // is installed. event.element() returns the clicked element
  if (!event.shiftKey && (contextClickElement.id != "")
      && contextMenuItemDataForElemId.get(contextClickElement.id)) {
    myContextMenu.show(event, contextMenuItemDataForElemId.get(contextClickElement.id),
        contextClickElement.id);
  }
};

const contextKeydownExecuter = function(ev, nodeId) {
   var cmi_action_found = false;
   if (nodeId && contextMenuItemDataForElemId.get(nodeId)) {
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

const getCmOutliner = function() {
  if (cmOutliner == null) {
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

