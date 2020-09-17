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
    _analyticsPriorizedEventQueue : undefined,
    _addBind : undefined,
    _priorityAddBind : undefined,
    _sizeBind : undefined,
    _lowPrioritySizeBind : undefined,
    _highPrioritySizeBind : undefined,
    _sentHitsCountBind : undefined,
    _sendSessionOutOfHitsBind : undefined,
    _atHitsPerSessionLimitBind : undefined,
    _sendHitsBind : undefined,
    _getPrioMsgPartBind : undefined,

    initialize : function() {
      var _me = this;
      if (window.ga) {
        _me._analytics = window.ga;
        _me._analyticsEventQueue = new Array();
        _me._analyticsPriorizedEventQueue = new Array();
        _me._addBind = _me.add.bind(_me);
        _me._priorityAddBind = _me.priorityAdd.bind(_me);
        _me._sizeBind = _me.size.bind(_me);
        _me._lowPrioritySizeBind = _me.lowPrioritySize.bind(_me);
        _me._highPrioritySizeBind = _me.highPrioritySize.bind(_me);
        _me._sentHitsCountBind = _me.sentHitsCount.bind(_me);
        _me._sendSessionOutOfHitsBind = _me._sendSessionOutOfHits.bind(_me);
        _me._atHitsPerSessionLimitBind = _me._atHitsPerSessionLimit.bind(_me);
        _me._sendHitsBind = _me._sendHits.bind(_me);
        _me._getPrioMsgPartBind = _me._getPrioMsgPart.bind(_me);
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

    priorityAdd : function(action, parameters) {
      var _me = this;
      _me._analyticsPriorizedEventQueue.push({ 'action' : action, 'params' : parameters });
//      console.log('added priorized event');
    },

    size : function() {
      var _me = this;
      return _me._lowPrioritySizeBind() + _me._highPrioritySizeBind();
    },

    lowPrioritySize : function() {
      var _me = this;
      return _me._analyticsEventQueue.length;
    },

    highPrioritySize : function() {
      var _me = this;
      return _me._analyticsPriorizedEventQueue.length;
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
        while ((_me._highPrioritySizeBind() > 0) && !_me._atHitsPerSessionLimitBind() && (_me._availableHits > 1)) { // always keep 1 in reserve (for out of hits or missed)
          var nextHit = _me._analyticsPriorizedEventQueue.shift();
          ga(nextHit.action, nextHit.params);
          _me._availableHits--;
        }
        while ((_me._lowPrioritySizeBind() > 0) && !_me._atHitsPerSessionLimitBind() && (_me._availableHits > 2)) { // always keep 2 in reserve (+1 for a high prio event)
          var nextHit = _me._analyticsEventQueue.shift();
          ga(nextHit.action, nextHit.params);
          _me._availableHits--;
        }
        if (!_me._atHitsPerSessionLimitBind()) {
          _me._availableHits = Math.min(_me._availableHits + 2, 20); //each second you gain 2 hits up to a max of 20
          _me._sendHitsBind.delay(1.1); // +0.1 second to be sure hits are available
        } else { // 2 hits remaining for session
          if(_me._highPrioritySizeBind() > 0) {
            var nextHit = _me._analyticsPriorizedEventQueue.shift();
            ga(nextHit.action, nextHit.params);
          }
          _me._sendSessionOutOfHitsBind();
        }
      }
    },

    _atHitsPerSessionLimit : function() {
      var _me = this;
      return _me._sentHitsCountBind() >= (_me.maxHitsPerSession - 2);
    },

    _sendSessionOutOfHits : function() {
      var _me = this;
      _me._running = false;
      ga('send', {
        'hitType': 'event',
        'eventCategory': 'banner',
        'eventAction': 'missed',
        'eventLabel': _me._getPrioMsgPartBind() + _me._sizeBind() + ' in default queue on reaching 500 hits in session'
      });
    },

    _sendMissedHits : function(event) {
      var _me = this;
      _me._sendHitsBind();
      _me._running = false;
      if ((_me._highPrioritySizeBind() + _me._sizeBind()) > 0) {
        ga('send', {
          'hitType': 'event',
          'eventCategory': 'banner',
          'eventAction': 'missed',
          'eventLabel': _me._getPrioMsgPartBind() + _me._sizeBind() + ' in queue on unload'
        });
      }
    },

    _getPrioMsgPart : function() {
      var _me = this;
      var prioMsg = 'No priority events remaining. ';
      if(_me._highPrioritySizeBind() > 0) {
        var nextPrioObj = _me._analyticsPriorizedEventQueue.shift();
        prioMsg = _me._highPrioritySizeBind() + ' remaining high prio hits. Top most of which has' +
            ' action [' + nextPrioObj.eventAction + '] and label [' + nextPrioObj.eventLabel + ']. ';
      }
      return prioMsg;
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
