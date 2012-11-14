/**
 * $Id: editor_plugin_src.js 677 2008-03-07 13:52:41Z spocke $
 *
 * @author synventis
 * @copyright Copyright © 2010 synventis
 */

(function() {
  // Load plugin specific language pack
  tinymce.PluginManager.requireLangPack('celimage');

  tinymce.create('tinymce.plugins.CelementsImagePlugin', {
    init : function(ed, url) {
      // Register commands
      ed.addCommand('mceCelImage', function() {
        // Internal image object like a flash placeholder
        if (ed.dom.getAttrib(ed.selection.getNode(), 'class').indexOf('mceItem') != -1)
          return;

        ed.windowManager.open({
          file : url + '/image.htm',
          width : 630 + parseInt(ed.getLang('celimage.delta_width', 0)),
          height : 590 + parseInt(ed.getLang('celimage.delta_height', 0)),
          inline : 1
        }, {
          plugin_url : url
        });
      });

      // Register buttons
      ed.addButton('image', {
        title : 'celimage.image_desc',
        cmd : 'mceCelImage'
      });
      
      // Register observers
      ed.onNodeChange.add(this.checkResizeEnd.bind(this));
      ed.origData = new Hash();
      ed.lastSize = new Hash();
    },

    /**
     * Fix gecko resize handles glitch
     */
    fixGeckoHandles : function(ed) {
        ed.execCommand('mceRepaint', false);
    },

    getOrigDimensionsForImg : function(ed, imgSrc, callbackFN) {
      var imageFullName = this._getImageFullName(imgSrc);
      if (!ed.origData.get(imageFullName)) {
        this.loadOrigDimensionsAsync(ed, imageFullName, callbackFN);
      } else {
        var origDim = ed.origData.get(imageFullName);
        if (callbackFN) {
          callbackFN(imageFullName, origDim, origDim);
        }
      }
    },

    loadOrigDimensionsAsync : function(ed, imageFullName, callbackFN) {
      if (imageFullName && (imageFullName != '')) {
        new Ajax.Request(getCelHost(), {
          method: 'post',
          parameters: {
             'xpage' : 'celements_ajax',
             'ajax_mode' : 'GetImageDimensions',
             'imageFullName' : imageFullName
          },
          onSuccess: function(transport) {
            if (transport.responseText.isJSON()) {
              var resp = transport.responseText.evalJSON();
              if (resp.width && resp.height) {
                ed.origData.set(imageFullName, resp);
                if (callbackFN) {
                  callbackFN(imageFullName, resp);
                }
              } else if ((typeof console != 'undefined')
                  && (typeof console.warn != 'undefined')) {
                console.warn('loadOrigDimensionsAsync: failed!!! ', transport.responseText);
              }
            } else if ((typeof console != 'undefined')
                && (typeof console.warn != 'undefined')) {
              console.warn('loadOrigDimensionsAsync: noJSON!!! ', transport.responseText);
            }
          },
          onFailure : function(transport) {
            if ((typeof console != 'undefined')
                && (typeof console.warn != 'undefined')) {
              console.warn('loadOrigDimensionsAsync: failed to execute request: ',
                  transport.status, transport.statusText);
            }
          }
        });
      } else {
        if ((typeof console != 'undefined')
            && (typeof console.warn != 'undefined')) {
          console.warn('loadOrigDimensionsAsync: skip request because imageFullName '
              + 'is empty!!');
        }
      }
    },

    _resizeHappend : function(ed, e) {
      var lastDim = ed.lastSize.get(this._getImageFullName(e.src));
      return lastDim && ((lastDim.width != e.width) || (lastDim.height != e.height));
    },

    _reduceDimensionToMaxSize : function(origDim, newDim) {
      if (newDim.height > origDim.height) {
        newDim.height = origDim.height;
      }
      if (newDim.width > origDim.width) {
        newDim.width= origDim.width;
      }
      return newDim;
    },

    _getImageFullName : function(imageUrl) {
      return imageUrl.replace(/.*\/download\/([^\/]+)\/([^\/]+)\/([^\?]+).*/, '$1.$2;$3');
    },

    _fixAspectRatio : function(ed, imageFullName, newDim) {
      var origDim = ed.origData.get(imageFullName);
      var lastDim = ed.lastSize.get(imageFullName);
      var adjustedHeight = (Math.abs(newDim.width - lastDim.width
          ) < Math.abs(newDim.height - lastDim.height));
      if (adjustedHeight) {
        var tp = (parseInt(newDim.height) / parseInt(origDim.height)) * origDim.width;
        newDim.width = tp.toFixed(0);
      } else {
        var tp = (parseInt(newDim.width) / parseInt(origDim.width)) * origDim.height;
        newDim.height = tp.toFixed(0);
      }
      return newDim;
    },

    checkResizeEnd : function(ed, cm, e) {
      if (e.nodeName != 'IMG')
        return;
      var imageFullName = this._getImageFullName(e.src);
      if (!ed.origData.get(imageFullName)) {
        var cropW = parseInt(e.src.replace(/((^|(.*[\?&]))cropW=(\d*)\D?.*)|.*/g, '$4'));
        if(!cropW || (typeof(cropW) == 'undefined') || (cropW <= 0)) {
          cropW = null;
        }
        var cropH = parseInt(e.src.replace(/((^|(.*[\?&]))cropH=(\d*)\D?.*)|.*/g, '$4'));
        if(!cropH || (typeof(cropH) == 'undefined') || (cropH <= 0)) {
          cropH = null;
        }
        if (cropW && (cropW > 0) && cropH && (cropH > 0)) {
          ed.origData.set(imageFullName, { 'width' : cropW , 'height' : cropH});
        } else {
          this.loadOrigDimensionsAsync(ed, imageFullName);
        }
        ed.lastSize.set(imageFullName, {width : e.width, height : e.height });
      } else if (this._resizeHappend(ed, e)) {
        var origDim = ed.origData.get(imageFullName);
        var newDim = this._reduceDimensionToMaxSize(origDim, { width : e.width,
          height : e.height});
        var newDim = this._fixAspectRatio(ed, imageFullName, newDim);
        var needsForceContraint = ((newDim.width != e.width) || (newDim.height != e.height)
            || (newDim.width == origDim.width) || (newDim.height == origDim.height));
        if (needsForceContraint) {
          ed.dom.setAttribs(e, {
            src : this.addAutoResizeToURL(e.src, newDim.width, newDim.height),
            width : newDim.width,
            height : newDim.height
          });
          ed.lastSize.set(imageFullName, {width : newDim.width, height : newDim.height });
          if (needsForceContraint && tinymce.isGecko)
            this.fixGeckoHandles(ed);
        }
      }
    },
    
    addAutoResizeToURL : function(src, width, height) {
      var newSrc = src.replace(/(.*\?.*)(&celwidth=\d*|celwidth=\d*&)(\D?.*)/g, '$1$3');
      newSrc = newSrc.replace(/(.*\?.*)(&celheight=\d*|celheight=\d*&)(\D?.*)/g, '$1$3');
      if(newSrc.indexOf('?') < 0) {
        newSrc += '?';
      } else if(!newSrc.endsWith('&')) {
        newSrc += '&';
      }
      newSrc += 'celwidth=' + width + '&celheight=' + height;
      return newSrc;
    },

    getInfo : function() {
      return {
        longname : 'Celements image',
        author : 'synventis',
        authorurl : 'http://www.synventis.ch',
        infourl : 'http://www.celements.ch',
        version : tinymce.majorVersion + "." + tinymce.minorVersion
      };
    }
  });

  // Register plugin
  tinymce.PluginManager.add('celimage', tinymce.plugins.CelementsImagePlugin);
})();