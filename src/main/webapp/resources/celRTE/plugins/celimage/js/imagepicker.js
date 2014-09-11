var baseurl;
var imgurl;
var editor_id;
var attList = [];
var startPos = 0;
var stepNumber = 25;
var imagePickerMaxDimension = 100;

var loadingImg = new Element('img', {
    'src' : '/file/resources/celRes/ajax-loader.gif',
    'class' : 'attListLoading',
    'alt' : 'loading...'
  });

Event.observe(window, 'load', function(){
  baseurl = tinyMCEPopup.getParam("wiki_attach_path");
  imgurl = tinyMCEPopup.getParam("wiki_imagedownload_path");
  editor_id = tinyMCEPopup.getWindowArg('editor_id');
  $('imagePickerUploadAreaFieldset').hide();
  $('imagePickerForm').action = baseurl;
  getUploadToken();
  $$('#imagePickerUploadArea .celfileupload').each(function(elem) {
    elem.observe('celements:uploadfinished', pickerUploadFinshed);
  });
});

var imagePicker_pickerTabFirstClickHandler = function(event) {
  this.stopObserving('click', imagePicker_pickerTabFirstClickHandler);
  loadAttachmentList(baseurl);
};

var getUploadToken = function() {
  new Ajax.Request(baseurl, {
    method: 'post',
    parameters: {
       xpage : 'celements_ajax',
       'ajax_mode' : 'TokenFileUploader',
       'tfu_mode' : 'getTokenForCurrentUser'
    },
    onSuccess: function(transport) {
      jsonStr = transport.responseText;
      if (jsonStr.isJSON()) {
        jsonResponse = jsonStr.evalJSON();
        if (jsonResponse.hasUploadRights) {
          $('celfileuploadToken').value = jsonResponse.token;
          $('imagePickerUploadAreaFieldset').show();
        }
      }
    }
  });
};

var pickerUploadFinshed = function(event) {
  var uploadResult = event.memo.uploadResult;
  if (uploadResult && uploadResult.success && (uploadResult.success == 1)) {
    $('attachments').insert({ top : loadingImg });
    new Ajax.Request(baseurl, {
        method: 'post',
        parameters: {
           'xpage' : 'celements_ajax',
           'ajax_mode' : 'imagePickerList',
           'images' : '1',
           'start' : 0,
           'nb' : 1
        },
        onSuccess: function(transport) {
          if (transport.responseText.isJSON()) {
            var json = transport.responseText.evalJSON();
            loadAttachmentListCallback(json, false, true, false);
          } else if ((typeof console != 'undefined') 
              && (typeof console.warn != 'undefined')) {
            console.warn('pickerUploadFinshed: noJSON!!! ', transport.responseText);
          }
        }
      });
    startPos++;
  } else {
    alert('failed to upload image.');
  }
};

var endlessScrollLoadActionFnc = function(attachEl, scroller, callbackFnkt) {
  $('attachments').insert(loadingImg);
  new Ajax.Request(baseurl, {
    method: 'post',
    parameters: {
       'xpage' : 'celements_ajax',
       'ajax_mode' : 'imagePickerList',
       'images' : '1',
       'start' : startPos,
       'nb' : stepNumber
    },
    onComplete: function(transport) {
      if (transport.responseText.isJSON()) {
        var json = transport.responseText.evalJSON();
        loadAttachmentListCallback(json, true, false, false);
        callbackFnkt(json.length == stepNumber);
        if ((typeof console != 'undefined') && (typeof console.log != 'undefined')) {
          console.log('loadAttachmentList: total loaded [',
              $$('.imagePickerSource').size() ,'] are there more? ',
              (json.length == stepNumber));
        }
      } else if ((typeof console != 'undefined') 
          && (typeof console.warn != 'undefined')) {
        console.warn('loadAttachmentList: noJSON!!! ', transport.responseText);
      }
    }
  });
  startPos += stepNumber;
};

var loadAttachmentList = function(baseurl) {
  var attachEl = document.getElementById("attachments");
  var scroll = new CELEMENTS.anim.EndlessScroll(attachEl, endlessScrollLoadActionFnc, {
    isScrollBlockEle : true,
    overlap : 150
  });
//  scroll.setLogging(1);
};

var getCenteredImagePickerValue = function(diffValue) {
  if (diffValue < 0) {
    return 0;
  } else {
    return Math.floor(diffValue / 2);
  }
};

var imagePickerFixDimensions = function(dim) {
  if (dim.height > dim.width) {
    if (dim.height > imagePickerMaxDimension) {
      dim.width = Math.round(dim.width / dim.height * imagePickerMaxDimension);
      dim.height = imagePickerMaxDimension;
    }
  } else {
    if (dim.width > imagePickerMaxDimension) {
      dim.height = Math.round(dim.height / dim.width * imagePickerMaxDimension);
      dim.width = imagePickerMaxDimension;
    }
  }
  return dim;
};

var centerImagePickerThumbHandler = function(event) {
  var tempImg = event.findElement();
  centerImagePickerThumb(tempImg);
};

