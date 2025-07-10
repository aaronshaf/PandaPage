import { JSDOM } from "jsdom";

// Set up DOM globals for tests
const dom = new JSDOM();
global.DOMParser = dom.window.DOMParser;
