/**
 * Presentation Link Handler
 * This is the link handler for presentation mode
 */
if(typeof CELEMENTS=="undefined"){var CELEMENTS={};};
if(typeof CELEMENTS.anim=="undefined"){CELEMENTS.anim={};};

(function() {

//////////////////////////////////////////////////////////////////////////////
// CELEMENTS Presentation Link Handler
//////////////////////////////////////////////////////////////////////////////
CELEMENTS.anim.PresentationLink = function() {
  // constructor
  this._init();
};

(function() {
var CPL = CELEMENTS.anim.PresentationLink;

CELEMENTS.anim.PresentationLink.prototype = {
  currentHref : undefined,
  currentStart : undefined,
  History : undefined,

  _init : function() {
    var _me = this;
    _me.currentHref = top.location.href;
    _me.currentStart = _me.currentHref.replace(/^([^\/]*\/\/[^\/]*\/).*/,'$1');
    _me.History = top.History;
  },

  isNotInsideFrame : function() {
    return (top === self);
  },

  shouldBeRenderedTop : function(linkHref) {
    var _me = this;
    var isTopEditLink = top.location.pathname.startsWith('/edit/');
    var isTopDownloadLink = top.location.pathname.startsWith('/download/');
    return (!_me.shouldRenderPage(linkHref) && !isTopEditLink && !isTopDownloadLink);
  },

  shouldRenderPage : function(pageHref) {
    var isEditorLoggedIn = $$('body')[0].hasClassName('celementsmenubarvisible');
    var url = new Element('a', {
      'href' : pageHref
    });
    var pathname = url.pathname;
    var isEditLink = pathname.startsWith('/edit/');
    var isDownloadLink = pathname.startsWith('/download/');
    var isResourcesLink = (pathname.startsWith('/skin/') || pathname.startsWith('/file/'));
//    console.log('isEditLink: ', pathname, isEditLink);
    //  console.log('rendering: ', pathname, url.search);
  //  console.log('hash value: ', url.hash);
  //  console.log('search value: ', url.search);
    var hasSearchValue = ((typeof url.search != 'undefined') && (url.search != ''));
    return ((pathname != '/login') && !isEditLink && !isDownloadLink
        && !hasSearchValue && !isResourcesLink);
  },

  isCelanimLink : function(linkElem) {
    return (linkElem.hasClassName('celanim_audio')
      || linkElem.hasClassName('celanim_flowplayer')
      || linkElem.hasClassName('celanim_flowplayerStart')
      || linkElem.hasClassName('celanim_overlay')
      || linkElem.hasClassName('celanim_overlayIframe'));
  },

  isInternalLink : function(linkElem) {
    var _me = this;
    var linkHref = linkElem.href;
    return linkHref.startsWith('/') || linkHref.startsWith(_me.currentStart);
  },

  registerInternalLinks : function(parentElem) {
    var _me = this;
    if ($(parentElem).select) {
      if ((typeof console != 'undefined') && (typeof console.log != 'undefined')) {
        console.log('registerInternalLinks: ', $(parentElem).select('a').size());
      }
      $(parentElem).select('a').each(function(linkElem) {
  //      console.log('register linkElem: ', linkElem, isInternalLink(linkElem), !isCelanimLink(linkElem));
        if (_me.isInternalLink(linkElem) && !_me.isCelanimLink(linkElem)) {
          linkElem.observe('click', _me.presentationNavigationHandler.bind(_me));
        }
      });
    }
  },

  presentationNavigationHandler : function(event) {
    var _me = this;
    var linkElem = event.findElement();
    if (linkElem.href) {
      event.stop();
      if (_me.shouldBeRenderedTop(linkElem.href)) {
        top.location.href = linkElem.href;
      } else {
        var realHref = linkElem.href;
  //      console.debug('realHref: ', realHref);
        var fakeHref = realHref.replace(/\/a\//, '/');
  //      console.debug('fakeHref: ', fakeHref);
        _me.History.pushState({ hiddenURL : realHref }, null, fakeHref);
      }
    }
  },

  checkShouldBeRenderedTop : function() {
    var _me = this;
    var newFramePageLink = window.location.href;
    if (_me.shouldBeRenderedTop(newFramePageLink)) {
      top.location.href = newFramePageLink;
    }
  }

};
})();

})();
