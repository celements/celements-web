var imagePickerCallback = function(filename, origFieldName) {
  var celAttDocFullName = $('nav_imagePicker').down('#image_prefix').innerHTML;
  var celAttFileName = celAttDocFullName.strip() + ';' + filename.strip();
  $('nav_imagePicker').down('#image').value = celAttFileName;
  var celAttUrl = celAttFileName.replace(/^([^\.]+)\.([^\.]+);(.+)$/,
      '/download/$1/$2/$3') + '?celwidth=200&celheight=200';
  $('nav_imagePicker').down('img#celMenuImagePreview').src = celAttUrl;
};
