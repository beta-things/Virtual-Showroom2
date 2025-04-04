/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * https://sailsjs.com/anatomy/config/routes-js
 */

module.exports.routes = {

  //  ╦ ╦╔═╗╔╗ ╔═╗╔═╗╔═╗╔═╗╔═╗
  //  ║║║║╣ ╠╩╗╠═╝╠═╣║ ╦║╣ ╚═╗
  //  ╚╩╝╚═╝╚═╝╩  ╩ ╩╚═╝╚═╝╚═╝
  'GET /admin':                   { action: 'view-homepage-or-redirect' },
  'GET /welcome/:unused?':   { action: 'dashboard/view-welcome' },

  'GET /faq':                { action:   'view-faq' },
  'GET /legal/terms':        { action:   'legal/view-terms' },
  'GET /legal/privacy':      { action:   'legal/view-privacy' },
  'GET /contact':            { action:   'view-contact' },

  'GET /signup':             { action: 'entrance/view-signup' },
  'GET /email/confirm':      { action: 'entrance/confirm-email' },
  'GET /email/confirmed':    { action: 'entrance/view-confirmed-email' },

  'GET /login':              { action: 'entrance/view-login' },
  'GET /password/forgot':    { action: 'entrance/view-forgot-password' },
  'GET /password/new':       { action: 'entrance/view-new-password' },

  'GET /account':            { action: 'account/view-account-overview' },
  'GET /account/password':   { action: 'account/view-edit-password' },
  'GET /account/profile':    { action: 'account/view-edit-profile' },
  'GET /new-customer': { action: 'dashboard/view-new-customer' },
  'GET /showroom/:sessionCode?/:customerID?': { action: 'view-showroom', locals: {
    layout: 'layouts/showroom-layout'
  }},
  'GET /': { action: 'view-enter' },
  'GET /dashboard/edit-template': { action: 'dashboard/view-edit-template' },
  'GET /dashboard/edit-parts': { action: 'dashboard/view-edit-parts' },
  'GET /quote/:sessionCode': { action: 'view-quote' },
  'GET /quote-pdf/:sessionCode/:buildSecret': { action: 'view-quote-pdf' },
  

  //  ╔╦╗╦╔═╗╔═╗  ╦═╗╔═╗╔╦╗╦╦═╗╔═╗╔═╗╔╦╗╔═╗   ┬   ╔╦╗╔═╗╦ ╦╔╗╔╦  ╔═╗╔═╗╔╦╗╔═╗
  //  ║║║║╚═╗║    ╠╦╝║╣  ║║║╠╦╝║╣ ║   ║ ╚═╗  ┌┼─   ║║║ ║║║║║║║║  ║ ║╠═╣ ║║╚═╗
  //  ╩ ╩╩╚═╝╚═╝  ╩╚═╚═╝═╩╝╩╩╚═╚═╝╚═╝ ╩ ╚═╝  └┘   ═╩╝╚═╝╚╩╝╝╚╝╩═╝╚═╝╩ ╩═╩╝╚═╝
  '/terms':                   '/legal/terms',
  '/logout':                  '/api/v1/account/logout',


  //  ╦ ╦╔═╗╔╗ ╦ ╦╔═╗╔═╗╦╔═╔═╗
  //  ║║║║╣ ╠╩╗╠═╣║ ║║ ║╠╩╗╚═╗
  //  ╚╩╝╚═╝╚═╝╩ ╩╚═╝╚═╝╩ ╩╚═╝
  // …


  //  ╔═╗╔═╗╦  ╔═╗╔╗╔╔╦╗╔═╗╔═╗╦╔╗╔╔╦╗╔═╗
  //  ╠═╣╠═╝║  ║╣ ║║║ ║║╠═╝║ ║║║║║ ║ ╚═╗
  //  ╩ ╩╩  ╩  ╚═╝╝╚╝═╩╝╩  ╚═╝╩╝╚╝ ╩ ╚═╝
  // Note that, in this app, these API endpoints may be accessed using the `Cloud.*()` methods
  // from the Parasails library, or by using those method names as the `action` in <ajax-form>.
  '/api/v1/account/logout':                           { action: 'account/logout' },
  'PUT   /api/v1/account/update-password':            { action: 'account/update-password' },
  'PUT   /api/v1/account/update-profile':             { action: 'account/update-profile' },
  'PUT   /api/v1/account/update-billing-card':        { action: 'account/update-billing-card' },
  'PUT   /api/v1/entrance/login':                        { action: 'entrance/login' },
  'POST  /api/v1/entrance/signup':                       { action: 'entrance/signup' },
  'POST  /api/v1/entrance/send-password-recovery-email': { action: 'entrance/send-password-recovery-email' },
  'POST  /api/v1/entrance/update-password-and-login':    { action: 'entrance/update-password-and-login' },
  'POST  /api/v1/deliver-contact-form-message':          { action: 'deliver-contact-form-message' },
  'POST  /api/v1/observe-my-session':                 { action: 'observe-my-session', hasSocketFeatures: true },
  
  'DELETE /api/v1/destroy-one-user': { action: 'destroy-one-user' },
  'PUT /api/v1/update-one-salesperson': { action: 'update-one-salesperson' },
  
  'DELETE /api/v1/delete-one-customer': { action: 'delete-one-customer' },
  'PATCH /api/v1/update-one-customer': { action: 'update-one-customer' },
  'POST /api/v1/create-new-build': { action: 'create-new-build' },
  'DELETE /api/v1/delete-one-build': { action: 'delete-one-build' },
  'POST /api/v1/dashboard/new-customer': { action: 'dashboard/new-customer' },
  'POST /api/v1/customer-login': { action: 'customer-login' },
  'POST /api/v1/add-new-template': { action: 'add-new-template' },
  'POST /api/v1/set-active-template': { action: 'set-active-template' },
  'POST /api/v1/add-part-to-slot': { action: 'add-part-to-slot' },
  'DELETE /api/v1/delete-one-part': { action: 'delete-one-part' },
  'GET /api/v1/build-notes': { action: 'build-notes' },
  'GET /api/v1/meeting-participants': { action: 'meeting-participants' },
  'GET /api/v1/build-parts-update': { action: 'build-parts-update' },
  'POST /api/v1/upload-screenshot': { action: 'upload-screenshot' },
  'PATCH /api/v1/update-quote-price': { action: 'update-quote-price' },
  'POST /api/v1/add-update-quote-item': { action: 'add-update-quote-item' },
  'POST /api/v1/generate-pdf': { action: 'generate-pdf' },
  
};
