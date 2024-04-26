import { RectangleBrush } from "./rectangle.js";
import { getThemed } from "../defs.js";


function smoothstep(value, low = 0, high = 1) {
  return clamp((value - low) / (high - low));
}

function clamp(value, high = 1, low = 0) {
  if (value < low) return low;
  if (value > high) return high;
  return value;
}

class PatternSquares extends RectangleBrush {

  static template = `
<style>
:host {
  display: block;
  margin: var(--spacing) 0;
  padding: var(--spacing) 0;
  border-bottom: 1px dotted var(--light-gray);
 
}
</style>
<label for="focal-x">Pattern position:</label>
<input id="focal-x" as="focalX" type="range" min="0" max="1" step=".01">

<label for="spread">Pattern spread:</label>
<input type="range" id="spread" as="spread" min="0" max=".3" step=".01" value=".1">
  `;

  constructor() {
    super();
    this.elements.focalX.addEventListener("input", this.invalidate);
    this.elements.spread.addEventListener("input", this.invalidate);
  }

  draw(context, config) {
    var { theme } = config;
    var { width, height } = context.canvas;
    var focalX = width * this.elements.focalX.valueAsNumber;
    var focalY = height * .5;
    var spread = this.elements.spread.valueAsNumber;
    context.globalCompositeOperation = "normal";
    context.fillStyle = getThemed(theme, "accent");
    const BLOCK_SIZE = width / 32;
    const BLOCK_COUNT = 16 * (height / BLOCK_SIZE);
    for (var x = 0; x <= width; x += BLOCK_SIZE) {
      for (var y = 0; y < height; y += BLOCK_SIZE) {
        var distance = Math.sqrt((x - focalX) ** 2 + (y - focalY) ** 2);
        var lerp = smoothstep(distance, width * spread, width * (.5 + spread));
        // context.globalAlpha = lerp;
        if (Math.random() < lerp) {
          var b = BLOCK_SIZE * .2 + (BLOCK_SIZE * .8 * lerp) + 1;
          context.fillRect(x, y, b, b);
        }
      }
    }
  }

}

window.customElements.define("pattern-squares", PatternSquares);