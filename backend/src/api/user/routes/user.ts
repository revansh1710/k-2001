
module.exports = {
  routes: [
    {
      method: "POST",
      path: "/user/register",
      handler: "user.register",
      config: {
        auth: false,
        policies: [],
      },
    },
    {
      method: "POST",
      path: "/user/login",
      handler: "user.login",
      config: {
        auth: false,
        policies: [],
      },
    },
    {
      method: 'GET',
      path: '/custom-users',
      handler: 'user.findAll',
      config: {
        auth: false,
        policies: [],
      },
    },
    {
      method: 'POST',
      path: '/custom-logout',
      handler: 'user.logout',
      config: {
        auth: false,
        policies: [],
      }
    },

  ],
};
