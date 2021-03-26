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
(function (window, undefined) {

  if (typeof window.CELEMENTS === "undefined") { window.CELEMENTS = {}; }
  if (typeof window.CELEMENTS.mobile === "undefined") { window.CELEMENTS.mobile = {}; }

  //////////////////////////////////////////////////////////////////////////////
  //Celements mobile dimensions
  //////////////////////////////////////////////////////////////////////////////
  CELEMENTS.mobile.Dimensions = function () {
    // constructor
    this._init();
  };

  CELEMENTS.mobile.Dimensions.prototype = {

    _dimLogging: false,

    isMobile: {
      Safari: function () {
        const _me = this;
        return window.navigator.userAgent.match(/Safari/i) && !_me.Chrome()
          && !_me.Windows();
      },
      Chrome: function () {
        return window.navigator.userAgent.match(/Chrome|CriOS/i);
      },
      Android: function () {
        return window.navigator.userAgent.match(/Android/i);
      },
      BlackBerry: function () {
        return window.navigator.userAgent.match(/BlackBerry/i);
      },
      iOS: function () {
        return window.navigator.userAgent.match(/iPhone|iPad|iPod/i);
      },
      iPhone: function () {
        return window.navigator.userAgent.match(/iPhone/i);
      },
      iPod: function () {
        return window.navigator.userAgent.match(/iPod/i);
      },
      iPad: function () {
        return window.navigator.userAgent.match(/iPad/i);
      },
      Opera: function () {
        return window.navigator.userAgent.match(/Opera Mini/i);
      },
      Windows: function () {
        return window.navigator.userAgent.match(/IEMobile/i);
      },
      IE: function () {
        const ua = window.navigator.userAgent;
        const msie = ua.indexOf("MSIE ");
        const trident = ua.match(/Trident.*rv\:(\d{2})\./) || false;
        const edge = ua.match(/Edge\/(\d{2})\./) || false;
        return (msie > 0 || trident || edge);
      },
      Simulator: function () {
        // http://iphone4simulator.com/ maybe
        return (window.top != window);
      },
      ChromeOn_iOS: function () {
        return window.navigator.userAgent.match(/CriOS/i);
      },
      any: function () {
        const _me = this;
        return (_me.Android() || _me.BlackBerry() || _me.iOS() || _me.Opera()
          || _me.Windows());
      }
    },

    _init: function () {
    },

    version: function () {
      const _me = this;
      const ua = window.navigator.userAgent;
      if (_me.isMobile.Safari()) {
        return ua.match(/Version\/(\d+\.\d+)/)[1];
      } else if (_me.isMobile.Chrome()) {
        return ua.match(/Chrome|CriOS\/(\d+\.\d+)/)[1];
      } else if (_me.isMobile.IE()) {
        const msie = ua.indexOf("MSIE ");
        const trident = ua.match(/Trident.*rv\:(\d{2})\./) || false;
        const edge = ua.match(/Edge\/(\d{2})\./) || false;
        if (trident) {
          return parseInt(trident[1]);
        } else if (edge) {
          return parseInt(edge[1]);
        } else {
          return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
        }
      }
      return $j.browser.version;
    },

    getZoomStyles: function (zoomFactor, fullWidth, fullHeight) {
      const _me = this;
      let zoomStyles = {};
      if (_me.isMobile.IE() && (_me.version() < 10)) {
        zoomStyles['msTransformOrigin'] = '0 0'; //IE9 only supports 2D values
        zoomStyles['msTransform'] = 'scale(' + zoomFactor + ')';
        zoomStyles['transformOrigin'] = '0 0 0';
        zoomStyles['transform'] = 'scale(' + zoomFactor + ')';
      } else {
        zoomStyles['webkitTransformOrigin'] = '0 0 0';
        zoomStyles['webkitTransform'] = 'scale(' + zoomFactor + ')';
        zoomStyles['transformOrigin'] = '0 0 0';
        zoomStyles['transform'] = 'scale(' + zoomFactor + ')';
      }
      if (!Number.isNaN(fullHeight)) {
        // transform-scale only scales the content of the box, the box must be resized itself
        const scaledHeight = (zoomFactor * fullHeight);
        zoomStyles['height'] = scaledHeight + 'px';
      } else {
        zoomStyles['height'] = fullHeight;
      }
      if (!Number.isNaN(fullHeight)) {
        // transform-scale only scales the content of the box, the box must be resized itself
        const scaledWidth = (zoomFactor * fullWidth);
        zoomStyles['width'] = scaledWidth + 'px';
      } else {
        zoomStyles['width'] = fullWidth;
      }
      return zoomStyles;
    },

    isOrientationLandscape: function () {
      const innerWidth = window.innerWidth || document.documentElement.clientWidth;
      const innerHeight = window.innerHeight || document.documentElement.clientHeight;
      //window.orientation works only correct on load, but has whimsical behavior when 
      //  rotating 
      return innerWidth > innerHeight;
    },

    getInnerWidth: function () {
      const _me = this;
      let width = window.innerWidth || document.documentElement.clientWidth;
      if (_me.isMobile.any()) {
        if (_me.isMobile.iOS() && _me.isOrientationLandscape()) {
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

    getInnerHeight: function () {
      const _me = this;
      let height = window.innerHeight || document.documentElement.clientHeight;
      if (_me.isMobile.any()) {
        if (_me.isMobile.iOS() && _me.isOrientationLandscape()) {
          height = screen.width;
        } else if (!_me.isMobile.Android()) {
          height = screen.height;
        }
      }
      if (_me._dimLogging) {
        _me.logDimAndAgent("getInnerHeight returning: [" + height + "].");
      }
      return height;
    },

    getDimensions: function () {
      const mobileDim = {
        'screen': {
          'width': screen.width,
          'height': screen.height
        },
        'screenAvailable': {
          'width': screen.availWidth,
          'height': screen.availHeight
        },
        'windowInner': {
          'width': window.innerWidth,
          'height': window.innerHeight
        },
        'windowOuter': {
          'width': window.outerWidth,
          'height': window.outerHeight
        },
        'docBodyClient': {
          'width': document.body.clientWidth,
          'height': document.body.clientHeight
        },
        'docBodyOffset': {
          'width': document.body.offsetWidth,
          'height': document.body.offsetHeight
        },
        'docElement': {
          'width': document.documentElement.clientWidth,
          'height': document.documentElement.clientHeight
        }
      };
      return mobileDim;
    },

    alertDim: function () {
      const _me = this;
      const mobileDim = _me.getDimensions();
      let outStr = "dimensions: \n";
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

    logDimAndAgent: function (message) {
      const _me = this;
      const logMessage = message || '';
      new Ajax.Request(getCelHost(), {
        method: "POST",
        parameters: {
          'xpage': 'celements_ajax',
          'ajax_mode': 'MobileLogDimAndAgent',
          'mobileDim': Object.toJSON(_me.getDimensions()),
          'userAgent': window.navigator.userAgent,
          'isOrientationLandscape': _me.isOrientationLandscape(),
          'message': logMessage
        },
        onSuccess: function (transport) {
          if (transport.responseText.isJSON()) {
            const responseObject = transport.responseText.evalJSON();
            console.log('MobileLogDimAndAgent finished successfully. ', responseObject);
          } else {
            console.error('noJSON!!! ', transport.responseText);
          }
        }
      });
    }
  };

})(window);
