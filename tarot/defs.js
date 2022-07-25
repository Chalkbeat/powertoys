export var colors = {
  darkTeal: "#178287",
  teal: "#19A4AB",
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
  black: "#393939",
  white: "#F8F8F8",
  // Votebeat colors
  mauve: "#554359",
  vbYellow: "#FCE487",
  orange: "#F5B362",
  green: "#ABD299",
  vbBlue: "#8EAAC2"
};

export var sizes = {
  default: [1200, 628],
  ig: [1080, 1080],
  igs: [1080, 1920]
}

// themes are specified as an array of items, typically in these categories
// you can also specify a color directly instead of an index
// [ background, alternate background, text, alternate text, accent ]
export var themes = {
  light: [
    colors.white,
    colors.gray,
    colors.black,
    colors.darkTeal,
    colors.teal,
  ],
  dark: [colors.black, colors.gray, colors.white, colors.teal, colors.teal],
  chalkbeat: [
    colors.darkTeal,
    colors.teal,
    colors.white,
    colors.yellow,
    colors.yellow,
  ],
  purple: [
    colors.purple,
    colors.lightPurple,
    colors.white,
    colors.yellow,
    colors.yellow,
  ],
  votebeat: [
    colors.white,
    colors.gray,
    colors.black,
    colors.mauve,
    colors.orange
  ]
};

var themeIndices = {
  background: 0,
  backgroundAlt: 1,
  text: 2,
  textAlt: 3,
  accent: 4,
};

export function getThemed(theme, shade) {
  var palette = themes[theme];
  shade = shade in themeIndices ? themeIndices[shade] : shade;
  return palette[shade] || shade;
}

var swatch = document.createElement("canvas");
swatch.width = 1;
swatch.height = 1;
var context = swatch.getContext("2d");
var rgbCache = {};

export function getThemedRGB(theme, shade) {
  var background = getThemed(theme, shade);
  if (!rgbCache[background]) {
    // convert our color into rgb
    // we'll use canvas to take advantage of browser support for color names
    context.fillStyle = background;
    context.fillRect(0, 0, 1, 1);
    rgbCache[background] = context.getImageData(0, 0, 1, 1).data.slice();
  }
  return rgbCache[background];
}

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

var templateCache = {};

export async function getTemplate(path) {
  if (!templateCache[path]) {
    templateCache[path] = fetch(`templates/${path}.html`).then(r => r.text());
  }
  return templateCache[path];
}