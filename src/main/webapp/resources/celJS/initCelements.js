var celOnBeforeLoadListenerArray = [];

var celAddOnBeforeLoadListener = function(listenerFunc) {
  celOnBeforeLoadListenerArray.push(listenerFunc);
};
