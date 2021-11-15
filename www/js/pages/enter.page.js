parasails.registerPage('enter', {
  //  ╦╔╗╔╦╔╦╗╦╔═╗╦    ╔═╗╔╦╗╔═╗╔╦╗╔═╗
  //  ║║║║║ ║ ║╠═╣║    ╚═╗ ║ ╠═╣ ║ ║╣
  //  ╩╝╚╝╩ ╩ ╩╩ ╩╩═╝  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝
  data: {
    // Form data
    formData: { /* … */ },

    // For tracking client-side validation errors in our form.
    // > Has property set to `true` for each invalid property in `formData`.
    formErrors: { /* … */ },

    // Form rules
    formRules: {
      contactEmail: {required: true, isEmail: true},
      sessionCode: {required: true},
    },

    // Syncing / loading state
    syncing: false,

    // Server error state
    cloudError: '',

    // Success state when form has been submitted
    cloudSuccess: false,
  },

  //  ╦  ╦╔═╗╔═╗╔═╗╦ ╦╔═╗╦  ╔═╗
  //  ║  ║╠╣ ║╣ ║  ╚╦╝║  ║  ║╣
  //  ╩═╝╩╚  ╚═╝╚═╝ ╩ ╚═╝╩═╝╚═╝
  beforeMount: function() {
    //…
  },
  mounted: async function() {
    //…
    
  },

  //  ╦╔╗╔╔╦╗╔═╗╦═╗╔═╗╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
  //  ║║║║ ║ ║╣ ╠╦╝╠═╣║   ║ ║║ ║║║║╚═╗
  //  ╩╝╚╝ ╩ ╚═╝╩╚═╩ ╩╚═╝ ╩ ╩╚═╝╝╚╝╚═╝
  methods: {
    logMeIn: async function() {
      if(this.formData.contactEmail && this.formData.sessionCode){
        this.syncing = true;
        console.log(this.formData.contactEmail+" "+this.formData.sessionCode);
        
        var loginreturn = await Cloud.customerLogin.with({contactEmail: this.formData.contactEmail, sessionCode:this.formData.sessionCode});
        
        if(loginreturn.error == "none"){
          window.location = '/showroom/'+loginreturn.sessionCode+'/'+loginreturn.customerID;
        }else{
          console.log(loginreturn.error);
          this.cloudError = loginreturn.error;
          this.syncing = false;
        }
      }
      
      if(!this.formData.contactEmail){
        console.log("no email provided");
        //this.cloudError = "some kionda error";
        this.formErrors.contactEmail =true;
        //$('#session-code').addClass("is-invalid");
      }else{
        //$('#session-code').removeClass("is-invalid");
        this.formErrors.contactEmail =false;
      }

      if(!this.formData.sessionCode){
        console.log("no seesion code provided");
        //$('#contact-email').addClass("is-invalid");
        this.formErrors.sessionCode = true;
      }else{
        //$('#contact-email').removeClass("is-invalid");
        this.formErrors.sessionCode = false;
      }
      this.$forceUpdate();
    }
  },

});
