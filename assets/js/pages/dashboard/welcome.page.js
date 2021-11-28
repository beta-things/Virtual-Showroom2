parasails.registerPage('welcome', {
  //  ╦╔╗╔╦╔╦╗╦╔═╗╦    ╔═╗╔╦╗╔═╗╔╦╗╔═╗
  //  ║║║║║ ║ ║╠═╣║    ╚═╗ ║ ╠═╣ ║ ║╣
  //  ╩╝╚╝╩ ╩ ╩╩ ╩╩═╝  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝
  data: {
    confirmUserDeleteModelOpen: false,
    pageLoadedAt: Date.now(),
    selectedUserForDelete: undefined,
    syncing: false,
    cloudError: '',
    allUsers: undefined,
    submittingForm : '',
    loadingBuild: false,
    
    currentUsersCustomers: undefined,
    selectedCustomerForDelete: undefined,
    confirmCustomerDeleteModelOpen: false,
    submittingCustomersForm: undefined,

    confirmBuildDeleteModalOpen: false,
    buildToBeDeleted: undefined,
    buildToDeleteName: undefined,
    ownerOfBuildToBeDeleted: undefined,
  },

  //  ╦  ╦╔═╗╔═╗╔═╗╦ ╦╔═╗╦  ╔═╗
  //  ║  ║╠╣ ║╣ ║  ╚╦╝║  ║  ║╣
  //  ╩═╝╩╚  ╚═╝╚═╝ ╩ ╚═╝╩═╝╚═╝
  beforeMount: function() {
    
  },
  mounted: async function() {
    
  },

  //  ╦  ╦╦╦═╗╔╦╗╦ ╦╔═╗╦    ╔═╗╔═╗╔═╗╔═╗╔═╗
  //  ╚╗╔╝║╠╦╝ ║ ║ ║╠═╣║    ╠═╝╠═╣║ ╦║╣ ╚═╗
  //   ╚╝ ╩╩╚═ ╩ ╚═╝╩ ╩╩═╝  ╩  ╩ ╩╚═╝╚═╝╚═╝
  // Configure deep-linking (aka client-side routing)
  virtualPagesRegExp: /^\/welcome\/?([^\/]+)?\/?/,
  afterNavigate: async function(virtualPageSlug){
    // `virtualPageSlug` is determined by the regular expression above, which
    // corresponds with `:unused?` in the server-side route for this page.
    switch (virtualPageSlug) {
      case 'hello':
        this.modal = 'example';
        break;
      default:
        this.modal = '';
    }
  },

  //  ╦╔╗╔╔╦╗╔═╗╦═╗╔═╗╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
  //  ║║║║ ║ ║╣ ╠╦╝╠═╣║   ║ ║║ ║║║║╚═╗
  //  ╩╝╚╝ ╩ ╚═╝╩╚═╩ ╩╚═╝ ╩ ╩╚═╝╝╚╝╚═╝
  methods: {

    //UI
    clickedFolderTab: async function(event){
        callerObj = event.target;
        parentObj = $(callerObj).parent().parent();
        console.log(parentObj);
        $(parentObj).children('.user_element').toggle(500, function(){
          //do thing
        });
        
    },
  

    //SALES PERSON
    attemptDeleteOneCustomer: function(customerID){
      this.selectedCustomerForDelete = _.find(this.currentUsersCustomers, {'id':customerID});
      this.confirmCustomerDeleteModelOpen = true;
    },

    deleteOneCustomer: async function(){
      await Cloud.deleteOneCustomer.with({id: this.selectedCustomerForDelete.id});
      
      _.remove(this.currentUsersCustomers, {id: this.selectedCustomerForDelete.id});
      this.$forceUpdate();
      this.selectedCustomerForDelete = undefined;
      this.confirmCustomerDeleteModelOpen = false; 
    },

    closeDeleteCustomerModal: async function(){
      this.selectedCustomerForDelete = undefined;
      this.confirmCustomerDeleteModelOpen = false; //open modal
    },
    
    setUpdatingCustomersForm: async function(index){
      this.submittingCustomersForm = index;
      console.log("the active customers form element is "+index);
    },
   
    handleParsingUpdateCustomerForm: function(){
      console.log("parsing Customer update info..");
      
      //console.log(this.currentUsersCustomers[this.submittingCustomersForm]);
      return this.currentUsersCustomers[this.submittingCustomersForm];// argins;
    },
    submittedUpdateCustomerFrom(customerID){
      $('#change_feedback_'+String(customerID)).show(300);
      setTimeout(() => {
        $('#change_feedback_'+String(customerID)).hide(1000);
      }, 1500);
    },
    createNewBuildForCustomer: async function(ID){
      var typedBuildName = $('#typed-build-name-'+ID).val();
      if(typedBuildName != ""){
        String(typedBuildName);
        var createdBuild = await Cloud.createNewBuild.with({customerID: ID, buildName: typedBuildName });
        $('#typed-build-name-'+ID).val("");
        var customerArrayIndex = _.findIndex(this.currentUsersCustomers, {'id': ID});
        this.currentUsersCustomers[customerArrayIndex].builds.push(createdBuild);
        this.$forceUpdate();
      }else{
        //error
      }
    },
    attemptDeleteOneBuild: async function(buildID, customerID, buildName){
      this.buildToDeleteName = buildName;
      this.buildToBeDeleted=buildID;
      this.ownerOfBuildToBeDeleted=customerID;     
      this.confirmBuildDeleteModalOpen = true;

    },

    deleteOneBuildForCustomer: async function(){
      buildID = this.buildToBeDeleted;
      customerID = this.ownerOfBuildToBeDeleted;
      await Cloud.deleteOneBuild.with({id:buildID, customerID:customerID});
      var customerArrayIndex = _.findIndex(this.currentUsersCustomers, {'id': customerID});
      _.remove(this.currentUsersCustomers[customerArrayIndex].builds, {id: buildID});
      this.$forceUpdate();
      this.ownerOfBuildToBeDeleted =undefined;
      this.buildToBeDeleted= undefined;
      this.confirmBuildDeleteModalOpen=false;
      
    },

    closeDeleteBuildModal: async function(){
      this.ownerOfBuildToBeDeleted =undefined;
      this.buildToBeDeleted= undefined;
      this.confirmBuildDeleteModalOpen=false;
    },

    // SUPER ADMIN
    closeDeleteUserModal: async function() {
      
      this.selectedUserForDelete = undefined;
      this.confirmUserDeleteModelOpen = false;
    },

    attemptDeleteOneUser: async function(userID){
      this.selectedUserForDelete =  _.find(this.allUsers, { 'id': userID});
      
      this.confirmUserDeleteModelOpen = true; //open modal
    },

    deleteOneUser: async function(){
      console.log("deleting person "+ this.selectedUserForDelete.id);
      
      await Cloud.destroyOneUser.with({id: this.selectedUserForDelete.id});
      _.remove(this.allUsers, {id: this.selectedUserForDelete.id});
      this.$forceUpdate();
      this.selectedUserForDelete = undefined;
      this.confirmUserDeleteModelOpen = false; //close modal
    },

    setUpdatingForm: function(index){
      this.submittingForm = index;
      console.log("the active form element is "+index);
    },

    handleParsingUpdateUserForm: function(){
      console.log("parsing user update info..");
      
      console.log(this.allUsers[this.submittingForm].fullName);
      return this.allUsers[this.submittingForm];// argins;

    },

    submittedUpdateUserFrom: function(){
      console.log("sent info");
    },

    redirectToBuild: function(sessionCode){
      this.loadingBuild = true;
      window.location.replace("/showroom/"+sessionCode);
    }

  }
});
