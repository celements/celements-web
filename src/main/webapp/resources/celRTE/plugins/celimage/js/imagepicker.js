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

var loadAttachmentListCallback = function(e) {
  if (e.isJSON()) {
    attList = e.evalJSON();
    var attachEl = $('attachments');
    attachEl.update('');
    $A(attList).each(function(imgElem) {
      var imgThmb = new Element('img', {
        'src' : (imgElem.src + '?celheight=100&celwidth=100'),
        'class' : 'imagePickerSource'
      });
      attachEl.insert({ bottom : imgThmb });
    });
//    attachEl.select('.imagePickerSource').each(function(elem) {
//        elem.observe('click', clickOnFileAction);
//      });
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
    CelImageDialog.showPreviewImage(filename);
//    mcTabs.displayTab('general_tab','general_panel');
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
