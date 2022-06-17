export { celDomFire };

const celDomFire = function(htmlElem, eventName, memo, bubble = true) {
  const event = new CustomEvent(eventName, { 
    'bubbles' : bubble,
    'memo' : memo
  });
  console.debug('celDomFire dispatch event ', event);
  htmlElem.dispatchEvent(event);
  return event;
};
