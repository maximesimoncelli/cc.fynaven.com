import {
  getCollection,
  getEntries,
  type ImageFunction,
  reference,
} from "astro:content";
import type { ImageMetadata } from "astro";
import { z } from "astro/zod";
import type { DataLayerArtist } from "./artists";

export interface DataLayerPack {
  title: string;
  slug: string;
  type: string;
  source: string;
  cover: ImageMetadata;
  images: Array<{
    link: ImageMetadata;
    slug: string;
    name: string;
    artists: DataLayerArtist[];
    description: string;
  }>;
}

export enum DataLayerPackType {
  TEXTURES = "textures",
  ILLUSTRATIONS = "illustrations",
  ELEMENTS = "elements",
}
export type DataLayerPackTypeLiterals = `${DataLayerPackType}`;

export function dataLayerPackSchema(image: ImageFunction) {
  return z.object({
    title: z.string(),
    slug: z.string(),
    type: z.enum(Object.values(DataLayerPackType)),
    source: z.string(),
    cover: image(),
    downloadLink: z.string(),
    publishedAt: z.iso.date(),
    images: z.array(
      z.object({
        link: image(),
        slug: z.string(),
        name: z.string(),
        source: z.string().optional(),
        tags: z.array(reference("tags")),
        artists: z
          .array(
            z.object({
              name: z.string(),
              role: z.string(),
              slug: z.string().optional(),
            }),
          )
          .optional(),
        description: z.string(),
      }),
    ),
  });
}

export type BusinessLayerImage = Omit<
  DataLayerPack["images"][number],
  "artists"
> & {
  packSlug: DataLayerPack["slug"];
  artists?: DataLayerArtist[];
};

/**
 * Retrieves all images from the "packs" collection and flattens them into a single array,
 * while also including the slug of the pack they belong to.
 * @returns BusinessLayerImage[] - An array of images with their associated pack slug.
 */
export async function getImages() {
  const packs = await getCollection("packs");
  const images: BusinessLayerImage[] = [];

  packs
    .sort(
      (a, b) =>
        new Date(b.data.publishedAt).getTime() -
        new Date(a.data.publishedAt).getTime(),
    )
    .forEach((pack) => {
      pack.data.images.forEach((image) => {
        images.push({
          ...image,
          packSlug: pack.data.slug,
        });
      });
    });

  return images;
}

export async function getImagesOfType(type: DataLayerPackTypeLiterals) {
  const packs = await getCollection("packs");
  const images: BusinessLayerImage[] = [];

  packs
    .sort(
      (a, b) =>
        new Date(b.data.publishedAt).getTime() -
        new Date(a.data.publishedAt).getTime(),
    )
    .filter((pack) => pack.data.type === type)
    .forEach((pack) => {
      pack.data.images.forEach((image) => {
        images.push({
          ...image,
          packSlug: pack.data.slug,
        });
      });
    });

  return images;
}

function uniqueRandomSubsetInRange(maxRange: number, subset: number = 8) {
  const asIndexes = maxRange - 1;
  const range = [...Array(asIndexes).keys()];
  const random: number[] = [];

  while (random.length !== subset) {
    const randomIndex = Math.floor(Math.random() * asIndexes);
    if (!range[randomIndex]) continue;
    random.push(range[randomIndex]);
    delete range[randomIndex];
  }

  return random;
}

export async function getNRandomImages(numberOfImages: number = 8) {
  const packs = await getCollection("packs");
  const images: BusinessLayerImage[] = [];

  packs
    .sort(
      (a, b) =>
        new Date(b.data.publishedAt).getTime() -
        new Date(a.data.publishedAt).getTime(),
    )
    .forEach((pack) => {
      pack.data.images.forEach((image) => {
        images.push({
          ...image,
          packSlug: pack.data.slug,
        });
      });
    });

  const randomIndexes = uniqueRandomSubsetInRange(
    images.length - 1,
    numberOfImages,
  );

  return images.filter((_image, index) => {
    return randomIndexes.includes(index);
  });
}

/**
 * Generates static paths for each image in the "images" collection.
 * This is purely an astro utility function.
 * @returns A promise resolving to an array of static path configurations.
 */
export async function getImageForStaticPath() {
  const packs = await getCollection("packs");
  return Promise.all(
    packs.flatMap((pack) => {
      return pack.data.images.map(async (img) => {
        const tags = await getEntries(img.tags);
        return {
          params: {
            imageSlug: [pack.data.slug, img.slug].join("/"),
          },
          props: {
            img,
            collection: pack.data,
            tags: tags.map((tag) => tag?.data).filter((tag) => tag),
          },
        };
      });
    }),
  );
}

export async function getPackForStaticPath() {
  const packs = await getCollection("packs");
  return packs.map((pack) => {
    const images: BusinessLayerImage[] = [];
    pack.data.images.forEach((image) => {
      images.push({
        ...image,
        packSlug: pack.data.slug,
      });
    });
    return {
      params: {
        packId: pack.data.slug,
      },
      props: { collection: pack.data, images },
    };
  });
}

export async function getPacksSortedByDate() {
  const packs = await getCollection("packs");
  return packs.sort(
    (a, b) =>
      new Date(b.data.publishedAt).getTime() -
      new Date(a.data.publishedAt).getTime(),
  );
}
