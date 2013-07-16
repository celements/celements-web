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

var finishedCelRTE_tinyMCE_Load = false;

var celFinishTinyMCEStart = function() {
  finishedCelRTE_tinyMCE_Load = true;
  $$('body')[0].fire('celRTE:finishedInit');
};

var delayedEditorOpeningHandler = function(event) {
  var mceEditorAreaAvailable = ($$('#tabMenuPanel .mceEditor').size() > 0);
  if (!finishedCelRTE_tinyMCE_Load && mceEditorAreaAvailable) {
    event.stop();
    $$('body')[0].observe('celRTE:finishedInit', function() {
      event.memo.start();
    });
  }
};

$j(document).ready(function() {
  $('tabMenuPanel').observe('tabedit:finishedLoadingDisplayNow',
      delayedEditorOpeningHandler);
  getCelementsTabEditor().addAfterInitListener(function() {
    initCelRTE();
    if(typeof(resize) != 'undefined') {
      resize();
    }
  });
});
