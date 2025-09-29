// src/api/apod/services/apod.ts
import { factories } from '@strapi/strapi';

interface NasaApod {
  title: string;
  date: string;
  explanation: string;
  media_type: 'image' | 'video';
  url: string;
  hdurl?: string;
  thumbnail_url?: string;
}

export default factories.createCoreService('api::apod.apod', ({ strapi }) => ({

  async fetchAndStore() {
    const key = process.env.NASA_API_KEY;
    if (!key) throw new Error('NASA_API_KEY not configured');

    const res = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${key}&thumbs=true`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(await res.text());
    const a = (await res.json()) as NasaApod;

    const data = {
      date: a.date,
      title: a.title,
      explanation: a.explanation,
      media_type: a.media_type,
      url: a.url,
      hdurl: a.hdurl ?? null,
    };

    // For a collection-type "apod": upsert first row
    const existing = await strapi.entityService.findMany('api::apod.apod', { limit: 1 });
    if (existing?.[0]) {
      return await strapi.entityService.update('api::apod.apod', existing[0].id, { data });
    }
    return await strapi.entityService.create('api::apod.apod', { data });

    // If you made APOD a single-type, replace the above with the single-type update.
  },

}));
