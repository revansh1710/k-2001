module.exports = [
  'strapi::errors',
  'strapi::security',
  'strapi::cors',                // <— make sure cors middleware is enabled
  'strapi::poweredBy',
  'strapi::logger',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
