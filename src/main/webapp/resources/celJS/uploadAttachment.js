var checkUploadFileName = function(fileUploadElm) {
   if ($('uploadFilename') == null) {
     fileUploadElm.insert({after: new Element('input', {
     'type' : 'hidden',
     'id' : 'uploadFilename',
     'name' : 'filename'
     })});
   }
   var filename = fileUploadElm.value.replace(/^.*(\\|\/)/g, '');
   if (filename != '') {
     fileUploadElm.hide();
     fileUploadElm.insert({after : new Element('img', {
       'id' : 'attachmentloadingimg',
       'src' : '/file/resources/celRes/ajax-loader-small.gif'
     })});
     if($('noAttachments')) {
       $('noAttachments').hide();
     }
     $('uploadFilename').value = filename;
     return true;
   }
   return false;
};

var checkIframeTarget = function(formElm, fileUploadElm) {
  if ($('uploadFrame') == null) {
    var iframeElem = new Element('iframe', {
     'id' : 'uploadFrame',
     'name' : 'uploadFrame',
     'src' : ''
     }).setStyle({ 'display' : 'none'});
    Element.insert(formElm, { 'after' : iframeElem });
  }
  
  if ($('beforeUploadFormTarget') == null) {
    var inputElem = new Element('input', {
     'type' : 'hidden',
     'id' : 'beforeUploadFormTarget',
     'name' : 'beforeUploadFormTarget'
     });
    Element.insert(formElm,inputElem);
  }
  if ($('celementsFormId') == null) {
    var inputElem = new Element('input', {
     'type' : 'hidden',
     'id' : 'celementsFormId',
     'name' : 'celementsFormId'
     });
    Element.insert(formElm,inputElem);
  }
  if (formElm.elements['xpage'] == null) {
    var inputElem = new Element('input', {
      'type' : 'hidden',
      'name' : 'xpage',
      });
     Element.insert(formElm,inputElem);
  } else if (formElm.elements['xpage'] && (formElm.elements['beforeUploadXpage'] == null)) {
    var inputElem = new Element('input', {
     'type' : 'hidden',
     'name' : 'beforeUploadXpage',
     }).addClassName('beforeUploadXpage');
    Element.insert(formElm,inputElem);
  }
  if (formElm.elements['ajax_mode'] == null) {
    var inputElem = new Element('input', {
     'type' : 'hidden',
     'name' : 'ajax_mode',
     'value' : 'TokenFileUploader'
     });
    Element.insert(formElm,inputElem);
  }
  if (formElm.elements['tfu_mode'] == null) {
    var inputElem = new Element('input', {
     'type' : 'hidden',
     'name' : 'tfu_mode',
     'value' : 'upload'
     });
    Element.insert(formElm,inputElem);
  }
  $('beforeUploadFormTarget').value = formElm.target;
  $('celementsFormId').value = Element.readAttribute(formElm, 'id');
  formElm.target = "uploadFrame";
  if (formElm.elements['beforeUploadXpage']) {
    formElm.elements['beforeUploadXpage'].value = formElm.elements['xpage'].value; 
  }
  formElm.elements['xpage'].value = 'celements_ajax';
  $('uploadFrame').stopObserving('load', celUploadCallbackHandler);
  $('uploadFrame').observe('load', celUploadCallbackHandler);
};

var getIframeDocument = function(iframeElement) {
  /**
IE (Win) and Mozilla (1.7) will return the window object inside the iframe with oIFrame.contentWindow.
Safari (1.2.4) doesn't understand that property, but does have oIframe.contentDocument, which points to the document object inside the iframe.
To make it even more complicated, Opera 7 uses oIframe.contentDocument, but it points to the window object of the iframe.
Because Safari has no way to directly access the window object of an iframe element via standard DOM (or does it?), our fully modern-cross-browser-compatible code will only be able to access the document within the iframe. The resulting code follows.
   */
  var oDoc = (iframeElement.contentWindow || iframeElement.contentDocument);
  if (oDoc.document) oDoc = oDoc.document;
  return oDoc;
};

