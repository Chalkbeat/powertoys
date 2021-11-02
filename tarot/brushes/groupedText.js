import Brush from "./brush.js";

class GroupedTextBrush extends Brush {

  static template = `<slot as="slot"></slot>`;

  getLayout(context) {
    // find child bounds
    var children = this.elements.slot.assignedElements();
    var layouts = children.map(c => c.getLayout(context));
    var childTop = Math.min(...layouts.map(l => l.top));
    var childBottom = Math.max(...layouts.map(l => l.bottom));
    var height = childBottom - childTop;

    // find own bounds
    var anchor = this.getAttribute("anchor") || "middle";
    var normalY = Number(this.getAttribute("y") || 0);
    var normalX = Number(this.getAttribute("x") || 0);
    var [x, y] = this.denormalize(context.canvas, [normalX, normalY]);
    var top = anchor == "middle" ? y - (height * .5):
      anchor == "bottom" ? y - height : y;
    var bottom = top + height;

    var delta = top - childTop;

    return { x, left: x, top, y: top, bottom, height, children, delta };
  }

  draw(context, config) {
    var layout = this.getLayout(context);
    // set the canvas transform to place content
    context.save();
    context.translate(layout.x, layout.delta);
    for (var c of layout.children) {
      c.draw(context, config);
    }
    context.restore();
  }
}

GroupedTextBrush.define("grouped-text-brush");