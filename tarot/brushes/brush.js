var persistence = {};

export default class Brush extends HTMLElement {
  constructor() {
    super();
    var def = new.target;

    this.elements = {};
    if (def.template) {
      var root = this.attachShadow({ mode: "open" });
      root.innerHTML = def.template;
      for (var tagged of root.querySelectorAll(`[as]`)) {
        this.elements[tagged.getAttribute("as")] = tagged;
      }
    }

    if (def.boundMethods) {
      for (var method of def.boundMethods) {
        this[method] = this[method].bind(this);
      }
    }
    this.invalidate = this.invalidate.bind(this);
  }

  connectedCallback() {
    requestAnimationFrame(() => {
      var id = this.id;
      var state = persistence[id];
      if (id && typeof state != "undefined") {
        this.restore(state);
        this.invalidate();
      }
    });
  }

  disconnectedCallback() {
    var id = this.id;
    var state = this.persist();
    if (id && typeof state != "undefined") {
      persistence[id] = state;
    }
  }

  persist() {
    // override me
  }

  restore(state) {
    // override me
  }

  dispatch(event, detail = {}) {
    var e = new CustomEvent(event, { bubbles: true, composed: true, detail });
    this.dispatchEvent(e);
  }

  invalidate() {
    this.dispatch("update");
  }

  getLayout(context, config) {
    // your positioning code should go here
  }

  draw(context, config) {
    // your rendering code should go here
  }

  unpackPadding(input) {
    input = input.trim().split(" ").map(Number)
    var [pt, pr, pb, pl] = input;
    var padding = input;
    switch (input.length) {
      case 0:
        padding = [0, 0, 0, 0];
        break;
      case 1:
        padding = [pt, pt, pt, pt];
        break;
      case 2:
        padding = [pt, pr, pt, pr];
        break;
      case 3:
        padding = [pt, pr, pb, pr];
        break;
    }
    return padding;
  }

  getNumeric(attribute) {
    return this.getAttribute(attribute) * 1;
  }

  denormalize(canvas, [x, y]) {
    return [x * canvas.width, y * canvas.height];
  }

  static define(tag) {
    window.customElements.define(tag, this);
  }
}