export { celDomFire };

const celDomFire = function(htmlElem, eventName, memo, bubble = true) {
  const event = new CustomEvent(eventName, { 
    'bubbles' : bubble,
    'memo' : memo
  });
  htmlElem.dispatchEvent(event);
  return event;
};
