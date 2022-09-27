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

// get the userfiles list
describe("Userfiles list", () => {
  it("get the list of userfiles", function () {
    cy.request({
      method: "GET",
      url: `${BACKEND}/userfiles`,
      headers: {
        authorization: `Bearer ${access_token}`,
      },
    })
      .as("getUserfiles")
      .then((response) => {
        expect(response.status).to.eq(200);
      });
  });
});
