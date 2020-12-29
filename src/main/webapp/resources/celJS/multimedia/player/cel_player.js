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

  if (typeof window.CELEMENTS.multimedia.PlayerConf === 'undefined') {
    window.CELEMENTS.multimedia.PlayerConf = Class.create({
      _conf : undefined,
      _confStr : undefined,

      initialize : function() {
        var _me = this;
        _me._asyncLoadConf();
      },

      _asyncLoadConf : function() {
        var _me = this;
        if (_me.isConfDefined())
          return;
        new Ajax.Request(window.getCelHost(), {
          method : "POST",
          parameters : {
            'xpage' : 'celements_ajax',
            'ajax_mode' : 'multimedia/config'
          },
          onSuccess : function(transport) {
            _me._confStr = transport.responseText;
            if (_me._confStr.isJSON()) {
              _me._conf = _me.getConfObjCopy();
              _me.celFire("cel-media-player:confLoaded", _me._conf);
            } else {
              console.warn('Failed to load cel-multimedia config (no json):', _me._confStr);
            }
          },
          onFailure : function(transport) {
            console.error('Failed to load cel-multimedia config:', transport);
          }
        });
      },

      isConfDefined : function() {
        var _me = this;
        return (typeof _me._conf === 'object');
      },

      getConfObjCopy : function() {
        var _me = this;
        return _me._confStr.evalJSON();
      },

      getConfObj : function(subConfigName) {
        var _me = this;
        if (_me._conf && _me._conf[subConfigName]) {
          console.debug('getConfObj: ', subConfigName, _me._conf[subConfigName]);
          return _me._conf[subConfigName];
        }
        return _me._conf;
      },


      _transformCssClassName : function(elem, flowclassname) {
        var _me = this;
        console.warn('_transformCssClassName: TODO implement in Player', elem, flowclassname);
        var flvLink = elem.href;
        elem.removeClassName(flowclassname);
        if (flowclassname.includes('overlay')) {
          elem.addClassName('celanim_overlay');
          elem.addClassName(flowclassname.replace(/_overlay_/g, '_'));
        } else {
          if (flvLink.endsWith('.mp3')) {
            var isLinkEmpty = (elem.innerHTML.strip() == '');
            if (!isLinkEmpty) {
              if (flowclassname.includes('oneflowplayer')) {
                elem.addClassName('celmultimedia_oneflowplayerAudioStart');
              } else {
                elem.addClassName('celmultimedia_flowplayerAudioStart');
              }
            } else {
              if ((typeof console != 'undefined')
                  && (typeof console.warn != 'undefined')) {
                console
                    .warn('Skipping empty flowplayer-Link which might cause automatic '
                        + ' playing on page load.');
              }
            }
          }
        }
        if (flowclassname.includes('_externalvideo')) {
          var celAnimLinkConfig = _me._getExternalMappingConfigForLink(flvLink);
          if (celAnimLinkConfig && celAnimLinkConfig.cssClass) {
            elem.addClassName(celAnimLinkConfig.cssClass);
          }
        } else if (flowclassname.includes('_mp3_')) {
          elem.addClassName('celmultimedia_audio');
        } else {
          if (flowclassname.endsWith('2')) {
            elem.addClassName('celmultimedia_16to9');
          } else {
            elem.addClassName('celmultimedia_4to3');
          }
        }
      },

      _getExternalMappingConfigForLink : function(elemHref) {
        var _me = this;
        var celAnimLinkReplaceObject = _me.getConfObj('externalVideoMapping');
        var isFound = false;
        var configObject = null;
        $A(celAnimLinkReplaceObject).each(function(linkReplaceObj) {
          if (!isFound && elemHref.match(new RegExp(linkReplaceObj.matchStr))) {
            isFound = true;
            configObject = linkReplaceObj;
          }
        });
        return configObject;
      }

    });
    CELEMENTS.multimedia.PlayerConf.prototype = Object.extend(
        CELEMENTS.multimedia.PlayerConf.prototype, CELEMENTS.mixins.Observable);
  }

  if (typeof window.CELEMENTS.multimedia.Player === 'undefined') {
    window.CELEMENTS.multimedia.Player = Class.create({
      _playerConf : undefined,
      _initDocumentReadyBind : undefined,

      initialize : function(playerConf) {
        var _me = this;
        _me._playerConf = playerConf;
        console.log('initialize Player: ', _me._playerConf);
        _me.registerPlayer();
      },

      registerPlayer : function(parentElem) {
        var _me = this;
        var parentElemIn = $(parentElem || document.body);
        console.log('registerPlayer: ', parentElem, parentElemIn);
        var shouldRegisterBodyEvent = _me.celFire('cel-media-player:shouldRegisterInsideBody',
            parentElemIn);
        if (!shouldRegisterBodyEvent.stopped) {
          console.log('registerPlayer: before initMoviePlayerCssClasses');
          _me.initMoviePlayerCssClassesInsideParent(parentElemIn, [ 'celanim_mp3_flowplayer',
              'celanim_overlay_mp3_flowplayer', 'celanim_flowplayer', 'celanim_overlay_flowplayer',
              'celanim_flowplayer2', 'celanim_overlay_flowplayer2', 'celanim_oneflowplayer',
              'celanim_overlay_oneflowplayer', 'celanim_oneflowplayer2',
              'celanim_overlay_oneflowplayer2', 'celanim_externalvideo',
              'celanim_overlay_externalvideo' ]);
          console.warn('registerPlayer: TODO');
//          initFlowPlayerLinksInsideParent(parentElemIn, 'a.celmultimedia_flowplayerStart');
//          initOneFlowPlayerLinksInsideParent(parentElemIn, 'a.celmultimedia_oneflowplayerStart');
//          initFlowPlayerAudioLinksInsideParent(parentElemIn, 'a.celmultimedia_flowplayerAudioStart');
//          initOverlayLinksInsideParent(parentElemIn, 'a.celmultimedia_overlay');
        } else if ((typeof console != 'undefined') && (typeof console.log != 'undefined')) {
          console.log('register of cel-mediaplayer stopped for ', parentElemIn);
        }
      },

      initMoviePlayerCssClassesInsideParent : function(parentElem, cssClassNames) {
        console.debug('initMoviePlayerCssClassesInsideParent: ', parentElem, cssClassNames);
        $A(cssClassNames).each(
                function(flowclassname) {
                  if (parentElem.select('a.' + flowclassname).size() > 0) {
                    parentElem
                        .select('a.' + flowclassname)
                        .each(function(elem) {
                            _me._playerConf._transformCssClassName(elem, flowclassname);
                          });
                  }
                });
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
  }

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

  /*********************************
   * old movieplayer.js code follows
   *********************************/

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
        src : conf.flowplayerConf.flowplayerPath,
        wmode : 'opaque'
      }, {
        clip : conf.flowplayerConf.flowplayerLookConf.defaults,
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
      var clipConfig = conf.flowplayerConf.flowplayerLookConf.defaults;
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
        src : conf.flowplayerConf.flowplayerPath,
        wmode : 'opaque'
      }, {
        clip : clipConfig,
        plugins : {
          content : {
            url : conf.flowplayerConf.flowplayerContentPath,
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