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
  
  var Queue = Class.create({
    maxHitsPerSession : 500,
    _running : false,
    _availableHits : 20,
    _analytics : undefined,
    _analyticsId : undefined,
    _analyticsEventQueue : undefined,
    _addBind : undefined,
    _sizeBind : undefined,
    _sentHitsCountBind : undefined,
    _sendSessionOutOfHitsBind : undefined,
    _atHitsPerSessionLimitBind : undefined,
    _sendHitsBind : undefined,
    
    initialize : function() {
      var _me = this;
      if (window.ga) {
        _me._analytics = window.ga;
        _me._analyticsEventQueue = new Array();
        _me._addBind = _me.add.bind(_me);
        _me._sizeBind = _me.size.bind(_me);
        _me._sentHitsCountBind = _me.sentHitsCount.bind(_me);
        _me._sendSessionOutOfHitsBind = _me._sendSessionOutOfHits.bind(_me);
        _me._atHitsPerSessionLimitBind = _me._atHitsPerSessionLimit.bind(_me);
        _me._sendHitsBind = _me._sendHits.bind(_me);
        var metas = $$('meta[name="cel-GAA-Num"]');
        if((metas.size() > 0) && (metas[0].content !== '')) {
          _me._analyticsId = metas[0].content;
          _me._running = true;
          _me._sendHitsBind();
          Event.observe(window, 'beforeunload', _me._sendMissedHits.bind(_me));
        }
      }
    },
    
    add : function(action, parameters) {
      var _me = this;
      _me._analyticsEventQueue.push({ 'action' : action, 'params' : parameters });
//      console.log('added event');
    },
    
    size : function() {
      var _me = this;
      return _me._analyticsEventQueue.length;
    },
    
    sentHitsCount : function() {
      var _me = this;
      if (typeof(gaData) !== 'undefined') {
        return gaData[_me._analyticsId].hitcount;
      }
      return null;
    },
    
    _sendHits : function() {
      var _me = this;
//      console.log('send hits, _running', _me._running, ', queue size is', _me._sizeBind(), ', hits availabe', _me._availableHits, ', hits sent', _me._sentHitsCountBind());
      if (_me._running) {
        while ((_me._sizeBind() > 0) && !_me._atHitsPerSessionLimitBind() && (_me._availableHits > 1)) { // always keep 1 in reserve
          var nextHit = _me._analyticsEventQueue.shift();
          ga(nextHit.action, nextHit.params);
          _me._availableHits--;
        }
        if (!_me._atHitsPerSessionLimitBind()) {
          _me._availableHits = Math.min(_me._availableHits + 2, 20); //each second you gain 2 hits up to a max of 20
          _me._sendHitsBind.delay(1.1); // +0.1 second to be sure hits are available
        } else { // 1 hit remaining for session
          _me._sendSessionOutOfHitsBind();
        }
      }
    },
    
    _atHitsPerSessionLimit : function() {
      var _me = this;
      return _me._sentHitsCountBind() >= (_me.maxHitsPerSession - 1);
    },
    
    _sendSessionOutOfHits : function() {
      var _me = this;
      _me._running = false;
      ga('send', {
        'hitType': 'event',
        'eventCategory': 'banner',
        'eventAction': 'missed',
        'eventLabel': _me._sizeBind() + ' in queue on reaching 500 hits in session'
      });
    },
    
    _sendMissedHits : function(event) {
      var _me = this;
      _me._sendHitsBind();
      _me._running = false;
      if (_me._sizeBind() > 0) {
        ga('send', {
          'hitType': 'event',
          'eventCategory': 'banner',
          'eventAction': 'missed',
          'eventLabel': _me._sizeBind() + ' in queue on unload'
        });
      }
    }
  });
  
  celAddOnBeforeLoadListener(function () {
    if (window.ga) {
      if (typeof window.CELEMENTS === "undefined"){ window.CELEMENTS={}; };
      if (typeof window.CELEMENTS.analytics === "undefined"){ window.CELEMENTS.analytics={}; };
      window.CELEMENTS.analytics.Queue = new Queue();
    }
  });
})(window);
