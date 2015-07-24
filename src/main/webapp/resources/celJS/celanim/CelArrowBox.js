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
 * Celements Arrow Box
 * This is the Arrow Box effect.
 */
(function(window, undefined) {
  "use strict";

  /**
   * package CELEMENTS definition
   * package CELEMENTS.anim definition
   */
  if(typeof CELEMENTS=="undefined"){window.CELEMENTS={};};
  if(typeof CELEMENTS.anim=="undefined"){window.CELEMENTS.anim={};};

  /**
   * CELEMENTS.anim.ArrowBox constructor
   * 
   * hoverBox will be added AFTER boxParent
   * 
   * linkCSSselector        registerMouseoverHandler and registerClickHandler register
   *                        on all matching elements
   * hoverContentSelector   content for hover box is taken from element selected by
   *                        hoverContentSelector inside link-element parent
   */
  CELEMENTS.anim.ArrowBox = function(boxParent, linkCSSselector, hoverContentSelector) {
    // constructor
    this._init(boxParent, linkCSSselector, hoverContentSelector);
  };

  /**
   * class CELEMENTS.anim.ArrowBox definition
   */
  CELEMENTS.anim.ArrowBox.prototype = {
      _boxParent : undefined,
      _positionOffset : undefined,
      _currentHoverLink : undefined,
      _linkCSSselector : undefined,
      _hoverContentSelector : undefined,
      _hoverMouseOverHandlerBind : undefined,
      _hoverMouseClickHandlerBind : undefined,
      _hoverMouseOutHandlerBind : undefined,
      _hoverMouseClickOutsideBind : undefined,

      _init : function(boxParent, linkCSSselector, hoverContentSelector) {
        var _me = this;
        _me._currentHoverLink = null;
        _me._boxParent = $(boxParent);
        _me._linkCSSselector = linkCSSselector;
        _me._hoverContentSelector = hoverContentSelector;
        _me._hoverMouseOverHandlerBind = _me._hoverMouseOverHandler.bind(_me);
        _me._hoverMouseClickHandlerBind = _me._hoverMouseClickHandler.bind(_me);
        _me._hoverMouseOutHandlerBind = _me._hoverMouseOutHandler.bind(_me);
        _me._hoverMouseClickOutsideBind = _me._hoverMouseClickOutside.bind(_me);
        _me._positionOffset = { 'top' : 0, 'left' : 0};
      },

      registerMouseoverHandler : function() {
        var _me = this;
        _me._boxParent.select(_me._linkCSSselector).each(function(linkElem) {
          linkElem.stopObserving('mouseover', _me._hoverMouseOverHandlerBind);
          linkElem.observe('mouseover', _me._hoverMouseOverHandlerBind);
        });
      },

      registerClickHandler : function() {
        var _me = this;
        _me._boxParent.select(_me._linkCSSselector).each(function(linkElem) {
          linkElem.stopObserving('click', _me._hoverMouseClickHandlerBind);
          linkElem.observe('click', _me._hoverMouseClickHandlerBind);
        });
      },

      _getHoverContent : function(linkElem) {
        var _me = this;
        var hoverContentElemMemo = { 'hoverContentElem' : null };
        var wrapperEvent = _me._boxParent.fire('celements:arrowBoxGetWrapper', 
            hoverContentElemMemo);
        if (wrapperEvent.stopped) {
          if (hoverContentElemMemo.hoverContentElem) {
            return hoverContentElemMemo.hoverContentElem.innerHTML;
          }
        } else {
          var wrapperElem = linkElem.up('.celArrowBoxWrapper') || linkElem.up();
          var hoverContentElem = wrapperElem.down(_me._hoverContentSelector);
          if (hoverContentElem) {
            return hoverContentElem.innerHTML;
          } else {
            console.warn('_getHoverContent: failed to get content for ', linkElem);
          }
        }
        return linkElem.title;
      },

      setPositionOffset : function(topLeftOffset) {
        var _me = this;
        _me._positionOffset = topLeftOffset;
        _me.positionHoverBox();
      },

      positionHoverBox : function(boxElem, linkElem) {
        var _me = this;
        var theLink = linkElem || _me._currentHoverLink;
        var theBox = boxElem || _me.getHoverBoxElem();
        if (theBox && theBox.visible()) {
          if (theLink) {
            //there is a bug in prototypejs 1.7.2 cumulativeOffset sometimes not
            //counting margin-auto offsets. Thus we need to use jquery.offset
            var linkOffset = $j(theLink).offset();
            var linkTop = linkOffset.top + _me._positionOffset.top;
            var linkLeft = linkOffset.left + _me._positionOffset.left;
            if (theLink.readAttribute('coords')) {
              var boxParentPos = _me._boxParent.positionedOffset();
              var linkCoords = theLink.readAttribute('coords').split(',');
              linkTop = parseInt(linkCoords[1]) + boxParentPos.top;
              linkLeft = parseInt(linkCoords[0]) + boxParentPos.left;
            } else {
              var boxWrapperPos = $j(_me._boxParent.getOffsetParent()).offset();
              //reposition link to positioned parent boxWrapper
              linkTop = linkTop - boxWrapperPos.top; 
              linkLeft = linkLeft - boxWrapperPos.left; 
            }
            var top = linkTop - theBox.getHeight() - 25;
            var left = linkLeft - theBox.getWidth() / 2;
            theBox.setStyle({
              'top' : top + 'px',
              'left' : left + 'px'
            });
          } else {
            console.warn('positionHoverBox: skipped. ', theLink);
          }
        }
      },

      _getHoverArrowBoxElem : function(boxElem) {
        var arrowElem = boxElem.down('.arrowElement');
        if (!arrowElem) {
          arrowElem = new Element('div').addClassName('arrowElement');
          var arrowLeftInnerPartElem = new Element('div').addClassName('arrowInnerPart'
              ).addClassName('arrowLeftInnerPart');
          var arrowLeftPartElem = new Element('div').addClassName('arrowClipPart'
              ).addClassName('arrowClipLeftPart');
          arrowLeftPartElem.update(arrowLeftInnerPartElem);
          arrowElem.insert({ 'bottom' : arrowLeftPartElem });
          var arrowRightInnerPartElem = new Element('div').addClassName('arrowInnerPart'
              ).addClassName('arrowRightInnerPart');
          var arrowRightPartElem = new Element('div').addClassName('arrowClipPart'
              ).addClassName('arrowClipRightPart');
          arrowRightPartElem.update(arrowRightInnerPartElem);
          arrowElem.insert({ 'bottom' : arrowRightPartElem });
          boxElem.insert({ 'bottom' : arrowElem });
        }
        return arrowElem;
        /**
    <div style="border-top-width: 24px; position: absolute; left: 164px; top: 175px;">
      <div style="position: absolute; overflow: hidden; left: -6px; top: -1px; width: 16px; height: 30px;">
        <div style="position: absolute; left: 6px; background-color: rgb(255, 255, 255); transform: skewX(22.6deg); transform-origin: 0px 0px 0px; height: 24px; width: 10px; box-shadow: 0px 1px 6px rgba(0, 0, 0, 0.6);">
        </div>
      </div>
      <div style="position: absolute; overflow: hidden; top: -1px; left: 10px; width: 16px; height: 30px;">
      <div style="position: absolute; left: 0px; background-color: rgb(255, 255, 255); transform: skewX(-22.6deg); transform-origin: 10px 0px 0px; height: 24px; width: 10px; box-shadow: 0px 1px 6px rgba(0, 0, 0, 0.6);"></div></div></div>
    <div class="arrowElement">
      <div class="arrowClipPart">
        <div class="arrowLeftInnerPart" />
      </div>
      <div class="arrowClipPart">
        <div class="arrowRightInnerPart" />
      </div>
    </div>
         */
      },

      getBoxParent : function() {
        var _me = this;
        return _me._boxParent;
      },

      getHoverBoxElem : function() {
        var _me = this;
        return $(_me._boxParent.id + 'HoverBox');
      },

      _getHoverTextBoxElem : function(linkElem) {
        var _me = this;
        var boxElem = _me.getHoverBoxElem();
        var textBoxElem = $(_me._boxParent.id + 'HoverTextBox');
        var shadowBoxElem = $(_me._boxParent.id + 'HoverShadowBox');
        var shadowArrowBoxElem = $(_me._boxParent.id + 'HoverShadowArrow');
        if (!boxElem || !textBoxElem) {
          boxElem = new Element('div', {
            'id' : _me._boxParent.id + 'HoverBox'
          }).addClassName('HoverBox').hide();
          textBoxElem = new Element('div', {
            'id' : _me._boxParent.id + 'HoverTextBox'
          }).addClassName('HoverTextBox');
          boxElem.insert({ 'bottom' : textBoxElem });
          shadowBoxElem = new Element('div', {
            'id' : _me._boxParent.id + 'HoverShadowBox'
          }).addClassName('HoverShadowBox');
          boxElem.insert({ 'bottom' : shadowBoxElem });
          shadowArrowBoxElem = new Element('div', {
            'id' : _me._boxParent.id + 'HoverShadowArrow'
          }).addClassName('HoverShadowArrow');
          boxElem.insert({ 'bottom' : shadowArrowBoxElem });
          _me._boxParent.insert({
            'after' : boxElem
          });
        }
        var textBoxContent = _me._getHoverContent(linkElem);
        textBoxElem.update('<p>' + textBoxContent + '</p>');
        boxElem.setStyle({
          'visibility' : 'hidden'
        });
        boxElem.show();
        _me.positionHoverBox(boxElem, linkElem);
        var arrowBoxElem = _me._getHoverArrowBoxElem(boxElem);
        var shadowArrowLeft = boxElem.getWidth() / 2 - 5;
        shadowArrowBoxElem.setStyle({
          'left' : shadowArrowLeft + 'px' 
        });
        arrowBoxElem.setStyle({
          'left' : shadowArrowLeft + 'px' 
        });
        boxElem.setStyle({
          'visibility' : ''
        });
        return boxElem;
      },

      _hoverMouseOut : function(linkElem) {
        var _me = this;
        linkElem.stopObserving('mouseout', _me._hoverMouseOutHandlerBind);
        $(_me._boxParent.id + 'HoverBox').hide();
        _me._currentHoverLink.removeClassName('celArrowBoxHoverActive');
        _me._currentHoverLink = null;
      },

      _hoverMouseOutHandler : function(event) {
        var _me = this;
        var linkElem = event.findElement();
        _me._hoverMouseOut(linkElem);
      },

      _hoverMouseOverHandler : function(event, onlyClick) {
        var _me = this;
        var linkElem = event.findElement();
        if (_me._currentHoverLink) {
          _me._hoverMouseOut(_me._currentHoverLink);
        }
        _me._currentHoverLink = linkElem;
        _me._currentHoverLink.addClassName('celArrowBoxHoverActive');
        _me._getHoverTextBoxElem(linkElem);
        if (!onlyClick) {
          linkElem.observe('mouseout', _me._hoverMouseOutHandlerBind);
        }
      },

      _hoverMouseClickOutside : function(event) {
        var _me = this;
        $(_me._boxParent.id + 'HoverBox').removeClassName('celArrowBoxHoverForceOpen');
        _me._hoverMouseOut(_me._currentHoverLink);
      },

      _hoverMouseClickHandler : function(event) {
        var _me = this;
        event.stop();
        _me._hoverMouseOverHandlerBind(event, true);
        $(_me._boxParent.id + 'HoverBox').addClassName('celArrowBoxHoverForceOpen');
        $(document.body).stopObserving('click', _me._hoverMouseClickOutsideBind);
        $(document.body).observe('click', _me._hoverMouseClickOutsideBind);
      }

  };

})(window);
