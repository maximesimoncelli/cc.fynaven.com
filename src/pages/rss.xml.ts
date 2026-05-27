import { getImage } from "astro:assets";
import { getCollection } from "astro:content";
import { PUBLIC_URL } from "astro:env/client";
import rss from "@astrojs/rss";
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ site }) => {
  const packs = await getCollection("packs");
  return rss({
    title: "CC0.FYNAVEN",
    description:
      "Illustrations, textures, design elements and more, made available freely under the CC0 license. By Sylfvr.",
    site: site ?? PUBLIC_URL,
    items: await Promise.all(
      packs.map(async ({ data: pack }) => ({
        author: "Sylfvr",
        categories: [`${pack.type.at(0)?.toUpperCase()}${pack.type.slice(1)}`],
        description: pack.source,
        content: `<div>${pack.source}</div><div><img src="${PUBLIC_URL}${(await getImage({ src: pack.cover, width: 600, height: 600 })).src}" /></div>`,
        link: `${PUBLIC_URL}/packs/${pack.slug}`,
        title: pack.title,
        pubDate: new Date(pack.publishedAt),
      })),
    ),
  });
};
