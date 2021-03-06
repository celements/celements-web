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

var overlaySlideIsDebug = false;

YAHOO.util.Event.onDOMReady(function() {
  loadOverlaySlide();
});

var loadOverlaySlide = function() {
  $$('body')[0].fire('celanim_overlay:beforeLoadOverlaySlide-Link');
  $$('a.celanim_overlay, a.celanim_overlayIframe').each(function(elem) {
    celanimOverlay_addOpenConfig(elem.id, {
      'src' : elem.href,
      'objectType' : 'iframe',
      'cssClassNames' : ['draggable-header']
    });
  });
  $$('body')[0].fire('celanim_overlay:beforeLoadOverlaySlide-Image');
  $$('img.celanim_overlay').each(function(elem) {
    var imgOverlayDim = celanimOverlay_getDimensionsFromElem(elem);
    if (imgOverlayDim.height && imgOverlayDim.width) {
      var imgOverlaySrc = elem.src.replace(/\?.*/, '') + '?celheight='
          + imgOverlayDim.height + '&celwidth=' + imgOverlayDim.width;
      celanimOverlay_addOpenConfig(elem.id, {
          'src' : imgOverlaySrc,
          'addCloseButton' : $(elem.id).hasClassName('celanim_overlay_addCloseButton'),
          'addNavigation' : $(elem.id).hasClassName('celanim_addNavigation'),
          'captionEval' : 'this.thumb.alt',
          'objectType' : 'image',
          'cssClassNames' : ['borderless', 'floating-caption']
        });
    }
  });
  $$('body')[0].fire('celanim_overlay:afterLoadOverlaySlide');
};

var celanimOverlay_getDimensionsFromElem = function(elem) {
  if (elem && elem.id && (elem.id != '')) {
    var elemSplits = elem.id.split(':');
    var overlayWidth = elemSplits[4];
    var overlayHeight = elemSplits[5];
    return {
      'width' : overlayWidth,
      'height' : overlayHeight
    };
  }
  return {};
};

var celanimOverlay_openConfig = new Hash();
var celanimOverlay_addOpenConfig = function(elemId, openConfig) {
  if ($(elemId)) {
    var openConfigObj = $H(celanimOverlay_getDimensionsFromElem($(elemId))
      ).merge({ id : elemId }).merge(openConfig).toObject();
    if (openConfigObj.src && openConfigObj.width && openConfigObj.height) {
      if (!openConfigObj.cssClassNames) {
        openConfigObj.cssClassNames = [];
      }
      celanimOverlay_openConfig.set(elemId, openConfigObj);
      $(elemId).setStyle({
        'cursor' : "url(" + window.CELEMENTS.getUtils().getPathPrefix()
                 + "/file/resources/celJS/highslide/graphics/zoomin.cur), pointer"
      });
      $(elemId).stopObserving('click', celanimOverlay_OpenInOverlay);
      $(elemId).observe('click', celanimOverlay_OpenInOverlay);
      $(elemId).stopObserving('celanim_overlay:openOverlay', celanimOverlay_OpenInOverlay);
      $(elemId).observe('celanim_overlay:openOverlay', celanimOverlay_OpenInOverlay);
    } else {
      if ((typeof console != 'undefined') && (typeof console.warn != 'undefined')) {
        console.warn('Skipping add open config because one of the required config fields'
           +' (src, width, height) is missing for id "' + elemId + '".', openConfigObj);
      }
    }
  } else {
    if ((typeof console != 'undefined') && (typeof console.warn != 'undefined')) {
      console.warn('Skipping add open config because no element with id "' + elemId
          + '" found.');
    }
  }
};

var celanimOverlay_AfterExpandHandler = function(hsExpander) {
  $$('.highslide-html').each(function(overlayHTMLDiv) {
    //FIX width of overlayWrapper after opening second time.
    //IMPORTANT: do not set height similarly, because sometimes it is only 16px on first opening.
    var overlayHTMLDiv2 = overlayHTMLDiv.down('div');
    var overlayWrapper = overlayHTMLDiv2.up('.highslide-wrapper');
    overlayWrapper.setStyle({ 'width' : overlayHTMLDiv2.getWidth() + 'px' });
    overlayHTMLDiv.setStyle({ 'width' : overlayHTMLDiv2.getWidth() + 'px' });
    if (overlayWrapper.hasClassName('celanim_hasCloseButton')) {
      var closeButtonElem = new Element('div', {
        'class' : 'closebutton',
        'title' : 'Close'
      });
      closeButtonElem.observe('click', function() {
        hs.close(this);
      });
      overlayHTMLDiv.insert({
        'after' : closeButtonElem
      });
    }
    //center image
    var imgInOverlay = overlayHTMLDiv.down('img.highslide-image');
    if (imgInOverlay) {
      imgInOverlay.observe('load', centerImage);
      // load will be only fired if the image is not yet loaded.
      //Thus we execute centerImage once for if it is already loaded.
      celSlideShowInternalCenterImage(imgInOverlay);
      imgInOverlay.setStyle({
        'visibility' : 'visible'
      });
    }
  });
  $(hsExpander.thumb).fire('celanim_overlay:afterExpand', hsExpander);
  $$('body')[0].fire('celanim_overlay:afterExpandGeneral', hsExpander);
};

