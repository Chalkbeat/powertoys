import { themes } from "./defs.js";

class ThemeIcon extends HTMLElement {
  constructor() {
    super();
    var shadow = this.attachShadow({ mode: "open" });
    shadow.innerHTML = `
<style>
.block {
  display: inline-block;
  width: var(--block-size, 15px);
  height: var(--block-size, 15px);
}
</style>
    `;
    this.container = document.createElement("span");
    shadow.appendChild(this.container);
  }

  generateSwatch(theme) {
    var palette = themes[theme];
    this.container.replaceChildren(...palette.map(color => {
      var block = document.createElement("i");
      block.className = "block";
      block.style.background = color;
      return block;
    }));
  }

  static observedAttributes = ["theme"];
  attributeChangedCallback(attr, was, value) {
    this.generateSwatch(value);
  }
}

window.customElements.define("theme-icon", ThemeIcon);