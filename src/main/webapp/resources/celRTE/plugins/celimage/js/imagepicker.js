var baseurl;
var imgurl;
var editor_id;
var attList = [];

Event.observe(window, 'load', function(){
  baseurl = tinyMCEPopup.getParam("wiki_attach_path");
  imgurl = tinyMCEPopup.getParam("wiki_imagedownload_path");
  editor_id = tinyMCEPopup.getWindowArg('editor_id');
  loadAttachmentList(baseurl);
});

var loadAttachmentList = function(baseurl) {
  new Ajax.Request(baseurl, {
    method: 'post',
    parameters: {
       xpage : 'celements_ajax',
       'ajax_mode' : 'imagePickerList',
       images : '1'
    },
    onSuccess: function(transport) {
      loadAttachmentListCallback(transport.responseText);
    }
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

var loadAttachmentListCallback = function(e) {
  if (e.isJSON()) {
    attList = e.evalJSON();
    var attachEl = $('attachments');
    attachEl.update('');
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
      attachEl.insert({ bottom : imgDiv });
    });
    attachEl.select('.imagePickerSource').each(function(elem) {
        if (!elem.hasClassName('selected')) {
          elem.observe('click', clickOnFileAction);
        }
      });
  } else if ((typeof console != 'undefined')
      && (typeof console.warn != 'undefined')) {
    console.warn('loadAttachmentListCallback: noJSON!!! ', e);
  }
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
