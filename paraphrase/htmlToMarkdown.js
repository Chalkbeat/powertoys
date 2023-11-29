function recurse(node, settings = { listDepth: 0, bullet: "* " }) {
  var converted = "";
  for (var node of node.childNodes) {
    switch (node.tagName) {
      case "H1":
      case "H2":
      case "H3":
      case "H4":
      case "H5":
        var level = node.tagName.match(/\d+/) * 1;
        converted += `${"#".repeat(level)} ${recurse(node, settings)}\n\n`;
        break;

      case "P":
      case "BR":
        if (node.getAttribute("role") != "presentation") converted += "\n\n";
        converted += recurse(node, settings);
        break;

      case "UL":
        converted += recurse(node, {
          listDepth: settings.listDepth + 1,
          bullet: "* "
        });
        break;

      case "OL":
        converted += recurse(node, { 
          listDepth: settings.listDepth + 1,
          bullet: "1. "
        });
        break;

      case "LI":
        var { bullet } = settings;
        var padding = " ".repeat(bullet.length).repeat(settings.listDepth - 1);
        converted += `${padding}${bullet}${recurse(node, settings)}\n`;
        break;

      case "A":
        converted += `[${recurse(node, settings)}](${node.href})`;
        break;

      case "B":
      case "STRONG":
        if (node.style.fontWeight == "normal") {
          converted += recurse(node, settings);
        } else {
          converted += `**${recurse(node, settings)}**`;
        }
        break;

      case "I":
      case "EM":
        converted += `*${recurse(node, settings)}*`;
        break;

      case "SPAN":
        var nodeStack = [];
        if (node.style.fontStyle == "italic") {
          nodeStack.push(document.createElement("i"));
        }
        if (node.style.fontWeight * 1 > 400) {
          nodeStack.push(document.createElement("b"));
        }
        var span = document.createElement("span");
        var tail = nodeStack.reduce((acc, n) => acc.append(n) || n, span);
        for (var child of node.childNodes) {
          tail.append(child.cloneNode(true));
        }
        converted += recurse(span, settings);
        break;

      default:
        if (node.nodeType == Node.TEXT_NODE) {
          converted += node.textContent;
        } else {
          converted += recurse(node, settings);
        }
    }
  }
  return converted;
}

export function convert(html) {
  var template = document.createElement("template");
  template.innerHTML = html.trim();
  var converted = recurse(template.content);
  return converted.replace(/^\s+$/gm, "").replace(/[\r\n]{2,}/g, "\n\n").trim();
}