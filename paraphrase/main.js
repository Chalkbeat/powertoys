import "https://unpkg.com/commonmark@0.29.3/dist/commonmark.js";
import "./copy-box.js";
import { convert } from "./htmlToMarkdown.js";

var input = document.querySelector(".input textarea");
var output = document.querySelector(".output copy-box");
var preview = document.querySelector(".preview-box");

var parser = new commonmark.Parser();
var renderer = new commonmark.HtmlRenderer();

function onInput() {
  var markdown = input.value;
  var parsed = parser.parse(markdown);
  var html = renderer.render(parsed);
  output.value = html;
  preview.innerHTML = html;
}

input.addEventListener("paste", function(e) {
  var html = e.clipboardData.getData("text/html");
  if (html) {
    e.preventDefault();
    var md = convert(html);
    input.value = md;
    onInput();
  }
})

input.addEventListener("input", onInput);