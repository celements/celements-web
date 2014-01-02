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
 * Celements mobile support library
 * This is the Celements mobile support library.
 */
if(typeof CELEMENTS=="undefined"){var CELEMENTS={};};
if(typeof CELEMENTS.mobile=="undefined"){CELEMENTS.mobile={};};

(function(window, undefined) {

//////////////////////////////////////////////////////////////////////////////
//Celements mobile dimensions
//////////////////////////////////////////////////////////////////////////////
CELEMENTS.mobile.Dimensions = function() {
  // constructor
  this._init();
};

CELEMENTS.mobile.Dimensions.prototype = {
    
    _dimLogging : false,

    isMobile : {
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
        ChromeOn_iOS: function() {
          return navigator.userAgent.match(/CriOS/i);
        },
        any: function() {
          var _me = this;
          return (_me.Android() || _me.BlackBerry() || _me.iOS() || _me.Opera()
              || _me.Windows());
        }
    },

    _init : function() {
    },

    isOrientationLandscape : function() {
//    var _me = this;
      var innerWidth = window.innerWidth || document.documentElement.clientWidth;
      var innerHeight = window.innerHeight || document.documentElement.clientHeight;
      //window.orientation works only correct on load, but has whimsical behavior when 
      //  rotating 
      return innerWidth > innerHeight;
    },
  
    getInnerWidth : function() {
      var _me = this;
      var width = window.innerWidth || document.documentElement.clientWidth;
      if(_me.isMobile.any()) {
        if(_me.isMobile.iOS() && _me.isOrientationLandscape()) {
          width = screen.height;
        } else if (!_me.isMobile.Android()) {
          width = screen.width;
        }
      }
      if (_me._dimLogging) {
        _me.logDimAndAgent("getInnerWidth returning: [" + width + "].");
      }
      return width;
    },

    getInnerHeight : function() {
//        var _me = this;
      var height = window.innerHeight || document.documentElement.clientHeight;
//        if(_me.isMobile.any()) {
//          if(_me.isMobile.iOS() && _me.isOrientationLandscape()) {
//            height = screen.width;
//          } else {
//            height = screen.height;
//          }
//        }
      return height;
    },

    getDimensions : function() {
      var mobileDim = {
          'screen' : {
            'width' : screen.width,
            'height' :screen.height
          },
          'screenAvailable' : {
            'width' : screen.availWidth,
            'height' : screen.availHeight
          },
          'windowInner' : {
            'width' : window.innerWidth,
            'height' : window.innerHeight
          },
          'windowOuter' : {
            'width' : window.outerWidth,
            'height' : window.outerHeight
          },
          'docBodyClient' : {
            'width' : document.body.clientWidth,
            'height' : document.body.clientHeight
          },
          'docBodyOffset' : {
            'width' : document.body.offsetWidth,
            'height' : document.body.offsetHeight
          },
          'docElement' : {
            'width' : document.documentElement.clientWidth,
            'height' : document.documentElement.clientHeight
          }
      };
      return mobileDim;
    },

    alertDim : function() {
      var _me = this;
      var mobileDim = _me.getDimensions();
      var outStr = "dimensions: \n";
      outStr += "screen: " + mobileDim.screen.width + ","
        + mobileDim.screen.height + "\n";
      outStr += "screenAvailable: " + mobileDim.screenAvailable.width + ","
        + mobileDim.screenAvailable.height + "\n";
      outStr += "windowInner: " + mobileDim.windowInner.width + ","
        + mobileDim.windowInner.height + "\n";
      outStr += "windowOuter: " + mobileDim.windowOuter.width + ","
        + mobileDim.windowOuter.height + "\n";
      outStr += "docBodyClient: " + mobileDim.docBodyClient.width + ","
        + mobileDim.docBodyClient.height + "\n";
      outStr += "docBodyOffset: " + mobileDim.docBodyOffset.width + ","
        + mobileDim.docBodyOffset.height + "\n";
      outStr += "docElement: " + mobileDim.docElement.width + ","
        + mobileDim.docElement.height + "\n";
      alert(outStr);
    },

    logDimAndAgent : function(message) {
      var _me = this;
      var logMessage = message || '';
      new Ajax.Request(getCelHost(), {
        method : "POST",
        parameters: {
          'xpage' : 'celements_ajax',
          'ajax_mode' : 'MobileLogDimAndAgent',
          'mobileDim' : Object.toJSON(_me.getDimensions()),
          'userAgent' : navigator.userAgent,
          'isOrientationLandscape' : _me.isOrientationLandscape(),
          'message' : logMessage
        },
        onSuccess : function(transport) {
          if (transport.responseText.isJSON()) {
            var responseObject = transport.responseText.evalJSON();
            if ((typeof console != 'undefined') && (typeof console.log != 'undefined')) {
              console.log('MobileLogDimAndAgent finished successfully. ', responseObject);
            }
          } else if ((typeof console != 'undefined')
              && (typeof console.error != 'undefined')) {
            console.error('noJSON!!! ', transport.responseText);
          }
        }
      });
    }
};

})(window);
