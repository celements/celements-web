/*
 * See the NOTICE file distributed with this work for additional
 * information regarding copyright ownership.
 *
 * This is free software; you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as
 * published by the Free Software Foundation; either version 2.1 of
 * the License, or (at your option) any later version.
 *
 * This software is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this software; if not, write to the Free
 * Software Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA
 * 02110-1301 USA, or see the FSF site: http://www.fsf.org.
 */

(function(window, undefined) {
  "use strict";

  window.CELEMENTS.multimedia.Player = Class.create({
    memo : undefined,
    stopped : undefined,
    eventName : undefined,

    initialize : function() {
      var _me = this;
    }

  });

  var celAnimMoviePlayerRegisterBodyDone = false;
  var celAnimMoviePlayerRegisterBodyReadyMissed = false;

  var registerCelAnimMoviePlayer = function() {
    if (!celAnimMoviePlayerRegisterBodyDone) {
      celAnimMoviePlayerRegisterBodyDone = true;
      registerCelAnimMoviePlayerInsideParent($$('body')[0]);
    }
  };

  var registerCelAnimMoviePlayerInsideParent = function(parentElem) {
    var shouldRegisterBodyEvent = $(document.body).fire('celanim_player:shouldRegisterInsideBody',
        parentElem);
    if (!shouldRegisterBodyEvent.stopped) {
      var parentElemIn = parentElem || $$('body')[0];
      initMoviePlayerCssClassesInsideParent(parentElemIn, [ 'celanim_mp3_flowplayer',
          'celanim_overlay_mp3_flowplayer', 'celanim_flowplayer', 'celanim_overlay_flowplayer',
          'celanim_flowplayer2', 'celanim_overlay_flowplayer2', 'celanim_oneflowplayer',
          'celanim_overlay_oneflowplayer', 'celanim_oneflowplayer2',
          'celanim_overlay_oneflowplayer2', 'celanim_externalvideo',
          'celanim_overlay_externalvideo' ]);
      initFlowPlayerLinksInsideParent(parentElemIn, 'a.celanim_flowplayerStart');
      initOneFlowPlayerLinksInsideParent(parentElemIn, 'a.celanim_oneflowplayerStart');
      initFlowPlayerAudioLinksInsideParent(parentElemIn, 'a.celanim_flowplayerAudioStart');
      initOverlayLinksInsideParent(parentElemIn, 'a.celanim_overlay');
    } else if ((typeof console != 'undefined') && (typeof console.log != 'undefined')) {
      console.log('register of celanim movieplayer stopped for ', parentElem);
    }
  };

  var initMoviePlayerCssClassesInsideParent = function(parentElem, cssClassNames) {
    $A(cssClassNames)
        .each(
            function(flowclassname) {
              if (parentElem.select('a.' + flowclassname).size() > 0) {
                parentElem
                    .select('a.' + flowclassname)
                    .each(
                        function(elem) {
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
                                if ((typeof console != 'undefined')
                                    && (typeof console.warn != 'undefined')) {
                                  console
                                      .warn('Skipping empty flowplayer-Link which might cause automatic '
                                          + ' playing on page load.');
                                }
                              }
                            } else {
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

  var getCelAnimObject = function() {
    var celAnimObject = [ {
      'name' : 'vimeo',
      'matchStr' : '^https?:\/\/vimeo.com\/.*?',
      'replaceStr' : 'https://vimeo.com/moogaloop.swf?clip_id=',
      'cssClass' : 'celanim_vimeo',
      'replaceOnLoad' : true
    }, {
      'name' : 'youtube',
      'matchStr' : '^https?:\/\/(www.youtube.com\/.*?[\/=]|youtu.be\/)',
      'replaceStr' : 'https://www.youtube.com/v/',
      'cssClass' : 'celanim_youtube',
      'replaceOnLoad' : true
    }, {
      'name' : 'sfaudioPortal',
      'matchStr' : '^https?:\/\/(www.srf.ch)\/.*\/audio/.*[\/=]',
      'replaceStr' : 'https://www.srf.ch/player/flash/srfplayer.swf?mode=embed&audio_id=',
      'cssClass' : 'celanim_sfaudio',
      'replaceOnLoad' : true
    }, {
      'name' : 'sfvideoPortal',
      'matchStr' : '^https?:\/\/(www.videoportal.sf.tv|www.sf.tv|www.srf.ch)\/.*[\/=]',
      'replaceStr' : 'https://www.srf.ch/player/flash/srfplayer.swf?mode=embed&segment_id=',
      'cssClass' : 'celanim_sfvideo',
      'replaceOnLoad' : true
    } ];
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
      elemHref = elemHref.replace(new RegExp(linkReplaceObj.matchStr), linkReplaceObj.replaceStr);
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

  var initFlowPlayerLinksInsideParent = function(parentElem, flowclassname) {
    if ((parentElem.select(flowclassname).size() > 0) || $(flowclassname)) {
      flowplayer(flowclassname, {
        src : conf.flowplayerPath,
        wmode : 'opaque'
      }, {
        clip : conf.defaults,
        plugins : {
          controls : conf.skins.dark
        }
      });
      initEventTracking(flowclassname);
    }
  };

  var initOneFlowPlayerLinksInsideParent = function(parentElem, flowclassname) {
    if (parentElem.select(flowclassname).size() > 0) {
      var flowLink = parentElem.select(flowclassname)[0];
      var playerid = 'celanimFlowPlayer';
      flowLink.id = playerid;
      flowLink.innerHTML = '';
      initFlowPlayerLinksInsideParent(parentElem, playerid);
    }
  };

  var initFlowPlayerAudioLinksInsideParent = function(parentElem, flowclassname) {
    if (parentElem.select(flowclassname).size() > 0) {
      var clipConfig = conf.defaults;
      if (clipConfig.autoBuffering && !clipConfig.autoPlay) {
        // there is a problem with the flash if the mp3 has not ID3 tags of
        // version 2.3 - 2.4
        // http://code.google.com/p/flowplayer-core/issues/detail?id=138
        // http://flowplayer.org/forum/3/11094
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
        src : '$xwiki.getSkinFile("celJS/flowplayer/flowplayer-3.2.6.swf", true)',
        wmode : 'opaque'
      }, {
        clip : clipConfig,
        plugins : {
          content : {
            url : '$xwiki.getSkinFile("celJS/flowplayer/flowplayer.content-3.2.0.swf", true)',
            left : 0,
            top : 0,
            width : '100%',
            opacity : 1.0,
            borderRadius : 0,
            padding : 0,
            backgroundColor : '#FFFFFF',
            border : '0px solid #FFFFFF'
          },
          controls : {
            height : 30,
            'z-Index' : 99,
            fullscreen : false,
            autoHide : false
          }
        },
        onBeforeClick : function() {
          this.getParent().setStyle({
            display : 'block'
          });
          this.getParent().setStyle({
            height : (this.getParent().getHeight() + 35) + "px"
          });
          this.celStoreHtml = this.getParent().innerHTML;
        },
        onBeforeLoad : function() {
          var playerConf = this.getConfig(false);
          playerConf.plugins.content.height = this.getParent().getHeight()
              - playerConf.plugins.controls.height;
          var celanimStyle = {
            'color' : celAnimGetHexColor(this.getParent().getStyle('color')),
            'font-family' : this.getParent().getStyle('font-family'),
            'font-size' : this.getParent().getStyle('font-size'),
            'font-style' : this.getParent().getStyle('font-style')
          };
          playerConf.plugins.content.style = {
            '.celanim_audiocontent' : celanimStyle
          };
          playerConf.plugins.content.backgroundColor = celAnimGetHexColor(this.getParent()
              .getStyle('background-color'));
        },
        onLoad : function() {
          this.getPlugin("content").setHtml(
              '<span class="celanim_audiocontent">' + this.celStoreHtml + '</span>');
          this.getPlugin("content").height = this.getParent().getHeight()
              - this.getPlugin("controls").height;
        },
        onUnload : function() {
          this.getParent().setStyle({
            display : 'inline'
          });
          this.getParent().setStyle({
            height : 'auto'
          });
        }
      });
      initEventTracking(flowclassname);
    }
  };

  var initOverlayLinksInsideParent = function(parentElem, flowclassname) {
    if (parentElem.select(flowclassname).size() > 0) {
      parentElem.select(flowclassname).each(function(flowLink) {
        if (flowLink.hasClassName('celanim_sfaudio')) {
          flowLink.observe('click', celanimOpenInOverlaySFAudio);
        } else if (flowLink.hasClassName('celanim_audio')) {
          flowLink.observe('click', celanimOpenInOverlayAudio);
        } else {
          flowLink.observe('click', celanimOpenInOverlay);
        }
      });
      initEventTracking(flowclassname);
    }
  };

  var celanimOpenInOverlaySFAudio = function(e) {
    celanimOpenInOverlay(e, 580, 70);
  };

  var celanimOpenInOverlayAudio = function(e) {
    celanimOpenInOverlay(e, 580, 90);
  };

  var celanimOpenInOverlay = function(e, fixWidth, fixHeight) {
    var elem = e.findElement('a');
    var flvLink = elem.href
        .replace(/^..\/..\//g, window.CELEMENTS.getUtils().getPathPrefix() + '/');
    var cssClassNames = $w($(elem).className).without('celanim_overlay');
    var overlaySrc = window.getCelHost() + '?xpage=celements_ajax&ajax_mode=FlowplayerInOverlay';
    overlaySrc += '&cssclassname=' + cssClassNames.join(',');
    overlaySrc += '&flvfilename=' + encodeURIComponent(flvLink);
    hs.graphicsDir = window.CELEMENTS.getUtils().getPathPrefix()
        + '/file/celJS/highslide/graphics/';
    hs.outlineType = '';
    hs.wrapperClassName = 'no-footer no-move draggable-header celanim_overlay_wrapper '
        + cssClassNames.join(' ');
    var params = {
      src : overlaySrc,
      objectType : 'iframe',
      dimmingOpacity : 0.60,
      dragByHeading : false,
      align : 'center',
      preserveContent : false,
      objectHeight : '0' // important for IE!!!
    };
    if (fixWidth) {
      params.width = fixWidth;
    }
    if (fixHeight) {
      params.height = fixHeight;
    }
    hs.htmlExpand(null, params);
    e.stop();
  };

  /**
   * deprecated on 30/12/2013
   */
  var initEventTracking = function(flowclassname) {
    if ((typeof console != 'undefined') && (typeof console.warn != 'undefined')) {
      console.warn('deprecated usage of initEventTracking.'
          + ' Instead use initEventTrackingInsideParent');
    }
    initEventTrackingInsideParent($$('body')[0], flowclassname);
  };

  var initEventTrackingInsideParent = function(parentElem, cssselector) {
    if (typeof _gaq != 'undefined') {
      parentElem.select(cssselector).each(function(elemToTrack) {
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
    if (typeof (ga) !== 'undefined') {
      ga('send', {
        'hitType' : 'event', // Required.
        'eventCategory' : category, // Required.
        'eventAction' : action, // Required.
        'eventLabel' : label
      });
    } else if (typeof (_gaq) !== 'undefined') {
      _gaq.push([ '_trackEvent', category, action, label ]);
    }
  };

  var asyncLoadConf = function() {
    new Ajax.Request(window.getCelHost(), {
      method : "POST",
      parameters : {
        'xpage' : 'celements_ajax',
        'ajax_mode' : 'movieplayerDefaults'
      },
      onSuccess : function(transport) {
        if (transport.responseText.isJSON()) {
          var responseObject = transport.responseText.evalJSON();
          if (responseObject.defaults) {
            conf = responseObject;
            if (celAnimMoviePlayerRegisterBodyReadyMissed) {
              registerCelAnimMoviePlayer();
            }
          }
        }
      }
    });
  };

  var isConfDefined = function() {
    return ((typeof conf !== 'undefined') && conf.defaults);
  };

  if (!isConfDefined()) {
    asyncLoadConf();
  }

  $j(document).ready(function() {
    if (isConfDefined()) {
      registerCelAnimMoviePlayer();
    } else {
      celAnimMoviePlayerRegisterBodyReadyMissed = true;
    }
  });

})(window);