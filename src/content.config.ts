import { defineCollection } from "astro:content";
import fs from "node:fs";
import path, { join } from "node:path";
import { glob, type Loader } from "astro/loaders";
import { dataLayerPackSchema } from "./entities/images";
import { type DataLayerTag, dataLayerTagSchema } from "./entities/tags";

const packs = defineCollection({
  loader: glob({ base: "./src/content/packs", pattern: "**/index.json" }),
  schema: ({ image }) => dataLayerPackSchema(image),
});

function tagsLoader(): Loader {
  return {
    name: "autotag",
    schema: dataLayerTagSchema(),
    load: async ({ store, parseData }) => {
      const packsDir = "./src/content/packs";

      const packFiles = fs
        .readdirSync(packsDir, { recursive: true })
        .filter(
          (file) => typeof file === "string" && file.endsWith("index.json"),
        );

      const images = packFiles.flatMap((file) => {
        const filePath = path.join(packsDir, file.toString());
        const content = fs.readFileSync(filePath, "utf-8");
        return JSON.parse(content).images || [];
      });

      const tagFilePath = "./src/content/tags/index.json";
      const tagFile = fs.readFileSync(
        join(process.cwd(), tagFilePath),
        "utf-8",
      );

      let parsedTagFile: DataLayerTag[] = JSON.parse(tagFile);

      const tagsInImages = new Set(images.flatMap((image) => image.tags));

      const tagsInDatastore = new Set(parsedTagFile.map((tag) => tag.id));

      const missingTags = tagsInImages.difference(tagsInDatastore);
      const tagsToRemove = tagsInDatastore.difference(tagsInImages);

      let fileNeedsUpdate = false;

      if (missingTags.size > 0) {
        console.log("Writing new tags...");
        missingTags.forEach((tag) => {
          const tagName = `${tag.at(0)?.toUpperCase()}${tag.slice(1).replaceAll("-", " ")}`;
          parsedTagFile.push({
            id: tag,
            name: tagName,
          });
        });
        fileNeedsUpdate = true;
      }

      if (tagsToRemove.size > 0) {
        console.log("Removing unused tags...");
        tagsToRemove.forEach((tag) => {
          parsedTagFile = parsedTagFile.filter(
            (parsedTag) => parsedTag.id !== tag,
          );
        });
        fileNeedsUpdate = true;
      }

      if (fileNeedsUpdate) {
        fs.writeFileSync(tagFilePath, JSON.stringify(parsedTagFile, null, 4));
      }

      for (const tag of parsedTagFile) {
        const id = tag.id;
        const data = await parseData({
          id,
          data: tag,
        });
        store.set({
          id,
          data,
        });
      }
    },
  };
}

const tags = defineCollection({
  schema: dataLayerTagSchema(),
  loader: tagsLoader(),
});

export const collections = { packs, tags };
