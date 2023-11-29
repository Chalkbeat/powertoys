var template = document.createElement("template");

export function convert(html) {
  template.innerHTML = html;
  var walker = document.createTreeWalker(template.content);
  var converted = "";
  while (walker.nextNode()) {
    var node = walker.currentNode;
    switch (node.tagName) {
      case "H1":
      case "H2":
      case "H3":
      case "H4":
      case "H5":
        var level = node.tagName.match(/\d+/) * 1;
        converted += `${"".padStart(level, "#")} ${node.textContent}\n\n`;
        walker.nextSibling();
        break;

      case "P":
      case "UL":
        converted += "\n\n";
        break;

      case "LI":
        converted += "\n* ";
        break;

      case "A":
        converted += `[${node.textContent}](${node.href})`;
        walker.nextSibling();
        break;

      // case "B":
      // case "STRONG":
      //   converted += `**${convert(node)}**`;
      //   walker.nextSibling();
      //   break;

      // case "I":
      // case "EM":
      //   converted += `*${convert(node)}*`;
      //   walker.nextSibling();
      //   break;

      // case "U":
      //   converted += `_${convert(node)}_`;
      //   walker.nextSibling();
      //   break;

      default:
        if (node.nodeType == Node.TEXT_NODE) {
          converted += node.textContent;
        }
    }
  }
  return converted;
}