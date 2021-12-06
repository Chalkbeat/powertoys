import ImageBrush from "./image.js";
import { getThemed, getThemedRGB } from "../defs.js";

class LogoBrush extends ImageBrush {
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
  <option>Tennessee</option>
</select>
  `;

  constructor() {
    super();
    this.x = 0;
    this.y = 0;
    this.color = "text";

    this.image = new Image();
    this.image.src = "./assets/logo-dark.png";
    this.image.onload = this.invalidate;

    this.elements.bureau.addEventListener("change", this.invalidate);
  }

  static observedAttributes = ["x", "y", "color", "align"];
  attributeChangedCallback(attr, was, value) {
    switch (attr) {
      case "color":
      case "align":
        this[attr] = value;
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
      context.textAlign = "left";
      context.font = `italic 24px "Barlow Condensed"`;
      var measurement = context.measureText(bureau);
      bWidth = measurement.width;
    }

    var [x, y] = this.denormalize(context.canvas, [this.x, this.y]);
    var bSpacing = bWidth ? 10 : 0;
    var width = Math.max(logoWidth, bWidth);
    var height = bureau ? logoHeight + bSpacing + textSize : logoHeight;
    var textX = x;
    x -= width * .5;
    y = this.align == "top" ? y :
      this.align == "bottom" ? y - height :
      y - height * .5;
    var textY = y + logoHeight + bSpacing;
    
    var layout = new DOMRect(x, y, width, height);
    Object.assign(layout, { bureau, textX, textY });
    return layout;
  }

  draw(context, config) {
    var layout = this.getLayout(context);
    var color = getThemed(config.theme, this.color);
    var rgb = getThemedRGB(config.theme, this.color);
    this.tintBuffer(this.image, 124, 40, rgb);
    context.drawImage(this.buffer, layout.x, layout.y);

    if (layout.bureau) {
      context.fillStyle = color;
      context.textAlign = "center";
      context.textBaseline = "top";
      context.font = `italic 24px "Barlow Condensed"`;
      context.fillText(layout.bureau, layout.textX, layout.textY);
    }
  }
}

LogoBrush.define("logo-brush");