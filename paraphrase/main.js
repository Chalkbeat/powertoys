import "https://unpkg.com/commonmark@0.29.3/dist/commonmark.js";
import "./copy-box.js";

var input = document.querySelector(".input textarea");
var output = document.querySelector(".output copy-box");

var parser = new commonmark.Parser();
var renderer = new commonmark.HtmlRenderer();

input.addEventListener("input", function() {
  var markdown = input.value;
  var parsed = parser.parse(markdown);
  var html = renderer.render(parsed);
  output.value = html;
});