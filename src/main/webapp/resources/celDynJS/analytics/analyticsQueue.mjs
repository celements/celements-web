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

export class Queue {
  static _running = false;
  _analyticsEventQueue;
  _analyticsPriorizedEventQueue;
  _addBind;
  _priorityAddBind;
  _sizeBind;
  _lowPrioritySizeBind;
  _highPrioritySizeBind;
  _sendHitsBind;
  _getPrioMsgPartBind;

  constructor() {
	  this._analyticsEventQueue = [];
    this._analyticsPriorizedEventQueue = [];
    this._addBind = this.add.bind(this);
    this._priorityAddBind = this.priorityAdd.bind(this);
    this._sizeBind = this.size.bind(this);
    this._lowPrioritySizeBind = this.lowPrioritySize.bind(this);
    this._highPrioritySizeBind = this.highPrioritySize.bind(this);
    this._sendHitsBind = this._sendHits.bind(this);
    this._getPrioMsgPartBind = this._getPrioMsgPart.bind(this);
    Queue._running = true;
    this._sendHitsBind();
    Event.observe(window, 'beforeunload', this._sendMissedHits.bind(this));
  }

  add(action, parameters) {
    this._analyticsEventQueue.push({ 'action' : action, 'params' : parameters });
  }

  priorityAdd(action, parameters) {
    this._analyticsPriorizedEventQueue.push({ 'action' : action, 'params' : parameters });
  }

  size() {
    return this._lowPrioritySizeBind() + this._highPrioritySizeBind();
  }

  lowPrioritySize() {
    return this._analyticsEventQueue.length;
  }

  highPrioritySize() {
    return this._analyticsPriorizedEventQueue.length;
  }
  
  _sendHits() {
    console.debug('send hits, _running', Queue._running, ', queue size is', this._sizeBind());
    if (Queue._running) {
      while (this._highPrioritySizeBind() > 0) {
        const nextHit = this._analyticsPriorizedEventQueue.shift();
        window.CELEMENTS.analytics.MatomoQueue().push(['trackEvent', nextHit.params.eventAction, nextHit.params.eventLabel, nextHit.params.eventValue]);
      }
      while (this._lowPrioritySizeBind() > 0) {
        const nextHit = this._analyticsEventQueue.shift();
        window.CELEMENTS.analytics.MatomoQueue().push(['trackEvent', nextHit.params.eventAction, nextHit.params.eventLabel, nextHit.params.eventValue]);
      }
      this._sendHitsBind.delay(.5);
    }
  }

  _sendMissedHits(event) {
    this._sendHitsBind();
    Queue._running = false;
    if ((this._highPrioritySizeBind() + this._sizeBind()) > 0) {
      window.CELEMENTS.analytics.MatomoQueue().push(['trackEvent', 'Ad', 'Missed hits: ', this._getPrioMsgPartBind() + this._sizeBind() + ' in queue on unload']);
    }
  }

  _getPrioMsgPart() {
    let prioMsg = 'No priority events remaining. ';
    if(this._highPrioritySizeBind() > 0) {
      const nextPrioObj = this._analyticsPriorizedEventQueue.shift();
      prioMsg = this._highPrioritySizeBind() + ' remaining high prio hits. Top most of which has' +
          ' action [' + nextPrioObj.eventAction + '] and label [' + nextPrioObj.eventLabel + ']. ';
    }
    return prioMsg;
  }
}

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
