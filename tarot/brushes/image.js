import Brush from "./brush.js";
import { getThemed } from "../defs.js";

class ImageBrush extends Brush {

  constructor() {
    super();
    this.image = null;
    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = 0;
    this.buffer = document.createElement("canvas");
  }

  static observedAttributes = ["x", "y", "src", "follows", "width", "height", "recolor"];
  attributeChangedCallback(attr, was, value) {
    switch (attr) {
      case "src":
        this.image = new Image();
        this.image.src = value;
        this.image.onload = () => this.dispatch("update");
        break;

      // strings
      case "follows":
      case "recolor":
        this[attr] = value;
        break;

      // boolean
        // this[attr] = typeof value != "undefined";

      default:
        this[attr] = Number(value);
    }
    this.dispatch("update");
  }

  getLayout(context) {
    var [x, y] = this.denormalize(context.canvas, [this.x, this.y]);
    if (!this.image) {
      return { x, y };
    }
    var width = this.width || this.image.naturalWidth;
    var height = this.height || this.image.naturalHeight;
    x -= width / 2;
    y -= height / 2;
    if (this.follows) {
      var following = document.getElementById(this.follows);
      if (following) {
        var followed = following.getLayout(context);
        x = followed.left;
        y = followed.bottom;
      }
    }
    return { x, left: x, y, top: y, bottom: y + height, width, height }
  }

  draw(context, config) {
    if (!this.image) return;
    var layout = this.getLayout(context);
    if (this.recolor && layout.height) {
      // convert our color into rgb
      // we'll hack the browser to make a fake element and get this temporarily
      var temp = document.createElement("div");
      temp.style.background = getThemed(config.theme, this.recolor);
      document.body.appendChild(temp);
      var computed = window.getComputedStyle(temp);
      var rgb = computed.background.match(/\d+/g);
      temp.remove();
      var [r, g, b] = rgb.map(Number);

      // apply to the buffer
      this.buffer.width = layout.width;
      this.buffer.height = layout.height;
      var bufferContext = this.buffer.getContext("2d");
      bufferContext.drawImage(this.image, 0, 0, layout.width, layout.height);
      var bitmap = bufferContext.getImageData(0, 0, layout.width, layout.height);
      for (var i = 0; i < bitmap.data.length; i += 4) {
        bitmap.data[i] = r;
        bitmap.data[i+1] = g;
        bitmap.data[i+2] = b;
      }
      bufferContext.putImageData(bitmap, 0, 0);
      context.drawImage(this.buffer, layout.x, layout.y);
    } else {
      context.drawImage(this.image, layout.x, layout.y, layout.width, layout.height);
    }
  }

}

ImageBrush.define("image-brush");