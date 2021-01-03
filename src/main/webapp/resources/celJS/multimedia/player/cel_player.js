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
        var flvLink = elem.href.replace(/^..\/..\//g, window.CELEMENTS.getUtils().getPathPrefix()
            + '/');
        var cssClassNames = $w($(elem).className).without('celanim_overlay');
        var overlaySrc = window.getCelHost()
            + '?xpage=celements_ajax&ajax_mode=multimedia/InOverlay';
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

      openOverlayPlayer : function(e) {
        var _me = this;
        var elem = e.findElement('a');
        var overlayConfig = {x: 450, y: 105};
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

      _getPlayerCssClassNames : function() {
        return [ 'celanim_externalvideo', 'celanim_overlay_externalvideo' ];
      },

      _initalizePlayer : function(parentElem) {
        console.warn('_initalizePlayer: ToDo ExternalPlayer');
      }

    });
    window.CELEMENTS.multimedia.externalPlayer = new CELEMENTS.multimedia.ExternalPlayer();
  }

})(window);