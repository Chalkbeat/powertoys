import { sizes, colors, getThemed, getTemplate } from "./defs.js";
import "./theme-icon.js";
import "./copy-box.js";

/*
For more on how templates relate to drawing, see brushes/readme.rst.
*/
import "./brushes/image.js";
import "./brushes/logo.js";
import "./brushes/photo.js";
import "./brushes/rectangle.js";
import "./brushes/seriesLogo.js";
import "./brushes/text.js";
import "./brushes/verticalStack.js";
import "./brushes/verticalSpacer.js";
import "./brushes/patternSquares.js";

var $ = (s, d = document) => d.querySelectorAll(s);
$.one = (s, d = document) => d.querySelector(s);

var canvas = $.one(".preview canvas");
var context = canvas.getContext("2d");
var theme = "light";

var sizeSelect = $.one("select.size");
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

var updateSize = async function() {
  var { value } = sizeSelect;
  var [width, height] = sizes[value].canvas;
  canvas.width = width;
  canvas.height = height;
  canvas.style.aspectRatio = `${width} / ${height}`
  for (var option of templateSelect.children) {
    var excluded = (option.dataset.exclude || "").split(/,\s*/).filter(d => d);
    var included = (option.dataset.include || "").split(/,\s*/).filter(d => d);
    var hidden = false;
    if (included.length) {
      hidden = !included.includes(value);
    }
    if (excluded.length) {
      hidden = excluded.includes(value);
    }
    option.toggleAttribute("hidden", hidden);
  }
  var [ selectedTemplate ] = templateSelect.selectedOptions;
  if (selectedTemplate.hidden) {
    templateSelect.value = selectedTemplate.dataset.fallback || "quote";
    await updateTemplate();
  }
  updatePreview();
}
sizeSelect.addEventListener("change", updateSize);

var updatePreview = function() {
  // clear the canvas
  context.fillStyle = getThemed(theme, 0);
  context.fillRect(0, 0, canvas.width, canvas.height);

  // update from the form
  var drawables = form.children;
  var alt = [];
  var size = sizeSelect.value;
  var { fontScaling = 1, logoScaling = 1 } = sizes[size];
  for (var d of drawables) {
    if (!d.draw) continue;
    d.draw(context, { theme, fontScaling, logoScaling });
    var a = d.alt;
    if (a) alt.push(a);
  }
  altDisplay.value = alt.join("\n");
}

var updateTemplate = async function() {
  var html = await getTemplate(templateSelect.value);
  form.innerHTML = html;
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

updateSize();
updateTemplate();

var downloadButton = $.one("button.download");
downloadButton.addEventListener("click", function() {
  var link = document.createElement("a");
  var template = templateSelect.value;
  var timestamp = Date.now();
  link.setAttribute("download", `${template}-${timestamp}.jpg`);
  link.setAttribute("href", canvas.toDataURL("image/jpeg", .7));
  link.click();
});