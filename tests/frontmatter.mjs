// Checks every skills/*/SKILL.md the way skill loaders do:
// valid YAML frontmatter, name matches the folder, description within limits,
// and every referenced references/* file exists.
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";

const root = "skills";
let failed = false;
const fail = (msg) => {
  console.error(`FAIL ${msg}`);
  failed = true;
};

for (const dir of readdirSync(root)) {
  const file = join(root, dir, "SKILL.md");
  if (!existsSync(file)) {
    fail(`${dir}: missing SKILL.md`);
    continue;
  }
  const text = readFileSync(file, "utf8");
  const match = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) {
    fail(`${file}: no frontmatter block`);
    continue;
  }
  let meta;
  try {
    meta = parse(match[1]);
  } catch (err) {
    fail(`${file}: frontmatter is not valid YAML (${err.message})`);
    continue;
  }
  if (!/^[a-z0-9-]{1,64}$/.test(meta.name ?? "")) fail(`${file}: name must be lowercase letters, digits, hyphens`);
  if (meta.name !== dir) fail(`${file}: name "${meta.name}" does not match folder "${dir}"`);
  if (typeof meta.description !== "string" || !meta.description.trim()) fail(`${file}: description missing`);
  else if (meta.description.length > 1024) fail(`${file}: description over 1024 characters`);
  for (const [, ref] of text.matchAll(/`(references\/[^`]+)`/g)) {
    if (!existsSync(join(root, dir, ref))) fail(`${file}: referenced file ${ref} not found`);
  }
  if (!failed) console.log(`ok ${file}`);
}

process.exit(failed ? 1 : 0);
