export default {
  routes: [
    {
      method: "GET",
      path: "/apod",
      handler: "apod.latest",
      config: {
        auth: false, // make public
      },
    },
    {
      method: "POST",
      path: "/apod/refresh",
      handler: "apod.refresh",
      config: {
        auth: false, // you might lock this down later
      },
    },
  ],
};
