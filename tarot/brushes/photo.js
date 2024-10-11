import Brush from "./brush.js";
import { getThemed } from "../defs.js";

class PhotoBrush extends Brush {
  static template = `
<style>
:host {
  display: block;
  margin: var(--spacing) 0;
  border-bottom: 1px dotted var(--light-gray);
  --show-tint: none;
}

.container > * {
  margin: 4px 0;
}

[as=credit] {
  display: block;
  width: 100%;
}

.warnings {
  display: none;
}

.warnings.shown {
  display: block;
  padding: 10px;
  background: var(--peach);
}

.tint-controls {
  display: var(--show-tint);
}

:host([tintable]) {
  --show-tint: block;
}

</style>
<div class="container">
<label for="photo-upload">Photo block:</label>
<input type="file" id="photo-upload" as="file" accept="image/*">

<label for="photo-gravity">Alignment</label>
<select as="gravity" id="photo-gravity">
  <option selected value="center">Center</option>
  <option value="n">North</option>
  <option value="s">South</option>
  <option value="e">East</option>
  <option value="w">West</option>
</select>

<input as="credit" placeholder="Photo credit">

<div class="tint-controls">
  <input id="tint-image" as="tinted" type=checkbox>
  <label for="tint-image">Tint image?</label>
</div>

<div class="warnings" as="warning"></div>
</div>
  `;

  static boundMethods = ["onUpload", "invalidate"];

  constructor() {
    super();

    this.elements.file.addEventListener("change", this.onUpload);
    this.elements.tinted.addEventListener("change", this.invalidate);
    this.elements.credit.addEventListener("input", this.invalidate);
    this.elements.gravity.addEventListener("input", this.invalidate);
    this.image = null;
    this.x = 0;
    this.y = 0;
    this.width = 1;
    this.height = 1;
    this.tint = "backgroundAlt";
    this.buffer = document.createElement("canvas");
    this.context = this.buffer.getContext("2d");
  }

  persist() {
    if (!this.image) return null;
    var image = this.image;
    var tinted = this.elements.tinted.checked;
    return { image, tinted };
  }

  restore(state) {
    if (!state) return;
    this.image = state.image;
    this.elements.tinted.checked = state.tinted;
  }

  onUpload() {
    var [file] = this.elements.file.files;
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
    var [width, height] = this.denormalize(context.canvas, [
      this.width,
      this.height
    ]);
    return new DOMRect(x, y, width, height);
  }

  draw(context, config) {
    var layout = this.getLayout(context, config);
    context.fillStyle = getThemed(config.theme, this.tint);
    context.fillRect(layout.x, layout.y, layout.width, layout.height);
    if (this.image) {
      // check for being too small
      if (
        this.image.naturalWidth < layout.width ||
        this.image.naturalHeight < layout.height
      ) {
        this.elements.warning.innerHTML = `
          This image is smaller than the display area, 
          and may appear blurry when exported.`;
      } else {
        this.elements.warning.innerHTML = `
          Please make sure we have the rights to publish 
          this photo (i.e., it has been purchased on Getty 
          or is a courtesy photo from a source).`;
      }
      this.elements.warning.classList.add("shown");

      // find photo positioning (centered in display area, scaled)
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
      var gravity = this.elements.gravity.value;
      var xOffset = (width - layout.width) / 2;
      var yOffset = (height - layout.height) / 2;
      switch (gravity) {
        case "n":
          yOffset = 0;
          break;
        case "s":
          yOffset = height - layout.height;
          break;
        case "e":
          xOffset = 0;
          break;
        case "w":
          xOffset = width - layout.width;
      }
      var x = layout.x - xOffset;
      var y = layout.y - yOffset;

      // manually clip using the internal canvas
      this.buffer.width = layout.width;
      this.buffer.height = layout.height;
      this.context.drawImage(this.image, -xOffset, -yOffset, width, height);

      // set tint or not
      var blend = this.elements.tinted.checked ? "luminosity" : "source-over";
      context.globalCompositeOperation = blend;
      // blit to the main canvas
      context.drawImage(this.buffer, layout.x, layout.y);
      // clean up tint settings
      context.globalCompositeOperation = "source-over";

      // is there a credit line?
      var credit = this.elements.credit.value.trim().toUpperCase();
      if (credit) {
        context.textAlign = "right";
        context.textBaseline = "bottom";
        context.font = `20px "Figtree"`;
        context.fillStyle = "white";
        context.shadowColor = "black";
        context.shadowBlur = 2;
        context.shadowOffsetX = context.shadowOffsetY = 2;
        // context.strokeStyle = "black";
        // context.lineWidth = 3;
        // context.strokeText(credit, layout.right - 20, layout.bottom - 10);
        context.fillText(credit, layout.right - 10, layout.bottom - 10);
        context.shadowColor = null;
      }
    } else {
      // add placeholder label
      context.fillStyle = getThemed(config.theme, "background");
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.font = `120px "IBM Plex Serif"`;
      context.fillText(
        "PHOTO",
        layout.x + layout.width * 0.5,
        layout.y + layout.height * 0.5
      );
    }
  }
}

PhotoBrush.define("photo-brush");
