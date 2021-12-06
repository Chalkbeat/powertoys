import Brush from "./brush.js";

class VerticalSpacer extends Brush {

  constructor() {
    super();
    this.x = this.y = 0;
    this.width = this.height = 1;
    this.padding = "";
  }

  static observedAttributes = ["x", "y", "width", "height", "padding"];
  attributeChangedCallback(attr, was, value) {
    switch (attr) {

      case "padding":
        this[attr] = value;
        break;

      default:
        this[attr] = Number(value);

    }
  }

  // this is explicitly not a flex layout--it is the size you assign,
  // regardless of child size
  getLayout(context) {
    var [x, y] = this.denormalize(context.canvas, [this.x, this.y]);
    var [w, h] = this.denormalize(context.canvas, [this.width, this.height]);
    return new DOMRect(x, y, w, h);
  }

  draw(context, config) {
    var debug = this.hasAttribute("debug");
    var layout = this.getLayout(context);
    var padding = this.unpackPadding(this.padding);
    var children = Array.from(this.children);
    var layouts = children.map(c => c.getLayout(context, config));
    var zipped = children.map((c, i) => [c, layouts[i]]);
    var totalHeight = layouts.reduce((acc, l) => acc + l.height, 0);
    var vPadding = padding[0] + padding[2];
    var totalSpace = layout.height - vPadding - totalHeight;;
    var spacing = totalSpace / (children.length - 1);
    if (debug) {
      context.fillStyle = "yellow";
      context.fillRect(layout.x, layout.y, layout.width, layout.height);
      context.fillStyle = "cyan";
      context.fillRect(layout.x, layout.y, layout.width, padding[0]);
      context.fillRect(layout.x, layout.y + layout.height - padding[2], layout.width, padding[2])
    }
    context.save();
    context.translate(layout.x, layout.y + padding[0]);
    for (var [c, l] of zipped) {
      if (debug) {
        context.fillStyle = "red";
        context.fillRect(l.x - 2, l.y - 2, l.width + 4, l.height + 4);
      }
      c.draw(context, config);
      if (debug) {
        context.fillStyle = "cyan";
        context.fillRect(l.x, l.height, l.width || 100, spacing);
      }
      context.translate(0, l.height + spacing);
    }
    context.restore();
  }

}

VerticalSpacer.define("vertical-spacer");