/**
 * Enhancing contextmenu with an hover on elements with a contextMenu.
 */

var oldHighlighted = null;

var celementsHighlightCell = function(event) {
  var onCell = event.findElement();
  if (onCell && contextMenuItemDataForElemId.get(onCell.id)) {
	if (oldHighlighted) {
      celementsUNhighlightCell(oldHighlighted);
      oldHighlighted = null;
	}
    if(event.shiftKey && !onCell.hasClassName('cm_highlighted')) {
      onCell.addClassName('cm_highlighted');
      onCell.stopObserving('mouseout', celementsCMHighlightMouseOut);
      onCell.observe('mouseout', celementsCMHighlightMouseOut);
      oldHighlighted = onCell;
    }
  }
}
var celementsCMHighlightMouseOut = function(event) {
  var onCell = event.findElement();
  if(onCell && onCell.hasClassName('cm_highlighted')) {
    celementsUNhighlightCell(onCell);
  }
}

var celementsUNhighlightCell = function(theCell) {
  if(theCell.hasClassName('cm_highlighted')) {
	  theCell.removeClassName('cm_highlighted');
  }
  theCell.stopObserving('mouseout', celementsCMHighlightMouseOut);
}

var addContextMenuHover = function() {
  contextMenuItemDataForElemId.keys().each(function(elemId) {
    if($(elemId)) {
      $(elemId).stopObserving('mouseover', celementsHighlightCell);
      $(elemId).observe('mouseover', celementsHighlightCell);
    }
  });
}

Event.observe(window, 'celcontextmenu:loadingfinished', addContextMenuHover);
