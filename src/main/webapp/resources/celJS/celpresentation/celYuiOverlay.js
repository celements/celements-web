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

CELEMENTS.presentation.getOverlayObj = function(configObj) {
  if (!cpoInstance) {
    cpoInstance = new CELEMENTS.presentation.Overlay(configObj);
  } else {
    configObj = configObj || {};
    cpoInstance.updateOpenConfig(configObj);
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
        zindex: 101, 
        modal:true,
        monitorresize:false,
//        icon: YAHOO.widget.SimpleDialog.ICON_HELP, 
        icon: null, 
        constraintoviewport: true
      },
      _dialogConfig : undefined,
      _bindOpenHandler : undefined,

      _init : function(configObj) {
        var _me = this;
        configObj = configObj || {};
        _me.updateOpenConfig(configObj);
        _me._bindOpenHandler = _me._openHandler.bind(_me);
      },

      getWidth : function() {
        return _me._dialogConfig.width || _me._defaultConfig.width;
      },

      getHeight : function() {
        return _me._dialogConfig.height || _me._defaultConfig.height;
      },

      getOverlayDialog : function(openConfig) {
        var _me = this;
        _me.updateOpenConfig(openConfig);
        if(!_me.__overlayDialog) {
          _me._overlayDialog = new YAHOO.widget.SimpleDialog("modal dialog",
              _me._dialogConfig);
          _me._overlayDialog.hideEvent.subscribe(function() {
            var bodyElem = $$('body')[0];
            bodyElem.setStyle({ 'overflow' : 'auto' });
            bodyElem.fire('cel_yuiOverlay:hideEvent');
          });
        } else {
          _me._overlayDialog.cfg.setProperty('width', _me._dialogConfig.width);
        }
        var dialogHeight = '';
        if ((_me._dialogConfig.height != undefined) && (_me._dialogConfig.height != '')) {
          dialogHeight = 'style="height:' + _me._dialogConfig.height + ";'";
        }
        _me._overlayDialog.setHeader('&nbsp;'); 
        _me._overlayDialog.setBody('<div id="yuiOverlayContainer"' + dialogHeight
            + '><img style="display:block; margin-left: auto; margin-right:auto;"'
            + ' src="/file/resources/celRes/ajax-loader.gif" /></div>'); 
        //add skin-div to get default yui-skin-sam layouting for the dialog
        var yuiSamSkinDiv = new Element('div'
          ).addClassName('yui-skin-sam'
          ).addClassName('cel-YuiOverlay');
        $(document.body).insert(yuiSamSkinDiv);
        _me._overlayDialog.render(yuiSamSkinDiv);
        $(document.body).fire('cel_yuiOverlay:afterRenderDialog');
        return _me._overlayDialog;
      },

      updateOpenConfig : function(configObj) {
        var _me = this;
        _me._dialogConfig = $H(_me._defaultConfig).merge(configObj).toObject();
      },

      open: function() {
        var _me = this;
        var dialog = _me.getOverlayDialog();
        dialog.render();
        dialog.show();
        $(document.body).down('div.mask').addClassName('cel-YuiOverlay');
        var bodyElem = $$('body')[0];
        bodyElem.setStyle({ 'overflow' : 'hidden' });
        bodyElem.fire('cel_yuiOverlay:afterShowDialog_General');
        $('yuiOverlayContainer').fire('cel_yuiOverlay:afterShowDialog');
      },

      close: function() {
        var _me = this;
        var dialog = _me.getOverlayDialog();
        dialog.hide;
        //destroy to prevent problems after following orientation changes on iPhone/iPad
        dialog.destroy();
        if ($('modal dialog_mask')) {
          $('modal dialog_mask').remove();
        }
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
      },

      openCelPageInOverlay : function(openConfig) {
        var _me = this;
        if (typeof openConfig === 'string') {
          openConfig = {
            'overlayURL' : openConfig  
          };
        }
        if (openConfig.overlayURL != '') {
          var openDialogEvent = $(document.body).fire('cel_yuiOverlay:openDialog',
              openConfig);
          if (!openDialogEvent.stopped) {
            _me._defaultOpenDialog(openConfig);
          }
        } else {
          if ((typeof console != 'undefined') && (typeof console.error != 'undefined')) {
            console.error('Calling overlay without overlayURL!');
          }
        }
      },

      _openHandler : function(event) {
        var _me = this;
        event.stop();
        var link = event.findElement();
        var width = parseInt(link.id.split(':')[4]) + 5;
        var height = link.id.split(':')[5];
        var overlayURL = link.href;
        var openConfig = {
            'link' : link,
            'overlayURL' : overlayURL,
            'width' : width + 'px',
            'height' : height + 'px'
          };
        _me.openCelPageInOverlay(openConfig);
      },

      registerOpenHandler : function(openCssSelector) {
        var _me = this;
        openCssSelector = openCssSelector || '.cel_yuiOverlay';
        $$(openCssSelector).each(function(elem){
          elem.stopObserving('click', _me._bindOpenHandler);
          elem.observe('click', _me._bindOpenHandler);
        });
      },

      _defaultOpenDialog : function(openConfig) {
        var _me = this;
        openConfig['width'] = openConfig.width || '720px';
        _me.updateOpenConfig(openConfig);
        var dialog = _me.open(openConfig);
        var bodyElem = $$('body')[0];
        bodyElem.setStyle({ 'overflow' : 'hidden' });
        bodyElem.fire('cel_yuiOverlay:afterShowDialog_General');
        $('yuiOverlayContainer').fire('cel_yuiOverlay:afterShowDialog');
        var loadContentEvent = $('yuiOverlayContainer').fire(
            'cel_yuiOverlay:loadFirstContent', openConfig);
        if (!loadContentEvent.stopped) {
          new Ajax.Request(openConfig.overlayURL, {
            method: 'post',
            parameters: {
              'xpage' : 'celements_ajax',
              'ajax_mode' : 'pageTypeWithLayout',
              'ajax' : '1'
            },
            onSuccess: function(transport) {
              var yuiOverlayContainer = $('yuiOverlayContainer');
              yuiOverlayContainer.update(transport.responseText);
              yuiOverlayContainer.fire('cel_yuiOverlay:contentChanged');
            }
          });
        }
      }

  };
})();

})();

