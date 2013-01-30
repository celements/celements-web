/**
 * outline cells
 */
if(typeof CELEMENTS=="undefined"){var CELEMENTS={};};
if(typeof CELEMENTS.layout=="undefined"){CELEMENTS.layout={};};

(function(window, undefined) {

  CELEMENTS.layout.Outliner = function() {
    // constructor
    this._init();
  };

  (function() {

    CELEMENTS.layout.Outliner.prototype = {
      _init : function() {
        var _me = this;
      },

      _addOutlineElement : function(elemId, idSuffix, top, left, width, height,
          cssClass) {
        var _me = this;
        var cssClassStr = cssClass || '';
        cssClassStr = ('cel_outline cel_outline_' + elemId + ' ' + cssClassStr
            ).strip();
        var outlineElemId = elemId + idSuffix;
        var outlineElem = $(outlineElemId);
        if (!outlineElem) {
          outlineElem = new Element('div', {
            'id' : outlineElemId,
            'class' : cssClassStr
          }).setStyle({
            'position' : 'absolute',
            'background' : 'green'
          });
          $(document.body).insert({
            'bottom' : outlineElem
          });
        }
        outlineElem.setStyle({
          'top' : top + 'px',
          'left' : left + 'px',
          'width' : width + 'px',
          'height' : height + 'px'
        });
      },

      outlineElement : function(cssClass, element) {
        var _me = this;
        element = $(element);
        var elemRightBorderLeft = element.cumulativeOffset().left + element.getWidth() -1;
        _me._addOutlineElement(element.id, '-RightBorder', element.cumulativeOffset().top,
            elemRightBorderLeft, 1, element.getHeight(), cssClass);
        var elemBottomBorderTop = element.cumulativeOffset().top + element.getHeight() -1;
        _me._addOutlineElement(element.id, '-BottomBorder', elemBottomBorderTop,
            element.cumulativeOffset().left, element.getWidth(), 1, cssClass);
        _me._addOutlineElement(element.id, '-LeftBorder', element.cumulativeOffset().top,
            element.cumulativeOffset().left, 1, element.getHeight(), cssClass);
        _me._addOutlineElement(element.id, '-TopBorder', element.cumulativeOffset().top,
            element.cumulativeOffset().left, element.getWidth(), 1, cssClass);
      },

      removeOutlinesForElement : function(element) {
        var _me = this;
        element = $(element);
        $$('.cel_outline' + element.id).each(function(element) {
          element.remove();
        });
      },

      removeAllOutlines : function() {
        var _me = this;
        $$('.cel_outline').each(function(element) {
          element.remove();
        });
      },

      addFocus : function(element) {
        var _me = this;
        $$('.cel_outline_' + $(element).id).each(function(outlineElem) {
          outlineElem.addClassName('cel_outline_focus');
          outlineElem.setStyle({
            'background' : 'lime',
            'zIndex' : '999'
          });
        });
      },

      removeFocus : function(element) {
        var _me = this;
        $$('.cel_outline_' + $(element).id).each(function(outlineElem) {
          outlineElem.removeClassName('cel_outline_focus');
          outlineElem.setStyle({
            'background' : 'green',
            'zIndex' : ''
          });
        });
      }

    };
  })();

})(window);
