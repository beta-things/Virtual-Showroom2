module.exports = {


  friendlyName: 'View enter',


  description: 'Display "Enter" page.',


  exits: {

    success: {
      viewTemplatePath: 'pages/enter'
    }

  },


  fn: async function () {

    // Respond with view.
    return {};

  }


};
