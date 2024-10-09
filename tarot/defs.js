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
  mauve: "#554359",
  orange: "#F5B362",
  green: "#ABD299",
  // Chalkbeat brand colors
  cbLogo: "#3666EC",
  cbBureau: "#03938F",
  cbLightBlue: "#92C5D4",
  cbDarkGreen: "#042B29",
  // Votebeat colors
  vbLogo: "#7E509E",
  vbBureau: "#331B3D",
  vbYellow: "#FCE487",
  vbBlue: "#8EAAC2",
  // Healthbeat colors
  hbLogo: "#F25A4D",
  hbBureau: "#DD405E"
};

export var fonts = {
  sans: "Figtree",
  serif: "Crimson Pro"
};

export var sizes = {
  default: { canvas: [1200, 628] },
  arc: { canvas: [3000, 1680], fontScaling: 3, logoScaling: 3 },
  ig: { canvas: [1080, 1080] },
  igs: { canvas: [1080, 1920], fontScaling: 1.3, logoScaling: 1.5 }
};

// themes are specified as an array of items, typically in these categories
// you can also specify a color directly instead of an index
// [ background, alternate background, text, alternate text, accent ]
export var themes = {
  cbLight: {
    colors: [
      colors.white,
      colors.gray,
      colors.black,
      colors.black,
      colors.cbBureau
    ],
    vertical: "Chalkbeat"
  },
  cbDark: {
    colors: [
      colors.black,
      colors.gray,
      colors.white,
      colors.white,
      colors.teal
    ],
    vertical: "Chalkbeat"
  },
  vbLight: {
    colors: [
      colors.white,
      colors.gray,
      colors.black,
      colors.black,
      colors.vbLogo
    ],
    vertical: "Votebeat"
  },
  vbDark: {
    colors: [
      colors.black,
      colors.gray,
      colors.white,
      colors.white,
      colors.orange
    ],
    vertical: "Votebeat"
  },
  hbLight: {
    colors: [
      colors.white,
      colors.gray,
      colors.black,
      colors.black,
      colors.hbLogo
    ],
    vertical: "Healthbeat"
  },
  hbDark: {
    colors: [
      colors.black,
      colors.gray,
      colors.white,
      colors.white,
      colors.hbBureau
    ],
    vertical: "Healthbeat"
  }
};

var themeIndices = {
  background: 0,
  backgroundAlt: 1,
  text: 2,
  textAlt: 3,
  accent: 4
};

export function getThemed(theme, shade) {
  var palette = themes[theme].colors;
  shade = shade in themeIndices ? themeIndices[shade] : shade;
  return palette[shade] || shade;
}

var swatch = document.createElement("canvas");
swatch.width = 1;
swatch.height = 1;
var context = swatch.getContext("2d", { willReadFrequently: true });
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

var templateCache = {};

export async function getTemplate(path) {
  if (!templateCache[path]) {
    templateCache[path] = fetch(`templates/${path}.html`).then((r) => r.text());
  }
  return templateCache[path];
}
