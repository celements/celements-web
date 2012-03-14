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
    _imagesArray : undefined,
    _imagesHash : undefined,

  _init : function(collDocRef, callbackFN) {
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
          _me._imagesArray = new Array();
          _me._imagesHash = new Hash();
          _me._galleryData.imageArray.each(function(imageObj) {
            var imageId = 'GI:' + _me._collDocRef + ':' + imageObj.filename;
            var image = new CELEMENTS.images.Image(imageObj, imageId);
            image.setThumbDimension(_me._galleryData.thumbWidth,
                _me._galleryData.thumbHeight);
            var index = _me._imagesArray.push(image);
            _me._imagesHash.set(imageId, index - 1);
          });
          if (callbackFN) {
            callbackFN(_me);
          }
        } else if ((typeof console != 'undefined')
            && (typeof console.error != 'undefined')) {
          console.error('noJSON!!! ', transport.responseText);
        }
      }
    });
  },

  getImageForId : function(imageId) {
    var _me = this;
    if (typeof _me._imagesHash.get(imageId) != 'undefined') {
      return _me._imagesArray[_me._imagesHash.get(imageId)];
    }
    return undefined;
  },

  getImages : function() {
    var _me = this;
    if (_me._imagesArray) {
      return _me._imagesArray;
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

(function() {

CELEMENTS.images.Image = function(imageData, id) {
  // constructor
  this._init(imageData, id);
};

var CiI = CELEMENTS.images.Image;

CiI.prototype = {
    _imageData : undefined,
    _thumbDim : undefined,
    _id : undefined,

  _init : function(imageData, id) {
    var _me = this;
    _me._imageData = imageData;
    _me._id = id;
  },

  getId : function() {
    var _me = this;
    return _me._id;
  },

  getThumbURL : function() {
    var _me = this;
    if (_me.getThumbDimension()) {
      return _me._getDimURL(_me.getThumbDimension());
    } else {
      return _me.getSrc();
    }
  },

  getURL : function(maxWidth, maxHeight) {
    var _me = this;
    if (maxWidth || maxHeight) {
      return _me._getDimURL({ 'height' : maxHeight , 'width' : maxWidth });
    } else {
      return _me.getSrc();
    }
  },

  _getDimURL : function(dimObj) {
    var _me = this;
    var height = dimObj.height || '';
    var width = dimObj.width || '';
    return (_me.getSrc() + "?celwidth=" + width + "&celheight=" + height);
  },

  getSrc : function() {
    var _me = this;
    return _me._imageData.src;
  },

  setThumbDimension : function(width, height) {
    var _me = this;
    _me._thumbDim = { 'width' : width, 'height' : height };
  },

  getThumbDimension : function() {
    var _me = this;
    if (_me._thumbDim) {
      return _me._thumbDim;
    }
    return undefined;
  },

  getDimension : function() {
    var _me = this;
    return {
      'width' : _me._imageData.width,
      'height' : _me._imageData.height
    };
  },

  getFilename : function() {
    var _me = this;
    return _me._imageData.filename;
  },

  getLastChangedBy : function() {
    var _me = this;
    return _me._imageData.lastChangedBy;
  },

  getMimeType : function() {
    var _me = this;
    return _me._imageData.mimeType;
  },

  getFileSize : function() {
    var _me = this;
    return _me._imageData.fileSize;
  },

  getVersion : function() {
    var _me = this;
    return _me._imageData.attversion;
  }

};

})();
