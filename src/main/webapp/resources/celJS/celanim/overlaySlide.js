YAHOO.util.Event.onDOMReady(function() {
  loadOverlaySlide();
});

var loadOverlaySlide = function() {
  $$('a.celanim_overlay').each(function(elem) {
    celanimOverlay_addOpenConfig(elem.id, {
      'src' : elem.href,
      'objectType' : 'iframe',
      'celanimOverlayType' : 'htmlExpand',
      'cssClassNames' : ['draggable-header']
    });
  });
  $$('img.celanim_overlay').each(function(elem) {
    var imgOverlayDim = celanimOverlay_getDimensionsFromElem(elem);
    if (imgOverlayDim.height && imgOverlayDim.width) {
      var imgOverlaySrc = elem.src.replace(/\?.*/, '') + '?celheight='
          + imgOverlayDim.height + '&celwidth=' + imgOverlayDim.width;
      celanimOverlay_addOpenConfig(elem.id, {
          'src' : imgOverlaySrc,
          'addCloseButton' : $(elem.id).hasClassName('celanim_overlay_addCloseButton'),
          'cssClassNames' : ['borderless', 'floating-caption']
        });
    }
  });
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
      celanimOverlay_addCloseButton(openConfigObj);
      $(elemId).setStyle({
        'cursor' : "url(/file/resources/celJS/highslide/graphics/zoomin.cur), pointer"
      });
      $(elemId).observe('click', celanimOverlay_OpenInOverlay);
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

var celanimOverlay_OpenInOverlay = function(event) {
  var openConfig = celanimOverlay_openConfig.get(this.id);
  if (openConfig) {
    var hsConfig = $H({
        dimmingOpacity: 0.75,
        dragByHeading : false,
        objectHeight: openConfig.height, //important for IE!!!
        align : 'center',
        preserveContent : false
      }).merge(openConfig);
      hs.graphicsDir = '/file/resources/celJS/highslide/graphics/';
      hs.outlineType = hsConfig.outlineType || '';
      hs.wrapperClassName = 'no-footer no-move celanim_overlay_wrapper '
        + openConfig.cssClassNames.join(' ');
      if (hsConfig.celanimOverlayType == 'htmlExpand') {
        hs.htmlExpand(this, hsConfig.toObject());
      } else {
        hs.expand(this, hsConfig.toObject());
      }
      event.stop();
  } else {
    if ((typeof console != 'undefined') && (typeof console.warn != 'undefined')) {
      console.warn('Skipping open-in-overlay event, because no open config for elemId"'
          + this.id + '" found.');
    }
  }
};

var celanimOverlay_addCloseButton = function(openConfig) {
  if (openConfig && openConfig.addCloseButton) {
    // The simple semitransparent close button overlay
    hs.registerOverlay({
      thumbnailId: openConfig.id,
      html: '<div class="closebutton" onclick="return hs.close(this)" title="Close"></div>',
      position: 'top right',
      fade: 2 // fading the semi-transparent overlay looks bad in IE
    });
  }
};
