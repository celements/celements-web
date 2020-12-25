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

  if (typeof window.CELEMENTS === "undefined") {window.CELEMENTS = {};}
  if (typeof window.CELEMENTS.multimedia === "undefined") {window.CELEMENTS.multimedia = {};}

  if (typeof window.CELEMENTS.multimedia.PlayerInitializer === 'undefined') {
    window.CELEMENTS.multimedia.PlayerInitializer = Class.create({
      _playerConf : undefined,
      _initDocumentReadyBind : undefined,

      initialize : function() {
        var _me = this;
        _me._initDocumentReadyBind = _me._initDocumentReady.bind(_me);
        $j(document).ready(_me._initDocumentReadyBind);
        _me._playerConf = new CELEMENTS.multimedia.PlayerConf();
      },

      _initDocumentReady : function() {
        var _me = this;
        _me._playerConf.celStopObserving("cel-media-player:confLoaded", _me._initDocumentReadyBind);
        if (_me._playerConf.isConfDefined()) {
          _me._player = new CELEMENTS.multimedia.Player(_me._playerConf);
        } else {
          _me._playerConf.celObserve("cel-media-player:confLoaded", _me._initDocumentReadyBind);
        }
      },

    });
    CELEMENTS.multimedia.PlayerInitializer.prototype = Object.extend(
        CELEMENTS.multimedia.PlayerInitializer.prototype, CELEMENTS.mixins.Observable);

    window.CELEMENTS.multimedia.generalPlayerInitializer =
      new CELEMENTS.multimedia.PlayerInitializer();
  }

  if (typeof window.CELEMENTS.multimedia.PlayerConf === 'undefined') {
    window.CELEMENTS.multimedia.PlayerConf = Class.create({
      _conf : undefined,

      initialize : function() {
        var _me = this;
        _me._asyncLoadConf();
      },

      _asyncLoadConf : function() {
        var _me = this;
        if (_me._isConfDefined())
          return;
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
                _me._conf = responseObject;
                _me.celFire("cel-media-player:confLoaded", _me._conf);
              }
            }
          }
        });
      },

      isConfDefined : function() {
        var _me = this;
        return ((typeof _me._conf !== 'undefined') && _me._conf.defaults);
      },

      getConfObj : function() {
        var _me = this;
        return _me._conf;
      }

    });
    CELEMENTS.multimedia.PlayerConf.prototype = Object.extend(
        CELEMENTS.multimedia.PlayerConf.prototype, CELEMENTS.mixins.Observable);
  }

  if (typeof window.CELEMENTS.multimedia.Player === 'undefined') {
    window.CELEMENTS.multimedia.Player = Class.create({
      _conf : undefined,
      _initDocumentReadyBind : undefined,

      initialize : function(playerConf) {
        var _me = this;
        _me._conf = playerConf.getConfObj();
        console.warn('TODO implement in Player');
        //registerCelAnimMoviePlayer(); //TODO implement in Player
      },

      openInOverlay : function(e, fixWidth, fixHeight) {
        var elem = e.findElement('a');
        var flvLink = elem.href.replace(/^..\/..\//g, window.CELEMENTS.getUtils().getPathPrefix()
            + '/');
        var cssClassNames = $w($(elem).className).without('celanim_overlay');
        var overlaySrc = window.getCelHost()
            + '?xpage=celements_ajax&ajax_mode=FlowplayerInOverlay';
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
      },

      celanimOpenInOverlaySFAudio : function(e) {
        var _me = this;
        _me.openInOverlay(e, 580, 70);
      },

      celanimOpenInOverlayAudio : function(e) {
        var _me = this;
        _me.openInOverlay(e, 580, 90);
      }

    });
    CELEMENTS.multimedia.Player.prototype = Object.extend(CELEMENTS.multimedia.Player.prototype,
        CELEMENTS.mixins.Observable);

    window.CELEMENTS.multimedia.generalPlayer = new CELEMENTS.multimedia.Player();
  }

  /*********************************
   * old movieplayer.js code follows
   *********************************/
  
  var celAnimMoviePlayerRegisterBodyDone = false;

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
      initEventTrackingInsideParent(parentElem, flowclassname);
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
      initEventTrackingInsideParent(parentElem, flowclassname);
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
      initEventTrackingInsideParent(parentElem, flowclassname);
    }
  };

})(window);