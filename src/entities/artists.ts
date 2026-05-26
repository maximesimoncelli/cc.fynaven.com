import { getCollection } from "astro:content";

export interface DataLayerArtist {
  name: string;
  role: string;
  slug?: string;
}

export async function getArtistsForStaticPaths() {
  const packs = await getCollection("packs");
  const results = packs
    .flatMap((pack) => {
      return pack.data.images.flatMap((image) => {
        return image.artists
          ?.map((artist) => {
            return {
              params: {
                artistId: artist.slug,
              },
              props: {
                images: pack.data.images
                  .filter((image) => {
                    return image.artists?.some(
                      (artistBis) => artist.slug === artistBis.slug,
                    );
                  })
                  .map((image) => ({ ...image, packSlug: pack.data.slug })),
                artist,
              },
            };
          })
          .filter((artist) => artist.params && artist.props);
      });
    })
    .filter((pack) => pack);

  return results;
}
