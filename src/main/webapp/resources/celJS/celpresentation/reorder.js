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

(function(window, undefined) {
  "use strict";

  if (typeof window.CELEMENTS === "undefined") { window.CELEMENTS = {}; }
  if (typeof window.CELEMENTS.presentation === "undefined") { window.CELEMENTS.presentation = {}; }
  if (typeof window.CELEMENTS.presentation.Reorder === "undefined") {
    window.CELEMENTS.presentation.Reorder = Class.create({
      _startReorderModeBind: undefined,
      _cancelNavReorderHandlerBind: undefined,
      _saveNavReorderHandlerBind: undefined,
      _registerReorderBind: undefined,
      _initReorderBind: undefined,
      _reorderObj: undefined,
      _modalDialog: undefined,

      initialize: function() {
        const _me = this;
        _me._startReorderModeBind = _me._startReorderMode.bind(_me);
        _me._cancelNavReorderHandlerBind = _me._cancelNavReorderHandler.bind(_me);
        _me._saveNavReorderHandlerBind = _me._saveNavReorderHandler.bind(_me);
        _me._registerReorderBind = _me._registerReorder.bind(_me);
        _me._initReorderBind = _me._initReorder.bind(_me);
        _me._reorderObj = null;
        _me._modalDialog = null;
        if ($('tabMenuPanel')) {
          $('tabMenuPanel').observe('tabedit:scriptsLoaded', _me._registerReorderBind);
        } else {
          Event.observe(window, 'load', _me._registerReorderBind);
        }
      },

      _registerReorder: function(event) {
        const _me = this;
        if ($('tabMenuPanel')) {
          $('tabMenuPanel').stopObserving('tabedit:scriptsLoaded', _me._registerReorderBind);
        }
        Event.stopObserving(window, 'load', _me._registerReorderBind);
        $('cel_presentation_editor_reorder_tree').stopObserving('celreorder_reorderMode:start',
          _me._startReorderModeBind);
        $('cel_presentation_editor_reorder_tree').observe('celreorder_reorderMode:start',
          _me._startReorderModeBind);
        if ((typeof getCelementsTabEditor !== 'undefined') && getCelementsTabEditor()) {
          getCelementsTabEditor().addAfterInitListener(function() {
            _me._initReorder();
          });
        } else {
          $('cel_presentation_editor_reorder_tree').observe('celreorder:init',
            _me._initReorderBind);
        }
      },

      _startReorderMode: function(event) {
        const _me = this;
        $$('.cel_naveditor_button_cancel').each(function(button) {
          button.stopObserving('click', _me._cancelNavReorderHandlerBind);
          button.observe('click', _me._cancelNavReorderHandlerBind);
        });
        $$('.cel_naveditor_button_saveAndContinue').each(function(button) {
          button.stopObserving('click', _me._saveNavReorderHandlerBind);
          button.observe('click', _me._saveNavReorderHandlerBind);
        });
        if ($('reorderingTitle') && $('reorderingTitle').hasClassName('celReorderToggle')) {
          $('reorderingTitle').show();
        }
        $('cel_presentation_editor_reorder_tree').addClassName('reorderMode');
      },

      _endReorderMode: function() {
        const _me = this;
        $$('.cel_naveditor_button_cancel').each(function(button) {
          button.stopObserving('click', _me._cancelNavReorderHandlerBind);
        });
        $$('.cel_naveditor_button_saveAndContinue').each(function(button) {
          button.stopObserving('click', _me._saveNavReorderHandlerBind);
        });
        if ($('reorderingTitle') && $('reorderingTitle').hasClassName('celReorderToggle')) {
          $('reorderingTitle').hide();
          window.location.reload();
        }
        $('cel_presentation_editor_reorder_tree').removeClassName('reorderMode');
      },

      _initReorder: function() {
        const _me = this;
        _me._reorderObj = new CELEMENTS.reorder.DDReorder('cel_presentation_editor_reorder_tree',
          '.cel_presentation_reorder');
        myContextMenu.internal_hide();
      },

      _cancelNavReorderHandler: function(event) {
        event.stop();
        if ($('reorderingTitle') && $('reorderingTitle').hasClassName('celReorderToggle')) {
          window.location.reload();
        }
      },

      _saveNavReorderHandler: function(event) {
        const _me = this;
        event.stop();
        const button = event.findElement();
        button.stopObserving('click', _me._saveNavReorderHandlerBind);
        const savingDialog = _me._getCelModalDialog();
        savingDialog.setHeader("Saving...");
        savingDialog.setBody('<img style="margin-left: auto; margin-right:auto;" src="'
          + window.CELEMENTS.getUtils().getPathPrefix()
          + '/file/resources/celRes/ajax-loader-small.gif" />');
        savingDialog.cfg.queueProperty("buttons", null);
        savingDialog.render();
        savingDialog.show();
        _me._reorderObj.saveOrder(function(transport) {
          if (transport.responseText == 'OK') {
            _me._endReorderMode();
          } else {
            console.error('failed saving reorder: ' + transport.responseText);
            alert('Failed saving!');
          }
          if (!$('reorderingTitle') || !$('reorderingTitle').hasClassName('celReorderToggle')) {
            $('cel_presentation_editor_reorder_tree').fire('celreorder_reorderMode:start');
            _me._startReorderMode();
          }
          savingDialog.hide();
        });
      },

      _getCelModalDialog: function() {
        const _me = this;
        if (!_me._modalDialog) {
          _me._modalDialog = new YAHOO.widget.SimpleDialog("modal dialog", {
            width: "300px",
            fixedcenter: true,
            visible: false,
            draggable: false,
            close: false,
            zindex: 101,
            modal: true,
            monitorresize: false,
            icon: YAHOO.widget.SimpleDialog.ICON_HELP,
            constraintoviewport: true
          });
        }
        //add skin-div to get default yui-skin-sam layouting for the dialog
        const yuiSamSkinDiv = new Element('div'
        ).addClassName('yui-skin-sam'
        ).addClassName('cel-reorderSaveDialog');
        $(document.body).insert(yuiSamSkinDiv);
        _me._modalDialog.render(yuiSamSkinDiv);
        return _me._modalDialog;
      }

    });
    new CELEMENTS.presentation.Reorder();
  }
})(window);