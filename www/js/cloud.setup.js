/**
 * cloud.setup.js
 *
 * Configuration for this Sails app's generated browser SDK ("Cloud").
 *
 * Above all, the purpose of this file is to provide endpoint definitions,
 * each of which corresponds with one particular route+action on the server.
 *
 * > This file was automatically generated.
 * > (To regenerate, run `sails run rebuild-cloud-sdk`)
 */

Cloud.setup({

  /* eslint-disable */
  methods: {"confirmEmail":{"verb":"GET","url":"/email/confirm","args":["token"]},"logout":{"verb":"GET","url":"/api/v1/account/logout","args":[]},"updatePassword":{"verb":"PUT","url":"/api/v1/account/update-password","args":["password"]},"updateProfile":{"verb":"PUT","url":"/api/v1/account/update-profile","args":["fullName","emailAddress"]},"updateBillingCard":{"verb":"PUT","url":"/api/v1/account/update-billing-card","args":["stripeToken","billingCardLast4","billingCardBrand","billingCardExpMonth","billingCardExpYear"]},"login":{"verb":"PUT","url":"/api/v1/entrance/login","args":["emailAddress","password","rememberMe"]},"signup":{"verb":"POST","url":"/api/v1/entrance/signup","args":["emailAddress","password","fullName"]},"sendPasswordRecoveryEmail":{"verb":"POST","url":"/api/v1/entrance/send-password-recovery-email","args":["emailAddress"]},"updatePasswordAndLogin":{"verb":"POST","url":"/api/v1/entrance/update-password-and-login","args":["password","token"]},"deliverContactFormMessage":{"verb":"POST","url":"/api/v1/deliver-contact-form-message","args":["emailAddress","topic","fullName","message"]},"observeMySession":{"verb":"POST","url":"/api/v1/observe-my-session","args":[],"protocol":"io.socket"},"destroyOneUser":{"verb":"DELETE","url":"/api/v1/destroy-one-user","args":["id"]},"updateOneSalesperson":{"verb":"PUT","url":"/api/v1/update-one-salesperson","args":["id","fullName","emailAddress"]},"deleteOneCustomer":{"verb":"DELETE","url":"/api/v1/delete-one-customer","args":["id"]},"updateOneCustomer":{"verb":"PATCH","url":"/api/v1/update-one-customer","args":["id","companyName","contactName","contactEmail"]},"createNewBuild":{"verb":"POST","url":"/api/v1/create-new-build","args":["customerID","buildName"]},"deleteOneBuild":{"verb":"DELETE","url":"/api/v1/delete-one-build","args":["id","customerID"]},"newCustomer":{"verb":"POST","url":"/api/v1/dashboard/new-customer","args":["contactEmail","contactName","companyName"]},"customerLogin":{"verb":"POST","url":"/api/v1/customer-login","args":["contactEmail","sessionCode"]},"addNewTemplate":{"verb":"POST","url":"/api/v1/add-new-template","args":["templateName","meshFileName","slots"]},"setActiveTemplate":{"verb":"POST","url":"/api/v1/set-active-template","args":["newActiveTemplateID"]},"addPartToSlot":{"verb":"POST","url":"/api/v1/add-part-to-slot","args":["friendlyName","partCode","partDescription","meshName","optionForSlotID","isAliasPart","aliasRefName","aliasOfPartID","aliasWhenSlotID","hasPartID","downstreamXOffset","downstreamYOffset","downstreamZOffset","hasPreReq","preReqPartID"]},"deleteOnePart":{"verb":"DELETE","url":"/api/v1/delete-one-part","args":["id"]},"buildNotes":{"verb":"GET","url":"/api/v1/build-notes","args":["sessionCode","customerId","buildID","buildNotes"]},"meetingParticipants":{"verb":"GET","url":"/api/v1/meeting-participants","args":["sessionCode","isAdmin","isResponse","makeLogout"]},"buildPartsUpdate":{"verb":"GET","url":"/api/v1/build-parts-update","args":["connect","slotIndex","offstageIndex","slotID","newPartId","sessionCode","buildID","delete"]},"uploadScreenshot":{"verb":"POST","url":"/api/v1/upload-screenshot","args":["buildCode","photo"]}}
  /* eslint-enable */

});
