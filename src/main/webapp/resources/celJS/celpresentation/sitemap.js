(function(window, undefined) {

  var pageLinkClickHandler = function(event) {
    event.stop();
    var theLink = this;
    var parentDiv = theLink.up('ul').up();
    var isInReorderMode = parentDiv.hasClassName('reorderMode');
    console.log('parent ul classes: ', parentDiv.getAttribute('class'), isInReorderMode);
    var linkUrl = theLink.href;
    var xredirect = 'xredirect=' + encodeURI(window.location.href);
    if (!linkUrl.match(/\?/)) {
      linkUrl += '?' + xredirect;
    } else {
      linkUrl += '&' + xredirect;
    }
    if (!isInReorderMode || confirm('Sie sind am neu ordnen der Knoten.'
        + ' Nicht gespeicherte Änderungen gehen verloren.')) {
        window.location.href = linkURL;
      }
  };

  var registerOnSiteEditLinks = function() {
    console.log('editLinks: ', $$('.presentation_order_edit ul li a'));
    $$('.presentation_order_edit ul li a').each(function(pageLink) {
      pageLink.observe('click', pageLinkClickHandler);
    });
  };

  $j(document).ready(registerOnSiteEditLinks);

})(window);
