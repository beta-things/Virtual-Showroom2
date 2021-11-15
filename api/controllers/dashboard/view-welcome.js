module.exports = {
  

  friendlyName: 'View welcome page',


  description: 'Display the dashboard "Welcome" page.',


  exits: {

    success: {
      viewTemplatePath: 'pages/dashboard/welcome',
      description: 'Display the welcome page for authenticated users.'
    },

  },


  fn: async function () {
    sails.log("arrived at welcome backend page");
    
    var allUsers = await User.find({
      isSuperAdmin: false
    });
    
    var currentUsersCustomers = await Customers.find({
      owner: this.req.me.id
    }).populate('builds').sort('companyName ASC');
    //now we will add the build's template name

    for(var i = 0; i< currentUsersCustomers.length; i++){ //go through each customer 
      //if(currentUsersCustomers[i].builds){
        for(var v = 0; v < currentUsersCustomers[i].builds.length; v++){ // go through each customer's builds
          var templateID = currentUsersCustomers[i].builds[v].template;
          var templateOBJ = await Templates.findOne({
            id: templateID,
          });
          currentUsersCustomers[i].builds[v].templateName = templateOBJ.templateName;
        }
      //}
    }
    

    return {
      allUsers: allUsers,
      currentUsersCustomers: currentUsersCustomers, 
    };

  }


};
