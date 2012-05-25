$j.ctrl = function(key, callback, args) {
  $(document).keydown(function(event) {
    if(!args) args=[]; // IE barks when args is null
    if(event.keyCode == key.charCodeAt(0) && event.ctrlKey) {
      event.preventDefault();
      callback.apply(this, args);
      return false;
    }
  });
};
