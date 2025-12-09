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
 * Accordeon Heading
 * This is the Accordeon effect
 */
if(typeof CELEMENTS=="undefined"){var CELEMENTS={};};
if(typeof CELEMENTS.anim=="undefined"){CELEMENTS.anim={};};

(function() {

//////////////////////////////////////////////////////////////////////////////
// CELEMENTS accordeon heading animation
// --> there will be a glitsh on slideup in some browsers if you use margins on headings.
//////////////////////////////////////////////////////////////////////////////
CELEMENTS.anim.AccordeonHeading = function(id) {
  // constructor
  this._init(id);
};

(function() {
var CA = CELEMENTS.anim.AccordeonHeading;

CELEMENTS.anim.AccordeonHeading.prototype = {
  htmlElem : undefined,

  openOnlyOnePerLevel : undefined,
  
  _init : function(elemId) {
    var _me = this;
    _me.htmlElem = $(elemId);
    if (_me.htmlElem) {
      _me._hideAllBlocksAfter();
      _me._registerOpeningListeners();
      _me.openOnlyOnePerLevel = false;
      _me.htmlElem.fire('celanim_accordeon-heading:initFinished', _me.htmlElem);
    } else {
      console.warn('Failed to initialize accordeon-heading for id "' + elemId + '".');
    }
  },

  setOpenOnlyOne : function(newOpenOnlyOne) {
    var _me = this;
    _me.openOnlyOnePerLevel = (newOpenOnlyOne == true);
  },

  _hideAllBlocksAfter : function() {
    var _me = this;
    if (!_me.htmlElem) return;
    _me.htmlElem.select(_me._getHeadings('h6')).each(function(headingBlock) {
      if (headingBlock.visible() && headingBlock.hasClassName('accordeon')) {
        _me.getAllSiblings(headingBlock, true).each(function(elem) {
          elem.hide();
        });
      }
    });
  },

  _headingGetLevel : function(headingElem) {
    var headingName = headingElem.tagName || headingElem;
    var startLevel = headingName.toLowerCase().replace(/^h/, '');
    return (parseInt(startLevel) || 7);
  },

  _getHeadings : function(maxSubHeading) {
    var _me = this;
    if (maxSubHeading) {
      var headingLevel = _me._headingGetLevel(maxSubHeading);
      var greaterHeadings = [1,2,3,4,5,6].slice(0, headingLevel);
      greaterHeadings = 'h' + greaterHeadings.join(', h');
    }
    return greaterHeadings;
  },

  getAllSiblings : function(headingElem, allSubElements) {
    var _me = this;
    var currentElem = headingElem;
    var startLevel = _me._headingGetLevel(headingElem);
    var resultArray = [];
    var onlySubHeadings = undefined;
    do {
      var isHeading = false;
      var isAccordeonHeading = false;
      currentElem = currentElem.next(_me._getHeadings(onlySubHeadings));
      if (currentElem) {
        isHeading = currentElem.tagName.toLowerCase().startsWith('h');
        isAccordeonHeading = isHeading && currentElem.hasClassName('accordeon');
        var nextSubHeadingFound = (_me._headingGetLevel(currentElem) > startLevel);
        if (isHeading) {
          if (nextSubHeadingFound) {
            resultArray.push(currentElem);
            if (isAccordeonHeading && !allSubElements) {
              onlySubHeadings = currentElem.tagName;
            } else {
              onlySubHeadings = undefined;
            }
          }
        } else {
          resultArray.push(currentElem);
        }
      }
    } while (currentElem && (!isHeading || nextSubHeadingFound));
    return resultArray;
  },

  _registerOpeningListeners : function() {
    var _me = this;
    if (!_me.htmlElem) return;
    _me.htmlElem.select('h1.accordeon').concat(_me.htmlElem.select('h2.accordeon')
        ).concat(_me.htmlElem.select('h3.accordeon')).concat(_me.htmlElem.select(
            'h4.accordeon')).concat(_me.htmlElem.select('h5.accordeon')).concat(
                _me.htmlElem.select('h6.accordeon')).each(function(heading) {
      heading.observe('click', _me._toggleHeadingPart.bind(_me));
    });
  },

  _toggleHeadingPart : function(event) {
    var _me = this;
    event.stop();
    var clickedElem = event.findElement();
    //go up to next heading element if current clickedElem is no heading element.
    var clickedHeading = event.findElement(_me._getHeadings(clickedElem));
    _me.toggleHeading(clickedHeading);
  },

  toggleHeading : function(clickedHeading) {
    var _me = this;
    var nextSiblings = _me.getAllSiblings(clickedHeading);
    if ((nextSiblings.size() > 0) && nextSiblings[0].visible()) {
      nextSiblings = _me.getAllSiblings(clickedHeading, true);
    }
    _me.toggleAll(nextSiblings, clickedHeading);
  },

  _getHideEffect : function(wrapDiv, elem) {
    var _me = this;
    var origElem = elem;
    var theWrapDiv = wrapDiv;
    return new Effect.SlideUp(theWrapDiv, {
      transition: Effect.Transitions.sinoidal,
      afterFinish : function() {
        origElem.hide();
        origElem.removeClassName('active');
        theWrapDiv.replace(elem);
      },
      sync : true
    });
  },

  _getShowEffect : function(wrapDiv, elem) {
    var _me = this;
    var origElem = elem;
    var theWrapDiv = wrapDiv;
    return new Effect.SlideDown(theWrapDiv, {
      transition: Effect.Transitions.sinoidal,
      afterFinish : function() {
        theWrapDiv.replace(origElem);
      },
      sync : true
    });
  },

  _updateClickedHeading : function(isVisible, clickedHeading) {
    var _me = this;
    if (!_me.htmlElem) return;
    if (isVisible) {
      clickedHeading.removeClassName('active');
      _me.htmlElem.fire('celanim_accordeon-heading:dropActive', clickedHeading);
    } else {
      clickedHeading.addClassName('active');
      _me.htmlElem.fire('celanim_accordeon-heading:addActive', clickedHeading);
    }
  },

  _checkCloseBeforeOpen : function(clickedHeading, isVisible) {
    var _me = this;
    if (!_me.htmlElem) return;
    parallelEffects = [];
    if (!isVisible && _me.openOnlyOnePerLevel) {
      _me.htmlElem.select(clickedHeading.tagName + '.active').each(function(activElem) {
        parallelEffects.concat(_me._getEffectsForElements(_me.getAllSiblings(activElem,
            true), true));
        _me._updateClickedHeading(true, activElem);
      });
    }
    return parallelEffects;
  },

  _getEffectsForElements : function(allElems, isVisible) {
    var _me = this;
    parallelEffects = [];
    allElems.each(function(elem) {
      if (elem.visible() == isVisible) {
        var wrapDiv = elem.wrap('div');
        if (isVisible) {
          parallelEffects.push(_me._getHideEffect(wrapDiv, elem));
        } else {
          wrapDiv.hide();
          elem.show();
          parallelEffects.push(_me._getShowEffect(wrapDiv, elem));
        }
      }
    });
    return parallelEffects;
  },

  toggleAll : function(allElems, clickedHeading) {
    var _me = this;
    if (allElems.size() > 0) {
      allElems.last().addClassName('accordeonLast');
      allElems.last().addClassName('accordeon_' + clickedHeading.tagName.toLowerCase()
          + 'Last');
      var isVisible = allElems[0].visible();
      var parallelEffects = _me._checkCloseBeforeOpen(clickedHeading, isVisible);
      parallelEffects = parallelEffects.concat(_me._getEffectsForElements(allElems,
          isVisible));
      new Effect.Parallel(parallelEffects, {
        duration : 1.0,
        afterFinish : function() {
          _me._updateClickedHeading(isVisible, clickedHeading);
        }
      });
    }
  }

};
})();

})();
