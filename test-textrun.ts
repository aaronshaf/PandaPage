import type { TextRun } from "./packages/parser/src/types/document";

const firstRun: TextRun = {
  text: "Drop caps test",
  bold: true,
  link: undefined,
};

const remainingText = Object.assign({}, firstRun, { text: "rop caps test" });
console.log(remainingText);
