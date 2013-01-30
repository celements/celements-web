/**
 * outline cells
 */
if(typeof CELEMENTS=="undefined"){var CELEMENTS={};};
if(typeof CELEMENTS.layout=="undefined"){CELEMENTS.layout={};};
if(typeof CELEMENTS.layout.editor=="undefined"){CELEMENTS.layout.editor={};};

(function(window, undefined) {

  CELEMENTS.layout.editor.OutlineCells = function(outliner) {
    // constructor
    this._init(outliner);
  };

  (function() {

    CELEMENTS.layout.editor.OutlineCells.prototype = {
      _outliner : null,
      _windowResizeListener : null,
      delayedOutlineScheduled : null,
      delayValue : 0.6,

      _init : function(outliner) {
        var _me = this;
        _me._outliner = outliner || new CELEMENTS.layout.Outliner();
      },

      outlineAllCells : function() {
        var _me = this;
        _me._windowResizeListener = _me._outlineAllCells_delayed.bind(_me);
        Event.observe(window, 'resize', _me._windowResizeListener);
        _me._outlineAllCells_intern();
      },

      _outlineAllCells_delayed : function() {
        var _me = this;
        if (_me.delayedOutlineScheduled) {
          window.clearTimeout(_me.delayedOutlineScheduled);
        }
        _me.delayedOutlineScheduled = _me._outlineAllCells_intern.bind(_me).delay(
            _me.delayValue);
      },

      _outlineAllCells_intern : function() {
        var _me = this;
        $$('.cel_cell').each(_me._outliner.outlineElement.curry('cel_cellOutline'
            ).bind(_me._outliner));
      },

      removeAllCellOutlines : function() {
        var _me = this;
        $$('.cel_cellOutline').each(function(cellElem) {
          cellElem.remove();
        });
        Event.stopObserving(window, 'resize', _me._windowResizeListener);
      },

      _addFocusToList : function(cells) {
        var _me = this;
        $A(cells).each(function(cell) {
          if (cell.hasClassName('cel_cell')) {
            _me._outliner.addFocus(cell);
          }
        });
      },

      _removeFocusFromList : function(cells) {
        var _me = this;
        $A(cells).each(function(cell) {
          if (cell.hasClassName('cel_cell')) {
            _me._outliner.removeFocus(cell);
          }
        });
      },

      addFocusToCellAndParents : function(cell) {
        var _me = this;
        var cellElem = $(cell);
        var cellList = cellElem.ancestors();
        cellList.push(cellElem);
        _me._addFocusToList(cellList);
      },

      removeFocusFromCellAndParents : function(cell) {
        var _me = this;
        var cellElem = $(cell);
        var cellList = cellElem.ancestors();
        cellList.push(cellElem);
        _me._removeFocusFromList(cellList);
      }

    };
  })();

})(window);
