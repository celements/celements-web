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
CELEMENTS.anim.Accordeon = function(id) {
  // constructor
  this._init(id);
};

(function() {
var CA = CELEMENTS.anim.Accordeon;

CELEMENTS.anim.Accordeon.prototype = {
  htmlElem : undefined,
  
  _init : function(elemId) {
    var _me = this;
    _me.htmlElem = $(elemId);
    _me._hideAllBlocksAfter();
    _me._registerOpeningListeners();
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
    return parseInt(startLevel);
  },

  _getHeadings : function(maxSubHeading) {
    var _me = this;
    if (maxSubHeading) {
      var headingLevel = _me._headingGetLevel(maxSubHeading);
      var greaterHeadings = [1,2,3,4,5,6].slice(0, headingLevel);
      greaterHeadings = 'h' + greaterHeadings.join('.accordeon, h') + '.accordeon';
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
      currentElem = currentElem.next(_me._getHeadings(onlySubHeadings));
      if (currentElem) {
        isHeading = currentElem.tagName.toLowerCase().startsWith('h')
            && currentElem.hasClassName('accordeon');
        var nextSubHeadingFound = false;
        if (isHeading) {
          nextSubHeadingFound = (_me._headingGetLevel(currentElem) > startLevel);
          if (nextSubHeadingFound) {
            resultArray.push(currentElem);
            if (!allSubElements) {
              onlySubHeadings = currentElem.tagName;
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
    console.debug('_toggleHeadingPart: ', this);
    event.stop();
    var clickedHeading = event.findElement();
    var nextSiblings = _me.getAllSiblings(clickedHeading);
    if ((nextSiblings.size() > 0) && nextSiblings[0].visible()) {
      nextSiblings = _me.getAllSiblings(clickedHeading, true);
    }
    _me.toggleAll(nextSiblings);
  },

  toggleAll : function(allElems) {
    if (allElems.size() > 0) {
      var isVisible = allElems[0].visible();
      var parallelEffects = [];
      allElems.each(function(elem) {
        if (elem.visible() == isVisible) {
          var wrapDiv = elem.wrap('div');
          if (isVisible) {
            parallelEffects.push(
              new Effect.SlideUp(wrapDiv, {
                transition: Effect.Transitions.sinoidal,
                afterFinish : function() {
                  elem.hide();
                  wrapDiv.replace(elem);
                },
                sync : true
            }));
          } else {
            wrapDiv.hide();
            elem.show();
            parallelEffects.push(
              new Effect.SlideDown(wrapDiv, {
                transition: Effect.Transitions.sinoidal,
                afterFinish : function() {
                  wrapDiv.replace(elem);
                },
                sync : true
            }));
          }
        }
      });
      new Effect.Parallel(parallelEffects, { duration : 1.0 });
    }
  }

};
})();

})();
