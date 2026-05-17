import fs from "node:fs";
import path from "node:path";

function walk(dir) {
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (fs.statSync(full).isDirectory()) {
      walk(full);
      continue;
    }

    if (!full.endsWith(".tsx")) {
      continue;
    }

    const original = fs.readFileSync(full, "utf8");
    const fixed = original.replace(/<\/?motionless[^>]*>/gi, (tag) =>
      tag.startsWith("</") ? "</div>" : "<div>",
    );

    if (fixed !== original) {
      fs.writeFileSync(full, fixed);
      console.log("fixed", full);
    }
  }
}

walk(path.join(process.cwd(), "src"));
