export var colors = {
  teal: "#178287",
  lightTeal: "#9CD1D4",
  peach: "#F79C75",
  lightPeach: "#F1CEBF",
  purple: "#855279",
  lightPurple: "#B575BB",
  gold: "#AC8E4C",
  yellow: "#FFD373",
  blue: "#1B6383",
  lightBlue: "#A1C8DA",
  gray: "#828282",
  black: "#333333"
};

// themes are specified as an array of items, typically in these categories
// you can also specify a color directly instead of an index
// [ dark, light, accent, text ]
export var themes = {
  chalkbeat: [colors.teal, colors.lightTeal, colors.yellow, colors.black ],
  somber: [ colors.black, colors.gray, colors.teal, colors.black ],
  purple: [ colors.purple, colors.lightPurple, colors.yellow, colors.teal ],
  peach: [ colors.peach, colors.lightPeach, colors.yellow, colors.purple ]
}

export function getThemed(theme, shade) {
  var palette = themes[theme];
  return palette[shade] || shade;
}

/*
For more on how templates relate to drawing, see brushes/readme.rst.
*/
import "./brushes/groupedText.js";
import "./brushes/image.js";
import "./brushes/logo.js";
import "./brushes/rectangle.js";
import "./brushes/text.js";

async function getTemplate(path) {
  var response = await fetch(`templates/${path}.html`);
  return response.text();
}

export var templates = {
  test: await getTemplate("test")
};