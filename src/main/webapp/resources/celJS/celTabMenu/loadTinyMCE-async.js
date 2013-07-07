var initCelRTE = function() {
  new Ajax.Request(getCelHost(), {
    method: 'post',
    parameters: {
       xpage : 'celements_ajax',
       ajax_mode : 'TinyConfig'
    },
    onSuccess: function(transport) {
      var tinyConfigJSON = transport.responseText.replace(/\n/g,' ');
      if (tinyConfigJSON.isJSON()) {
        tinyMCE.init(tinyConfigJSON.evalJSON());
      } else {
        console.error('TinyConfig is no json!', tinyConfigJSON);
      }
    }
  });
};

$j(document).ready(function() {
  getCelementsTabEditor().addAfterInitListener(function() {
    initCelRTE();
    if(typeof(resize) != 'undefined') {
      resize();
    }
  });
});
