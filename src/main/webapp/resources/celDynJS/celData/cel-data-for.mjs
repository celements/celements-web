import { CelData, celDataRegistry } from './cel-data.mjs?version=20250901';
import CelDataRenderer from './cel-data-renderer.mjs?version=20250901';

export class CelDataFor extends CelData {
  #renderer;

  get template() {
    return this.getAttribute('template') || undefined;
  }
  
  #init() {
    const hookElem = this.querySelector('.cel-data-for-hook') ?? this;
    const template = document.querySelector(this.template);
    this.#renderer = new CelDataRenderer(hookElem, template);
  }

  connectedCallback() {
    super.connectedCallback();
    this.#init();
  }

  async updateData(data) {
    return this.#renderer?.render(this.extractValue(data));
  }
}

celDataRegistry.define('cel-data-for', CelDataFor);
