Event.observe(window, 'load', function() {
  if ($$('.celements3_tabMenu').size() > 0) {
	  getCelementsTabEditor().initTabMenu();
  }
});

var _celementsTabEditor = new CELEMENTS.widget.TabEditor();

var getCelementsTabEditor = function() {
  return _celementsTabEditor;
};

var celLogMsgDebug = function(message) {
  if ((typeof console != 'undefined') && (typeof console.debug != 'undefined')) {
    console.debug(message);
  }
};