var celanimOverlay_BeforeExpandHandler = function(hsExpander) {
  if (overlaySlideIsDebug && (typeof console != 'undefined')
      && (typeof console.debug != 'undefined')) {
    console.debug('celanimOverlay_BeforeExpandHandler: ', hsExpander.thumb, ', ',
        hsExpander);
  }
  $$('.highslide-html').each(function(overlayHTMLDiv) {
    var overlayHTMLDiv2 = overlayHTMLDiv.down('div');
    var overlayWrapper = overlayHTMLDiv2.up('.highslide-wrapper');
    overlayWrapper.setStyle({ 'width' : overlayHTMLDiv2.getWidth() + 'px' });
    overlayHTMLDiv.setStyle({ 'width' : overlayHTMLDiv2.getWidth() + 'px' });
    //fix height of internal divs
    var imgInOverlay = overlayHTMLDiv.down('img.highslide-image');
    overlayHTMLDiv.select('div').each(function(divElem) {
      if (!divElem.hasClassName('highslide-header')) {
        divElem.setStyle({'height' : '100%'});
      }
    });
    if (imgInOverlay) {
      imgInOverlay.setStyle({
        'position' : 'absolute',
        'visibility' : 'hidden'
      });
    }
  });
  $(hsExpander.thumb).fire('celanim_overlay:beforeExpand', hsExpander);
  $$('body')[0].fire('celanim_overlay:beforeExpandGeneral', hsExpander);
};

var celanimOverlay_AfterCloseHandler = function(hsExpander) {
  $(hsExpander.thumb).fire('celanim_overlay:afterClose', hsExpander);
  $$('body')[0].fire('celanim_overlay:afterCloseGeneral', hsExpander);
};

var celanimOverlay_OpenInOverlay = function(event) {
  if (overlaySlideIsDebug && (typeof console != 'undefined')
      && (typeof console.debug != 'undefined')) {
    console.debug('celanimOverlay_OpenInOverlay: ', this, ', ', event);
  }
  var openConfig = celanimOverlay_openConfig.get(this.id);
  if (openConfig) {
    var hsConfig = $H({
        dimmingOpacity: 0.75,
        dragByHeading : false,
        objectHeight: openConfig.height, //important for IE!!!
        align : 'center',
        preserveContent : false
      }).merge(openConfig);
    if (hsConfig.get('objectType') == 'image') {
      hsConfig = celanimOverlay_HandleImageContent(hsConfig);
    }
    hs.graphicsDir = window.CELEMENTS.getUtils().getPathPrefix()
                    + '/file/resources/celJS/highslide/graphics/';
    hs.outlineType = hsConfig.outlineType || '';
    if (openConfig.addNavigation) {
      openConfig.cssClassNames.push('celanim_addNavigation');
    }
    if (openConfig.addCloseButton) {
      openConfig.cssClassNames.push('celanim_hasCloseButton');
    }
    hs.wrapperClassName = 'no-footer no-move celanim_overlay_wrapper '
      + openConfig.cssClassNames.join(' ');
    hs.height = hsConfig.get('height');
    hs.width = hsConfig.get('width');
    hs.Expander.prototype.onBeforeExpand = celanimOverlay_BeforeExpandHandler;
    hs.Expander.prototype.onAfterExpand = celanimOverlay_AfterExpandHandler;
    hs.Expander.prototype.onAfterClose = celanimOverlay_AfterCloseHandler;
    hs.htmlExpand(this, hsConfig.toObject());
    event.stop();
  } else {
    if ((typeof console != 'undefined') && (typeof console.warn != 'undefined')) {
      console.warn('Skipping open-in-overlay event, because no open config for elemId"'
          + this.id + '" found.');
    }
  }
};

var celanimOverlay_HandleImageContent = function(hsConfig) {
  hsConfig.unset('objectType');
  var overlayContentId = 'celanim_overlay_contentId_image_' + hsConfig.get('id');
  hsConfig.set('contentId', overlayContentId);
  var overlayStartImg = celanimOverlay_getOrCreateStartImgElem(overlayContentId,
      hsConfig);
  overlayStartImg.src = hsConfig.get('src');
  hsConfig.unset('src');
  return hsConfig;
};

var celanimOverlay_getOrCreateStartImgElem = function(overlayContentId, hsConfig) {
  var overlayContentElem = celanimOverlay_getOrCreateContentElem(overlayContentId,
      hsConfig);
  var overlayStartImg = overlayContentElem.down('img.highslide-image');
  if (!overlayStartImg) {
    overlayStartImg = new Element('img', {
      'class' : 'highslide-image'
    });
    overlayContentElem.insert(overlayStartImg);
  }
  return overlayStartImg;
};

var celanimOverlay_getOrCreateContentElem = function(overlayContentId, hsConfig) {
  var overlayContentElem = $(overlayContentId);
  if (!overlayContentElem) {
    overlayContentElem = new Element('div', {
      'id' : overlayContentId
    }).setStyle({
      'width' : hsConfig.get('width') + 'px',
      'height' : hsConfig.get('height') + 'px'
    }).hide();
    $$('body')[0].insert(overlayContentElem);
  }
  return overlayContentElem;
};
