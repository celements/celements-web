Event.observe(window, 'load', getSuggestConf);

function getSuggestConf() {
  var fields = new Array();
  $$('input').each(function(inpField){
    if(inpField.type == 'text') {
      fields.push(inpField.id);
    }
  });
  new Ajax.Request('?', {
    method : 'post',
    parameters : {
      'xpage' : 'celements_ajax',
      'ajax_mode' : 'GetSuggestFields',
      'fields' : fields
    },
    onSuccess : function(transport){
      answer = transport.responseText;
      if(answer.isJSON()) {
        jsonanswer = transport.responseText.evalJSON();
        for(var i = 0; i < jsonanswer.length; i++) {
          addSuggest(jsonanswer[i]);
        }
      } else {
        if ((typeof console != 'undefined') && (typeof console.error != 'undefined')) {
          console.error("Ajax answer is no JSON.", transport);
        }
      }
    },
    onFailure : function(transport) {
      if ((typeof console != 'undefined') && (typeof console.error != 'undefined')) {
        console.error("Getting suggest fields failed.", transport);
      }
    }
  });
}

var addSuggest = function(conf) {
  Event.observe($(conf.id), "focus", function() {
    var url = '?xpage=suggest&classname=' + conf.classname + '&fieldname=' + conf.fieldname + '&';
      new XWiki.widgets.Suggest(this, {
          script: url, 
          varname: "input", 
          seps: " ,|",
          offsety: 13,
          minchars: 2,
          timeout: 10000
      });
  });
};
