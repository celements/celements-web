var saveAccessRights = function() {
  getCelementsTabEditor().saveAndContinueAjax('accessRightForm', { onSuccess : function() {
    getCelementsTabEditor().getTab('tbrights', true);
  }});
};

var registerChangeListener = function() {
  $$('.cel_rightsSelect').each(function(elem) {
    elem.stopObserving('change', saveAccessRights);
    elem.observe('change', saveAccessRights);
  });
};

registerChangeListener();

 $('tbrights-tab').observe('tabedit:tabchange', registerChangeListener);
