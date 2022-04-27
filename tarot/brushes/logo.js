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
  <option>Votebeat</option>
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

    this.votebeat = new Image();
    this.votebeat.src = "./assets/Vb-Logo-1Color-Black-V2.png";
    this.votebeat.onload = this.invalidate;

    this.elements.bureau.addEventListener("change", this.invalidate);
  }

  static observedAttributes = ["x", "y", "color", "align"];
  attributeChangedCallback(attr, was, value) {
    switch (attr) {
      case "color":
      case "align":
      case "x":
      case "y":
        this[attr] = value;
        break;

      default:
        this[attr] = Number(value);
    }
  }

  getLayout(context) {

    var bWidth = 0;
    var bureau = this.elements.bureau.value;
    var isVB = bureau == "Votebeat";
    var showLabel = false;
    if (bureau && !isVB) {
      bureau = bureau.toUpperCase();
      context.textAlign = "left";
      context.font = `italic 24px "Barlow Condensed"`;
      var measurement = context.measureText(bureau);
      bWidth = measurement.width;
      showLabel = true;
    }

    // hardcode image values
    var logoWidth = isVB ? 148 : 124;
    var logoHeight = isVB ? 36 : 40;
    var textSize = 24;
    var logo = isVB ? this.votebeat : this.image;

    var x = this.project(this.x, context.canvas.width);
    var y = this.project(this.y, context.canvas.height);
    // var [x, y] = this.denormalize(context.canvas, [this.x, this.y]);
    var bSpacing = bWidth ? 10 : 0;
    var width = Math.max(logoWidth, bWidth);
    var height = showLabel ? logoHeight + bSpacing + textSize : logoHeight;
    var textX = x;
    x -= width * .5;
    y = this.align == "top" ? y :
      this.align == "bottom" ? y - height :
      y - height * .5;
    var textY = y + logoHeight + bSpacing;
    
    var layout = new DOMRect(x, y, width, height);
    Object.assign(layout, { bureau, textX, textY, logo, logoWidth, logoHeight, showLabel });
    return layout;
  }

  draw(context, config) {
    var layout = this.getLayout(context);
    var { logo, textX, textY, logoWidth, logoHeight, bureau, showLabel } = layout;
    var color = getThemed(config.theme, this.color);
    var rgb = getThemedRGB(config.theme, this.color);
    this.tintBuffer(logo, logoWidth, logoHeight, rgb);
    context.drawImage(this.buffer, layout.x, layout.y);

    if (showLabel) {
      context.fillStyle = color;
      context.textAlign = "center";
      context.textBaseline = "top";
      context.font = `italic 24px "Barlow Condensed"`;
      context.fillText(bureau, textX, textY);
    }
  }
}

LogoBrush.define("logo-brush");