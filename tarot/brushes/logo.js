import Brush from "./brush.js";
import { colors, getThemed, fonts } from "../defs.js";

var brands = {
  Chalkbeat: [colors.cbLogo, colors.cbBureau],
  Votebeat: [colors.vbLogo, colors.vbBureau]
};

class LogoBrush extends Brush {
  static template = `
<style>
:host {
  display: block;
  margin: var(--spacing) 0;
  padding: var(--spacing) 0;
  border-bottom: 1px solid var(--light-gray);
}
</style>
<label>Logo</logo>
<select as="bureau">
  <option selected data-vertical="Chalkbeat" data-bureau="">Chalkbeat</option>
  <option data-vertical="Chalkbeat" data-bureau="Chicago">Chalkbeat Chicago</option>
  <option data-vertical="Chalkbeat" data-bureau="Colorado">Chalkbeat Colorado</option>
  <option data-vertical="Chalkbeat" data-bureau="Detroit">Chalkbeat Detroit</option>
  <option data-vertical="Chalkbeat" data-bureau="Indiana">Chalkbeat Indiana</option>
  <option data-vertical="Chalkbeat" data-bureau="Newark">Chalkbeat Newark</option>
  <option data-vertical="Chalkbeat" data-bureau="New York">Chalkbeat New York</option>
  <option data-vertical="Chalkbeat" data-bureau="Philadelphia">Chalkbeat Philadelphia</option>
  <option data-vertical="Chalkbeat" data-bureau="Tennessee">Chalkbeat Tennessee</option>
  <option data-vertical="Votebeat">Votebeat</option>
</select>
  `;

  constructor() {
    super();
    this.x = 0;
    this.y = 0;
    this.color = "text";
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

  getLayout(context, config) {
    var padding = { x: 20, y: 8 };
    var [ selected ] = this.elements.bureau.selectedOptions;
    var { vertical, bureau } = selected.dataset;
    var showLabel = false;
    var textSize = 36 * config.logoScaling;
    context.font = `${textSize}px "${fonts.sans}"`;
    context.textAlign = "left";
    var verticalWidth = context.measureText(vertical.toUpperCase()).width;
    var width = verticalWidth = verticalWidth + padding.x * config.logoScaling * 2.5;
    var height = textSize + (padding.y * config.logoScaling);
    var bureauWidth = 0;
    if (bureau) {
      bureauWidth = context.measureText(bureau.toUpperCase()).width;
      bureauWidth += padding.x * config.logoScaling;
      width += bureauWidth;
    }

    var x = this.project(this.x, context.canvas.width);
    var y = this.project(this.y, context.canvas.height);
    x -= width * 0.5;
    y =
      this.align == "top"
        ? y
        : this.align == "bottom"
        ? y - height
        : y - height * 0.5;

    var layout = new DOMRect(x, y, width, height);
    Object.assign(layout, {
      padding,
      vertical,
      bureau,
      textSize,
      bureauWidth,
      verticalWidth
    });
    return layout;
  }

  draw(context, config) {
    var layout = this.getLayout(context, config);
    var {
      textSize,
      vertical,
      bureau,
      padding,
      x,
      y,
      width,
      height,
      verticalWidth
    } = layout;

    var [vColor, bColor] = brands[vertical];

    context.font = `${textSize}px "${fonts.sans}"`;
    context.textAlign = "left";
    context.textBaseline = "alphabetic";

    //draw the bureau pennant, if it exists
    if (bureau) {
      context.fillStyle = bColor;
      context.beginPath();
      context.moveTo(x, y);
      context.lineTo(x + width + padding.x, y)
      context.lineTo(x + width, y + height);
      context.lineTo(x, y + height);
      context.fill();
      context.fillStyle = "white";
      context.fillText(bureau.toUpperCase(), x + verticalWidth + padding.x * .5, y + textSize);
    }

    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x + verticalWidth, y)
    context.lineTo(x + verticalWidth - padding.x, y + height);
    context.lineTo(x, y + height);
    context.fillStyle = vColor;
    context.fill();
    context.fillStyle = "white";
    context.fillText(vertical.toUpperCase(), x + padding.x, y + textSize);

  }
}

LogoBrush.define("logo-brush");
