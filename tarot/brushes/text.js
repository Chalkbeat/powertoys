/*
<text-brush
  x="normalized text start, horizontal"
  y="normalized text start, vertical"
  padding="CSS-style insets"
  color="theme index or literal"
  anchor="top|middle|bottom left|center|right"
  width="bounding, doesn't account for offset"
></text-brush>
*/

import Brush from "./brush.js";
import { getThemed } from "../defs.js";

class TextBrush extends Brush {
  static template = `
<style>
:host {
  display: block;
}

:host([noform]) textarea{
  display: none;
}

textarea {
  font-family: var(--serif);
  width: 100%;
  resize: vertical;
}
</style>
<label class="slotted"><slot></slot></div>
<textarea as="input">This space intentionally left blank.</textarea>
  `;

  constructor() {
    super();
    this.elements.input.addEventListener("input", () => this.dispatch("update"));
  }

  static observedAttributes = [
    "x", "y", "padding", "width", "follows", "value",
    "anchor", "font", "size", "color", "bold", "italic"
  ];
  attributeChangedCallback(attr, was, value) {
    switch (attr) {
      case "x":
      case "y":
      case "width":
      case "size":
        this[attr] = Number(value);
        break;

      case "bold":
      case "italic":
        this[attr] = value !== null;
        break;

      default:
        this[attr] = value;
    }
    this.dispatch("update");
  }

  get value() {
    return this.elements.input.value;
  }

  set value(v) {
    return this.elements.input.value = v;
  }

  getLayout(context, config) {
    var { canvas } = context;
    var { input } = this.elements;
    var {
      anchor = "top left",
      color = 3,
      size = 24,
      font = "Barlow Condensed",
      follows
    } = this;

    if (follows) {
      var followed = document.getElementById(follows);
      var layout = followed.getLayout(context);
      var x = layout.left;
      var y = layout.bottom;
    } else {
      var [x, y] = this.denormalize(canvas, [this.x || 0, this.y || 0]);
    }

    // generate bounding rectangle
    var padding = (this.padding || "").trim().split(" ");
    var [pt, pr, pb, pl] = padding.map(Number);
    switch (padding.length) {
      case 0:
        padding = [0, 0, 0, 0];
        break;
      case 1:
        padding = [pt, pt, pt, pt];
        break;
      case 2:
        padding = [pt, pr, pt, pr];
        break;
      case 3:
        padding = [pt, pr, pb, pr];
        break;

      default:
        padding = [pt, pr, pb, pl];
    }
    var [width] = this.denormalize(canvas, [this.width || 1, 1]);
    // subtract horizontal padding
    width -= padding[1] + padding[3];
    
    // reflow text
    var formatting = [];
    if (this.italic) formatting.push("italic");
    if (this.bold) formatting.push("bold");
    context.font = `${formatting.join(" ")} ${size}px ${font}`;
    var lines = [];
    var text = input.value.trim();
    if (this.hasAttribute("quoted")) {
      text = "“" + text + "”";
    }
    var words = text.split(/\s+/) || "";
    // join the last two words to prevent orphans
    if (words.length > 3) {
      var last = words.pop();
      var pen = words.pop();
      words.push(pen + " " + last);
    }

    var buffer = words.shift();
    while (words.length) {
      var word = words.shift();
      var line = buffer + " " + word;
      var measured = context.measureText(line);
      if (measured.width > width) {
        lines.push(buffer);
        buffer = word;
      } else {
        buffer = line;
      }
    }
    if (buffer) lines.push(buffer);

    // get alignment and set up the positioning
    var hAnchor = (anchor.match(/left|right/) || ["center"])[0];
    var vAnchor = (anchor.match(/top|bottom/) || ["middle"])[0];
    var lineHeight = size * 1.2;
    var textHeight = lines.length * lineHeight;
    var textY = vAnchor == "middle" ? y - textHeight * .5 :
      vAnchor == "bottom" ? y - textHeight : y;
    textY += padding[0];
    var textX = x + padding[3];

    var height = textHeight + padding[0] + padding[2];
    return {
      x,
      y,
      top: y,
      left: x,
      right: x + width,
      bottom: y + height,
      width,
      height,
      lineHeight,
      lines,
      textX,
      textY,
      anchor: hAnchor,
      size,
      font
    }
  }

  draw(context, config) {
    var { theme } = config;
    var { color = 3 } = this;
    var { lines, textX, textY, lineHeight, anchor } = this.getLayout(context);

    context.textBaseline = "top";
    context.textAlign = anchor;
    context.fillStyle = getThemed(theme, color);
    lines.forEach((line, i) => context.fillText(line, textX, textY + i * lineHeight));
  }
}

TextBrush.define("text-brush");