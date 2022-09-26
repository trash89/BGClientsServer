// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
const BACKEND = "http://localhost:5000";
Cypress.Commands.add("login", (email, password) => {
  // make login call to endpoint
  cy.visit(`${BACKEND}/api/v1`);
  cy.request("POST", `${BACKEND}/api/v1/auth/login`, {
    email: email,
    password: password,
  }).then((response) => {
    Cypress.env("access_token", response.body.session.access_token);
  });
});