var celUploadCallbackHandler = function(event) {
  var fileUploadInputElems = $($('celementsFormId').value).select('input.celfileupload');
  var fileUploadInputElem = fileUploadInputElems.pop();
  while ((fileUploadInputElems.size() > 0) && fileUploadInputElem.visible()) {
    fileUploadInputElem = fileUploadInputElems.pop();
  }
  var iframeDoc = getIframeDocument(event.findElement());
  var resultText = iframeDoc.getElementsByTagName('body')[0].innerHTML;
  if((typeof console != 'undefined') && (typeof console.debug != 'undefined')) {
    console.debug('finished upload: ' + resultText, resultText.isJSON());
  }
  if (resultText.isJSON()) {
    var uploadRes = resultText.evalJSON();
    if (uploadRes.success != '1') {
      if((typeof console != 'undefined') && (typeof console.error != 'undefined')) {
        console.error('upload failed: ' + resultText, resultText.isJSON());
      }
    }    
    if ($('attachmentList')) {
      if (uploadRes.success == '1') {
        var newAttListEntry = new Element('p', {"class" : "attachment" }
          ).update(uploadRes.attfilename);
        $('attachmentList').insert(newAttListEntry);
        if ($('noAttachments')) {
         $('noAttachments').remove();
        }
        if ($('celuploadErrorMsg')) {
          $('celuploadErrorMsg').remove();
        }
      } else {
        $('attachmentList').insert(new Element('p', {
            'class' : 'uploaderrmsg',
            'id' : 'celuploadErrorMsg'
          }).setStyle({ 'color' : 'red'}).update('upload of "' + uploadRes.attfilename
            + '" failed.')
        );
      }
    }
    uploadAttResetFormAfter(fileUploadInputElem);
    if($('noAttachments')) {
     $('noAttachments').show();
    }
    fileUploadInputElem.fire('celements:uploadfinished', {
      'uploadResult' : uploadRes
    });
    fileUploadInputElem.show();
  }
};

/**
 * call this function if you cancel the submit
 */
var uploadAtt_Cancel_ResetFormAfter = function(fileUploadInputElem) {
  uploadAttResetFormAfter(fileUploadInputElem);
  fileUploadInputElem.show();
};

var uploadAttResetFormAfter = function(fileUploadInputElem) {
  var formElm = fileUploadInputElem.up('form');
  if ($('beforeUploadFormTarget')) {
    fileUploadInputElem.up('form').target = $('beforeUploadFormTarget').value;
    $('beforeUploadFormTarget').remove();
  }
  if (formElm.elements['beforeUploadXpage']) {
    formElm.elements['xpage'].value = formElm.elements['beforeUploadXpage'].value;
    formElm.elements['beforeUploadXpage'].remove();
  } else if (formElm.elements['xpage'] != null) {
    formElm.elements['xpage'].remove();
  }
  fileUploadInputElem.value = '';
  fileUploadInputElem.clear();
  if ($('celementsFormId')) {
    $('celementsFormId').remove();
  }
  if ($('attachmentloadingimg')) {
    $('attachmentloadingimg').remove();
  }
};

var checkAttachmentList = function(fileUploadElm){
  if (($('attachmentList') == null)
     && (!fileUploadElm.hasClassName('celSupressAttachmentList'))) {
    fileUploadElm.insert({after: new Element('div', {
      'id' : 'attachmentList'
    })});
  }
};

var registerOnInputFields = function() {
  if((typeof console != 'undefined') && (typeof console.debug != 'undefined')) {
    console.debug('registerOnInputFields: registering change observers for file upload fields...');
  }
  $$('input.celfileupload').each(function(inputElem) {
    if((typeof console != 'undefined') && (typeof console.debug != 'undefined')) {
      console.debug('registerOnInputFields: change observer for ' + inputElem.inspect());
    }
    inputElem.stopObserving('change', celFileSelectionChanged);
    inputElem.observe('change', celFileSelectionChanged);
  });
};

var celFileSelectionChanged = function(event) {
  var fileUploadElm = event.findElement();
  var formElm = event.findElement('form');
  console.log('celFileSelectionChanged: file selected ', fileUploadElem.inspect());
  if (checkUploadFileName(fileUploadElm)) {
    checkAttachmentList(fileUploadElm);
    checkIframeTarget(formElm, fileUploadElm);
    var beforeEvent = fileUploadElm.fire('celements:beforeUpload');
    if (!beforeEvent.stopped) {
      formElm.submit();
    } else {
      console.log('celFileSelectionChanged: skip submit ', fileUploadElem.inspect());
    }
  } else {
    console.log('celFileSelectionChanged: checkUploadFileName failed ',
        fileUploadElem.inspect());
  }
};


window.celAddOnBeforeLoadListener(function() {
  $(document.body).observe('cel_yuiOverlay:contentChanged', registerOnInputFields);
  registerOnInputFields();
});
