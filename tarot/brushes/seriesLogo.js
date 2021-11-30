import ImageBrush from "./image.js";
import { getThemedRGB } from "../defs.js";

var nullRect = new DOMRect(0, 0, 0, 0);

class SeriesLogoBrush extends ImageBrush {

  static template = `
    <style>
    :host {
      display: block;
    }
    </style>
    <label>Series logo:</label>
    <select as="series">
      <option selected value="">None</option>
      <option value="fp">First Person</option>
      <option value="hit">How I Teach</option>
    </select>
  `

  constructor() {
    super();
    this.elements.series.addEventListener("change", this.invalidate);
    this.images = {
      fp: "./assets/Cb-first-person-logo-teal.png",
      hit: "./assets/Cb-how-i-teach-logo-teal.png"
    };
    for (var k in this.images) {
      var src = this.images[k];
      this.images[k] = new Image();
      this.images[k].src = src;
      this.images[k].onload = this.invalidate;
    }
    this.x = this.y = this.dx = this.dy = 0;
    this.scale = .5;
  }

  static observedAttributes = ["x", "y", "dx", "dy", "scale", "color"];
  attributeChangedCallback(attr, was, value) {
    switch (attr) {
      case "color":
        this[attr] = value;
        break;

      default:
        this[attr] = Number(value);
    }
  }

  persist() {
    return this.elements.series.value;
  }

  restore(value) {
    this.elements.series.value = value;
  }

  getLayout(context) {
    var series = this.elements.series.value;
    if (!series) return nullRect;
    var image = this.images[series];
    if (!image.naturalWidth) return nullRect;
    var [x, y] = this.denormalize(context.canvas, [this.x, this.y]);
    var width = image.naturalWidth * this.scale;
    var height = image.naturalHeight * this.scale;
    x -= width / 2;
    x += this.dx;
    y += this.dy;
    return new DOMRect(x, y, width, height);
  }

  draw(context, config) {
    var series = this.elements.series.value;
    if (!series) return;
    var image = this.images[series];
    if (!image.naturalWidth) return;
    var layout = this.getLayout(context);
    var rgb = getThemedRGB(config.theme, this.color);
    this.tintBuffer(image, layout.width, layout.height, rgb);
    context.drawImage(this.buffer, layout.x, layout.y);
  }

}

SeriesLogoBrush.define("series-logo");