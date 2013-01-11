Event.observe(window, 'load', function() {
  registerCelAnimMoviePlayer();
});

var registerCelAnimMoviePlayer = function() {
  initMoviePlayerCssClasses(['celanim_mp3_flowplayer',
                             'celanim_flowplayer', 'celanim_overlay_flowplayer',
                             'celanim_flowplayer2', 'celanim_overlay_flowplayer2',
                             'celanim_oneflowplayer', 'celanim_overlay_oneflowplayer', 
                             'celanim_oneflowplayer2', 'celanim_overlay_oneflowplayer2',
                             'celanim_externalvideo', 'celanim_overlay_externalvideo']);
  initFlowPlayerLinks('a.celanim_flowplayerStart');
  initOneFlowPlayerLinks('a.celanim_oneflowplayerStart');
  initFlowPlayerAudioLinks('a.celanim_flowplayerAudioStart');
  initOverlayLinks('a.celanim_overlay');
  initCelAnimSWFPlayer();
};

var initCelAnimSWFPlayer = function() {
  if ($$('a.celanim_swfplayer').size() > 0) {
    $$('a.celanim_swfplayer').each(function(elem) {
      var celAnimLinkConfig = getCelAnimSWFConfigForLink(elem.href);
      if (celAnimLinkConfig && celAnimLinkConfig.replaceOnLoad) {
        celanimLoadSWFplayer(elem);
      }
      elem.stopObserving('click', celanimSWFplayerHandler);
      elem.observe('click', celanimSWFplayerHandler);
    });
    initEventTracking('a.celanim_swfplayer');
  }
};

