describe("empty spec", () => {
  it("Authenticated user can create a new product", () => {
    cy.login("demo@demo.com", "secret123").then(() => {
      const access_token = Cypress.env("access_token");
      cy.request({
        method: "GET",
        url: "http://localhost:5000/api/v1/clients",
        headers: {
          authorization: "Bearer " + access_token, // consume the token
        },
      }).as("getClients");
      cy.get("@getClients");
    });
  });
});
