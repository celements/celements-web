/**
 * Enhancing contextmenu with an hover on elements with a contextMenu.
 */
if(typeof CELEMENTS=="undefined"){var CELEMENTS={};};
if(typeof CELEMENTS.layout=="undefined"){CELEMENTS.layout={};};

(function(window, undefined) {

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

      _CMHighlightMouseOut : function(event) {
        var _me = this;
        var onCell = event.findElement();
        if(onCell && onCell.hasClassName('cm_outline_highlighted')) {
          _me._UNhighlightCell(onCell);
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
