var baseurl;
var imgurl;
var editor_id;

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
  var attachEl = document.getElementById("attachments");
  attachEl.innerHTML = e;
  attachEl.select('.imagePickerSource').each(function(elem) {
      elem.observe('click', clickOnFileAction);
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
