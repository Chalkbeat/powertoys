import Brush from "./brush.js";
import { getThemed } from "../defs.js";

class LogoBrush extends Brush {
  static template = `
<label>Logo</logo>
<select as="bureau">
  <option value="">No bureau, only logo</option>
  <option>Chicago</option>
  <option>Colorado</option>
  <option>Detroit</option>
  <option>Indiana</option>
  <option>Newark</option>
  <option>New York</option>
  <option>Philadelphia</option>
  <option>Tennesee</option>
</select>
  `;

  constructor() {
    super();
    this.x = 0;
    this.y = 0;
    this.color = 3;

    this.image = new Image();
    this.image.src = "./assets/logo-dark.png";
    this.image.onload = () => this.dispatch("update");

    this.buffer = document.createElement("canvas");
    this.elements.bureau.addEventListener("change", () => this.dispatch("update"));
  }

  static observedAttributes = ["x", "y", "color"];
  attributeChangedCallback(attr, was, value) {
    switch (attr) {
      case "color":
        this.color = value;
        break;

      default:
        this[attr] = Number(value);
    }
  }

  getLayout(context) {
    // hardcode image values
    var logoWidth = 124; // really: 247;
    var logoHeight = 40; // really: 79;
    var textSize = 24;

    var bWidth = 0;
    var bureau = this.elements.bureau.value;
    if (bureau) {
      bureau = bureau.toUpperCase();
      context.font = `italic 24px "Barlow Condensed"`;
      var measurement = context.measureText(bureau);
      bWidth = measurement.width;
    }

    var [x, y] = this.denormalize(context.canvas, [this.x, this.y]);
    var bSpacing = bWidth ? 10 : 0;
    var width = logoWidth + bSpacing + bWidth;
    var height = logoHeight;
    var textY = y - textSize * .5;
    x -= width * .5;
    var textX = x + logoWidth + bSpacing;
    y -= height * .5;
    var top = y;
    var left = x;
    var bottom = top + height;
    var right = left + width;

    return { x, y, top, bottom, left, right, height, width, bureau, textX, textY };
  }

  draw(context, config) {
    var layout = this.getLayout(context);
    var color = getThemed(config.theme, this.color);

    // convert our color into rgb
    // we'll hack the browser to make a fake element and get this temporarily
    var temp = document.createElement("div");
    temp.style.background = color;
    document.body.appendChild(temp);
    var computed = window.getComputedStyle(temp);
    var rgb = computed.background.match(/\d+/g);
    temp.remove();
    var [r, g, b] = rgb.map(Number);

    // apply to the buffer
    this.buffer.width = 124;
    this.buffer.height = 40;
    var bufferContext = this.buffer.getContext("2d");
    bufferContext.drawImage(this.image, 0, 0, 124, 40);
    var bitmap = bufferContext.getImageData(0, 0, 124, 40);
    for (var i = 0; i < bitmap.data.length; i += 4) {
      bitmap.data[i] = r;
      bitmap.data[i+1] = g;
      bitmap.data[i+2] = b;
    }
    bufferContext.putImageData(bitmap, 0, 0);
    context.drawImage(this.buffer, layout.x, layout.y);

    if (layout.bureau) {
      context.fillStyle = color;
      context.font = `italic 24px "Barlow Condensed"`;
      context.textBaseline = "top";
      context.fillText(layout.bureau, layout.textX, layout.textY);
    }
  }
}

LogoBrush.define("logo-brush");