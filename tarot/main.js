import { colors, templates } from "./defs.js";
import "./theme-icon.js";

var $ = (s, d = document) => d.querySelectorAll(s);
$.one = (s, d = document) => d.querySelector(s);

var canvas = $.one(".preview canvas");
var context = canvas.getContext("2d");
var theme = "chalkbeat";

var form = $.one(".form form");

form.innerHTML = templates.test;

var updatePreview = function() {
  var drawables = form.children;
  for (var d of drawables) {
    if (!d.draw) continue;
    d.draw(context, { theme });
  }
}

$.one(".theme-group").addEventListener("input", function() {
  theme = $.one(".theme-group input:checked").value;
  updatePreview();
});

updatePreview();
form.addEventListener("update", updatePreview);
document.fonts.onloadingdone = updatePreview;