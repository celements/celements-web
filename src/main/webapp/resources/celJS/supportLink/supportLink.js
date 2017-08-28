(function(window, undefined) {
  "use strict";
  
  /**
   * Initialize all Jira-SupportBox
   */
  celAddOnBeforeLoadListener(function() {
    console.log("<<<<<<<<<<<<<<<<< supportLink IN celAddOnBeforeLoadListener");
    $(document.body).stopObserving('cel:messagesLoaded', openJiraSupportBoxInit)
    $(document.body).observe('cel:messagesLoaded', openJiraSupportBoxInit)
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
    // Requires jQuery!
    console.log("<<<<<<<<<<<<<<<<< supportLink openJiraSupportBoxInit supportLinkURL: ", window.celMessages.celmenu.supportLinkURL);
    jQuery.ajax({
        url: window.celMessages.celmenu.supportLinkURL,
        type: "get",
        cache: true,
        dataType: "script"
    });
  };

})(window);
