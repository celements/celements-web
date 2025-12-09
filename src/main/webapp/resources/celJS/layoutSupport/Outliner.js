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
      _outline_Width : 2,

      _init : function() {
        var _me = this;
      },

      _chromeAskToolbarFixTop : function(top) {
        var _me = this;
        if ($$('html iframe.apn-toolbar') && $$('html iframe.apn-toolbar').size() > 0) {
          var toolbarHeight = $j('html iframe.apn-toolbar').height();
          top = top - toolbarHeight;
        }
        return top;
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
        top = _me._chromeAskToolbarFixTop(top);
        outlineElem.setStyle({
          'top' : top + 'px',
          'left' : left + 'px',
          'width' : width + 'px',
          'height' : height + 'px'
        });
      },

      outlineElement : function(element) {
        var _me = this;
        _me.outlineElementAddClass(undefined, element);
      },

      outlineElementAddClass : function(cssClass, element) {
        var _me = this;
        element = $(element);
        //there is a bug in prototypejs 1.7.2 cumulativeOffset sometimes not
        //counting margin-auto offsets. Thus we need to use jquery.offset
        var elemRightBorderLeft = $j(element).offset().left + element.getWidth()
            - _me._outline_Width;
        _me._addOutlineElement(element.id, '-RightBorder', $j(element).offset().top,
            elemRightBorderLeft, _me._outline_Width, element.getHeight(), cssClass);
        var elemBottomBorderTop = $j(element).offset().top + element.getHeight()
            - _me._outline_Width;
        _me._addOutlineElement(element.id, '-BottomBorder', elemBottomBorderTop,
            $j(element).offset().left, element.getWidth(), _me._outline_Width,
            cssClass);
        _me._addOutlineElement(element.id, '-LeftBorder', $j(element).offset().top,
            $j(element).offset().left, _me._outline_Width, element.getHeight(),
            cssClass);
        _me._addOutlineElement(element.id, '-TopBorder', $j(element).offset().top,
            $j(element).offset().left, element.getWidth(), _me._outline_Width,
            cssClass);
      },

      _makeSafeForCSS : function(name) {
        return name.replace(/([:\.])/g, '\\$1');
      },

      removeOutlinesForElement : function(element) {
        var _me = this;
        element = $(element);
        $$('.cel_outline_' + _me._makeSafeForCSS(element.id)).each(function(element) {
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
        $$('.cel_outline_' + _me._makeSafeForCSS($(element).id)).each(
            function(outlineElem) {
          outlineElem.addClassName('cel_outline_focus');
          outlineElem.setStyle({
            'background' : 'lime',
            'zIndex' : '999'
          });
        });
      },

      removeFocus : function(element) {
        var _me = this;
        $$('.cel_outline_' + _me._makeSafeForCSS($(element).id)).each(
            function(outlineElem) {
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
