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
    var textSize = 36 * config.logoScaling;
    context.font = `${textSize}px "${fonts.sans}"`;
    context.textAlign = "left";
    var em = context.measureText("M").width;
    var padding = { x: .75 * em, y: .3 * em };

    var [ selected ] = this.elements.bureau.selectedOptions;
    var { vertical, bureau } = selected.dataset;
    var verticalWidth = context.measureText(vertical.toUpperCase()).width;
    var width = verticalWidth = verticalWidth + padding.x + em;
    var height = textSize + padding.y * 2;
    var bureauWidth = 0;
    if (bureau) {
      bureauWidth = context.measureText(bureau.toUpperCase()).width;
      bureauWidth += padding.x + em;
      width += bureauWidth;
    }

    var x = this.project(this.x, context.canvas.width);
    x -= width * 0.5;
    var y = this.project(this.y, context.canvas.height);

    var layout = new DOMRect(x, y, width, height);
    Object.assign(layout, {
      padding,
      vertical,
      bureau,
      textSize,
      bureauWidth,
      verticalWidth,
      em
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
      verticalWidth,
      em
    } = layout;

    var [vColor, bColor] = brands[vertical];

    context.font = `${textSize}px "${fonts.sans}"`;
    context.textAlign = "left";
    context.textBaseline = "bottom";

    //draw the bureau pennant, if it exists
    if (bureau) {
      context.fillStyle = bColor;
      context.beginPath();
      context.moveTo(x, y);
      context.lineTo(x + width, y)
      context.lineTo(x + width - .75 * em, y + height);
      context.lineTo(x, y + height);
      context.fill();
      context.fillStyle = "white";
      context.fillText(bureau.toUpperCase(), x + verticalWidth + padding.x * .5, y + padding.y + textSize + 2);
    }

    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x + verticalWidth, y)
    context.lineTo(x + verticalWidth - .75 * em, y + height);
    context.lineTo(x, y + height);
    context.fillStyle = vColor;
    context.fill();
    context.fillStyle = "white";
    context.fillText(vertical.toUpperCase(), x + padding.x, y + padding.y + textSize + 2);

  }

  persist() {
    var [selected] = this.elements.bureau.selectedOptions;
    return [ selected.dataset.vertical, selected.dataset.bureau ];
  }

  restore([vertical, bureau]) {
    console.log(vertical, bureau);
    for (var option of this.elements.bureau.querySelectorAll("option")) {
      if (option.dataset.vertical == vertical && option.dataset.bureau == bureau) {
        this.elements.bureau.value = option.value;
      }
    }
  }
}

LogoBrush.define("logo-brush");
