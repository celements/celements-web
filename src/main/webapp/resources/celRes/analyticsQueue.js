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
    _running : false,
    _analyticsEventQueue : undefined,
    _analyticsPriorizedEventQueue : undefined,
    _addBind : undefined,
    _priorityAddBind : undefined,
    _sizeBind : undefined,
    _lowPrioritySizeBind : undefined,
    _highPrioritySizeBind : undefined,
    _sendHitsBind : undefined,
    _getPrioMsgPartBind : undefined,

    initialize : function() {
      var _me = this;
  	  _me._analyticsEventQueue = new Array();
      _me._analyticsPriorizedEventQueue = new Array();
	  _me._addBind = _me.add.bind(_me);
	  _me._priorityAddBind = _me.priorityAdd.bind(_me);
	  _me._sizeBind = _me.size.bind(_me);
	  _me._lowPrioritySizeBind = _me.lowPrioritySize.bind(_me);
	  _me._highPrioritySizeBind = _me.highPrioritySize.bind(_me);
	  _me._sendHitsBind = _me._sendHits.bind(_me);
	  _me._getPrioMsgPartBind = _me._getPrioMsgPart.bind(_me);
	  _me._running = true;
	  _me._sendHitsBind();
	  Event.observe(window, 'beforeunload', _me._sendMissedHits.bind(_me));
    },

    add : function(action, parameters) {
      var _me = this;
      _me._analyticsEventQueue.push({ 'action' : action, 'params' : parameters });
    },

    priorityAdd : function(action, parameters) {
      var _me = this;
      _me._analyticsPriorizedEventQueue.push({ 'action' : action, 'params' : parameters });
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
    
    _sendHits : function() {
      var _me = this;
      console.debug('send hits, _running', _me._running, ', queue size is', _me._sizeBind());
      if (_me._running) {
        while (_me._highPrioritySizeBind() > 0) {
          var nextHit = _me._analyticsPriorizedEventQueue.shift();
          window.CELEMENTS.analytics.MatomoQueue().push(['trackEvent', nextHit.params.eventAction, nextHit.params.eventLabel, nextHit.params.eventValue]);
        }
        while (_me._lowPrioritySizeBind() > 0) {
          var nextHit = _me._analyticsEventQueue.shift();
          window.CELEMENTS.analytics.MatomoQueue().push(['trackEvent', nextHit.params.eventAction, nextHit.params.eventLabel, nextHit.params.eventValue]);
        }
        _me._sendHitsBind.delay(.5);
      }
    },

    _sendMissedHits : function(event) {
      var _me = this;
      _me._sendHitsBind();
      _me._running = false;
      if ((_me._highPrioritySizeBind() + _me._sizeBind()) > 0) {
        window.CELEMENTS.analytics.MatomoQueue().push(['trackEvent', 'Ad', 'Missed hits: ', _me._getPrioMsgPartBind() + _me._sizeBind() + ' in queue on unload']);
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
  
  const initQueue = function() {
	if (window.CELEMENTS.analytics.MatomoQueue && window.CELEMENTS.analytics.MatomoQueue()) {
      window.CELEMENTS.analytics.Queue = new Queue();
    } else {
	  //console.debug('analytics delay', window.CELEMENTS.analytics.MatomoQueue);
	  setTimeout(initQueue, 200);
	}
  };

  document.addEventListener('DOMContentLoaded', function() {
    if (typeof window.CELEMENTS === "undefined"){ window.CELEMENTS={}; };
    if (typeof window.CELEMENTS.analytics === "undefined"){ window.CELEMENTS.analytics={}; };
    initQueue();
  });
})(window);
