import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const versionPath = join(root, "version.json");
const { version } = JSON.parse(readFileSync(versionPath, "utf8"));

if (!/^\d+\.\d+\.\d+(-[\w.-]+)?$/.test(version)) {
  console.error(`Invalid version in version.json: ${version}`);
  process.exit(1);
}

let changed = 0;

function updateJsonFile(path, updater) {
  const raw = readFileSync(path, "utf8");
  const data = JSON.parse(raw);
  if (updater(data)) {
    writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`);
    changed += 1;
  }
}

updateJsonFile(join(root, "package.json"), (pkg) => {
  if (pkg.version === version) {
    return false;
  }
  pkg.version = version;
  return true;
});

updateJsonFile(join(root, "src-tauri", "tauri.conf.json"), (config) => {
  if (config.version === version) {
    return false;
  }
  config.version = version;
  return true;
});

const cargoPath = join(root, "src-tauri", "Cargo.toml");
const cargo = readFileSync(cargoPath, "utf8");
const cargoLines = cargo.split("\n");
let inPackage = false;
let cargoUpdated = false;

for (let index = 0; index < cargoLines.length; index += 1) {
  const line = cargoLines[index];

  if (line.trim() === "[package]") {
    inPackage = true;
    continue;
  }

  if (inPackage && line.startsWith("[") && line.trim() !== "[package]") {
    break;
  }

  if (inPackage && line.startsWith("version = ")) {
    const nextLine = `version = "${version}"`;
    if (line !== nextLine) {
      cargoLines[index] = nextLine;
      cargoUpdated = true;
    }
    break;
  }
}

if (cargoUpdated) {
  writeFileSync(cargoPath, cargoLines.join("\n"));
  changed += 1;
}

if (changed === 0) {
  console.log(`Version already synced: ${version}`);
} else {
  console.log(`Synced version ${version} to ${changed} file(s)`);
}
