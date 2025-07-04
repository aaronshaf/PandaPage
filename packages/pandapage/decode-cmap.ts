// From stream 3 output
const cmapText = `11 beginbfchar
<01> <0044>
<02> <0075>
<03> <006D>
<04> <0079>
<05> <0020>
<06> <0050>
<07> <0046>
<08> <0066>
<09> <0069>
<0A> <006C>
<0B> <0065>
endbfchar`;

// Parse the mappings
const lines = cmapText.split('\n');
const charMap: { [key: string]: string } = {};

for (const line of lines) {
  const match = line.match(/<([0-9A-F]+)>\s*<([0-9A-F]+)>/i);
  if (match) {
    const from = match[1].toLowerCase();
    const to = parseInt(match[2], 16);
    const char = String.fromCharCode(to);
    charMap[from] = char;
    console.log(`${from} (0x${from}) -> U+${match[2]} -> '${char}'`);
  }
}

console.log("\nCharacter map:", charMap);

// Test with our hex sequences
const sequences = ["01020303", "04", "05", "060107", "050809", "0A0B"];
let result = "";
for (const seq of sequences) {
  let seqResult = "";
  for (let i = 0; i < seq.length; i += 2) {
    const code = seq.substr(i, 2).toLowerCase();
    if (charMap[code]) {
      seqResult += charMap[code];
    }
  }
  console.log(`${seq} -> "${seqResult}"`);
  result += seqResult;
}

console.log(`\nFull result: "${result}"`);