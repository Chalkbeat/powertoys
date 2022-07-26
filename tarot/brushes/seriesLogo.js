import ImageBrush from "./image.js";
import { getThemedRGB } from "../defs.js";

var nullRect = new DOMRect(0, 0, 0, 0);

var logoCache = {};
var loadLogo = function(url) {
  if (!logoCache[url]) {
    logoCache[url] = new Promise(function(ok, fail) {
      var image = new Image();
      image.src = url;
      image.onload = () => ok(image);
      image.onerror = fail;
    });
  }
  return logoCache[url];
}

const logos = {
  fp: { label: "First Person", url: "./assets/Cb-first-person-logo-teal.png" },
  hit: { label: "How I Teach", url: "./assets/Cb-how-i-teach-logo-teal.png" },
  atb: { label: "After the Bell", url: "./assets/Cb-after-the-bell-logo-teal.png" }
};

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
      ${Object.entries(logos).map(([key, value]) => `
      <option value="${key}">${value.label}</option>
      `).join("\n")}
    </select>
  `

  static boundMethods = ["onSeries"];

  constructor() {
    super();
    this.elements.series.addEventListener("change", this.onSeries);
    this.x = this.y = this.dx = this.dy = 0;
    this.scale = .5;
  }

  async onSeries() {
    var series = this.elements.series.value;
    this.image = null;
    this.invalidate();
    if (!series) return;
    this.image = await loadLogo(logos[series].url);
    this.invalidate();
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
    this.onSeries();
  }

  getLayout(context, config) {
    if (!this.image) return nullRect;
    var [x, y] = this.denormalize(context.canvas, [this.x, this.y]);
    var { logoScaling = 1 } = config;
    var width = this.image.naturalWidth * this.scale * logoScaling;
    var height = this.image.naturalHeight * this.scale * logoScaling;
    x -= width / 2;
    x += this.dx;
    y += this.dy;
    return new DOMRect(x, y, width, height);
  }

  draw(context, config) {
    if (!this.image) return;
    var layout = this.getLayout(context, config);
    var rgb = getThemedRGB(config.theme, this.color);
    this.tintBuffer(this.image, layout.width, layout.height, rgb);
    context.drawImage(this.buffer, layout.x, layout.y);
  }

}

SeriesLogoBrush.define("series-logo");