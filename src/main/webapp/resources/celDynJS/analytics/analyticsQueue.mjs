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
  #running = false;
  #analyticsEventQueue;
  #analyticsPriorizedEventQueue;

  constructor() {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === "hidden") {
        this._sendMissedHits();
      }
    });
    this.#analyticsEventQueue = [];
    this.#analyticsPriorizedEventQueue = [];
    this.#running = true;
    this._sendHits();
  }

  add(action, parameters) {
    this.#analyticsEventQueue.push({ 'action' : action, 'params' : parameters });
  }

  priorityAdd(action, parameters) {
    this.#analyticsPriorizedEventQueue.push({ 'action' : action, 'params' : parameters });
  }

  size() {
    return this.lowPrioritySize() + this.highPrioritySize();
  }

  lowPrioritySize() {
    return this.#analyticsEventQueue.length;
  }

  highPrioritySize() {
    return this.#analyticsPriorizedEventQueue.length;
  }
  
  #sleep(sec) {
    return new Promise(resolve => window.setTimeout(resolve, sec * 1000));
  }

  async _sendHits() {
    console.debug('send hits, #running', this.#running, ', queue size is', this.size());
    while (this.#running) {
      this._sendHitsOnce();
      await this.#sleep(.5);
    }
  }

  _sendHitsOnce() {
      while (this.highPrioritySize() > 0) {
        const nextHit = this.#analyticsPriorizedEventQueue.shift();
        window._paq.push(['trackEvent', nextHit.params.eventCategory,  nextHit.params.eventAction,
         nextHit.params.eventLabel, nextHit.params.eventValue]);
      }
      while (this.lowPrioritySize() > 0) {
        const nextHit = this.#analyticsEventQueue.shift();
        window._paq.push(['trackEvent', nextHit.params.eventCategory,  nextHit.params.eventAction,
         nextHit.params.eventLabel, nextHit.params.eventValue]);
      }
  }

  _sendMissedHits() {
    this.#running = false;
    this._sendHitsOnce();
    if ((this.highPrioritySize() + this.size()) > 0) {
      window._paq.push(['trackEvent', 'Ad', 'Missed hits: ',
       this._getPrioMsgPart() + this.size() + ' in queue on unload']);
    }
  }

  _getPrioMsgPart() {
    let prioMsg = 'No priority events remaining. ';
    if(this.highPrioritySize() > 0) {
      const nextPrioObj = this.#analyticsPriorizedEventQueue.shift();
      prioMsg = this.highPrioritySize() + ' remaining high prio hits. Top most of which has' +
          ' action [' + nextPrioObj.eventAction + '] and label [' + nextPrioObj.eventLabel + ']. ';
    }
    return prioMsg;
  }
}
