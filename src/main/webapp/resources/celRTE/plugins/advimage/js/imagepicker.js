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
       xpage : 'attachwysiwyg',
       images : '1',
       fieldname : "src"
    },
    onSuccess: function(transport) {
      loadAttachmentListCallback(transport.responseText);
    }
  });
}

var loadAttachmentListCallback = function(e) {
  var attachEl = document.getElementById("attachments");
  attachEl.innerHTML = e;
}

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
}
