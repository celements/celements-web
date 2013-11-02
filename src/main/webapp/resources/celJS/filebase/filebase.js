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
        _me._fileUploadElem.value = '';
        _me._fileUploadElem.clear();
        _me._fileUploadElem.observe('celements:beforeUpload', _me._beforeUploading.bind(
            _me));
        _me._fileUploadElem.observe('celements:uploadfinished', _me._finishUploading.bind(
            _me));
      },

      _reshowUploadElements : function() {
        var _me = this;
        uploadAtt_Cancel_ResetFormAfter(_me._fileUploadElem);
      },

      _finishUploading : function(event) {
        var _me = this;
        change();
        _me._reshowUploadElements();
      },

      _beforeUploading : function(event){
        var _me = this;
        event.stop();
      //uploadAttachment.js already extracted the filename
        var filename = $('uploadFilename').value;
        if(filename.length > 0){
          var allowedExtentions = '';
          if($('cel_filebase_allowed_file_extentions')){
            allowedExtentions = $('cel_filebase_allowed_file_extentions').value;
            allowedExtentions = allowedExtentions.toLowerCase();
          }
          
          var fileParts = filename.split('.');
          var fileExtention = fileParts[fileParts.size()-1];
          fileExtention = fileExtention.toLowerCase();
          if((allowedExtentions.replace(/,/g, "") == '') || (allowedExtentions.indexOf(',' + fileExtention + ',') >= 0)){
            var filter = $('c2_fb_' + active);
            if (filter){
              filter.checked = true;
            }
            _me._transformFilename(filename);
          } else{
            if($('cel_filebase_not_allowed_file_extention_message')){
              alert($('cel_filebase_not_allowed_file_extention_message').value);
            } else{
              alert("Unsupported file extention.");
            }
            _me._reshowUploadElements();
          }
        }
      },

      _transformFilename : function(name, forceOverwrite){
        var _me = this;
        forceOverwrite = forceOverwrite || false;
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
              var noOverwrites = (jsonResultObj.filesExistList.size() == 0)
                  || forceOverwrite;
              if(noFileNameChanges && noOverwrites) {
                $('uploadFilename').value = clearedName;
                var elements = $$('.c3_fb_upload_filter input[name="uploadFilterItem"]');
                for(var i = 0; i < elements.length; i++){
                  if(elements[i].checked){
                    _me.setTag(clearedName, uploadDoc, elements[i].value, true);
                    elements[i].checked = false;
                  }
                }
                $('cel_filebase_uploadForm').submit();
              } else if (!noFileNameChanges) {
                //TODO give possibility to the user to change the name instead of only confirming it
                var confirmName = confirm($('cel_filebase_upload_namechange_message').value + "\n'" + name + "' -> '" + clearedName + "'");
                if(confirmName){
                  _me._transformFilename(clearedName, forceOverwrite);
                } else {
                  _me._reshowUploadElements();
                }
              } else if (!noOverwrites) {
                var confirmName = confirm(jsonResultObj.errorMsg);
                if(confirmName){
                  _me._transformFilename(name, true);
                } else {
                  _me._reshowUploadElements();
                }
              } else {
                var confirmName = confirm(jsonResultObj.errorMsg);
                if(confirmName){
                  _me._transformFilename(name, forceOverwrite);
                } else {
                  _me._reshowUploadElements();
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
