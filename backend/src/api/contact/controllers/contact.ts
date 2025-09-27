import { sanitize } from "@strapi/utils";

export default {
  async submit(ctx) {
    try {
      const { name, email, message } = ctx.request.body;

      if (!name || !email || !message) {
        return ctx.badRequest("Name, email, and message are required");
      }

      // Save to DB
      const entry = await strapi.entityService.create("api::contact.contact", {
        data: { name, email, message },
      });

      // Sanitize output before sending to client
      const sanitized = await strapi.contentAPI.sanitize.output(entry, strapi.getModel("api::contact.contact"));

      return ctx.send({ success: true, data: sanitized });
    } catch (err) {
      ctx.throw(500, err);
    }
  },
};
