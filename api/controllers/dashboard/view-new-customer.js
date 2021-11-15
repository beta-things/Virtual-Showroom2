module.exports = {


  friendlyName: 'View new customer',


  description: 'Display "New customer" page.',


  exits: {

    success: {
      viewTemplatePath: 'pages/dashboard/new-customer'
    }

  },


  fn: async function () {

    // Respond with view.
    return {};

  }


};
