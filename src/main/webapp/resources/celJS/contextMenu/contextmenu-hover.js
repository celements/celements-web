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
      _CMHighlightMouseOutBinded : null,

      _init : function(outliner) {
        var _me = this;
        _me._outliner = outliner || new CELEMENTS.layout.Outliner();
        _me._CMHighlightMouseOutBinded = _me._CMHighlightMouseOut.bind(_me);
        Event.observe(window, 'celcontextmenu:loadingfinished',
            _me.addContextMenuHover.bind(_me));
      },

      _highlightCell : function(event) {
        var _me = this._me;
        if (event.shiftKey) {
          event.stop();
          var onCell = $(this.elemId);
          if ((typeof onCell !== 'undefined') && onCell
              && !onCell.hasClassName('cm_outline_highlighted')) {
            _me._UNhighlightAllCell();
            onCell.addClassName('cm_outline_highlighted');
            _me._outliner.outlineElement(onCell);
          }
        }
      },

      _isInsideHighlighted : function(element, highlightedCell) {
        var _me = this;
        element = $(element);
        if (element) {
          var insideHighlightedCell = element.up('.cm_outline_highlighted');
          return ((typeof insideHighlightedCell !== 'undefined') && insideHighlightedCell
              && (!highlightedCell || (insideHighlightedCell == highlightedCell)));
        }
        return false;
      },

      _CMHighlightMouseOut : function(event) {
        var _me = this;
        var onCell = event.findElement();
        var reltg = (event.relatedTarget) ? event.relatedTarget : event.toElement;
        var insideHighlightedCellFrom = onCell.up('.cm_outline_highlighted');
        if (_me._isInsideHighlighted(onCell) && (!_me._isInsideHighlighted(reltg)
            || (insideHighlightedCellFrom != reltg.up('.cm_outline_highlighted')))) {
          _me._UNhighlightCell(insideHighlightedCellFrom);
        } else if (!_me._isInsideHighlighted(onCell)
            && !_me._isInsideHighlighted(reltg)) {
          _me._UNhighlightAllCell();
        }
      },

      _keyUpListener : function(event) {
        var _me = this;
        if (!event.shiftKey) {
          _me._UNhighlightAllCell();
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
    
      _UNhighlightAllCell : function() {
        var _me = this;
        $$('.cm_outline_highlighted').each(function(theCell) {
          _me._outliner.removeOutlinesForElement(theCell);
          theCell.removeClassName('cm_outline_highlighted');
          theCell.stopObserving('mouseout', _me._CMHighlightMouseOutBinded);
        });
      },
    
      addContextMenuHover : function() {
        var _me = this;
        $(document.body).stopObserving('mouseout', _me._CMHighlightMouseOutBinded);
        $(document.body).observe('mouseout', _me._CMHighlightMouseOutBinded);
        $(document.body).observe('keyup', _me._keyUpListener.bind(_me));
        contextMenuItemDataForElemId.keys().each(function(elemId) {
          if($(elemId)) {
            var highlightCellBinded = _me._highlightCell.bind({
              '_me' : _me,
              'elemId' : elemId
            });
            $(elemId).stopObserving('mouseover', highlightCellBinded);
            $(elemId).observe('mouseover', highlightCellBinded);
          }
        });
      }

    };
  })();

})(window);
