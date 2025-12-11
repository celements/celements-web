console.warn('If you see this message, the TS file was successfully transpiled and executed in the browser.');
const elem: HTMLElement | null = document.getElementById('vite');
if (elem) {
  elem.innerHTML = `Hello World! This text was inserted by a ts file transpiled by Vite to an mjs module.`;
}
