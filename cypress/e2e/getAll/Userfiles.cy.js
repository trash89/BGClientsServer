import { BACKEND } from "../../support/commands";
import { faker } from "@faker-js/faker";
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

// test the /userfiles API route
describe("Userfiles list", () => {
  it("get the list of userfiles", function () {
    cy.request({
      method: "GET",
      url: `${BACKEND}/userfiles`,
      headers,
    })
      .as("getUserfiles")
      .then((response) => {
        expect(response.status).to.eq(200);
      });
  });
});
