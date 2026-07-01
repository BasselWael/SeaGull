const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const fs = require("fs");

const html = fs.readFileSync("index.html", "utf-8");
const dom = new JSDOM(html, { runScripts: "dangerously", resources: "usable" });

dom.window.onerror = function(message, source, lineno, colno, error) {
  console.log("Error:", message, error);
};

setTimeout(() => {
  console.log("Scripts loaded.");
  const visible = dom.window.document.querySelectorAll('.is-visible');
  console.log("is-visible elements count:", visible.length);
}, 2000);
