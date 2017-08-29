(function(window, undefined) {
  "use strict";
  
  /**
   * Initialize all Jira-SupportBox
   */
  celAddOnBeforeLoadListener(function() {
    if(!window.celMessages.celmenu) {
      $(document.body).stopObserving('cel:messagesLoaded', openJiraSupportBoxInit)
      $(document.body).observe('cel:messagesLoaded', openJiraSupportBoxInit)
    } else {
      openJiraSupportBoxInit();
    }
    window.ATL_JQ_PAGE_PROPS =  {
      "triggerFunction": triggerFunction
    };
  });
  
  var triggerFunction = function(showCollectorDialog) {
    //Requires that jQuery is available!
    jQuery(".celements_menu_bar_support_item").click(function(e) {
      e.preventDefault();
      showCollectorDialog();
    });
  };

  var openJiraSupportBoxInit = function() {
    if((window.celMessages.celmenu != null) && (window.celMessages.celmenu.supportLinkURL != null)){
      // Requires jQuery!
      jQuery.ajax({
          url: window.celMessages.celmenu.supportLinkURL,
          type: "get",
          cache: true,
          dataType: "script"
      });
    }
  };

})(window);
