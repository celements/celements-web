/**
 * Enhancing contextmenu with an hover on elements with a contextMenu.
 */
if(typeof CELEMENTS=="undefined"){var CELEMENTS={};};
if(typeof CELEMENTS.layout=="undefined"){CELEMENTS.layout={};};

(function(window, undefined) {

  var contextMenuHoverObj = null;
  registerContextMenuHover = function() {
    if (!contextMenuHoverObj) {
      contextMenuHoverObj = new CELEMENTS.layout.ContextMenuHover();
    }
  };

  getDefaultContextMenuHoverObj = function() {
    return contextMenuHoverObj;
  };

  celAddOnBeforeLoadListener(registerContextMenuHover);

  /**
   * FIXME ContextMenuHover needs so far global access to 'contextMenuItemDataForElemId'
   */
  CELEMENTS.layout.ContextMenuHover = function(outliner) {
    // constructor
    this._init(outliner);
  };

  (function() {

    CELEMENTS.layout.ContextMenuHover.prototype = {
      _outliner : null,
      _oldHighlighted : null,
      _CMHighlightMouseOutBinded : null,
      _highlightCellBinded : null,

      _init : function(outliner) {
        var _me = this;
        _me._outliner = outliner || new CELEMENTS.layout.Outliner();
        _me._CMHighlightMouseOutBinded = _me._CMHighlightMouseOut.bind(_me);
        _me._highlightCellBinded = _me._highlightCell.bind(_me);
        Event.observe(window, 'celcontextmenu:loadingfinished',
            _me.addContextMenuHover.bind(_me));
      },

      _highlightCell : function(event) {
        var _me = this;
        var onCell = event.findElement();
        console.log('_highlightCell: out? ', onCell, !_me._isInsideHighlighted(onCell));
        if (onCell && contextMenuItemDataForElemId.get(onCell.id)) {
          if (_me._oldHighlighted) {
            _me._UNhighlightCell(_me._oldHighlighted);
            _me._oldHighlighted = null;
          }
          if(event.shiftKey && !onCell.hasClassName('cm_outline_highlighted')) {
            onCell.addClassName('cm_outline_highlighted');
            _me._outliner.outlineElement(onCell);
            onCell.stopObserving('mouseout', _me._CMHighlightMouseOutBinded);
            onCell.observe('mouseout', _me._CMHighlightMouseOutBinded);
            _me._oldHighlighted = onCell;
          }
        }
      },

      _isInsideHighlighted : function(element, highlightedCell) {
        var _me = this;
        element = $(element);
        var insideHighlightedCell = element.up('.cm_outline_highlighted');
        return (insideHighlightedCell && (!highlightedCell
            || (insideHighlightedCell == highlightedCell)));
      },

      _CMHighlightMouseOut : function(event) {
        var _me = this;
        var onCell = event.findElement();
        onCell.stopObserving('mouseout', _me._CMHighlightMouseOutBinded);
        var reltg = (event.relatedTarget) ? event.relatedTarget : event.toElement;
        if(onCell && onCell.hasClassName('cm_outline_highlighted')
            && !_me._isInsideHighlighted(reltg, onCell)) {
          console.log('_CMHighlightMouseOut: remove ', onCell, reltg,
              _me._isInsideHighlighted(reltg), _me._isInsideHighlighted(reltg, onCell));
          _me._UNhighlightCell(onCell);
        } else if (_me._isInsideHighlighted(reltg, onCell)) {
          console.log('_CMHighlightMouseOut: add listener to ', reltg);
          reltg.stopObserving('mouseout', _me._CMHighlightMouseOutBinded);
          reltg.observe('mouseover', _me._CMHighlightMouseOutBinded);
        } else {
          console.log('_CMHighlightMouseOut: out? ', _me._isInsideHighlighted(reltg));
        }
      },
    
      _UNhighlightCell : function(theCell) {
        var _me = this;
        if(theCell.hasClassName('cm_outline_highlighted')) {
          _me._outliner.removeOutlinesForElement(theCell);
          theCell.removeClassName('cm_outline_highlighted');
        }
        theCell.stopObserving('mouseout', _me._CMHighlightMouseOutBinded);
      },
    
      addContextMenuHover : function() {
        var _me = this;
        contextMenuItemDataForElemId.keys().each(function(elemId) {
          if($(elemId)) {
            $(elemId).stopObserving('mouseover', _me._highlightCellBinded);
            $(elemId).observe('mouseover', _me._highlightCellBinded);
          }
        });
      }

    };
  })();

})(window);
