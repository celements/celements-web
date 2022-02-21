// Make sure the XWiki 'namespace' exists.
if(typeof(XWiki) == 'undefined') {
  XWiki = new Object();
}
// Make sure the viewers 'namespace' exists.
if(typeof(XWiki.viewers) == 'undefined') {
  XWiki.viewers = new Object();
}

/**
 * JavaScript snippet that toggles line numbers on code view.
 */
XWiki.viewers.Code = Class.create({
  initialize : function (initialShowLineNumbers) {
    this.showingLineNumbers = initialShowLineNumbers;
    this.toggleLink = $('toggleLineNumbers');
    this.showText = "$msg.get('core.viewers.code.showLineNumbers')";
    this.hideText = "$msg.get('core.viewers.code.hideLineNumbers')";
    if (this.toggleLink) {
      this.textarea = this.toggleLink.up().down('textarea');
      if (this.textarea) {
        this.attachToggleListener();
      }
    }
  },
  attachToggleListener : function() {
    this.toggleLink.href = '';
    this.toggleLink.observe('click', this.toggleLineNumbers.bindAsEventListener(this));
  },
  toggleLineNumbers : function(event) {
    if (event) {
      event.stop();
    }
    var sep = '\n';
    var lines = this.textarea.value.split(sep);
    // The textarea contains an extra empty line. Don't number it.
    var totalLines = lines.size() - 1;
    var prefixLength = Math.ceil(Math.log(totalLines + 1)/Math.LN10);
    for (var i = 0; i < totalLines; ++i) {
      if (this.showingLineNumbers) {
        lines[i] = lines[i].replace(/^\s*[0-9]+:\s/, '');
      } else {
        var lineNumber = i + 1 + '';
        lines[i] = ' '.times(prefixLength - lineNumber.length) + lineNumber + ': ' + lines[i];
      }
    }
    this.textarea.value = lines.join(sep);
    this.showingLineNumbers = !this.showingLineNumbers;
    if (this.showingLineNumbers) {
      this.toggleLink.update(this.hideText);
    } else {
      this.toggleLink.update(this.showText);
    }
  }
});

document.observe('dom:loaded', function() {
  var initialLineNumbers = true;
  if (window.location.search.indexOf('showlinenumbers=0') >= 0) {
    initialLineNumbers = false;
  }
  new XWiki.viewers.Code(initialLineNumbers);
});