var initMoviePlayerCssClasses = function(cssClassNames) {
  $A(cssClassNames).each(function(flowclassname) {
    if ($$('a.' + flowclassname).size() > 0) {
      $$('a.' + flowclassname).each(function(elem) {
      var flvLink = elem.href.replace(/^..\/..\//g, '/');
      elem.href = flvLink;
      elem.removeClassName(flowclassname);
      if (flowclassname.indexOf('overlay') > 0) {
        elem.addClassName('celanim_overlay');
        elem.addClassName(flowclassname.replace(/_overlay_/g, '_'));
      } else {
        if (elem.href.endsWith('.flv')) {
          if (flowclassname.indexOf('oneflowplayer') > 0) {
            elem.addClassName('celanim_oneflowplayerStart');
          } else {
            elem.addClassName('celanim_flowplayerStart');
          }
        } else if (elem.href.endsWith('.mp3')) {
          var isLinkEmpty = (elem.innerHTML.strip() == '');
          if (!isLinkEmpty) {
              if (flowclassname.indexOf('oneflowplayer') > 0) {
                elem.addClassName('celanim_oneflowplayerAudioStart');
              } else {
                elem.addClassName('celanim_flowplayerAudioStart');
              }
          } else {
            if ((typeof console != 'undefined') && (typeof console.warn != 'undefined')) {
              console.warn('Skipping empty flowplayer-Link which might cause automatic '
                + ' playing on page load.');
            }
          }
        } 
        else {
            elem.addClassName('celanim_swfplayer');
        }
      }
      if (flowclassname.indexOf('_externalvideo') > 0) {
        var celAnimLinkConfig = getCelAnimSWFConfigForLink(elem.href);
        if (celAnimLinkConfig && celAnimLinkConfig.cssClass) {
          elem.addClassName(celAnimLinkConfig.cssClass);
        }
      } else if (flowclassname.indexOf('_mp3_') > 0) {
          elem.addClassName('celanim_audio');
      } else {
        if (flowclassname.endsWith('2')) {
          elem.addClassName('celanim_16to9');
        } else {
          elem.addClassName('celanim_4to3');
        }
      }
    });
    }
  });
};

var celanimSWFplayerHandler = function(event) {
  var playerLink = event.findElement('a');
  if (playerLink) {
    celanimLoadSWFplayer(playerLink);
  }
  event.stop();
};

var celanimLoadSWFplayer = function(playerLink) {
  if (playerLink && !playerLink.hasClassName('celanim_loaded')) {
    playerLink.addClassName('celanim_loaded');
    var movieLink = getCelAnimSWFmovieLink(playerLink.href);
    //TODO replace swf-object creation with http://code.google.com/p/swfobject/
    //--> it solves issues at least with IE7!!!
//    playerContainer.update(new Element('span', { 'id' : 'celanimFlowPlayer_object' }));
//    swfobject.embedSWF(movieLink, "celanimFlowPlayer_object", "100%", "100%", "9.0.0", "expressInstall.swf");
    var objectElem = new Element('object', {
      'type' : 'application/x-shockwave-flash',
      'data' : movieLink,
      'style' : 'height: 100%; width: 100%;'
      });
    objectElem.insert(new Element('param', { 'name' : 'movie', 'value' : movieLink}));
    objectElem.insert(new Element('param', { 'name' : 'allowScriptAccess',
      'value' : 'sameDomain'}));
    objectElem.insert(new Element('param', { 'name' : 'quality', 'value' : 'best'}));
    objectElem.insert(new Element('param', { 'name' : 'scale', 'value' : 'showall'}));
//      wmode=opaque --> prevent flash appear before overlay elements
//      Flash movies can appear on top of Overlay instances in IE and Gecko-based browsers.
//      To fix this problem, set the "wmode" of the Flash movie to either "transparent" or "opaque".
//       For more information see the Adobe TechNote http://kb.adobe.com/selfservice/viewContent.do?externalId=tn_15523 on this issue.
    objectElem.insert(new Element('param', { 'name' : 'wmode', 'value' : 'opaque'}));
    playerLink.update(objectElem);
  }
};

var getCelAnimObject = function() {
  var celAnimObject = [
    { 
    'name' : 'vimeo',
    'matchStr' : '^https?:\/\/vimeo.com\/.*?',
    'replaceStr' : 'http://vimeo.com/moogaloop.swf?clip_id=',
    'cssClass' : 'celanim_vimeo',
    'replaceOnLoad' : true
    },
    { 'name' : 'youtube',
    'matchStr' : '^http:\/\/www.youtube.com\/.*?[\/=]',
    'replaceStr' : 'http://www.youtube.com/v/',
    'cssClass' : 'celanim_youtube',
    'replaceOnLoad' : true
    },
    { 'name' : 'sfvideoPortal',
    'matchStr' : '^http:\/\/(www.videoportal.sf.tv|www.sf.tv)\/.*[\/=]',
    'replaceStr' : 'http://www.sf.tv/videoplayer/embed/',
    'cssClass' : 'celanim_sfvideo',
    'replaceOnLoad' : true
    }];
  return celAnimObject;
};

var getCelAnimSWFConfigForLink = function(elemHref) {
  var celAnimLinkReplaceObject = getCelAnimObject();
  var isFound = false;
  var configObject = null;
  $A(celAnimLinkReplaceObject).each(function(linkReplaceObj) {
    if (!isFound && elemHref.match(new RegExp(linkReplaceObj.matchStr))) {
      isFound = true;
      configObject = linkReplaceObj;
    }
  });
  return configObject;
};


var getCelAnimSWFmovieLink = function(elemHref) {
  var linkReplaceObj = getCelAnimSWFConfigForLink(elemHref);
  if (linkReplaceObj) {
    elemHref = elemHref.replace(new RegExp(linkReplaceObj.matchStr),
       linkReplaceObj.replaceStr);
  }
  return elemHref;
};

var celAnimGetHexColor = function(color) {
  if (color.startsWith('rgb')) {
    var rgbValues = color.replace(/.*?(\d+)[,)]/g, '$1,').split(',');
    return '#' + parseInt(rgbValues[0]).toString(16) + parseInt(rgbValues[1]).toString(16)
      + parseInt(rgbValues[2]).toString(16);
  } else if (color.startsWith('transparent')) {
    return '#FFFFFF';
  } else {
    return color;
  }
};

var initFlowPlayerLinks = function(flowclassname) {
  if (($$(flowclassname).size() > 0) || $(flowclassname)) {
  flowplayer(flowclassname, {
    src: '$xwiki.getSkinFile("celJS/flowplayer/flowplayer-3.2.6.swf", true)',
    wmode: 'opaque'
    }, {
    clip: conf.defaults, 
    plugins: {
        controls: conf.skins.dark
      } 
    });
   initEventTracking(flowclassname);
  }
};

var initOneFlowPlayerLinks = function(flowclassname) {
  if ($$(flowclassname).size() > 0) {
    var flowLink = $$(flowclassname)[0];
    var playerid = 'celanimFlowPlayer';
    flowLink.id = playerid;
    flowLink.innerHTML = '';
    initFlowPlayerLinks(playerid);
  }
};

