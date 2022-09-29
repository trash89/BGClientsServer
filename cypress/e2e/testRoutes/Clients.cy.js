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

// test the /clients API route
describe("/clients", function () {
  let createdClient = null;
  let countClients = null;
  context("Context /clients", () => {
    it("get the list of clients", function () {
      cy.request({
        method: "GET",
        url: `/clients`,
        headers,
      })
        .as("clientsListInitial")
        .then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.have.property("count");
          countClients = response.body.count;
        });
    });

    it("Create a new client", function () {
      const name = faker.company.name();
      const description = faker.lorem.lines(1);
      const password = faker.internet.password();
      const email = faker.internet.email();
      const address = faker.address.streetAddress({ useFullAddress: true });
      cy.request({
        method: "POST",
        url: `/clients`,
        headers,
        body: {
          email,
          name,
          description,
          password,
          address,
        },
      })
        .as("newClient")
        .then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.have.property("client");
          createdClient = response.body.client[0];
        });
    });

    it("Edit the new created client", function () {
      const id = createdClient.id;
      const name = faker.company.name();
      const description = faker.lorem.lines(1);
      const email = faker.internet.email();
      const address = faker.address.streetAddress({ useFullAddress: true });
      const user_id = createdClient.user_id;
      const localuser_id = createdClient.localuser_id;
      cy.request({
        method: "PATCH",
        url: `/clients/${createdClient.id}`,
        headers,
        body: {
          id,
          name,
          description,
          email,
          address,
          user_id,
          localuser_id,
        },
      })
        .as("editedClient")
        .then((response) => {
          expect(response.status).to.eq(200);
        });
    });

    it("Get the modified client", function () {
      cy.request({
        method: "GET",
        url: `/clients/${createdClient.id}`,
        headers,
      })
        .as("modifiedClient")
        .then((response) => {
          expect(response.status).to.eq(200);
        });
    });
    it("get the new list of clients", function () {
      cy.request({
        method: "GET",
        url: `/clients`,
        headers,
      })
        .as("clientsNewList")
        .then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.have.property("count");
          expect(response.body.count).to.equal(countClients + 1);
        });
    });
    it("Delete the new client", function () {
      cy.request({
        method: "DELETE",
        url: `/clients/${createdClient.id}`,
        headers,
      })
        .as("deletedClient")
        .then((response) => {
          expect(response.status).to.eq(200);
        });
    });
    it("Verify the new client was deleted", function () {
      cy.request({ method: "GET", url: `/clients/${createdClient.id}`, headers, failOnStatusCode: false }).then((response) => {
        expect(response.status).to.eq(404);
      });
    });

    it("get the new list of clients after delete", function () {
      cy.request({
        method: "GET",
        url: `/clients`,
        headers,
      })
        .as("clientsListAfterDelete")
        .then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.have.property("count");
          expect(response.body.count).to.equal(countClients);
        });
    });
  });
});
