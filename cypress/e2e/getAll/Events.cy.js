import { BACKEND } from "../../support/commands";
let access_token = "";

// login to backend
before(() => {
  cy.login("demo@demo.com", "secret123").then((response) => {
    expect(response.body).to.have.property("session");
    expect(response.body.session).to.have.property("access_token");
  });
  cy.get("@loginResponse").then((loginResponse) => {
    access_token = loginResponse.body.session.access_token;
  });
});

// get the events list
describe("Events list", () => {
  it("get the list of events", function () {
    cy.request({
      method: "GET",
      url: `${BACKEND}/events`,
      headers: {
        authorization: `Bearer ${access_token}`,
      },
    })
      .as("getEvents")
      .then((response) => {
        expect(response.status).to.eq(200);
      });
  });
});
