import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Create __dirname equivalent for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve the path relative to this script file
// Assuming structure: /frontend/scripts/this-file.js -> /frontend/src/assets/icons
const iconsDir = path.join(__dirname, "../src/assets/icons");

// Check if directory exists before proceeding to avoid crashes
if (!fs.existsSync(iconsDir)) {
  console.error(`Directory not found: ${iconsDir}`);
  process.exit(1);
}

fs.readdirSync(iconsDir).forEach((file) => {
  if (!file.endsWith(".svg")) return;

  const filePath = path.join(iconsDir, file);
  let content = fs.readFileSync(filePath, "utf8");

  // Replace fill colors with CSS variable
  content = content.replace(
    /fill:#[a-fA-F0-9]{6}/g,
    "fill:var(--icon-fill, #b3b3b3)"
  );

  // Replace stroke colors with CSS variable
  content = content.replace(
    /stroke:#[a-fA-F0-9]{6}/g,
    "stroke:var(--icon-stroke, #000)"
  );

  // Replace stroke-width (captures values like 0.8px, 1px, 2px, etc.)
  content = content.replace(
    /stroke-width:[\d.]+px/g,
    "stroke-width:var(--icon-stroke-width, 0.8px)"
  );

  fs.writeFileSync(filePath, content);
  console.log(`Converted: ${file}`);
});
