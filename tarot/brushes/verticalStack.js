import Brush from "./brush.js";

/*
VerticalStack replaces the "follows" attribute, merging it into the former GroupedTextBrush
*/

class VerticalStack extends Brush {

  static template = `<slot as="slot"></slot>`;

  static observedAttributes = ["x", "y", "dx", "dy"];

  attributeChangedCallback(attr, was, value) {
    this[attr] = Number(value);
  }

  getLayout(context) {
    // find child bounds
    var children = this.elements.slot.assignedElements();
    var layouts = children.map(c => c.getLayout(context));
    var height = layouts.reduce((acc, l) => acc + l.height, 0);

    // find own bounds
    var anchor = this.getAttribute("anchor") || "middle";
    var normalY = this.y || 0;
    var normalX = this.x || 0;
    var [x, y] = this.denormalize(context.canvas, [normalX, normalY]);
    x += this.dx || 0;
    y += this.dy || 0;
    var top = anchor == "middle" ? y - (height * .5):
      anchor == "bottom" ? y - height : y;

    var delta = top - height;

    var layout = new DOMRect(x, top, 0, height);
    layout.pairs = children.map((c, i) => [c, layouts[i]]);
    return layout;
  }

  draw(context, config) {
    var layout = this.getLayout(context);
    var { x, top, pairs } = layout;
    // set the canvas transform to place content
    context.save();
    // move to the starting point
    context.translate(x, top);
    for (var [ child, position ] of pairs) {
      child.draw(context, config);
      context.translate(0, position.height);
    }
    context.restore();
  }

  get alt() {
    var children = this.elements.slot.assignedElements();
    return children.map(c => c.alt).filter(t => t).join("\n");
  }
}

VerticalStack.define("vertical-stack");