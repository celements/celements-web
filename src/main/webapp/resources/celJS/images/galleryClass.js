/*
*
* The celements javascript gallery framework
**/
if(typeof CELEMENTS=="undefined"){var CELEMENTS={};};
if(typeof CELEMENTS.images=="undefined"){CELEMENTS.images={};};

(function() {

CELEMENTS.images.Gallery = function(galleryDocRef, callbackFN) {
  // constructor
  this._init(galleryDocRef, callbackFN);
};

var CiG = CELEMENTS.images.Gallery;

CiG.prototype = {
    _collDocRef : undefined,
    _galleryData : undefined,

  _init : function(collDocRef) {
    var _me = this;
    _me._collDocRef = collDocRef;
    _me._loadData(callbackFN);
  },

  _getGalleryURL : function() {
    var _me = this;
    var colDocRefSplit = _me._collDocRef.split('.');
    var port = '';
    if (window.location.port != '80') {
      port = window.location.port;
    }
    return window.location.protocol + '//' + window.location.host + '/'
      + colDocRefSplit[0] + '/' + colDocRefSplit[1];
  },

  _loadData : function(callbackFN) {
    var _me = this;
    new Ajax.Request(_me._getGalleryURL(), {
      method : "POST",
      parameters: {
        'xpage' : 'celements_ajax',
        'ajax_mode' : 'GalleryData'
      },
      onSuccess : function(transport) {
        if (transport.responseText.isJSON()) {
          var responseObject = transport.responseText.evalJSON();
          _me._galleryData = responseObject;
          if (callbackFN) {
            callbackFN();
          }
        } else if ((typeof console != 'undefined')
            && (typeof console.error != 'undefined')) {
          console.error('noJSON!!! ', transport.responseText);
        }
      }
    });
  },

  getImages : function() {
    var _me = this;
    if (_me._galleryData) {
      return _me._galleryData.imageArray;
    }
    return undefined;
  },

  getTitle : function() {
    var _me = this;
    if (_me._galleryData) {
      return _me._galleryData.title;
    }
    return undefined;
  },

  getDesc : function() {
    var _me = this;
    if (_me._galleryData) {
      return _me._galleryData.desc;
    }
    return undefined;
  },

  hasOverview : function() {
    var _me = this;
    if (_me._galleryData) {
      return _me._galleryData.hasOverview;
    }
    return undefined;
  },

  getTheme : function() {
    var _me = this;
    if (_me._galleryData) {
      return _me._galleryData.theme;
    }
    return undefined;
  },

  getThumbDimension : function() {
    var _me = this;
    if (_me._galleryData) {
      return {
        'width' : _me._galleryData.thumbWidth,
        'height' : _me._galleryData.thumbHeight
      };
    }
    return undefined;
  },

  getDimension : function() {
    var _me = this;
    if (_me._galleryData) {
      return {
        'width' : _me._galleryData.width,
        'height' : _me._galleryData.height
      };
    }
    return undefined;
  }

};

})();
