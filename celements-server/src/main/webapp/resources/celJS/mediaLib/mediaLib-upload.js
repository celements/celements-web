Event.observe(window, 'load', function(){
  $$('form.ml_upload_form .upload').each(function(button){
    button.observe('click', uploading);
  });
});

var uploading = function(event){
  var mlPrefix = event.target.up('form').down('.ml_id_prefix').value;
  
  if($(mlPrefix + '_uploadBrowser').value.replace(/^\s+/, '').replace(/\s+$/, '').length > 0){
    var allowedExtentions = '';
    if($(mlPrefix + '_cel_filebase_allowed_file_extentions')){
      allowedExtentions = $(mlPrefix + '_cel_filebase_allowed_file_extentions').value;
      allowedExtentions = allowedExtentions.toLowerCase();
    }
    
    var uploadFile = $(mlPrefix + '_uploadBrowser').value;
    var fileParts = uploadFile.split('.');
    var fileExtention = fileParts[fileParts.size()-1];
    fileExtention = fileExtention.toLowerCase();
    if((allowedExtentions.replace(/,/g, "") == '') || (allowedExtentions.indexOf(',' + fileExtention + ',') >= 0)){
      transformFilename(uploadFile, mlPrefix);
    } else{
      if($(mlPrefix + '_cel_filebase_not_allowed_file_extention_message')){
        alert($(mlPrefix + '_cel_filebase_not_allowed_file_extention_message').value);
      } else{
        alert("Unsupported file extention.");
      }
    }
  }
  event.stop();
}

var transformFilename = function(name, mlPrefix){
  var checkDocExists = '';
  checkDocExists = $(mlPrefix + '_uploadDoc').value;
  
  new Ajax.Request("/Celements2/FileBaseUploaded", { 
    method: 'post',
    parameters: {xpage: 'plain', testName: name, checkDoc: checkDocExists},
    onComplete : function(transport){
      clearedName = transport.responseText;
      if(name.match(clearedName + "$")){
        $(mlPrefix + '_uploadFilename').value = clearedName;
        upform = $(mlPrefix + '_cel_filebase_uploadForm').setStyle({ display: 'none' });
        progress = $(mlPrefix + '_progressBar').setStyle({ display: '' });
        $$('form.' + mlPrefix + '_config .cel_ml_param').each(function(paramInput) {
          $(mlPrefix + '_cel_filebase_uploadForm').action = "/upload/" + paramInput.value.replace(/\./, '/');
        });
        $(mlPrefix + '_cel_filebase_uploadForm').submit();
      } else {
        //TODO give possibility to the user to change the name insead of only confirming it
        confirmName = confirm($(mlPrefix + '_cel_filebase_upload_namechange_message').value + "\n'" + name + "' -> '" + clearedName + "'");
        if(confirmName){
          transformFilename(clearedName, mlPrefix);
        }
      }
    }
  });
}

var updateMediaLib = function(fieldid) {
  new CELEMENTS.widget.MediaLibTable(fieldid);
}