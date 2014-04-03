(function(window, undefined) {
  $j(document).ready(function() {
    $$('.newsletter_receiver_inject .submit').each(function(ele) {
      ele.observe('click', sendForm);
    });
  });
  
  var sendForm = function(event) {
    event.stop()
    event.element().hide();
    var receivers = 0;
    $$('.receivers').each(function(rec) {
      var recarray = rec.value.split('\n');
      for(var i = 0; i < recarray.length; i++) {
        if(recarray[i].indexOf('@') > 0) {
          receivers++;
        }
      }
    });
    var doIt = confirm("Send Article to the " + receivers + " receivers?");
    if(doIt && (receivers > 0)) {
      var form = $$('.newsletter_receiver_inject')[0];
      var url = '?xpage=celements_ajax&ajax_mode=sendNewsletterToInjectedReceiverList';
      new Ajax.Request(url, {
          parameters : form.serialize(true),
          method : "post",
          onComplete : function(transport){
            $$('.newsletter_send_results').each(function(ele) {
              ele.innerHTML = transport.responseText;
            });
            event.element().show();
          }
      });
    } else {
      event.element().show();
    }
  };
})(window);