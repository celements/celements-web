(function(window, undefined) {

  var pageLinkClickHandler = function(event) {
    event.stop();
    var theLink = this;
    var parentUl = theLink.up('ul');
    console.log('parent ul classes: ', parentUl.getAttribute('class'));
  };

  var registerOnSiteEditLinks = function() {
    console.log('editLinks: ', $$('.presentation_order_edit ul li a'));
    $$('.presentation_order_edit ul li a').each(function(pageLink) {
      pageLink.observe('click', pageLinkClickHandler);
    });
  };

  $j(document).ready(registerOnSiteEditLinks);

})(window);
