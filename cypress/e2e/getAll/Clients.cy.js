import { BACKEND } from "../../support/commands";
let access_token = "";
let headers = null;
// login to backend
before(function () {
  cy.login("demo@demo.com", "secret123").then(function (response) {
    expect(response.body).to.have.property("session");
    expect(response.body.session).to.have.property("access_token");
  });
  cy.get("@loginResponse").then((loginResponse) => {
    access_token = loginResponse.body.session.access_token;
    headers = { authorization: `Bearer ${access_token}` };
  });
});

// get the clients list
describe("Clients", () => {
  let client0 = null;
  context("clients context", () => {
    it("get the list of clients", function () {
      cy.request({
        method: "GET",
        url: `${BACKEND}/clients`,
        headers,
      })
        .as("clientsList")
        .then((response) => {
          expect(response.status).to.eq(200);
          client0 = response.body.clients[0];
        });
    });
    it("get one client", function () {
      cy.request({
        method: "GET",
        url: `${BACKEND}/clients/${client0.id}`,
        headers,
      })
        .as("client0")
        .then((response) => {
          expect(response.status).to.eq(200);
        });
    });
  });
});
