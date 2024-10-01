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
import { getThemed, fonts } from "../defs.js";

class TextBrush extends Brush {
  static template = `
<style>
:host {
  display: block;
  margin: var(--spacing) 0;
  border-bottom: 1px solid var(--light-gray);
}

:host([noform]) textarea{
  display: none;
}

textarea {
  font-family: var(--serif);
  width: 100%;
  resize: vertical;
  padding-bottom: 0;
  display: block;
}

[as="wordCount"] {
  font-size: 12px;
  text-align: right;
  margin-top: 4px;
  line-height: 1;
  display: none;
}

:host([wordcount]) [as="wordCount"] {
  display: block;
}
</style>
<label class="slotted"><slot></slot></div>
<textarea as="input">This space intentionally left blank.</textarea>
<div as="wordCount">0 characters / 0 words</div>
  `;

  constructor() {
    super();
    this.elements.input.addEventListener("input", this.invalidate);
    this.x = 0;
    this.y = 0;
    this.width = 1;
    this.height = 1;
  }

  static observedAttributes = [
    "x",
    "y",
    "padding",
    "width",
    "value",
    "anchor",
    "font",
    "size",
    "color",
    "bold",
    "italic"
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
    this.invalidate();
  }

  get value() {
    return this.elements.input.value;
  }

  set value(v) {
    return (this.elements.input.value = v);
  }

  get alt() {
    var text = this.value;
    if (this.hasAttribute("quoted")) {
      text = `"${text}"`;
    }
    return text;
  }

  persist() {
    return this.value;
  }

  restore(state) {
    this.value = state;
  }

  getLayout(context, config = {}) {
    var { canvas } = context;
    var { input } = this.elements;
    var {
      anchor = "top left",
      color = "text",
      size = 24,
      font = fonts.serif
    } = this;
    var [x, y] = this.denormalize(canvas, [this.x || 0, this.y || 0]);

    // generate bounding rectangle
    var padding = this.unpackPadding(this.padding || "");

    var [width] = this.denormalize(canvas, [this.width || 1, 1]);
    // subtract horizontal padding
    width -= padding[1] + padding[3];

    // reflow text
    var { fontScaling = 1 } = config;
    size *= fontScaling;
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
    var textY =
      vAnchor == "middle"
        ? y - textHeight * 0.5
        : vAnchor == "bottom"
        ? y - textHeight
        : y;
    textY += padding[0];
    var textX = x + padding[3];

    var height = textHeight + padding[0] + padding[2];

    var layout = new DOMRect(x, y, width, height);
    Object.assign(layout, {
      lineHeight,
      lines,
      textX,
      textY,
      anchor: hAnchor,
      size,
      font
    });
    return layout;
  }

  draw(context, config) {
    var { theme } = config;
    var { color = "text" } = this;
    var { lines, textX, textY, lineHeight, anchor } = this.getLayout(
      context,
      config
    );

    context.textBaseline = "top";
    context.textAlign = anchor;
    context.fillStyle = getThemed(theme, color);
    lines.forEach((line, i) =>
      context.fillText(line, textX, textY + i * lineHeight)
    );

    // update word counts
    var characters = this.value.length;
    var words = this.value.split(/\s+/).length;
    this.elements.wordCount.innerHTML = `
      ${characters} character${characters > 1 ? "s" : ""} / 
      ${words} word${words > 1 ? "s" : ""}`;
  }
}

TextBrush.define("text-brush");
