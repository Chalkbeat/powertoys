import { colors, templates, getThemed } from "./defs.js";
import "./theme-icon.js";
import "./copy-box.js";

var $ = (s, d = document) => d.querySelectorAll(s);
$.one = (s, d = document) => d.querySelector(s);

var canvas = $.one(".preview canvas");
var context = canvas.getContext("2d");
var theme = "light";

var templateSelect = $.one("select.template");
var form = $.one(".form form");
var altDisplay = $.one(".alt-display");

var scheduled = false;
var scheduleUpdate = function() {
  if (scheduled) return;
  scheduled = setTimeout(() => {
    scheduled = null;
    updatePreview();
  }, 50);
}

var updatePreview = function() {
  // clear the canvas
  context.fillStyle = getThemed(theme, 0);
  context.fillRect(0, 0, canvas.width, canvas.height);

  // update from the form
  var drawables = form.children;
  var alt = [];
  for (var d of drawables) {
    if (!d.draw) continue;
    d.draw(context, { theme });
    var a = d.alt;
    if (a) alt.push(a);
  }
  altDisplay.value = alt.join("\n");
}

var updateTemplate = function() {
  form.innerHTML = templates[templateSelect.value];
  scheduleUpdate();
};

var updateTheme = function() {
  theme = $.one(".theme-group input:checked").value;
  scheduleUpdate();
}


templateSelect.addEventListener("change", updateTemplate);
$.one(".theme-group").addEventListener("input", updateTheme);
form.addEventListener("update", scheduleUpdate);
document.fonts.onloadingdone = scheduleUpdate;

updateTemplate();

var downloadButton = $.one("button.download");
downloadButton.addEventListener("click", function() {
  var link = document.createElement("a");
  var template = templateSelect.value;
  var timestamp = Date.now();
  link.setAttribute("download", `${template}-${timestamp}.jpg`);
  link.setAttribute("href", canvas.toDataURL("image/jpg"));
  link.click();
});