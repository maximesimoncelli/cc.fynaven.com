import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { JSONLayerPack } from "../src/entities/images";
import { loadEnv } from "vite";

const {
  PUBLIC_MEDIA_URL,
  PRIVATE_WRANGLER_COMPATIBILITY_DATE,
  PRIVATE_WRANGLER_COMPATIBILITY_FLAGS,
  PRIVATE_WRANGLER_WORKER_NAME,
} = loadEnv(process.env.NODE_ENV ?? "development", process.cwd(), "");

const ROOT_PATH = process.cwd();

/**
 * Processes the `index.json` pack files in order to get the proper bucket
 * paths at build time.
 */
export function processPacksForBuild() {
  const packsDir = join(ROOT_PATH, "./src/content/packs");

  const packFiles = readdirSync(packsDir, { recursive: true }).filter(
    (file) => typeof file === "string" && file.endsWith("index.json"),
  );

  for (let packFile of packFiles) {
    const filePath = join(packsDir, packFile.toString());
    const pack = JSON.parse(readFileSync(filePath, "utf-8")) as JSONLayerPack;
    pack.cover = pack.cover.replace("./", `${PUBLIC_MEDIA_URL}/${pack.slug}/`);
    pack.images = pack.images.map((image) => {
      return {
        ...image,
        link: image.link.replace(
          "./files/",
          `${PUBLIC_MEDIA_URL}/${pack.slug}/`,
        ),
      };
    });
    writeFileSync(
      join(packsDir, pack.slug, "index.build.json"),
      JSON.stringify(pack, null, 2),
    );
  }
}

/**
 * Processes the `wrangler.example.jsonc` file in order to build the correct
 * one at build time.
 */
export function processWranglerJSON() {
  const configurationFiles = {
    wrangler: {
      source: join(ROOT_PATH, "wrangler.example.jsonc"),
      destination: join(ROOT_PATH, "wrangler.jsonc"),
    },
  };

  const replaceMap = new Map<string, string | string[]>([
    ["compatibility_date", PRIVATE_WRANGLER_COMPATIBILITY_DATE],
    ["compatibility_flags", PRIVATE_WRANGLER_COMPATIBILITY_FLAGS.split(",")],
    ["name", PRIVATE_WRANGLER_WORKER_NAME],
  ]);

  let exampleFileContent = JSON.parse(
    readFileSync(configurationFiles.wrangler.source, "utf-8"),
  );
  replaceMap.forEach((value, key) => {
    exampleFileContent[key] = value;
  });
  writeFileSync(
    configurationFiles.wrangler.destination,
    JSON.stringify(exampleFileContent, null, 2),
  );
}

processPacksForBuild();
processWranglerJSON();
