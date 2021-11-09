import Brush from "./brush.js";

class LogoBrush extends Brush {
  static template = `
<label>Logo</logo>
<select as="color">
  <option selected value="dark">Dark</option>
  <option value="light">Light</option>
</select>
<select as="bureau">
  <option value="">No bureau</option>
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

    this.logos = {};

    this.buffer = document.createElement("canvas");

    for (var color of ["dark", "light"]) {
      var logo = new Image();
      logo.src = `./assets/logo-${color}.png`;
      logo.onload = () => this.dispatch("update");
      this.logos[color] = logo;
    }

    this.elements.color.addEventListener("change", () => this.dispatch("update"));
    this.elements.bureau.addEventListener("change", () => this.dispatch("update"));
  }

  static observedAttributes = ["x", "y", "theme"];
  attributeChangedCallback(attr, was, value) {
    switch (attr) {
      case "theme":
        this.elements.color.value = value;
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
    var color = this.elements.color.value;
    var logo = this.logos[color];
    context.drawImage(logo, layout.x, layout.y, 124, 40);
    if (layout.bureau) {
      context.fillStyle = color == "dark" ? "#333" : "white";
      context.font = `italic 24px "Barlow Condensed"`;
      context.textBaseline = "top";
      context.fillText(layout.bureau, layout.textX, layout.textY);
    }
  }
}

LogoBrush.define("logo-brush");