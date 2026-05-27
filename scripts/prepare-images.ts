import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { loadEnv } from "vite";
import type { JSONLayerPack } from "../src/entities/images";

const {
  PUBLIC_MEDIA_URL,
  PRIVATE_WRANGLER_COMPATIBILITY_DATE,
  PRIVATE_WRANGLER_COMPATIBILITY_FLAGS,
  PRIVATE_WRANGLER_WORKER_NAME,
} = loadEnv(process.env.NODE_ENV ?? "development", process.cwd(), "");

const ROOT_PATH = process.cwd();

export async function computeProperImageSizes() {
  const packsDir = join(ROOT_PATH, "./src/content/packs");

  const packFiles = readdirSync(packsDir, { recursive: true }).filter(
    (file) => typeof file === "string" && file.endsWith("index.json"),
  );

  for (let packFile of packFiles) {
    const filePath = join(packsDir, packFile.toString());
    const pack = JSON.parse(readFileSync(filePath, "utf-8")) as JSONLayerPack;
    pack.cover = pack.cover.replace("./", `${PUBLIC_MEDIA_URL}/${pack.slug}/`);
    pack.images = await Promise.all(
      pack.images.map(async (image) => {
        const imgPath = join(packsDir, pack.slug, image.link);
        const { width, height, format } = await sharp(imgPath).metadata();
        let reductionRatio = width / 810;
        const calculatedHeightAfterReduction = Math.round(
          height / reductionRatio,
        );
        // if the height increases, then we adapt width instead of the height.
        // Right now only src\content\packs\element-pack-1-shakespeares-frames\files\vertical-separator.png is concerned but who knows in the future.
        if (calculatedHeightAfterReduction > height) {
          reductionRatio = height / 1000; // 1000px max height is arbitrary but higher screens are rare
          return {
            ...image,
            width: Math.round(width / reductionRatio),
            height: 1000,
            originalWidth: width,
            originalHeight: height,
            format: format,
          };
        }
        return {
          ...image,
          width: width > 810 ? 810 : width,
          height: Math.round(height / reductionRatio),
          originalWidth: width,
          originalHeight: height,
          format: format,
        };
      }),
    );
    writeFileSync(filePath, JSON.stringify(pack, null, 2));
  }
}

await computeProperImageSizes();
