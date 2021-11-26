/*
<rectangle-brush
  x="normalized left side"
  y="normalized top side"
  width="normalized horizontal extent"
  height="normalized vertical extent"
  fill="theme ID or literal"
></rectangle-brush>
*/

import Brush from "./brush.js";
import { getThemed } from "../defs.js";

class RectangleBrush extends Brush {

  static observedAttributes = ["x", "y", "width", "height", "fill"];
  attributeChangedCallback(attr, was, value) {
    switch (attr) {
      // numeric cast
      case "x":
      case "y":
      case "width":
      case "height":
        this[attr] = Number(value);
        break;

      default:
        this[attr] = value;
    }
  }

  draw(context, config) {
    var { canvas } = context;
    var { theme } = config;
    var { fill = "background" } = this;
    var { top, left, width, height } = this.getLayout(context);
    context.fillStyle = getThemed(theme, fill);
    context.fillRect(top, left, width, height);
  }

  getLayout(context) {
    var { canvas } = context;
    var { x = 0, y = 0, width = canvas.width, height = canvas.height } = this;
    var [top, left] = this.denormalize(canvas, [x, y]);
    var [w, h] = this.denormalize(canvas, [width, height]);
    return new DOMRect(left, top, w, h);
  }
}

RectangleBrush.define("rectangle-brush");