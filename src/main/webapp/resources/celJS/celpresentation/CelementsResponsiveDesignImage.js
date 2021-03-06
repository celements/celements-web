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
 * Celements presentation ResponsiveDesignImage
 * This is the Celements presentation ResponsiveDesignImage controller.
 */
if(typeof CELEMENTS=="undefined"){var CELEMENTS={};};
if(typeof CELEMENTS.presentation=="undefined"){CELEMENTS.presentation={};};

(function() {

//////////////////////////////////////////////////////////////////////////////
// Celements presentation ResponsiveDesignImage
//////////////////////////////////////////////////////////////////////////////
CELEMENTS.presentation.ResponsiveDesignImage = function(containerId, wrapperId) {
  containerId = containerId || 'sitecontainer';
  // constructor
  this._init(containerId, wrapperId);
};

(function() {
  CELEMENTS.presentation.ResponsiveDesignImage.prototype = {
      _htmlContainerId : undefined,
      _htmlContainer : undefined,
      _htmlContainerWrapper : undefined,
      _htmlContainerWrapperId : undefined,
      _preloadConfig : new Array(),
      _preloadImgs : new Hash(),

      _init : function(containerId, wrapperId) {
        var _me = this;
        _me.resetContainerAndWrapper;
      },

      resetContainerAndWrapper : function(containerId, wrapperId) {
        var _me = this;
        _me._htmlContainerId = containerId;
        _me._htmlContainer = $(containerId);
        _me._htmlContainerWrapperId = wrapperId;
        _me._htmlContainerWrapper = $(wrapperId);
      },

      addPreloadConfig : function(preloadConfigElem) {
        var _me = this;
        if (preloadConfigElem.width || preloadConfigElem.height) {
          _me._preloadConfig.push(preloadConfigElem);
        }
      },

      _resizedImageLoaded : function() {
        this.appear({ duration : 0.4 });
      },

      _addParamToUrl : function(currUrl, newParamPart) {
        var srcSuffix = '';
        if (newParamPart != '') {
          if (currUrl.indexOf('?') > 0) {
            srcSuffix = '&' + newParamPart;
          } else {
            srcSuffix = '?' + newParamPart;
          }
        }
        return srcSuffix;
      },

      _getImgSourceWithDim : function(imgSrc, wrapWidth, wrapHeight) {
        var _me = this;
        wrapWidth = parseInt(wrapWidth);
        wrapHeight = parseInt(wrapHeight);
        var newImgSrc = imgSrc.replace(/celwidth=\d*&?|celheight=\d*&?/g, '');
        newImgSrc = newImgSrc.replace(/\?$/g, '');
        if (wrapWidth && (wrapWidth > 0)) {
          newImgSrc += _me._addParamToUrl(newImgSrc, 'celwidth=' + wrapWidth);
        } 
        if (wrapHeight && (wrapHeight > 0)) {
          newImgSrc += _me._addParamToUrl(newImgSrc, 'celheight=' + wrapHeight);
        } 
        return newImgSrc;
      },

      preloadContentImages : function(contentImg) {
        var _me = this;
        _me._preloadConfig.each(function(preloadConfElem) {
          var updatedImgSrc = _me._getImgSourceWithDim(contentImg.src,
              preloadConfElem.width, preloadConfElem.height);
          if (!_me._preloadImgs.get(updatedImgSrc)) {
            var newPreloadImg = new Image();
            newPreloadImg.src = updatedImgSrc;
            _me._preloadImgs.set(updatedImgSrc, newPreloadImg);
          }
        });
      },

      checkImageDimensions : function(wrapperElemDim, contentImg, preloadIfEditor) {
        var _me = this;
        preloadIfEditor = preloadIfEditor || true;
        var wrapHeight = wrapperElemDim.height;
        var wrapWidth = wrapperElemDim.width;
        if (preloadIfEditor && $$('body')[0].hasClassName('celementsmenubarvisible')) {
          _me.preloadContentImages(contentImg);
        }
        var updatedImgSrc = _me._getImgSourceWithDim(contentImg.src, wrapWidth,
            wrapHeight);
        if (contentImg.src != updatedImgSrc) {
          contentImg.removeAttribute('width');
          contentImg.removeAttribute('height');
          contentImg.hide();
          var bindedResizeImageLoaded = _me._resizedImageLoaded.bind(contentImg);
          $(contentImg).stopObserving('load', bindedResizeImageLoaded);
          $(contentImg).observe('load', bindedResizeImageLoaded);
          contentImg.src = updatedImgSrc;
          $(contentImg).setStyle({
            'backgroundImage' : 'url(' + window.CELEMENTS.getUtils().getPathPrefix()
               + '/file/resources/celRes/ajax-loader.gif)',
            'backgroundPosition' : 'center center',
            'backgroundRepeat' : 'no-repeat'
          });
          _me._htmlContainer.fire('cel_ResponsiveDesign:afterImageSrcChange', {
            'img' : contentImg
           });
        }
      },

      _getWrapper : function() {
        var _me = this;
        return _me._htmlContainerWrapper || _me._htmlContainer.up();
      },

      doImageRescaleToWrapperDim : function() {
        var _me = this;
        if (_me._htmlContainer && _me._getWrapper()) {
          var wrapperElem = _me._getWrapper();
          var wrapperElemHeight = Math.round(parseFloat(wrapperElem.getStyle('height')));
          var wrapperElemWidth = Math.round(parseFloat(wrapperElem.getStyle('width')));
          var checkImageDimBinded = _me.checkImageDimensions.curry({
            'width' : wrapperElemWidth,
            'height' : wrapperElemHeight
          }).bind(_me);
          _me._htmlContainer.select('img').each(checkImageDimBinded);
        }
      },

      doImageRescaleToDim : function(wrapperElemDim) {
        var _me = this;
        if (_me._htmlContainer) {
          var checkImageDimBinded = _me.checkImageDimensions.curry(wrapperElemDim).bind(
              _me);
          _me._htmlContainer.select('img').each(checkImageDimBinded);
        }
      }

  };
})();

})();
