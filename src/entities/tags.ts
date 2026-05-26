import { getCollection } from "astro:content";
import { z } from "astro/zod";
import type { BusinessLayerImage } from "./images";

export type DataLayerTag = {
  id: string;
  name: string;
};

export function dataLayerTagSchema() {
  return z.object({
    id: z.string(),
    name: z.string(),
  });
}

export async function getTaggedImagesForStaticPaths() {
  const tags = await getCollection("tags");

  const results = await Promise.all(
    tags.map(async (tag) => {
      const packs = await getCollection("packs");
      const taggedImages: BusinessLayerImage[] = [];

      packs.forEach((pack) => {
        pack.data.images.forEach((image) => {
          if (image.tags.some((imageTag) => imageTag.id === tag.id)) {
            taggedImages.push({ ...image, packSlug: pack.id });
          }
        });
      });

      return {
        params: {
          tagId: tag.id,
        },
        props: {
          tag: tag.data,
          images: taggedImages,
        },
      };
    }),
  );

  return results;
}
