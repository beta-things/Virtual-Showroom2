module.exports = {


  friendlyName: 'View signup',


  description: 'Display "Signup" page.',


  exits: {

    success: {
      viewTemplatePath: 'pages/entrance/signup',
    },

    redirect: {
      description: 'The requesting user is already logged in.',
      responseType: 'redirect'
    }

  },


  fn: async function () {

    // if (this.req.me) {
    //   throw {redirect: '/'};
    // } //this was from when users would themselves up. now only super admin can do that.

    return {};

  }


};
