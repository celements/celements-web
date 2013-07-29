var celOnBeforeLoadListenerArray = [];

var celAddOnBeforeLoadListener = function(listenerFunc) {
  celOnBeforeLoadListenerArray.push(listenerFunc);
};

if (typeof getCelHost === 'undefined') {
var getCelHost = function() {
  var celHost = document.location + '?';
  celHost = celHost.substring(0, celHost.indexOf('?'));
  return celHost;
};
}