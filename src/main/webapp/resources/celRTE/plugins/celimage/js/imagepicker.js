var baseurl;
var imgurl;
var editor_id;
var attList = [];
var startPos = 0;
var stepNumber = 25;
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
  loadAttachmentList(baseurl);
  $('imagePickerForm').action = baseurl;
  getUploadToken();
  $$('#imagePickerUploadArea .celfileupload').each(function(elem) {
    elem.observe('celements:uploadfinished', pickerUploadFinshed);
  });
});

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
            loadAttachmentListCallback(json, false, true);
          } else if ((typeof console != 'undefined') 
              && (typeof console.debug != 'undefined')) {
            console.debug('loadSlideShowDataAsync: noJSON!!! ', transport.responseText);
          }
        }
      });
    startPos++;
  } else {
    alert('failed to upload image.');
  }
};

var loadAttachmentList = function(baseurl) {
  var attachEl = document.getElementById("attachments");
  var scroll = new CELEMENTS.anim.EndlessScroll(attachEl, function(attachEl, callbackFnkt) {
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
      onSuccess: function(transport) {
        if (transport.responseText.isJSON()) {
          var json = transport.responseText.evalJSON();
          loadAttachmentListCallback(json, true, false);
          callbackFnkt(json.length == stepNumber, scroll);
        } else if ((typeof console != 'undefined') 
            && (typeof console.debug != 'undefined')) {
          console.debug('loadSlideShowDataAsync: noJSON!!! ', transport.responseText);
        }
      }
    });
    startPos += stepNumber;
  }, {
    isScrollBlockEle : true,
    overlap : 150
  });
};

var getCenteredImagePickerValue = function(diffValue) {
  if (diffValue < 0) {
    return 0;
  } else {
    return Math.floor(diffValue / 2);
  }
};

var centerImagePickerThumb = function(event) {
  var tempImg = event.findElement();
  var dim = tempImg.getDimensions();
  var wrapDiv = tempImg.up('div');
  tempImg.setStyle({
    'top' : getCenteredImagePickerValue(wrapDiv.getHeight() - dim.height) + 'px',
    'left' : getCenteredImagePickerValue(wrapDiv.getWidth() - dim.width) + 'px'
  });
};

var loadAttachmentListCallback = function(attList, insertBottom, duplicateCheck) {
    var attachEl = $('attachments');
    loadingImg.remove();
    var currentImgSrc = $('src').value;
    $A(attList).each(function(imgElem) {
      var cssClasses = 'imagePickerSource';
      if (imgElem.src == currentImgSrc) {
        cssClasses += ' selected';
      }
      var imgThmb = new Element('img', {
        'src' : (imgElem.src + '?celheight=100&celwidth=100'),
        'class' : cssClasses
      });
      imgThmb.observe('load', centerImagePickerThumb);
      var imgDiv = new Element('div', {
        'class' : 'imagePickerWrapper'
      }).update(imgThmb);
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
    });
    attachEl.select('.imagePickerSource').each(function(elem) {
        if (!elem.hasClassName('selected')) {
          elem.observe('click', clickOnFileAction);
        }
      });
};

var clickOnFileAction = function (event) {
  event.stop();
  var filename = this.src;
  if (!filename) {
    filename = this.href;
  }
  if (filename && document.forms[0].src) {
    filename = filename.replace(/^(.+)\?.*/, '$1');
    document.forms[0].src.value = filename;
    var oldSelection = $$('img.imagePickerSource.selected');
    if (oldSelection.size() > 0) {
      oldSelection[0].removeClassName('selected');
      oldSelection[0].observe('click', clickOnFileAction);
    }
    this.addClassName('selected');
    this.stopObserving('click', clickOnFileAction);
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
