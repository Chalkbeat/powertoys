function recurse(node) {
  var converted = "";
  for (var node of node.childNodes) {
    switch (node.tagName) {
      case "H1":
      case "H2":
      case "H3":
      case "H4":
      case "H5":
        var level = node.tagName.match(/\d+/) * 1;
        converted += `${"".padStart(level, "#")} ${recurse(node)}\n\n`;
        break;

      case "P":
      case "BR":
      case "UL":
        if (node.getAttribute("role") != "presentation") converted += "\n\n";
        converted += recurse(node);
        break;

      case "LI":
        converted += `\n* ${recurse(node)}`;
        break;

      case "A":
        converted += `[${recurse(node)}](${node.href})`;
        break;

      case "B":
      case "STRONG":
        if (node.style.fontWeight == "normal") {
          converted += recurse(node);
        } else {
          converted += `**${recurse(node)}**`;
        }
        break;

      case "I":
      case "EM":
        converted += `*${recurse(node)}*`;
        break;

      case "SPAN":
        var nodeStack = [];
        if (node.style.fontStyle == "italic") {
          nodeStack.push(document.createElement("i"));
        }
        if (node.style.fontWeight * 1 > 400) {
          nodeStack.push(document.createElement("b"));
        }
        if (node.style.textDecoration == "underline") {
          nodeStack.push(document.createElement("u"));
        }
        var span = document.createElement("span");
        var tail = nodeStack.reduce((acc, n) => acc.append(n) || n, span);
        for (var child of node.childNodes) {
          tail.append(child.cloneNode(true));
        }
        converted += recurse(span);
        break;

      default:
        if (node.nodeType == Node.TEXT_NODE) {
          converted += node.textContent;
        } else {
          converted += recurse(node);
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