// src/api/apod/controllers/apod.ts
import { factories } from '@strapi/strapi';
import type { Context } from 'koa';

interface NasaApod {
  title: string;
  date: string;
  explanation: string;
  media_type: 'image' | 'video';
  url: string;
  hdurl?: string;
  thumbnail_url?: string;
}

export default factories.createCoreController('api::apod.apod', ({ strapi }) => ({

  // GET /api/apod/live
  async live(ctx: Context) {
    const key = process.env.NASA_API_KEY;
    if (!key) ctx.throw(500, 'NASA_API_KEY not configured');

    const dateParam = ctx.query?.date ? `&date=${encodeURIComponent(String(ctx.query.date))}` : '';
    const url = `https://api.nasa.gov/planetary/apod?api_key=${key}&thumbs=true${dateParam}`;

    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) ctx.throw(res.status, await res.text());

    const apod = (await res.json()) as NasaApod;

    // Prefer HD for images, thumbnail for videos (APOD supplies thumbnail_url when thumbs=true)
    const mediaUrl =
      apod.media_type === 'video'
        ? apod.thumbnail_url || apod.url
        : apod.hdurl || apod.url;

    ctx.set('Cache-Control', 'no-store');
    ctx.body = {
      title: apod.title,
      date: apod.date,
      explanation: apod.explanation,
      media_type: apod.media_type,
      url: mediaUrl,
      hdurl: apod.hdurl ?? null,
      original_url: apod.url ?? null, // useful if you want to embed the real video
    };
  },

  // GET /api/apod/refresh — fetch NASA + upsert in Strapi
  async refresh(ctx: Context) {
    try {
      const record = await strapi.service('api::apod.apod').fetchAndStore();
      ctx.body = record;
    } catch (err: any) {
      ctx.throw(500, err?.message || 'Failed to refresh APOD');
    }
  },

}));
