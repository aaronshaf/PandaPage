import { Window } from "happy-dom";

// Set up global DOM for tests
const window = new Window();
Object.assign(global, {
  DOMParser: window.DOMParser,
  Document: window.Document,
  Element: window.Element,
  Node: window.Node,
  NodeList: window.NodeList,
});
