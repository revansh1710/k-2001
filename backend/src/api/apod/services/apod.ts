import axios from "axios";

export default {
  async fetchAndStore() {
    const apiKey = process.env.NASA_API_KEY || "DEMO_KEY";
    const endpoint = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}`;

    const { data } = await axios.get(endpoint);

    // upsert by date
    const existing = await strapi.db.query("api::apod.apod").findOne({
      where: { date: data.date },
    });

    if (existing) {
      // update if needed
      await strapi.db.query("api::apod.apod").update({
        where: { id: existing.id },
        data: {
          title: data.title,
          explanation: data.explanation,
          media_type: data.media_type,
          url: data.url,
          hdurl: data.hdurl,
        },
      });
      return existing;
    }

    const created = await strapi.db.query("api::apod.apod").create({
      data: {
        date: data.date,
        title: data.title,
        explanation: data.explanation,
        media_type: data.media_type,
        url: data.url,
        hdurl: data.hdurl,
      },
    });

    return created;
  },
};
