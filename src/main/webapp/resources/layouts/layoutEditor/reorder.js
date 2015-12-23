Event.observe(window, 'load', function() {
  $('cel_skin_editor_reorder_tree').observe('celreorder_reorderMode:start',
      layoutEditor_startReorderMode);
  $('cel_skin_editor_reorder_tree').observe('celreorder_reorderMode:end',
      layoutEditor_endReorderMode);
});

var layoutEditor_startReorderMode = function(event) {
  $$('.cel_naveditor_button_cancel').each(function(button) {
    button.observe('click', cancelNavReorderHandler);
  });
  $$('.cel_naveditor_button_saveAndContinue').each(function(button) {
    button.observe('click', saveNavReorderHandler);
  });
  $('cel_layout_editor_reorder').show();
  $('cel_layout_editor_title_cell').hide();
  $('cel_skin_editor_reorder_tree').addClassName('reorderMode');
};

var layoutEditor_endReorderMode = function(event) {
  $$('.cel_naveditor_button_cancel').each(function(button) {
    button.stopObserving('click', cancelNavReorderHandler);
  });
  $$('.cel_naveditor_button_saveAndContinue').each(function(button) {
    button.stopObserving('click', saveNavReorderHandler);
  });
  $('cel_layout_editor_reorder').hide();
  $('cel_layout_editor_title_cell').show();
  $('cel_skin_editor_reorder_tree').removeClassName('reorderMode');
};

var layoutEditor_reorderObj = null;
var layoutEditor_reorder = function() {
  layoutEditor_reorderObj = new CELEMENTS.reorder.DDReorder('cel_skin_editor_reorder_tree');
  myContextMenu.internal_hide();
};

var cancelNavReorderHandler = function(event) {
  window.location.reload();
};

var saveNavReorderHandler = function(event) {
  var button = event.findElement();
  button.stopObserving('click', saveNavReorderHandler);
    var savingDialog = getCelModalDialog();
  savingDialog.setHeader("Saving..."); 
  savingDialog.setBody('<img style="margin-left: auto; margin-right:auto;" src="'
      + window.CELEMENTS.getPathPrefix() + '/file/resources/celRes/ajax-loader-small.gif" />'); 
  savingDialog.cfg.queueProperty("buttons", null);
  savingDialog.render();
  savingDialog.show();
  layoutEditor_reorderObj.saveOrder(function(transport) {
    if (transport.responseText == 'OK') {
      $('cel_skin_editor_reorder_tree').fire('celreorder_reorderMode:end');
      window.location.reload();
    } else {
      if ((typeof console != "undefined") && (typeof console.debug != "undefined")) {
        console.debug('failed saving reorder: ' + transport.responseText);
      }
      alert('Failed saving!');
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
      zindex:4, 
      modal:true,
      monitorresize:false,
      icon: YAHOO.widget.SimpleDialog.ICON_HELP, 
      constraintoviewport: true
    } );
  }
  //add skin-div to get default yui-skin-sam layouting for the dialog
  var yuiSamSkinDiv = new Element('div', {'class' : 'yui-skin-sam'});
  $(document.body).insert(yuiSamSkinDiv);
  celementsModalDialog.render(yuiSamSkinDiv);
  return celementsModalDialog;
};
