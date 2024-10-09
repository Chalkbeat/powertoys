import Brush from "./brush.js";
import { colors, getThemed, fonts, themes } from "../defs.js";

var brands = {
  Chalkbeat: [colors.cbLogo, colors.cbBureau],
  Votebeat: [colors.vbLogo, colors.vbBureau],
  Healthbeat: [colors.hbLogo, colors.hbBureau]
};

var bureaus = {
  Chalkbeat: "National|Chicago|Colorado|Detroit|Indiana|Newark|New York|Philadelphia|Tennessee".split("|"),
  Votebeat: "National|Arizona|Michigan|Pennsylvania|Texas|Wisconsin".split("|"),
  Healthbeat: "National|New York|Atlanta".split("|")
}

class LogoBrush extends Brush {
  static template = `
<style>
:host {
  display: block;
  margin: var(--spacing) 0;
  padding: var(--spacing) 0;
  border-bottom: 1px solid var(--light-gray);
}

.container {
  display: flex;
  gap: 16px;
}

select {
  min-width: 0;
  flex: 1;
}
</style>
<div class="container">
  <label>Logo</label>
  <select as="bureau"></select>
</div>
  `;

  constructor() {
    super();
    this.x = 0;
    this.y = 0;
    this.color = "text";
    this.vertical = "";
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
    var vertical = themes[config.theme].vertical;
    // if the vertical changed, then reset that selection
    if (vertical != this.vertical) {
      var none = document.createElement("option");
      none.value = "";
      none.innerHTML = "Vertical Only";
      var bureauOptions = bureaus[vertical].map(b => {
        var option = document.createElement("option");
        option.innerHTML = b;
        return option;
      });
      bureauOptions.unshift(none);
      this.elements.bureau.replaceChildren(...bureauOptions);
      this.elements.bureau.value = "";
      this.vertical = vertical;
    }

    var textSize = 36 * config.logoScaling;
    context.font = `${textSize}px "${fonts.sans}"`;
    context.textAlign = "left";
    var em = context.measureText("M").width;
    var padding = { x: 0.75 * em, y: 0.3 * em };

    var bureau = this.elements.bureau.value;
    var verticalWidth = context.measureText(vertical.toUpperCase()).width;
    var width = (verticalWidth = verticalWidth + padding.x + em);
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

  pen(...points) {
    var path = new Path2D();
    var first = points.shift();
    path.moveTo(...first);
    for (var p of points) {
      path.lineTo(...p);
    }
    return path;
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
      var right = x + width;
      var inset = x + width - 0.75 * em;
      var bottom = y + height;
      context.fill(this.pen(
        [x, y],
        [right, y],
        [inset, bottom],
        [x, bottom]
      ));
      context.fillStyle = "white";
      context.fillText(
        bureau.toUpperCase(),
        x + verticalWidth + padding.x * 0.5,
        y + padding.y + textSize + 2
      );
    }

    var right = x + verticalWidth;
    var inset = x + verticalWidth - 0.75 * em;
    var bottom = y + height;
    context.fillStyle = vColor;
    context.fill(this.pen(
      [x, y],
      [right, y],
      [inset, bottom],
      [x, bottom]
    ));
    context.fillStyle = "white";
    context.fillText(
      vertical.toUpperCase(),
      x + padding.x,
      y + padding.y + textSize + 2
    );
  }
}

LogoBrush.define("logo-brush");
