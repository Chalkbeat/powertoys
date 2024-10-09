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

  updateConfig(config) {
    // code that may or may not trigger a re-render
    // by default, just falls through
    for (var c of Array.from(this.children)) {
      if (c.updateConfig) c.updateConfig(config);
    }
  }

  unpackPadding(input) {
    input = input.trim().split(" ").map(Number);
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

  // support px and % measurements in attributes
  project(measurement, domain) {
    if (typeof measurement == "string") {
      var [_, numeric, unit] = measurement.match(/\s*([\d\.]+)\s*(px|%)?/);
      numeric = Number(numeric);
      if (unit == "%") {
        return (numeric / 100) * domain;
      } else if (unit == "px") {
        return numeric;
      } else {
        return numeric * domain;
      }
    }
    // fallback for numbers
    return measurement * domain;
  }

  static define(tag) {
    window.customElements.define(tag, this);
  }
}
