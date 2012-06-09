if(celOnBeforeLoadListenerArray
    && (typeof celOnBeforeLoadListenerArray !== 'undefined')) {
  $A(celOnBeforeLoadListenerArray).each(function(listener) {
    listener();
  });
}
$$('body')[0].fire('celements:beforeOnLoad');