var centerImagePickerThumb = function(tempImg) {
  tempImg.setStyle({
    'height' : 'auto',
    'width' : 'auto'
  });
  var dim = tempImg.getDimensions();
  if ((dim.height > 0) && (dim.width > 0)) {
    dim = imagePickerFixDimensions(dim);
    tempImg.setStyle({
      'height' : dim.height + 'px',
      'width' : dim.width + 'px'
    });
    var wrapDiv = tempImg.up('div.imagePickerWrapper');
    var sourceDiv = tempImg.up('div.imagePickerSource');
    sourceDiv.setStyle({
      'top' : getCenteredImagePickerValue(wrapDiv.getHeight() - sourceDiv.getHeight()
          ) + 'px',
      'left' : getCenteredImagePickerValue(wrapDiv.getWidth() - sourceDiv.getWidth()
          ) + 'px'
    });
  }
};

var isLoading = false;
var insertStack = new Array();
var goThroughStack = function() {
  if(!isLoading) {
    isLoading = true;
    if(insertStack.length > 0) {
      var next = insertStack.shift();
      if ((typeof console != 'undefined') && (typeof console.log != 'undefined')) {
        console.log('loadAttachmentList: load from stack. Stack size: ' + insertStack.length);
      }
      loadAttachmentListCallback(next[0], next[1], next[2], true);
    }
    isLoading = false;
  } else {
    goThroughStack.delay(0.1);
  }
}

var loadAttachmentListCallback = function(attList, insertBottom, duplicateCheck, fromStack) {
  if(!fromStack) {
    insertStack.push([attList, insertBottom, duplicateCheck]);
    if ((typeof console != 'undefined') && (typeof console.log != 'undefined')) {
      console.log('loadAttachmentList: pushed to stack. Stack size: ' + insertStack.length);
    }
    goThroughStack();
  } else {
    var attachEl = $('attachments');
    try {
      loadingImg.remove();
    } catch(err) {
      if ((typeof console != 'undefined') && (typeof console.log != 'undefined')) {
        console.log('error removing loader.', err);
      }
    }
    var currentImgSrc = $('src').value;
    $A(attList).each(function(imgElem) {
      var cssClasses = 'imagePickerSource';
      if (imgElem.src == currentImgSrc) {
        cssClasses += ' selected';
      }
      var imgThmb = new Element('img', {
        'src' : (imgElem.src + '?celheight=' + imagePickerMaxDimension + '&celwidth='
            + imagePickerMaxDimension)
      });
      var imgContainerDiv = new Element('div', {
        'class' : cssClasses
      }).update(imgThmb);
      var imgDiv = new Element('div', {
        'class' : 'imagePickerWrapper'
      }).update(imgContainerDiv);
      if(duplicateCheck) {
        attachEl.select('.imagePickerWrapper').each(function(imgWrapper) {
          if(imgWrapper.down('img').src.replace(/(http:\/\/.*?)?(\/.*?)\?.*/g, '$2') == imgElem.src) {
            imgWrapper.remove();
          }
        });
      }
      if(insertBottom) {
        attachEl.insert({ bottom : imgDiv });
      } else {
        attachEl.insert({ top : imgDiv });
      }
      imgThmb.observe('load', centerImagePickerThumbHandler);
      // call centerImage once to center in case already loaded
      centerImagePickerThumb(imgThmb);
    });
    attachEl.select('.imagePickerSource').each(function(elem) {
        if (!elem.hasClassName('selected')) {
          elem.observe('click', clickOnFileAction);
        }
    });
    if ((typeof console != 'undefined') && (typeof console.log != 'undefined')) {
      console.log('loadAttachmentList: total loaded [',
          $$('.imagePickerSource').size() ,']');
    }
    goThroughStack();
  }
};

var clickOnFileAction = function (event) {
  event.stop();
  var selectElem = this.down('img, a');
  var filename = selectElem.src;
  if (!filename) {
    filename = selectElem.href;
  }
  if (filename && document.forms[0].src) {
    filename = filename.replace(/^(.+)\?.*/, '$1');
    document.forms[0].src.value = filename;
    var oldSelection = $$('.imagePickerSource.selected');
    if (oldSelection.size() > 0) {
      oldSelection[0].removeClassName('selected');
      oldSelection[0].observe('click', clickOnFileAction);
    }
    this.addClassName('selected');
    this.stopObserving('click', clickOnFileAction);
    CelImageDialog.isNewImage = true;
    CelImageDialog.showPreviewImage(filename);
    mcTabs.displayTab('imageDetails_tab','imageDetails_panel');
  }
};

var updateAttachName = function(form) {
 // called on submit of upload form
  if($('progressBar')) {
    $('progressBar').show();
    if($('attach')) {
      $('attach').hide();
    }
  }
  form.xredirect.value=location;

  var fname = form.filepath.value;
  if (fname=="") {
    return false;
  }

  var i = fname.lastIndexOf('\\');
  if (i==-1)
   i = fname.lastIndexOf('/');

  fname = fname.substring(i+1);
  if (form.filename.value==fname)
   return true;

  if (form.filename.value=="")
   form.filename.value = fname;
  return true;
};
