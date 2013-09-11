/**
 * Celements filebase
 * This is the Celements filebase-ui javascript controller.
 */
if(typeof CELEMENTS=="undefined"){var CELEMENTS={};};
if(typeof CELEMENTS.filebase=="undefined"){CELEMENTS.filebase={};};

(function() {

  var filebaseController = undefined;

  $(document.body).observe('cel_filebase:loaded', function() {
    if (!filebaseController) {
      filebaseController = new CELEMENTS.filebase.UiController();
    }
  });
//////////////////////////////////////////////////////////////////////////////
// Celements filebase ui controller
//////////////////////////////////////////////////////////////////////////////
CELEMENTS.filebase.UiController = function() {
  // constructor
  this._init();
};

(function() {
  CELEMENTS.filebase.UiController.prototype = {
      _fileUploadElem : undefined,

      _init : function() {
        var _me = this;
        _me._fileUploadElem = $('uploadBrowser');
        _me._fileUploadElem.observe('celements:beforeUpload', _me._beforeUploading.bind(
            _me));
        _me._fileUploadElem.observe('celements:uploadfinished', _me._finishUploading.bind(
            _me));
      },

      _finishUploading : function(event) {
//        var _me = this;
        $('progressBar').hide();
        $('cel_filebase_uploadForm').show();
        change();
      },

      _beforeUploading : function(event){
        var _me = this;
        event.stop();
        if($('uploadBrowser').value.replace(/^\s+/, '').replace(/\s+$/, '').length > 0){
          var allowedExtentions = '';
          if($('cel_filebase_allowed_file_extentions')){
            allowedExtentions = $('cel_filebase_allowed_file_extentions').value;
            allowedExtentions = allowedExtentions.toLowerCase();
          }
          
          var fileParts = $('uploadBrowser').value.split('.');
          var fileExtention = fileParts[fileParts.size()-1];
          fileExtention = fileExtention.toLowerCase();
          if((allowedExtentions.replace(/,/g, "") == '') || (allowedExtentions.indexOf(',' + fileExtention + ',') >= 0)){
            filter = $('c2_fb_' + active);
            if(filter){
              filter.checked = true;
            }
            
            _me._transformFilename($('uploadBrowser').value);
          } else{
            if($('cel_filebase_not_allowed_file_extention_message')){
              alert($('cel_filebase_not_allowed_file_extention_message').value);
            } else{
              alert("Unsupported file extention.");
            }
          }
        }
      },

      _transformFilename : function(name){
        var _me = this;
        var uploadDoc = $('uploadDoc').value;
        new Ajax.Request(getCelHost(), { 
          method: 'post',
          parameters: {
            'xpage' : 'celements_ajax',
            'ajax_mode' : 'TokenFileUploader',
            'tfu_mode' : 'filesExistCheck',
            'fullName' : uploadDoc,
            'filename' : name
          },
          onComplete : function(transport) {
            var jsonResult = transport.responseText;
            if (jsonResult.isJSON()) {
              var jsonResultObj = jsonResult.evalJSON();
              var filename = jsonResultObj.allFileNames[0].fileName;
              var clearedName = jsonResultObj.allFileNames[0].clearedFileName;
              var noFileNameChanges = ((name == filename)
                  && name.match(clearedName + "$"));
              var noOverwrites = (jsonResultObj.filesExistList.size() == 0);
              if(noFileNameChanges && noOverwrites) {
                $('uploadFilename').value = clearedName;
                var elements = $$('.c3_fb_upload_filter input[name="uploadFilterItem"]');
                for(var i = 0; i < elements.length; i++){
                  if(elements[i].checked){
                    _me.setTag(clearedName, uploadDoc, elements[i].value, true);
                    elements[i].checked = false;
                  }
                }
                
                var upform = $('cel_filebase_uploadForm');
                upform.hide();
                $('progressBar').show();
                upform.submit();
              } else if (!noFileNameChanges) {
                //TODO give possibility to the user to change the name insead of only confirming it
                var confirmName = confirm($('cel_filebase_upload_namechange_message').value + "\n'" + name + "' -> '" + clearedName + "'");
                if(confirmName){
                  transformFilename(clearedName);
                }
              } else if (!noOverwrites) {
                var confirmName = confirm(jsonResultObj.errorMsg);
                if(confirmName){
                  transformFilename(name);
                }
              }
            }
        }});
      },

      setTag : function(attName, docName, tagLink, active){
        new Ajax.Request(getCelHost(), {
          method: 'post',
          parameters: {
            'xpage': 'celements_ajax',
            'ajax_mode' : 'FileBaseTags',
            'save' : 1,
            'tag' : tagLink,
            'att_doc' : docName,
            'att_name' : attName,
            'active' : active
          }
        });
      }

  };

})();

})();
