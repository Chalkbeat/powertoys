import Brush from "./brush.js";

class ImageBrush extends Brush {

  constructor() {
    super();
    this.image = null;
    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = 0;
  }

  static observedAttributes = ["x", "y", "src", "follows", "width", "height"];
  attributeChangedCallback(attr, was, value) {
    switch (attr) {
      case "src":
        this.image = new Image();
        this.image.src = value;
        this.image.onload = () => this.dispatch("update");
        break;

      case "follows":
        this.follows = value;
        break;

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
    context.drawImage(this.image, layout.x, layout.y, layout.width, layout.height);
  }

}

ImageBrush.define("image-brush");