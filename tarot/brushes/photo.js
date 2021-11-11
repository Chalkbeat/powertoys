import Brush from "./brush.js";
import { getThemed } from "../defs.js";

class PhotoBrush extends Brush {
  
  static template = `
<style>
:host {
  display: block;
}

.warnings {
  display: none;
}

.warnings.shown {
  display: block;
  padding: 10px;
  background: var(--peach);
}
</style>
<label for="photo-upload">Photo block:</label>
<input type="file" id="photo-upload" as="file" accept="image/*">

<input id="tint-image" as="tinted" type=checkbox>
<label for="tint-image">Tint image?</label>

<div class="warnings" as="warning"></div>
  `

  static boundMethods = ["onUpload", "invalidate"];

  constructor() {
    super();

    this.elements.file.addEventListener("change", this.onUpload);
    this.elements.tinted.addEventListener("change", this.invalidate);
    this.image = null;
    this.x = 0;
    this.y = 0;
    this.width = 1;
    this.height = 1;
    this.tint = "accent";
  }

  onUpload() {
    var [ file ] = this.elements.file.files;
    if (!file) return;
    this.image = new Image();
    var url = URL.createObjectURL(file);
    this.image.src = url;
    this.image.onload = this.invalidate;
  }

  static observedAttributes = ["x", "y", "width", "height", "tint"];

  attributeChangedCallback(attr, was, value) {
    switch (attr) {
      case "tint":
        this[attr] = value;
        break;

      default:
        this[attr] = Number(value);
    }
    this.invalidate();
  }

  getLayout(context, config) {
    var [x, y] = this.denormalize(context.canvas, [this.x, this.y]);
    var [width, height] = this.denormalize(context.canvas, [this.width, this.height]);
    return {
      x, y, width, height,
      top: y,
      left: x,
      right: x + width,
      bottom: y + height
    }
  }

  draw(context, config) {
    var layout = this.getLayout(context, config);
    context.fillStyle = getThemed(config.theme, this.tint);
    context.fillRect(layout.x, layout.y, layout.width, layout.height);
    if (this.image) {
      // check for being too small
      if (this.image.naturalWidth < layout.width || this.image.naturalHeight < layout.height) {
        this.elements.warning.innerHTML = `This image is smaller than the display area, and may appear blurry when exported.`
      } else {
        this.elements.warning.innerHTML = `Please make sure we have the rights to publish this photo (i.e., it has been purchased on Getty or is a courtesy photo from a source).`
      }
      this.elements.warning.classList.add("shown");
      context.globalCompositeOperation = this.elements.tinted.checked ? "luminosity" : "source-over";
      var imageAspect = this.image.naturalWidth / this.image.naturalHeight;
      var layoutAspect = layout.width / layout.height;
      // try horizontal cover
      var width = layout.width;
      var height = width / imageAspect;
      // if it can't work, try vertical cover
      if (height < layout.height) {
        height = layout.height;
        width = height * imageAspect;
      }
      // assume we're anchoring in the center for now
      var xOffset = (width - layout.width) / 2;
      var yOffset = (height - layout.height) / 2;
      var x = layout.x - xOffset;
      var y = layout.y - yOffset;
      // set the clip rect
      context.save();
      context.beginPath();
      context.rect(layout.x, layout.y, layout.width, layout.height);
      context.clip();
      context.drawImage(this.image, x, y, width, height);
      context.restore();
      context.globalCompositeOperation = "source-over";
    }
  }
}

PhotoBrush.define("photo-brush");
