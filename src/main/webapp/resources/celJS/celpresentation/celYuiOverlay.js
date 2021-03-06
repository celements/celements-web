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

 * Don't use setBody("...") on overlay dialog, instead set content of 
 * div with id="yuiOverlayContainer".
 */

(function(window, undefined) {
  "use strict";

  if (typeof window.CELEMENTS == "undefined") { window.CELEMENTS = {}; }
  if (typeof window.CELEMENTS.presentation === "undefined") { window.CELEMENTS.presentation = {}; }

  //////////////////////////////////////////////////////////////////////////////
  // Celements presentation overlay class
  //////////////////////////////////////////////////////////////////////////////
  window.CELEMENTS.presentation.Overlay = function (configObj) {
    // constructor
    configObj = configObj || {};
    this._init(configObj);
  };

  var cpoInstance = null;

  window.CELEMENTS.presentation.getOverlayObj = function (configObj) {
    if (!cpoInstance) {
      cpoInstance = new CELEMENTS.presentation.Overlay(configObj);
    } else {
      configObj = configObj || {};
      cpoInstance.updateOpenConfig(configObj);
    }
    return cpoInstance;
  };

  window.CELEMENTS.presentation.Overlay.prototype = {
    _overlayDialog: undefined,
    _defaultConfig: undefined,
    _dialogConfig: undefined,
    _bindOpenHandler: undefined,
    _bindCleanUpAfterClose: undefined,
    _centerBind: undefined,
    _closeBind: undefined,
    _confirmYesHandlerBind: undefined,

    _init: function (configObj) {
      var _me = this;
      configObj = configObj || {};
      _me._defaultConfig = _me._getDefaultConfig();
      _me.updateOpenConfig(configObj);
      _me._bindOpenHandler = _me._openHandler.bind(_me);
      _me._bindCleanUpAfterClose = _me._cleanUpAfterClose.bind(_me);
      _me._centerBind = _me.center.bind(_me);
      _me._closeBind = _me.close.bind(_me);
      _me._confirmYesHandlerBind = _me._confirmYesHandler.bind(_me);
    },

    _getDefaultConfig: function () {
      return {
        'dialogId': 'modal dialog',
        'containerId': 'yuiOverlayContainer',
        'additionalCssClass': '',
        'width': '300px',
        'height': 'auto',
        'fixedcenter': true,
        'visible': false,
        'draggable': false,
        'close': false,
        'zindex': 101,
        'modal': true,
        'monitorresize': false,
        'suppressDimFromId': false,
        //          icon: YAHOO.widget.SimpleDialog.ICON_HELP, 
        'icon': null,
        'constraintoviewport': true
      };
    },

    getContainerId: function () {
      var _me = this;
      return _me._dialogConfig.containerId || _me._defaultConfig.containerId;
    },

    getDialogId: function () {
      var _me = this;
      return _me._dialogConfig.dialogId || _me._defaultConfig.dialogId;
    },

    getWidth: function () {
      var _me = this;
      return _me._dialogConfig.width || _me._defaultConfig.width;
    },

    getSuppressDimFromId: function () {
      var _me = this;
      if (typeof _me._dialogConfig.suppressDimFromId !== 'undefined') {
        return _me._dialogConfig.suppressDimFromId;
      }
      return _me._defaultConfig.suppressDimFromId;
    },

    getHeight: function () {
      var _me = this;
      return _me._dialogConfig.height || _me._defaultConfig.height;
    },

    _cleanUpAfterClose: function () {
      var _me = this;
      var bodyElem = $$('body')[0];
      bodyElem.setStyle({ 'overflow': 'auto' });
      var closeEvent = bodyElem.fire('cel_yuiOverlay:hideEvent', _me);
      if (!closeEvent.stopped) {
        if ($(_me._dialogConfig.dialogId)) {
          var dialogWrapper = $(_me._dialogConfig.dialogId).up('div.cel-YuiOverlay');
          if (dialogWrapper) {
            dialogWrapper.remove();
          };
        }
      }
      if ($(_me._dialogConfig.dialogId + '_mask')) {
        $(_me._dialogConfig.dialogId + '_mask').remove();
      }
      _me._overlayDialog = null;
    },

    center: function () {
      var _me = this;
      if (_me._overlayDialog) {
        _me._overlayDialog.center();
      }
    },

    getOverlayDialog: function (openConfig) {
      var _me = this;
      _me.updateOpenConfig(openConfig);
      console.log('celYuiOverlay: getOverlayDialog ', _me._dialogConfig);
      if (!_me._overlayDialog) {
        _me._overlayDialog = new YAHOO.widget.SimpleDialog(_me._dialogConfig.dialogId,
          _me._dialogConfig);
        _me._overlayDialog.hideEvent.subscribe(_me._bindCleanUpAfterClose);
      } else {
        _me._overlayDialog.cfg.setProperty('width', _me._dialogConfig.width);
      }
      var dialogHeight = '';
      if ((_me._dialogConfig.height != undefined) && (_me._dialogConfig.height != '')) {
        dialogHeight = 'style="height: ' + _me._dialogConfig.height
          + '; position: relative;"';
      }
      _me._overlayDialog.setHeader('&nbsp;');
      _me._overlayDialog.setBody('<div id="' + _me._dialogConfig.containerId + '"'
        + dialogHeight
        + '><img style="display:block; margin-left: auto; margin-right:auto;'
        + ' position: relative; top: 48%; height:32px; width:32px;"'
        + ' height="32" width="32px"'
        + ' src="' + window.CELEMENTS.getUtils().getPathPrefix()
        + '/file/resources/celRes/ajax-loader.gif" /></div>');
      //add skin-div to get default yui-skin-sam layouting for the dialog
      var yuiSamSkinDiv = new Element('div'
      ).addClassName('yui-skin-sam'
      ).addClassName('cel-YuiOverlay');
      if (_me._dialogConfig.additionalCssClass
        && (_me._dialogConfig.additionalCssClass != '')) {
        yuiSamSkinDiv.addClassName(_me._dialogConfig.additionalCssClass);
      }
      $(document.body).insert(yuiSamSkinDiv);
      _me._overlayDialog.render(yuiSamSkinDiv);
      if (_me._dialogConfig.fixedcenter) {
        $(_me._dialogConfig.containerId).stopObserving('cel_yuiOverlay:contentChanged',
          _me._centerBind);
        $(_me._dialogConfig.containerId).observe('cel_yuiOverlay:contentChanged',
          _me._centerBind);
      }
      $(document.body).fire('cel_yuiOverlay:afterRenderDialog', _me);
      _me.celFire('cel-yuiOverlay:afterRenderDialog', _me);
      return _me._overlayDialog;
    },

    updateOpenConfig: function (configObj) {
      var _me = this;
      configObj = configObj || {};
      _me._dialogConfig = $H(_me._defaultConfig).merge(_me._dialogConfig
      ).merge(configObj).toObject();
    },

    open: function () {
      var _me = this;
      var dialog = _me.getOverlayDialog();
      dialog.render();
      _me.show();
      _me._addCSSclassesToMask();
      var bodyElem = $$('body')[0];
      if (_me._dialogConfig.modal) {
        bodyElem.setStyle({ 'overflow': 'hidden' });
      }
      bodyElem.fire('cel_yuiOverlay:afterShowDialog_General', _me);
      $(_me._dialogConfig.containerId).fire('cel_yuiOverlay:afterShowDialog', _me);
      _me.celFire('cel-yuiOverlay:afterShowDialog', _me);
    },

    close: function () {
      var _me = this;
      var dialog = _me.getOverlayDialog();
      dialog.hide();
      //destroy to prevent problems after following orientation changes on iPhone/iPad
      dialog.destroy();
    },

    show: function () {
      var _me = this;
      _me._overlayDialog.show();
      //DIRTY HACK!!!
      //for some reasons the zIndex does not correctly get applied by yui, thus
      //we need to force it here
      $(_me._overlayDialog.element).setStyle({
        'zIndex': _me._dialogConfig.zindex
      });
    },

    showConfirmDialog: function (openConfig) {
      var _me = this;
      openConfig = openConfig || _me._dialogConfig;
      console.log('showConfirmDialog: ', openConfig);
      var dialog = _me.getOverlayDialog(openConfig);
      var dialogHeight = '';
      if ((_me._dialogConfig.height != undefined) && (_me._dialogConfig.height != '')) {
        dialogHeight = 'style="height: ' + _me._dialogConfig.height
          + '; position: relative;"';
      }
      dialog.setHeader("Confirmation"); //TODO get from celMessage
      _me._overlayDialog.setBody('<div id="' + _me._dialogConfig.containerId + '"'
        + dialogHeight
        + '><p>' + _me._dialogConfig.confirmMsg + '</p></div>');
      dialog.cfg.setProperty("icon", YAHOO.widget.SimpleDialog.ICON_WARN);
      dialog.cfg.queueProperty("buttons", [
        {
          text: _me._dialogConfig.confirmBtn,
          handler: _me._confirmYesHandlerBind.curry(_me._dialogConfig), isDefault: true
        },
        { text: _me._dialogConfig.cancelBtn, handler: _me._closeBind }]);
      dialog.cfg.setProperty("close", false);
      dialog.render();
      _me.show();
      _me._addCSSclassesToMask();
    },

    _confirmYesHandler: function (openConfig) {
      var _me = this;
      console.debug('_confirmYesHandler: start', openConfig);
      var confirmYesEvent = $(document.body).fire('cel_yuiOverlay:confirmYes', openConfig);
      if (!confirmYesEvent.stopped) {
        _me._internalOpenCelPageInOverlay();
      } else {
        console.log('_confirmYesHandler skipping _internalOpenCelPageInOverlay.');
      }
    },

    showProgressDialog: function (headerText) {
      var _me = this;
      var dialog = _me.getOverlayDialog();
      dialog.setHeader(headerText);
      dialog.setBody('<img style="margin-left: auto; margin-right:auto;"'
        + ' src="' + window.CELEMENTS.getUtils().getPathPrefix()
        + '/file/resources/celRes/ajax-loader-small.gif" />');
      dialog.cfg.queueProperty("buttons", null);
      dialog.cfg.setProperty("close", false);
      dialog.render();
      _me.show();
      _me._addCSSclassesToMask();
    },

    _addCSSclassesToMask: function () {
      var _me = this;
      if ($(_me._dialogConfig.dialogId + '_mask')) {
        $(_me._dialogConfig.dialogId + '_mask').addClassName('cel-YuiOverlay');
        if (_me._dialogConfig.additionalCssClass
          && (_me._dialogConfig.additionalCssClass != '')) {
          $(_me._dialogConfig.dialogId + '_mask').addClassName(
            _me._dialogConfig.additionalCssClass);
        }
      }
    },

    _internalOpenCelPageInOverlay: function (openConfig) {
      var _me = this;
      openConfig = openConfig || _me._dialogConfig;
      console.debug('_internalOpenCelPageInOverlay: ', openConfig);
      var openDialogEvent = $(document.body).fire('cel_yuiOverlay:openDialog', openConfig);
      if (!openDialogEvent.stopped) {
        _me._defaultOpenDialog(openConfig);
      } else {
        console.log('_internalOpenCelPageInOverlay skipping defaultOpenDialog.');
      }
    },

    openCelPageInOverlay: function (openConfig) {
      var _me = this;
      if (typeof openConfig === 'string') {
        openConfig = {
          'overlayURL': openConfig
        };
      }
      openConfig = openConfig || _me._dialogConfig;
      if (openConfig.overlayURL != '') {
        if (openConfig.confirmMsg && openConfig.confirmMsg != '') {
          _me.showConfirmDialog(openConfig);
        } else {
          _me._internalOpenCelPageInOverlay(openConfig);
        }
      } else {
        console.error('Calling overlay without overlayURL!');
      }
    },

    _openHandler: function (link, event) {
      var _me = this;
      event.stop();
      try {
        var attrOpenConfig = _me._getDatasetValue(link, 'celOverlayConfig')
          || link.getAttribute("data-cel-overlay-config");
        if (attrOpenConfig && attrOpenConfig.isJSON()) {
          _me.updateOpenConfig(attrOpenConfig.evalJSON());
        }
      } catch (exp) {
        console.error('failed to parse overlay config in data attribute.', exp);
      }
      var openConfig = {
        'link': link,
        'overlayURL': _me._getDatasetValue(link, 'celOverlayLink')
          || link.getAttribute("data-cel-overlay-link") || link.href,
        'confirmMsg': _me._getDatasetValue(link, 'celOverlayConfirmMessage')
          || link.getAttribute("data-cel-overlay-confirm-message"),
        'confirmBtn': _me._getDatasetValue(link, 'celOverlayConfirmButton')
          || link.getAttribute("data-cel-overlay-confirm-button") || "OK",
        'cancelBtn': _me._getDatasetValue(link, 'celOverlayCancelButton')
          || link.getAttribute("data-cel-overlay-cancel-button") || "Cancel"
      };
      // allow 'configProvider' listener to change the openConfig object
      $(document.body).fire('cel_yuiOverlay:configProvider', openConfig);
      _me.updateOpenConfig(openConfig);
      _me.intermediatOpenHandler();
    },

    _getDatasetValue: function (domElem, dataFieldName) {
      var _me = this;
      if (domElem.dataset && domElem.dataset[dataFieldName]) {
        return domElem.dataset[dataFieldName];
      }
      return undefined;
    },

    intermediatOpenHandler: function (openConfig) {
      var _me = this;
      openConfig = openConfig || _me._dialogConfig;
      if (!_me.getSuppressDimFromId()) {
        var link = openConfig.link;
        var width = parseInt(link.id.split(':')[4]) + 5;
        var height = link.id.split(':')[5];
        if (!isNaN(width)) {
          openConfig['width'] = width + 'px';
        }
        if (!isNaN(height)) {
          openConfig['height'] = height + 'px';
        }
      }
      _me.openCelPageInOverlay(openConfig);
    },

    registerOpenHandler: function (openCssSelector) {
      var _me = this;
      openCssSelector = openCssSelector || '.cel_yuiOverlay';
      $$(openCssSelector).each(function (elem) {
        elem.stopObserving('click', _me._bindOpenHandler.curry(elem));
        elem.observe('click', _me._bindOpenHandler.curry(elem));
      });
    },

    _loadFirstContent: function () {
      var _me = this;
      _me._dialogConfig.contentChanged = true;
      var loadContentEvent = $(_me._dialogConfig.containerId).fire(
        'cel_yuiOverlay:loadFirstContent', _me._dialogConfig);
      if (!loadContentEvent.stopped) {
        var params = {
          'xpage': 'celements_ajax',
          'ajax_mode': 'pageTypeWithLayout',
          'ajax': '1'
        };
        if (_me._dialogConfig.overlayLayout) {
          params['overwriteLayout'] = _me._dialogConfig.overlayLayout;
        }
        new Ajax.Request(_me._dialogConfig.overlayURL, {
          method: 'post',
          parameters: params,
          onSuccess: function (transport) {
            var yuiOverlayContainer = $(_me._dialogConfig.containerId);
            yuiOverlayContainer.update(transport.responseText);
            yuiOverlayContainer.fire('cel_yuiOverlay:contentChanged');
          }
        });
      } else if (_me._dialogConfig.contentChanged) {
        var yuiOverlayContainer = $(_me._dialogConfig.containerId);
        yuiOverlayContainer.fire('cel_yuiOverlay:contentChanged');
      }
    },

    _defaultOpenDialog: function (openConfig) {
      var _me = this;
      _me.updateOpenConfig(openConfig);
      _me.open();
      _me._loadFirstContent();
    }

  };
  CELEMENTS.presentation.Overlay.prototype = Object.extend(CELEMENTS.presentation.Overlay.prototype,
    CELEMENTS.mixins.Observable);

}) (window);

