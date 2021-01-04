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


      transformCssClassName : function(elem, flowclassname) {
        var _me = this;
        var mediaLink = elem.href;
        elem.removeClassName(flowclassname);
        if (flowclassname.includes('overlay')) {
          elem.addClassName('celanim_overlay');
          elem.addClassName(flowclassname.replace(/_overlay_/g, '_'));
        } else {
          if (mediaLink.endsWith('.mp3')) {
            var isLinkEmpty = (elem.innerHTML.strip() == '');
            if (!isLinkEmpty) {
              if (flowclassname.includes('oneflowplayer')) {
                elem.addClassName('celmultimedia_oneAudioStart');
              } else {
                elem.addClassName('celmultimedia_audioStart');
              }
            } else {
                console.warn('Skipping empty flowplayer-Link which might cause automatic '
                        + ' playing on page load.', elem);
            }
          }
        }
        if (flowclassname.includes('_externalvideo')) {
          var celAnimLinkConfig = _me._getExternalMappingConfigForLink(mediaLink);
          if (celAnimLinkConfig && celAnimLinkConfig.cssClass) {
            elem.addClassName(celAnimLinkConfig.cssClass);
          }
          if (!elem.hasClassName('celanim_overlay')) {
            elem.addClassName('celmultimedia_externalvideo');
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
      },

      getExternalMovieLink : function (mediaLink) {
        var _me = this;
        var linkReplaceObj = _me._getExternalMappingConfigForLink(mediaLink);
        if (linkReplaceObj) {
          mediaLink = mediaLink.replace(new RegExp(linkReplaceObj.matchStr),
          linkReplaceObj.replaceStr);
          console.debug('getExternalMovieLink: after replace', mediaLink);
        } else {
          console.warn('getExternalMoveLink: no maching replace rule found.');
        }
        return mediaLink;
      }

    });
    CELEMENTS.multimedia.PlayerConf.prototype = Object.extend(
        CELEMENTS.multimedia.PlayerConf.prototype, CELEMENTS.mixins.Observable);
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
          _me.celFire('cel-media-player:initPlayers', _me._playerConf)
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

  /*************************
   * player definitions
   **************************/
  if (typeof window.CELEMENTS.multimedia.AbstractPlayer === 'undefined') {
    window.CELEMENTS.multimedia.AbstractPlayer = Class.create({
      _playerConf : undefined,
      _initPlayerBind : undefined,
      _openOverlayPlayer : undefined,

      initialize : function() {
        var _me = this;
        _me._initPlayerBind = _me._initPlayer.bind(_me);
        _me._openOverlayPlayerBind = _me.openOverlayPlayer.bind(_me);
        window.CELEMENTS.multimedia.generalPlayerInitializer.celObserve(
            'cel-media-player:initPlayers', _me._initPlayerBind);
      },

      _initPlayer : function(event) {
        var _me = this;
        _me._playerConf = event.memo;
        console.log('_initPlayer: ', _me._playerConf);
        _me.registerPlayer();
      },

      registerPlayer : function(parentElem) {
        var _me = this;
        var parentElemIn = $(parentElem || document.body);
        console.log('registerPlayer: ', parentElem, parentElemIn);
        var shouldRegisterBodyEvent = _me.celFire('cel-media-player:shouldRegisterInsideBody',
            parentElemIn);
        if (!shouldRegisterBodyEvent.stopped) {
          _me._initMultimedaPlayerInsideParent(parentElemIn, _me._getPlayerCssClassNames());
          _me._initalizePlayer(parentElemIn);
        } else if ((typeof console != 'undefined') && (typeof console.log != 'undefined')) {
          console.log('register of cel-mediaplayer stopped for ', parentElemIn);
        }
      },

      _getPlayerCssClassNames : function() {
        console.warn('_getPlayerCssClassNames: unimplemented method!');
        return [];
      },

      _initalizePlayer : function(parentElem) {
        console.warn('_initalizePlayer: unimplemented method!');
      },

      _initalizeOverlayPlayer : function (parentElem, overlayClassName) {
        var _me = this;
        if (parentElem.select(overlayClassName).size() > 0) {
          parentElem.select(overlayClassName).each(function (overlayLink) {
            overlayLink.stopObserving('click', _me._openOverlayPlayerBind);
            overlayLink.observe('click', _me._openOverlayPlayerBind);
          });
        }
      },

      _initMultimedaPlayerInsideParent : function(parentElem, cssClassNames) {
        var _me = this;
        console.debug('_initMultimedaPlayerInsideParent: ', parentElem, cssClassNames);
        $A(cssClassNames).each(
                function(flowclassname) {
                  if (parentElem.select('a.' + flowclassname).size() > 0) {
                    parentElem
                        .select('a.' + flowclassname)
                        .each(function(elem) {
                            _me._playerConf.transformCssClassName(elem, flowclassname);
                          });
                  }
                });
      },

      _openInOverlay : function(e, fixWidth, fixHeight) {
        var elem = e.findElement('a');
        var mediaLink = elem.href.replace(/^..\/..\//g, window.CELEMENTS.getUtils().getPathPrefix()
            + '/');
        var cssClassNames = $w($(elem).className).without('celanim_overlay');
        var overlaySrc = window.getCelHost()
            + '?xpage=celements_ajax&ajax_mode=multimedia/InOverlay';
        overlaySrc += '&cssclassname=' + cssClassNames.join(',');
        overlaySrc += '&mediaLink=' + encodeURIComponent(mediaLink);
        overlaySrc += '&additionalAttrs=autoplay';
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

      _getDefaultOverlayConfig : function() {
        return {x: 450, y: 105};
      },

      openOverlayPlayer : function(e) {
        var _me = this;
        var elem = e.findElement('a');
        var overlayConfig = _me._getDefaultOverlayConfig();
        if (elem.dataset.celMultimediaOverlayConfig && elem.dataset.celMultimediaOverlayConfig.isJSON()) {
          try {
            overlayConfig = elem.dataset.celMultimediaOverlayConfig.evalJSON();
          } catch(exp) {
            console.warn('openOverlayPlayer: no JSON config, fallback to default');
          }
        }
        _me._openInOverlay(e, overlayConfig.x, overlayConfig.y);
      }

    });
    CELEMENTS.multimedia.AbstractPlayer.prototype = Object.extend(
        CELEMENTS.multimedia.AbstractPlayer.prototype, CELEMENTS.mixins.Observable);
  }

  if (typeof window.CELEMENTS.multimedia.AudioPlayer === 'undefined') {
    window.CELEMENTS.multimedia.AudioPlayer = Class.create(CELEMENTS.multimedia.AbstractPlayer, {
      _createAudioElementBind : undefined,

      initialize : function($super) {
        var _me = this;
        $super();
        _me._createAudioElementBind = _me._createAudioElement.bind(_me);
      },

      _getPlayerCssClassNames : function() {
        return [ 'celanim_mp3_flowplayer', 'celanim_overlay_mp3_flowplayer'];
      },

      _initalizePlayer : function(parentElem) {
        var _me = this;
        parentElem.select('a.celmultimedia_audioStart').each(_me._createAudioElementBind);
        _me._initalizeOverlayPlayer(parentElem, 'a.celanim_overlay.celmultimedia_audio');
      },

      _getDefaultOverlayConfig : function() {
        return {x: 350, y: 105};
      },

      _createAudioElement : function(linkElem) {
        var audioElem = new Element('audio', { 'controls' : '', 'class' : linkElem.classNames() });
        var audioSrcElem = new Element('source', {
          'src' : linkElem.href,
          'type' : 'audio/mpeg'
        });
        audioElem.update(audioSrcElem);
        audioElem.insert({'bottom' : 'Your browser does not support the audio element.'});
        linkElem.replace(audioElem);
      }

    });    
    window.CELEMENTS.multimedia.audioPlayer = new CELEMENTS.multimedia.AudioPlayer();
  }

  if (typeof window.CELEMENTS.multimedia.ExternalPlayer === 'undefined') {
    window.CELEMENTS.multimedia.ExternalPlayer = Class.create(CELEMENTS.multimedia.AbstractPlayer, {
      _createExternalVideoElementBind : undefined,

      initialize : function($super) {
        var _me = this;
        $super();
        _me._createExternalVideoElementBind = _me._createExternalVideoElement.bind(_me);
      },

      _getPlayerCssClassNames : function() {
        return [ 'celanim_externalvideo', 'celanim_overlay_externalvideo' ];
      },

      _initalizePlayer : function(parentElem) {
        var _me = this;
        parentElem.select('a.celmultimedia_externalvideo').each(
          _me._createExternalVideoElementBind);
        _me._initalizeOverlayPlayer(parentElem, 'a.celanim_overlay.celanim_externalvideo');
      },

      _getDefaultOverlayConfig : function() {
        return {x: 560, y: 350};
      },

      _createExternalVideoElement : function(linkElem) {
      /** youtube
<iframe width="560" height="315" src="https://www.youtube.com/embed/33-AJqEA-7k" frameborder="0"
 allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
 allowfullscreen></iframe>
 */
        var _me = this;
        var linkSrcTransformed = _me._playerConf.getExternalMovieLink(linkElem.href);
        console.log('externalVideo create:', linkElem, linkSrcTransformed);
        var extVideoFrame = new Element('iframe', { 'allowfullscreen' : '',
          'class' : linkElem.classNames(), 'width' : '100%', 'height' : '100%', 
          'style' : 'height: 100%; width: 100%;', 'src' : linkSrcTransformed });
        console.warn('_initalizePlayer: ToDo ExternalPlayer embedded');
        linkElem.replace(extVideoFrame);
      }

    });
    window.CELEMENTS.multimedia.externalPlayer = new CELEMENTS.multimedia.ExternalPlayer();
  }

})(window);