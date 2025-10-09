
class EditorWindow {
  
  constructor() {
    this.#registerUnloadMessage();
  }
  
  #registerUnloadMessage() {
    if (window.opener) {
      window.addEventListener('unload', () => this.sendClosingMessage());
    }
  }
  
  #sendMessageForEvent(eventType) {
    this.#sendMessage({ type: eventType });
  }
  
  #sendMessage(data) {
    if (window.opener) {
      window.opener.postMessage(data, '*');
    }
  }
  
  sendClosingMessage() {
    this.#sendMessageForEvent('BEFORE_CLOSE');
  }
    
  receivingChildEvent() {
    window.addEventListener('message', (event) => {
      console.debug('Received message from child:', event);
      if (event.origin !== window.location.origin) return;
      console.log('Received message from child data:', event.data);
      if (['BEFORE_CLOSE', 'AFTER_UPDATE'].includes(event.data.type)) {
        this.#sendMessage(event.data);
        window.location.reload();
      }
    });
  }
  
  /** to be used by any intermediate safe */
  sendAfterUpdate() {
    this.#sendMessageForEvent('AFTER_UPDATE');
  }
}

export const celEditorWindow = new EditorWindow();
window.celEditorWindow = celEditorWindow;
