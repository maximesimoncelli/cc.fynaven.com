import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { JSONLayerPack } from "./src/entities/images";
import { loadEnv } from "vite";

const { PUBLIC_MEDIA_URL } = loadEnv(
  process.env.NODE_ENV ?? "development",
  process.cwd(),
  "",
);

export function processPacksForBuild() {
  const packsDir = join(process.cwd(), "./src/content/packs");

  const packFiles = readdirSync(packsDir, { recursive: true }).filter(
    (file) => typeof file === "string" && file.endsWith("index.json"),
  );

  for (let packFile of packFiles) {
    const filePath = join(packsDir, packFile.toString());
    const pack = JSON.parse(readFileSync(filePath, "utf-8")) as JSONLayerPack;
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

processPacksForBuild();
