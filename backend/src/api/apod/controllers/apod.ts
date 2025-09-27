export default {
  async latest(ctx) {
    try {
      // fetch the most recent record from DB
      const latest = await strapi.db.query("api::apod.apod").findMany({
        orderBy: { date: "desc" },
        limit: 1,
      });

      if (!latest.length) {
        ctx.send({ message: "No APOD cached yet." }, 404);
        return;
      }

      ctx.send(latest[0]);
    } catch (err) {
      ctx.throw(500, err);
    }
  },

  async refresh(ctx) {
    try {
      const record = await strapi.service("api::apod.apod").fetchAndStore();
      ctx.send(record);
    } catch (err) {
      ctx.throw(500, err);
    }
  },
};
