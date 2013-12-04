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
 * Celements navigation hover collapse class
 * This is the Celements navigation hover class. It collapses second navigation levels
 * and shows them on hover over first level navigation items.
 * 
 */
if(typeof CELEMENTS=="undefined"){var CELEMENTS={};};
if(typeof CELEMENTS.navigation=="undefined"){CELEMENTS.navigation={};};

(function(window, undefined) {

  var isMobile = {
      Android: function() {
        return navigator.userAgent.match(/Android/i);
      },
      BlackBerry: function() {
        return navigator.userAgent.match(/BlackBerry/i);
      },
      iOS: function() {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
      },
      iPhone: function() {
        return navigator.userAgent.match(/iPhone/i);
      },
      iPod: function() {
        return navigator.userAgent.match(/iPod/i);
      },
      iPad: function() {
        return navigator.userAgent.match(/iPad/i);
      },
      Opera: function() {
        return navigator.userAgent.match(/Opera Mini/i);
      },
      Windows: function() {
        return navigator.userAgent.match(/IEMobile/i);
      },
      Simulator: function() {
        // http://iphone4simulator.com/ maybe
        return (window.top != window);
      },
      any: function() {
        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() 
            || isMobile.Opera() || isMobile.Windows());
      }
    };

//////////////////////////////////////////////////////////////////////////////
// Celements navigation NavOpenOnHover
//////////////////////////////////////////////////////////////////////////////
CELEMENTS.navigation.NavOpenOnHover = function(secondMenuLevelCssSelector) {
  // constructor
  this._init(secondMenuLevelCssSelector);
};

(function() {
  CELEMENTS.navigation.NavOpenOnHover.prototype = {
      _secondMenuLevelCssSelector : undefined,
      _scheduledHide : new Hash(),
      _mainNavMouseOverBind : undefined,

      _init : function(secondMenuLevelCssSelector) {
        var _me = this;
        _me._secondMenuLevelCssSelector = secondMenuLevelCssSelector;
        _me._mainNavMouseOverBind = _me._mainNavMouseOver.curry(_me);
        _me._mainNavMouseOutBind = _me._mainNavMouseOut.curry(_me);
        _me._hideAllNotActiveSubNavigations();
        _me._registerNavigationHover();
      },

      _hideAllNotActiveSubNavigations : function(skipSubNav) {
        var _me = this;
        $$(_me._secondMenuLevelCssSelector).each(function(subNav) {
          var mainLi = subNav.up('li');
          if (!mainLi.hasClassName('active') && (!skipSubNav || (skipSubNav != subNav))) {
            _me._cancelDelayedHide(subNav);
            subNav.hide();
          }
        });
      },
  
      _registerNavigationHover : function() {
        var _me = this;
        $$(_me._secondMenuLevelCssSelector).each(function(subNav) {
          var mainLi = subNav.up('li');
          if (!mainLi.hasClassName('active')) {
            mainLi.observe('mouseover', _me._mainNavMouseOverBind);
          }
        });
      },

      _mainNavMouseOver : function(myself, event) {
        var _me = myself;
        var mainLi = this;
        var subNav = mainLi.down('ul');
        _me._cancelDelayedHide(subNav);
        _me._hideAllNotActiveSubNavigations(subNav);
        if (subNav.visible()) {
          subNav.setStyle({ 'opacity' : '1' });
        } else {
          subNav.addClassName('navHover');
          subNav.appear({ duration: 0.2 });
        }
        mainLi.stopObserving('mouseout', _me._mainNavMouseOutBind);
        mainLi.observe('mouseout', _me._mainNavMouseOutBind);
      },
      
      _mainNavMouseOut : function(myself, event) {
        var _me = myself;
        var mainLi = this;
        var relTarg = event.relatedTarget || event.toElement;
        var menuElem = relTarg.up('ul ul') || relTarg;
        var insideMainLi = menuElem.up('li');
        if (!(insideMainLi === mainLi)) {
          var subNav = mainLi.down('ul');
          _me._scheduledHide.set(subNav.id, _me._delayedHide.delay(0.5, myself, subNav));
          subNav.setStyle({ 'opacity' : '0.8' });
          mainLi.stopObserving('mouseout', _me._mainNavMouseOutBind);
        }
      },
      
      _delayedHide : function(myself, subNav) {
        var _me = myself;
        _me._scheduledHide.unset(subNav.id);
        subNav.fade({
          'duration' : 0.2,
          'afterFinish' : function() {
            subNav.removeClassName('navHover');
          }
        });
      },
      
      _cancelDelayedHide : function(subNav) {
        var _me = this;
        var delayId = _me._scheduledHide.get(subNav.id);
        if (delayId) {
          window.clearTimeout(delayId);
          _me._scheduledHide.unset(subNav.id);
        }
      }
  };
})();

})(window);
