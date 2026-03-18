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

let overlaySlideIsDebug = false;

(function (window, undefined) {
  const overlaySlideMutationObserver = new MutationObserver((mutationList) =>
    mutationList
      .flatMap((mutation) => [...mutation.addedNodes])
      .filter((newNode) => newNode.nodeType === Node.ELEMENT_NODE)
      .forEach((newNode) => {
        registerCelanimOverlayLinkListeners(newNode);
        registerCelanimOverlayImageListeners(newNode);
      }),
  );

  const registerCelanimOverlayLinkListeners = (elem) => {
    elem
      .querySelectorAll('a.celanim_overlay, a.celanim_overlayIframe')
      .forEach((elem) =>
        celanimOverlay_addOpenConfig(elem.id, {
          src: elem.href,
          objectType: 'iframe',
          cssClassNames: ['draggable-header'],
        }),
      );
  };

  const registerCelanimOverlayImageListeners = (elem) => {
    elem.querySelectorAll('img.celanim_overlay').forEach((elem) => {
      const imgOverlayDim = celanimOverlay_getDimensionsFromElem(elem);
      if (imgOverlayDim.height && imgOverlayDim.width) {
        const imgOverlaySrc =
          elem.src.replace(/\?.*/, '') +
          '?celheight=' +
          imgOverlayDim.height +
          '&celwidth=' +
          imgOverlayDim.width;
        celanimOverlay_addOpenConfig(elem.id, {
          src: imgOverlaySrc,
          addCloseButton: $(elem.id).hasClassName(
            'celanim_overlay_addCloseButton',
          ),
          addNavigation: $(elem.id).hasClassName('celanim_addNavigation'),
          captionEval: 'this.thumb.alt',
          objectType: 'image',
          cssClassNames: ['borderless', 'floating-caption'],
        });
      }
    });
  };

  const loadOverlaySlide = () => {
    $(document.body).fire('celanim_overlay:beforeLoadOverlaySlide-Link');
    registerCelanimOverlayLinkListeners(document.body);
    $(document.body).fire('celanim_overlay:beforeLoadOverlaySlide-Image');
    registerCelanimOverlayImageListeners(document.body);
    $(document.body).fire('celanim_overlay:afterLoadOverlaySlide');
    overlaySlideMutationObserver.observe(document.body, {
      attributes: false,
      childList: true,
      subtree: true,
    });
  };

  const celanimOverlay_getDimensionsFromElem = (elem) => {
    if (elem && elem.id && elem.id != '') {
      const elemSplits = elem.id.split(':');
      const overlayWidth = elemSplits[4];
      const overlayHeight = elemSplits[5];
      return {
        width: overlayWidth,
        height: overlayHeight,
      };
    }
    return {};
  };

  const celanimOverlay_openConfig = new Hash();
  const celanimOverlay_addOpenConfig = (elemId, openConfig) => {
    if ($(elemId)) {
      const openConfigObj = $H(celanimOverlay_getDimensionsFromElem($(elemId)))
        .merge({ id: elemId })
        .merge(openConfig)
        .toObject();
      if (openConfigObj.src && openConfigObj.width && openConfigObj.height) {
        if (!openConfigObj.cssClassNames) {
          openConfigObj.cssClassNames = [];
        }
        celanimOverlay_openConfig.set(elemId, openConfigObj);
        $(elemId).setStyle({
          cursor:
            'url(' +
            window.CELEMENTS.getUtils().getPathPrefix() +
            '/file/resources/celJS/highslide/graphics/zoomin.cur), pointer',
        });
        $(elemId).stopObserving('click', celanimOverlay_OpenInOverlay);
        $(elemId).observe('click', celanimOverlay_OpenInOverlay);
        $(elemId).stopObserving(
          'celanim_overlay:openOverlay',
          celanimOverlay_OpenInOverlay,
        );
        $(elemId).observe(
          'celanim_overlay:openOverlay',
          celanimOverlay_OpenInOverlay,
        );
      } else {
        console.warn(
          'Skipping add open config because one of the required config fields' +
            ' (src, width, height) is missing for id "' +
            elemId +
            '".',
          openConfigObj,
        );
      }
    } else {
      console.warn(
        'Skipping add open config because no element with id "' +
          elemId +
          '" found.',
      );
    }
  };

  const celanimOverlay_AfterExpandHandler = (hsExpander) => {
    document.querySelectorAll('.highslide-html').forEach((overlayHTMLDiv) => {
      //FIX width of overlayWrapper after opening second time.
      //IMPORTANT: do not set height similarly, because sometimes it is only 16px on first opening.
      const overlayHTMLDiv2 = overlayHTMLDiv.down('div');
      const overlayWrapper = overlayHTMLDiv2.up('.highslide-wrapper');
      overlayWrapper.setStyle({ width: overlayHTMLDiv2.getWidth() + 'px' });
      overlayHTMLDiv.setStyle({ width: overlayHTMLDiv2.getWidth() + 'px' });
      if (overlayWrapper.hasClassName('celanim_hasCloseButton')) {
        const closeButtonElem = new Element('div', {
          class: 'closebutton',
          title: 'Close',
        });
        closeButtonElem.addEventListener('click', () => {
          hs.close(closeButtonElem);
        });
        overlayHTMLDiv.insert({
          after: closeButtonElem,
        });
      }
      //center image
      const imgInOverlay = overlayHTMLDiv.down('img.highslide-image');
      if (imgInOverlay) {
        imgInOverlay.observe('load', centerImage);
        // load will be only fired if the image is not yet loaded.
        //Thus we execute centerImage once for if it is already loaded.
        celSlideShowInternalCenterImage(imgInOverlay);
        imgInOverlay.setStyle({
          visibility: 'visible',
        });
      }
    });
    $(hsExpander.thumb).fire('celanim_overlay:afterExpand', hsExpander);
    $(document.body).fire('celanim_overlay:afterExpandGeneral', hsExpander);
  };

  const celanimOverlay_BeforeExpandHandler = (hsExpander) => {
    if (overlaySlideIsDebug) {
      console.debug(
        'celanimOverlay_BeforeExpandHandler: ',
        hsExpander.thumb,
        ', ',
        hsExpander,
      );
    }
    document.querySelectorAll('.highslide-html').forEach((overlayHTMLDiv) => {
      const overlayHTMLDiv2 = overlayHTMLDiv.down('div');
      const overlayWrapper = overlayHTMLDiv2.up('.highslide-wrapper');
      overlayWrapper.setStyle({ width: overlayHTMLDiv2.getWidth() + 'px' });
      overlayHTMLDiv.setStyle({ width: overlayHTMLDiv2.getWidth() + 'px' });
      //fix height of internal divs
      const imgInOverlay = overlayHTMLDiv.down('img.highslide-image');
      overlayHTMLDiv.querySelectorAll('div').forEach((divElem) => {
        if (!divElem.hasClassName('highslide-header')) {
          divElem.setStyle({ height: '100%' });
        }
      });
      if (imgInOverlay) {
        imgInOverlay.setStyle({
          position: 'absolute',
          visibility: 'hidden',
        });
      }
    });
    $(hsExpander.thumb).fire('celanim_overlay:beforeExpand', hsExpander);
    $(document.body).fire('celanim_overlay:beforeExpandGeneral', hsExpander);
  };

  const celanimOverlay_AfterCloseHandler = (hsExpander) => {
    $(hsExpander.thumb).fire('celanim_overlay:afterClose', hsExpander);
    $(document.body).fire('celanim_overlay:afterCloseGeneral', hsExpander);
  };

  const celanimOverlay_OpenInOverlay = function (event) {
    if (overlaySlideIsDebug) {
      console.debug('celanimOverlay_OpenInOverlay: ', this, ', ', event);
    }
    const openConfig = celanimOverlay_openConfig.get(this.id);
    if (openConfig) {
      let hsConfig = $H({
        dimmingOpacity: 0.75,
        dragByHeading: false,
        objectHeight: openConfig.height, //important for IE!!!
        align: 'center',
        preserveContent: false,
      }).merge(openConfig);
      if (hsConfig.get('objectType') == 'image') {
        hsConfig = celanimOverlay_HandleImageContent(hsConfig);
      }
      hs.graphicsDir =
        window.CELEMENTS.getUtils().getPathPrefix() +
        '/file/resources/celJS/highslide/graphics/';
      hs.outlineType = hsConfig.outlineType || '';
      if (openConfig.addNavigation) {
        openConfig.cssClassNames.push('celanim_addNavigation');
      }
      if (openConfig.addCloseButton) {
        openConfig.cssClassNames.push('celanim_hasCloseButton');
      }
      hs.wrapperClassName =
        'no-footer no-move celanim_overlay_wrapper ' +
        openConfig.cssClassNames.join(' ');
      hs.height = hsConfig.get('height');
      hs.width = hsConfig.get('width');
      hs.Expander.prototype.onBeforeExpand = celanimOverlay_BeforeExpandHandler;
      hs.Expander.prototype.onAfterExpand = celanimOverlay_AfterExpandHandler;
      hs.Expander.prototype.onAfterClose = celanimOverlay_AfterCloseHandler;
      hs.htmlExpand(this, hsConfig.toObject());
      event.stop();
    } else {
      console.warn(
        'Skipping open-in-overlay event, because no open config for elemId"' +
          this.id +
          '" found.',
      );
    }
  };

  const celanimOverlay_HandleImageContent = (hsConfig) => {
    hsConfig.unset('objectType');
    const overlayContentId =
      'celanim_overlay_contentId_image_' + hsConfig.get('id');
    hsConfig.set('contentId', overlayContentId);
    const overlayStartImg = celanimOverlay_getOrCreateStartImgElem(
      overlayContentId,
      hsConfig,
    );
    overlayStartImg.src = hsConfig.get('src');
    hsConfig.unset('src');
    return hsConfig;
  };

  const celanimOverlay_getOrCreateStartImgElem = (
    overlayContentId,
    hsConfig,
  ) => {
    const overlayContentElem = celanimOverlay_getOrCreateContentElem(
      overlayContentId,
      hsConfig,
    );
    let overlayStartImg = overlayContentElem.down('img.highslide-image');
    if (!overlayStartImg) {
      overlayStartImg = new Element('img', {
        class: 'highslide-image',
      });
      overlayContentElem.insert(overlayStartImg);
    }
    return overlayStartImg;
  };

  const celanimOverlay_getOrCreateContentElem = (
    overlayContentId,
    hsConfig,
  ) => {
    let overlayContentElem = $(overlayContentId);
    if (!overlayContentElem) {
      overlayContentElem = new Element('div', {
        id: overlayContentId,
      })
        .setStyle({
          width: hsConfig.get('width') + 'px',
          height: hsConfig.get('height') + 'px',
        })
        .hide();
      $(document.body).insert(overlayContentElem);
    }
    return overlayContentElem;
  };

  document.addEventListener('DOMContentLoaded', loadOverlaySlide);
})(window);