var initFlowPlayerAudioLinks = function(flowclassname) {
  if ($$(flowclassname).size() > 0) {
  var clipConfig = conf.defaults;
  if (clipConfig.autoBuffering && !clipConfig.autoPlay) {
    //there is a problem with the flash if the mp3 has not ID3 tags of version 2.3 - 2.4
    //http://code.google.com/p/flowplayer-core/issues/detail?id=138
    //http://flowplayer.org/forum/3/11094
    clipConfig.autoBuffering = false;
    if ((typeof console != 'undefined') && (typeof console.warn != 'undefined')) {
      console.warn('Discovered bad configuration of flowplayer (autoPlay=false and'
        + ' autoBuffering=true). Deactivating autoBuffering to prevent flash-problems.'
        + ' For more details see: '
        + ' http://code.google.com/p/flowplayer-core/issues/detail?id=138 and '
        + ' http://flowplayer.org/forum/3/11094');
    }
  }
  flowplayer(flowclassname, {
        src: '$xwiki.getSkinFile("celJS/flowplayer/flowplayer-3.2.6.swf", true)',    
        wmode: 'opaque'
      }, {
      clip: clipConfig, 
      plugins: {
          content: {
            url: '$xwiki.getSkinFile("celJS/flowplayer/flowplayer.content-3.2.0.swf", true)',
            left: 0,
            top: 0,
            width: '100%',
            opacity: 1.0,
            borderRadius: 0,
            padding: 0,
            backgroundColor: '#FFFFFF',
            border: '0px solid #FFFFFF'
          },
          controls: {
            height : 30,
            'z-Index': 99,
            fullscreen: false,
            autoHide: false
          }
      },
      onBeforeClick: function() {
        this.getParent().setStyle({display : 'block'});
        this.getParent().setStyle({height: (this.getParent().getHeight() + 35) + "px"});
        this.celStoreHtml = this.getParent().innerHTML;
      },
      onBeforeLoad: function() {
        var playerConf = this.getConfig(false);
        playerConf.plugins.content.height = this.getParent().getHeight()
           - playerConf.plugins.controls.height;
        var celanimStyle = {
          'color': celAnimGetHexColor(this.getParent().getStyle('color')),
          'font-family': this.getParent().getStyle('font-family'),
          'font-size': this.getParent().getStyle('font-size'),
          'font-style': this.getParent().getStyle('font-style')
        };
        playerConf.plugins.content.style = {
          '.celanim_audiocontent': celanimStyle
        };
        playerConf.plugins.content.backgroundColor = 
          celAnimGetHexColor(this.getParent().getStyle('background-color'));
      },
      onLoad: function() {
        this.getPlugin("content").setHtml('<span class="celanim_audiocontent">'
           + this.celStoreHtml + '</span>');
        this.getPlugin("content").height = this.getParent().getHeight()
           - this.getPlugin("controls").height;
      },
      onUnload: function() {
        this.getParent().setStyle({display : 'inline'});
        this.getParent().setStyle({height: 'auto'});
      }
    });
    initEventTracking(flowclassname);
  }
};

var initOverlayLinks = function(flowclassname) {
  if ($$(flowclassname).size() > 0) {
    $$(flowclassname).each(function(flowLink) {
      flowLink.observe('click', celanimOpenInOverlay);
    });
    initEventTracking(flowclassname);
  }
};

var getCelHost = function() {
  var celHost = document.location + '?';
  celHost = celHost.substring(0, celHost.indexOf('?'));
  return celHost;
};

var celanimOpenInOverlay = function(e) {
  var elem = e.findElement('a');
  var flvLink = elem.href.replace(/^..\/..\//g, '/');
  var cssClassNames = $w($(elem).className).without('celanim_overlay');
  var overlaySrc = getCelHost() + '?xpage=celements_ajax&ajax_mode=FlowplayerInOverlay';
  overlaySrc += '&cssclassname=' + cssClassNames.join(',');
  overlaySrc += '&flvfilename=' + flvLink;
  hs.graphicsDir = 'highslide/graphics/';
  hs.outlineType = '';
  hs.wrapperClassName = 'no-footer no-move draggable-header celanim_overlay_wrapper '
    + cssClassNames.join(' '); 
  hs.htmlExpand(null, {
    src : overlaySrc,
    objectType: 'iframe',
    dimmingOpacity: 0.60,
    dragByHeading : false,
    align : 'center',
    preserveContent : false,
    objectHeight: '0' //important for IE!!!
  });
  e.stop();
};

var initEventTracking = function(cssselector) {
  if(typeof _gaq != 'undefined') {
    $$(cssselector).each(function(elemToTrack) {
      elemToTrack.observe('click', trackEvent);
    });
  }
};

var trackEvent = function(e) {
  var label = this.title;
  if (label.empty()) {
    label = this.href;
  }
  var action = "Play";
  var category = "Video";
  if (this.hasClassName("celanim_audio")) {
    category = "Audio";
  }
  _gaq.push(['_trackEvent',category,action,label]);
};
