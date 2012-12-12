/**
 * Celements presentation overlay class
 * This class allows to simply show an overlay using the YUI simple dialog
 */
if(typeof CELEMENTS=="undefined"){var CELEMENTS={};};
if(typeof CELEMENTS.presentation=="undefined"){CELEMENTS.presentation={};};

(function() {

//////////////////////////////////////////////////////////////////////////////
// Celements presentation overlay class
//////////////////////////////////////////////////////////////////////////////
  CELEMENTS.presentation.Overlay = function() {
  // constructor
  this._init();
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
      overlayDialog : null,

      _init : function() {
        var _me = this;
      },

      getOverlayDialog : function(width) {
        var _me = this;
        var dialogWidth = width || "300px";
        if(!_me.overlayDialog) {
          _me.overlayDialog = new YAHOO.widget.SimpleDialog("modal dialog", {
            "width" : dialogWidth, 
            fixedcenter: true, 
            visible: false, 
            draggable: false, 
            close: true, 
            zindex:4, 
            modal:true,
            monitorresize:false,
            icon: YAHOO.widget.SimpleDialog.ICON_HELP, 
            constraintoviewport: true
          } );
          _me.overlayDialog.hideEvent.subscribe(function() {
            var bodyElem = $$('body')[0];
            bodyElem.setStyle({ 'overflow' : 'auto' });
            bodyElem.fire('cel_yuiOverlay:hideEvent');
          });
        } else {
          _me.overlayDialog.cfg.setProperty('width', dialogWidth);
        }
        //add skin-div to get default yui-skin-sam layouting for the dialog
        var yuiSamSkinDiv = new Element('div', {'class' : 'yui-skin-sam'});
        $(document.body).insert(yuiSamSkinDiv);
        _me.overlayDialog.render(yuiSamSkinDiv);
        _me.overlayDialog.setBody('<img style="margin-left: auto; margin-right:auto;"'
            + ' src="/skin/resources/celRes/ajax-loader.gif" />'); 
        $(document.body).fire('cel_yuiOverlay:afterRenderDialog');
        return _me.overlayDialog;
      },

      showProgressDialog : function(headerText) {
        var _me = this;
        var dialog = _me.getOverlayDialog();
        dialog.setHeader(headerText); 
        dialog.setBody('<img style="margin-left: auto; margin-right:auto;"'
           + ' src="/skin/resources/celRes/ajax-loader-small.gif" />'); 
        dialog.cfg.queueProperty("buttons", null);
        dialog.render();
        dialog.show();
      }

      //TODO add methods for presentation overlay with navigation

  };
})();

})();

