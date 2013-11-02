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

Event.observe(window, 'load', function() {
  $('cel_presentation_editor_reorder_tree').observe('celreorder_reorderMode:start',
      presentationEditor_startReorderMode);
  $('cel_presentation_editor_reorder_tree').observe('celreorder_reorderMode:end',
      presentationEditor_endReorderMode);
  if ((typeof getCelementsTabEditor !== 'undefined') && getCelementsTabEditor()) {
    getCelementsTabEditor().addAfterInitListener(function() {
      presentationEditor_reorder();
    });
  }
});

var presentationEditor_startReorderMode = function(event) {
  $$('.cel_naveditor_button_cancel').each(function(button) {
    button.observe('click', cancelNavReorderHandler);
  });
  $$('.cel_naveditor_button_saveAndContinue').each(function(button) {
    button.observe('click', saveNavReorderHandler);
  });
  if ($('reorderingTitle') && $('reorderingTitle').hasClassName('celReorderToggle')) {
    $('reorderingTitle').show();
  }
  $('cel_presentation_editor_reorder_tree').addClassName('reorderMode');
};

var presentationEditor_endReorderMode = function(event) {
  $$('.cel_naveditor_button_cancel').each(function(button) {
    button.stopObserving('click', cancelNavReorderHandler);
  });
  $$('.cel_naveditor_button_saveAndContinue').each(function(button) {
    button.stopObserving('click', saveNavReorderHandler);
  });
  if ($('reorderingTitle') && $('reorderingTitle').hasClassName('celReorderToggle')) {
    $('reorderingTitle').hide();
    window.location.reload();
  }
  $('cel_presentation_editor_reorder_tree').removeClassName('reorderMode');
};

var presentationEditor_reorderObj = null;
var presentationEditor_reorder = function() {
  presentationEditor_reorderObj = new CELEMENTS.reorder.DDReorder(
      'cel_presentation_editor_reorder_tree', '.cel_presentation_reorder');
  myContextMenu.internal_hide();
};

var cancelNavReorderHandler = function(event) {
  event.stop();
  if ($('reorderingTitle') && $('reorderingTitle').hasClassName('celReorderToggle')) {
    window.location.reload();
  }
};

var saveNavReorderHandler = function(event) {
  event.stop();
  var button = event.findElement();
  button.stopObserving('click', saveNavReorderHandler);
    var savingDialog = getCelModalDialog();
  savingDialog.setHeader("Saving..."); 
  savingDialog.setBody('<img style="margin-left: auto; margin-right:auto;" src="/skin/resources/celRes/ajax-loader-small.gif" />'); 
  savingDialog.cfg.queueProperty("buttons", null);
  savingDialog.render();
  savingDialog.show();
  presentationEditor_reorderObj.saveOrder(function(transport) {
    if (transport.responseText == 'OK') {
      $('cel_presentation_editor_reorder_tree').fire('celreorder_reorderMode:end');
    } else {
      if ((typeof console != "undefined") && (typeof console.debug != "undefined")) {
        console.debug('failed saving reorder: ' + transport.responseText);
      }
      alert('Failed saving!');
    }
    if (!$('reorderingTitle') || !$('reorderingTitle').hasClassName('celReorderToggle')) {
      $('cel_presentation_editor_reorder_tree').fire('celreorder_reorderMode:start');
    }
    savingDialog.hide();
  });
};

var celementsModalDialog = null;
getCelModalDialog = function() {
  if(!celementsModalDialog) {
    celementsModalDialog = new YAHOO.widget.SimpleDialog("modal dialog", {
      width: "300px", 
      fixedcenter: true, 
      visible: false, 
      draggable: false, 
      close: false, 
      zindex:101, 
      modal:true,
      monitorresize:false,
      icon: YAHOO.widget.SimpleDialog.ICON_HELP, 
      constraintoviewport: true
    } );
  }
  //add skin-div to get default yui-skin-sam layouting for the dialog
  var yuiSamSkinDiv = new Element('div'
    ).addClassName('yui-skin-sam'
    ).addClassName('cel-reorderSaveDialog');
  $(document.body).insert(yuiSamSkinDiv);
  celementsModalDialog.render(yuiSamSkinDiv);
  return celementsModalDialog;
};
