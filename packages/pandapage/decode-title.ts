const hex = "FEFF00440075006D006D00790020005000440046002000660069006C0065";

// Decode UTF-16BE
let result = '';
// Skip BOM (FEFF)
for (let i = 4; i < hex.length; i += 4) {
  const codePoint = parseInt(hex.substr(i, 4), 16);
  result += String.fromCharCode(codePoint);
}

console.log("Title decodes to:", result);