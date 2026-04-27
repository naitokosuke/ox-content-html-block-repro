import content from "./content/index.md";

const app = document.getElementById("app");
const raw = document.getElementById("raw");

if (app) app.innerHTML = content.html;
if (raw) raw.textContent = content.html;
