function preimportChanged() {
  consoleMsg('import box content is ready');
  $$('.c3_import_checkbox_element').each(function(chkbox){
    chkbox.observe('click', changeAndCount);
  });
  if($('importForm')){
    $('closebutton').observe('click', closePreimport);
    $('importForm').observe('submit', importNow);
    countChecked();
  } else {
    $('closebutton').stopObserving('click', closePreimport);
  }
  updateObservers();
  if($('check_all')){
    $('check_all').observe('click', function(){
      $$('.c3_import_checkbox_element').each(function(chkbox){
        chkbox.checked=true;
        changeImportAction(chkbox);
      });
      countChecked();
    });
  }
  if($('check_none')){
    $('check_none').observe('click', function() {
      $$('.c3_import_checkbox_element').each(function(chkbox){
        chkbox.checked=false;
        changeImportAction(chkbox);
      });
      countChecked();
    });
  }
}

function closePreimport(event){
  if(!confirm($('c3_not_yet_imported_msg').value)){
    event.stop();
  }
}

function changeAndCount(event){
  consoleMsg('clicked check box');
  changeImportActionEvent(event);
  countChecked();
}

function countChecked(){
  var checkboxes = $$('.c3_import_checkbox_element');
  var checkedFiles = 0;
  checkboxes.each(function(chkbox){
    if(chkbox.checked){ checkedFiles++; }
  });
  $('c3_import_count_files').innerHTML = checkedFiles;
  $('c3_import_count_total').innerHTML = checkboxes.size();
  
  //stop observing to prevent double observes
  $('c3_import_button_div').stopObserving('click', nothingToImport);
  $('c3_import_button').stopObserving('click', overwriteOnImport);
  if(checkedFiles > 0){
    consoleMsg('activate import button');
    $('c3_import_button').disabled = false;
    if(doesOverwrite()){
      $('c3_import_button').observe('click', overwriteOnImport);
    }
  } else{
    $('c3_import_button').disabled = true;
    $('c3_import_button_div').observe('click', nothingToImport);
  }
}

function doesOverwrite(){
  var hasOverwrite = false;
  $$('.cel_photo_overwrite').each(function(ele){
    hasOverwrite |= !(ele.getStyle('display') == 'none');
  });
  return hasOverwrite;
}

function nothingToImport(){
  alert($('c3_nothing_to_import_msg').value);
}

function overwriteOnImport(event){
  if(!confirm($('c3_overwrite_on_import_msg').value)){
    event.stop();
  }
}

function changeImportActionEvent(event) {
  changeImportAction(event.element());
}

function changeImportAction(elem) {
  var chkboxspan = elem.up('.c3_import_row');
  var actionspan = chkboxspan.down('.c3_import_action', 0);
  var actionspanskip = chkboxspan.down('.c3_import_action', 1);
  if(elem.checked){
    consoleMsg('show action, hide skip');
    actionspan.setStyle({display: ''});
    actionspanskip.setStyle({display: 'none'});
  } else {
    consoleMsg('show skip, hide action');
    actionspan.setStyle({display: 'none'});
    actionspanskip.setStyle({display: ''});
  }
}

function preimport(event){
  var src = "";
  var filename = "";
  event.element().siblings().each(function(sibl){
    if(sibl.name == 'c3_fb_file_src'){
      src = sibl.value;
    } else if(sibl.name == 'c3_fb_full_file_name'){
      filename = sibl.value;
    }
  });
  
  url = $('c3_preimport_url').value + "&attDoc=" + src + "&filename=" + filename;
  getProgressBar($('c3_title_preimport').value);
  new Ajax.Request(url, { 
    method: 'post', 
    onComplete: function(transport){
      $('c3_import_box').innerHTML = transport.responseText;
      $('c3_import_box').fire("preimport:changed");
      resizeTab();
  }});
}

function importNow(event) {
  consoleMsg('start progress bar');
  getProgressBar($('c3_title_importing').value);
  consoleMsg('start ajax');
  consoleMsg('url is: "' + $('c3_import_url').value + '"');
  consoleMsg('params are: "' + $('importForm').serialize(true) + '"');
  new Ajax.Request($('c3_import_url').value, {
    parameters : $('importForm').serialize(true),
    onComplete : function(transport){
      $('c3_import_box').innerHTML = transport.responseText;
      $('c3_import_box').fire("preimport:changed");
      resizeTab();
    }
  });
  event.stop();
}