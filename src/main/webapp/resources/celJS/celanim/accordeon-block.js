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
 * Accordeon Celements Block
 * This is the Accordeon effect for block elements.
 */
if(typeof CELEMENTS=="undefined"){var CELEMENTS={};};
if(typeof CELEMENTS.anim=="undefined"){CELEMENTS.anim={};};

(function() {

//////////////////////////////////////////////////////////////////////////////
// CELEMENTS accordeon animation
// --> there will be a glitsh on slideup in some browsers if you use margins on headings.
// id          parent html element. Wrapper of all boxes
// cssBox      css selector for all boxes (each box containing one title and one content
//              element)
// cssTitle    css selector for clickable title element. On a click on the title box, the
//              content box will toggle between open or close.
// cssContent  css selector for content box which is open and closed by a click on the
//              title box.
//////////////////////////////////////////////////////////////////////////////
CELEMENTS.anim.AccordeonEffect = function(id, cssBox, cssTitle, cssContent, debug) {
  // constructor
  cssTitle = cssTitle || '.accordeonTitle';
  cssContent = cssContent || '.accordeonContent';
  this._init(id, cssBox, cssTitle, cssContent, debug);
};

(function() {
CELEMENTS.anim.AccordeonEffect.prototype = {
  htmlElem : undefined,

  cssBox : undefined,
  cssTitle : undefined,
  cssContent : undefined,
  openOnlyOnePerLevel : undefined,
  _clickHandlerBind : undefined,

  _effectRunning : undefined,
  _debug : undefined,

  _init : function(elemId, cssBox, cssTitle, cssContent, debug) {
    var _me = this;
    _me._debug = debug || false;
    _me._effectRunning = false;
    _me._clickHandlerBind = _me.clickHandler.bind(_me);
    _me.openOnlyOnePerLevel = true;
    _me.htmlElem = $(elemId);
    _me.cssBox = cssBox;
    _me.cssTitle = cssTitle;
    _me.cssContent = cssContent;
    _me.reInit();
    _me.htmlElem.fire('celanim_accordeon-block:accordeonInitFinished', _me);
  },

  reInit : function() {
    var _me = this;
    var stepsToHide = _me.htmlElem.select(_me.cssBox);
    stepsToHide.each(function(step) {
      if (_me.isValidStep(step)) {
        step.down(_me.cssTitle).stopObserving('click', _me._clickHandlerBind);
        step.down(_me.cssTitle).observe('click', _me._clickHandlerBind);
        if (!step.hasClassName('active') && !step.hasClassName('inactive')) {
          step.addClassName('inactive');
          step.down(_me.cssContent).hide();
        }
      } else if (_me._debug) {
        console.log('stepsToHide: skip step ', step, _me.cssContent, _me.cssTitle);
      }
    });
  },

  setOpenOnlyOnePerLevel : function(openOnlyOnePerLevel) {
    var _me = this;
    _me.openOnlyOnePerLevel = openOnlyOnePerLevel;
  },

  getOpenOnlyOnePerLevel : function() {
    var _me = this;
    return _me.openOnlyOnePerLevel;
  },

  accordeonHide : function(stepToHide) {
    var _me = this;
    return new Effect.SlideUp(stepToHide.down(_me.cssContent), {
      transition: Effect.Transitions.sinoidal,
      beforeStart : function() {
        stepToHide.fire('celanim_accordeon-block:accordeonBeforeHide', stepToHide);
      },
      afterFinish : function() {
        stepToHide.fire('celanim_accordeon-block:accordeonAfterHide', stepToHide);
        stepToHide.removeClassName('active');
        stepToHide.addClassName('inactive');
      },
      sync : true
    });
  },

  accordeonShow : function(stepToShow) {
    var _me = this;
    stepToShow.removeClassName('inactive');
    stepToShow.addClassName('active');
    return new Effect.SlideDown(stepToShow.down(_me.cssContent), {
      transition: Effect.Transitions.sinoidal,
      beforeStart : function() {
        stepToShow.fire('celanim_accordeon-block:accordeonBeforeShow', stepToShow);
      },
      afterFinish : function() {
        stepToShow.fire('celanim_accordeon-block:accordeonAfterShow', stepToShow);
      },
      sync : true
    });
  },

  _accordeonExecute : function(parallelEffects, nextStep) {
    var _me = this;
    if (!_me._effectRunning) {
      _me._effectRunning = true;
      var stepToShow = nextStep;
      new Effect.Parallel(parallelEffects, {
        duration : 1.0,
        beforeStart : function() {
          _me.htmlElem.fire('celanim_accordeon-block:accordeonBeforeStart', nextStep);
        },
        afterFinish : function() {
          _me.htmlElem.fire('celanim_accordeon-block:accordeonAfterFinish', nextStep);
          //IE7 Fix!!! Do not remove!!!
          (function () {
            stepToShow.setStyle({ visibility : 'visible'});
            _me._effectRunning = false;
          }).delay(0.3);
        }
      });
    } else {
      if ((typeof console != 'undefined')
          && (typeof console.warn != 'undefined')) {
        console.warn('accordeonExecute: doubleclick registered! ignoring...');
      }
    }
  },

  isValidStep : function(step) {
    var _me = this;
    var stepContent = step.down(_me.cssContent);
    var stepTitle = step.down(_me.cssTitle);
    return (stepContent && stepTitle);
  },

  isStepVisible : function(step) {
    var _me = this;
    if (step && step.down(_me.cssContent)) {
      return step.down(_me.cssContent).visible();
    } else {
      return false;
    }
  },

  clickHandler : function(event) {
    var _me = this;
    event.stop();
    var step = event.findElement(_me.cssBox);
    if ((typeof step !== 'undefined') && (_me.isValidStep(step))) {
      var clickEvent = step.fire('celanim_accordeon-block:beforeClickHandler', step);
      if (!clickEvent.stopped) {
        _me.toggleAccordeon(step);
      }
    } else if (_me._debug) {
      console.log('clickHandler: failed to get valid step. ', _me.cssBox,
          event.findElement());
    }
  },

  toggleAccordeon : function(step) {
    var _me = this;
    if (_me.isStepVisible(step)) {
      var accordeonEffects = [];
      accordeonEffects.push(_me.accordeonHide(step));
      _me._accordeonExecute(accordeonEffects, step);
    } else {
      _me.activateStep(step);
    }
  },

  activateStep : function(nextStep) {
    var _me = this;
    var activeSteps = _me.htmlElem.select(_me.cssBox);
    var accordeonEffects = [];
    if(_me.getOpenOnlyOnePerLevel()) {
      activeSteps.each(function(step) {
        if (_me.isValidStep(step) && (step != nextStep) && (_me.isStepVisible(step))) {
          accordeonEffects.push(_me.accordeonHide(step));
        }
      });
    }
    if (_me.isValidStep(nextStep)) {
      accordeonEffects.push(_me.accordeonShow(nextStep));
    }
    if (accordeonEffects.size() > 0) {
      _me._accordeonExecute(accordeonEffects, nextStep);
    }
    _me.htmlElem.fire('celanim_accordeon-block:activateStepAfterFinish', nextStep);
  }

};
})();

})();
