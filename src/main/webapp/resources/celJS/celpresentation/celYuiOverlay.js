/**
 * Celements presentation overlay class
 * This class allows to simply show an overlay using the YUI simple dialog.
 * 
 * usage: include before this js-file the following required components
css files for media="screen"
:celJS/yui/container/assets/skins/sam/container.css
:celJS/yui/button/assets/skins/sam/button.css
external js-files
:celJS/yui/yahoo/yahoo-min.js
:celJS/yui/dom/dom-min.js
:celJS/yui/event/event-min.js
:celJS/yui/element/element-min.js
:celJS/yui/button/button-min.js
:celJS/yui/container/container-min.js
 */
if(typeof CELEMENTS=="undefined"){var CELEMENTS={};};
if(typeof CELEMENTS.presentation=="undefined"){CELEMENTS.presentation={};};

(function() {

//////////////////////////////////////////////////////////////////////////////
// Celements presentation overlay class
//////////////////////////////////////////////////////////////////////////////
  CELEMENTS.presentation.Overlay = function(configObj) {
  // constructor
  configObj = configObj || {};
  this._init(configObj);
};

var cpoInstance = null;

CELEMENTS.presentation.getOverlayObj = function() {
  if (!cpoInstance) {
    cpoInstance = new CELEMENTS.presentation.Overlay();
  }
  return cpoInstance;
};

(function() {
  var CPO = CELEMENTS.presentation.Overlay;

  CELEMENTS.presentation.Overlay.prototype = {
      _overlayDialog : null,
      _defaultConfig : {
        "width" : "300px", 
        fixedcenter: true, 
        visible: false, 
        draggable: false, 
        close: false, 
        zindex: 4, 
        modal:true,
        monitorresize:false,
        icon: YAHOO.widget.SimpleDialog.ICON_HELP, 
        constraintoviewport: true
      },
      _dialogConfig : undefined,

      _init : function(configObj) {
        var _me = this;
        _me._dialogConfig = $H(_me._defaultConfig).merge(configObj).toObject(); 
      },

      getOverlayDialog : function(width) {
        var _me = this;
        var dialogWidth = width || "300px";
        if(!_me.__overlayDialog) {
          _me._dialogConfig.width = dialogWidth;
          _me._overlayDialog = new YAHOO.widget.SimpleDialog("modal dialog",
              _me._dialogConfig);
          _me._overlayDialog.hideEvent.subscribe(function() {
            var bodyElem = $$('body')[0];
            bodyElem.setStyle({ 'overflow' : 'auto' });
            bodyElem.fire('cel_yuiOverlay:hideEvent');
          });
        } else {
          _me._overlayDialog.cfg.setProperty('width', dialogWidth);
        }
        //add skin-div to get default yui-skin-sam layouting for the dialog
        var yuiSamSkinDiv = new Element('div'
          ).addClassName('yui-skin-sam'
          ).addClassName('cel-YuiOverlay');
        $(document.body).insert(yuiSamSkinDiv);
        _me._overlayDialog.render(yuiSamSkinDiv);
        _me._overlayDialog.setBody('<img style="margin-left: auto; margin-right:auto;"'
            + ' src="/skin/resources/celRes/ajax-loader.gif" />');
        $(document.body).fire('cel_yuiOverlay:afterRenderDialog');
        return _me._overlayDialog;
      },

      showProgressDialog : function(headerText) {
        var _me = this;
        var dialog = _me.getOverlayDialog();
        dialog.setHeader(headerText); 
        dialog.setBody('<img style="margin-left: auto; margin-right:auto;"'
           + ' src="/skin/resources/celRes/ajax-loader-small.gif" />'); 
        dialog.cfg.queueProperty("buttons", null);
        dialog.cfg.setProperty("close", false);
        dialog.render();
        dialog.show();
        $(document.body).down('div.mask').addClassName('cel-YuiOverlay');
      }

      //TODO add methods for presentation overlay with navigation

  };
})();

})();

