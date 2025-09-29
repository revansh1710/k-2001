// src/api/apod/routes/custom-apod.ts
export default {
  routes: [
    {
      method: 'GET',
      path: '/apod/live',
      handler: 'apod.live',
      config: { auth: false }, // set to true if you want auth
    },
    {
      method: 'GET',
      path: '/apod/refresh',
      handler: 'apod.refresh',
      config: { auth: false }, // set to true if you want auth
    },
  ],
};
