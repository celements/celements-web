Event.observe(window, 'load', function(){
  if($('newsletter_subscribe')){
    $('newsletter_subscribe').observe('submit', function(event){
      newsletterajax($('newsletter_subscribe'), $('newsletter_subscribe_answer'));
      event.stop();
    });
  }
  if($('newsletter_unsubscribe')){
    $('newsletter_unsubscribe').observe('submit', function(event){
      newsletterajax($('newsletter_unsubscribe'), $('newsletter_unsubscribe_answer'));
      event.stop();
    });
  }
  if($('newsletter_activate')){
    $('newsletter_activate').observe('submit', function(event){
      newsletterajax($('newsletter_activate'), $('newsletter_activate_answer'));
      event.stop();
    });
  }
  if($('newsletter_send')){
    $('newsletter_send').observe('submit', function(event){
      var answerBox = $('newsletter_send_answer');
      if($('testBox').value == "1"){
        answerBox = $('testResultBox');
      }
      newsletterajax($('newsletter_send'), answerBox);
      event.stop();
    });
  }
});

function newsletterajax(form, answer){
  var isTest = ($('testBox').value == "1");
  if(isTest){
    answer.setStyle({ display : "none"});
    answer.siblings()[0].setStyle({ display : "" });
  } else {
    var confirmSend = confirm($('cel_newsletter_confirm_send_message').value);
    if(confirmSend){
      form.setStyle({ display : "none"});
      form.siblings()[0].setStyle({ display : "" });
    }
  }
  
  if(isTest || confirmSend){
    var url = form.action;
    if(url == ''){
      url = "?";
    }
    new Ajax.Request(url, {
      parameters : form.serialize(true),
      method : "post",
      onComplete : function(transport){
        answer.innerHTML = transport.responseText;
        if(isTest){
          answer.setStyle({ display : ""});
          answer.siblings()[0].setStyle({ display : "none" });
        } else {
          form.reset();
          form.siblings()[0].setStyle({ display : "none" })
          form.setStyle({ display : "" });
        }
      }
    });
  }
}