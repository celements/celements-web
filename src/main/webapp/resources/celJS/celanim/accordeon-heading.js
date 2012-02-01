/**
 * Accordeon Heading
 * This is the Accordeon effect
 */
if(typeof CELEMENTS=="undefined"){var CELEMENTS={};};
if(typeof CELEMENTS.anim=="undefined"){CELEMENTS.anim={};};

(function() {

var Dom = YAHOO.util.Dom;
var YEvent = YAHOO.util.Event;

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

  openOnlyOnePerLevel : false,
  
  _init : function(elemId) {
    var _me = this;
    _me.htmlElem = $(elemId);
    _me._hideAllBlocksAfter();
    _me._registerOpeningListeners();
  },

  setOpenOnlyOne : function(newOpenOnlyOne) {
    var _me = this;
    _me.openOnlyOnePerLevel = (newOpenOnlyOne == true);
  },

  _hideAllBlocksAfter : function() {
    var _me = this;
    _me.htmlElem.select('h1.accordeon').each(function(headingBlock) {
      _me.getAllSiblings(headingBlock, true).each(function(elem) {
        elem.hide();
      });
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
    if (isVisible) {
      clickedHeading.removeClassName('active');
    } else {
      clickedHeading.addClassName('active');
    }
  },

  _checkCloseBeforeOpen : function(clickedHeading, isVisible) {
    var _me = this;
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
