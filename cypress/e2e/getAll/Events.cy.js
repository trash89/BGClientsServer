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

// test the /events API route
describe("/events", () => {
  let createdClient = null;
  let createdEvent = null;
  let countEvents = null;
  let countClients = null;
  context("Context /events", () => {
    it("get the list of clients", function () {
      cy.request({
        method: "GET",
        url: `${BACKEND}/clients`,
        headers,
      })
        .as("clientsListInitial")
        .then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.have.property("count");
          countClients = response.body.count;
        });
    });
    it("get the list of events", function () {
      cy.request({
        method: "GET",
        url: `${BACKEND}/events`,
        headers,
      })
        .as("getEvents")
        .then((response) => {
          expect(response.status).to.eq(200);
          expect(response.status).to.eq(200);
          expect(response.body).to.have.property("count");
          countEvents = response.body.count;
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
        url: `${BACKEND}/clients`,
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

    it("Create a new event for the new client", function () {
      const ev_name = faker.company.name();
      const ev_description = faker.lorem.lines(1);
      const ev_date = faker.date.soon();
      cy.request({
        method: "POST",
        url: `${BACKEND}/events`,
        headers,
        body: {
          client_id: createdClient.id,
          ev_name,
          ev_description,
          ev_date,
        },
      })
        .as("newEvent")
        .then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.have.property("event");
          createdEvent = response.body.event[0];
        });
    });

    it("Edit the new created event", function () {
      const id = createdEvent.id;
      const client_id = createdEvent.client_id;
      const ev_name = faker.word.verb();
      const ev_description = faker.lorem.lines(1);
      const ev_date = faker.date.soon();
      const user_id = createdEvent.user_id;
      const displayed = !createdEvent.displayed;
      cy.request({
        method: "PATCH",
        url: `${BACKEND}/events/${createdEvent.id}`,
        headers,
        body: {
          id,
          client_id,
          ev_name,
          ev_description,
          ev_date,
          displayed,
          user_id,
        },
      })
        .as("editedEvent")
        .then((response) => {
          expect(response.status).to.eq(200);
        });
    });

    it("Get the modified event", function () {
      cy.request({
        method: "GET",
        url: `${BACKEND}/events/${createdEvent.id}`,
        headers,
      })
        .as("modifiedEvent")
        .then((response) => {
          expect(response.status).to.eq(200);
        });
    });
    it("get the new list of events", function () {
      cy.request({
        method: "GET",
        url: `${BACKEND}/events`,
        headers,
      })
        .as("EventsNewList")
        .then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.have.property("count");
          expect(response.body.count).to.equal(countEvents + 1);
        });
    });

    it("Delete the new event", function () {
      cy.request({
        method: "DELETE",
        url: `${BACKEND}/events/${createdEvent.id}`,
        headers,
      })
        .as("deletedEvent")
        .then((response) => {
          expect(response.status).to.eq(200);
        });
    });
    it("Verify the new event was deleted", () => {
      cy.request({ method: "GET", url: `${BACKEND}/events/${createdEvent.id}`, headers, failOnStatusCode: false }).then((response) => {
        expect(response.status).to.eq(404);
      });
    });

    it("get the new list of events after delete", function () {
      cy.request({
        method: "GET",
        url: `${BACKEND}/events`,
        headers,
      })
        .as("eventsListAfterDelete")
        .then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.have.property("count");
          expect(response.body.count).to.equal(countEvents);
        });
    });
    it("Delete the new client", function () {
      cy.request({
        method: "DELETE",
        url: `${BACKEND}/clients/${createdClient.id}`,
        headers,
      })
        .as("deletedClient")
        .then((response) => {
          expect(response.status).to.eq(200);
        });
    });
    it("Verify the new client was deleted", () => {
      cy.request({ method: "GET", url: `${BACKEND}/clients/${createdClient.id}`, headers, failOnStatusCode: false }).then((response) => {
        expect(response.status).to.eq(404);
      });
    });

    it("get the new list of clients after delete", function () {
      cy.request({
        method: "GET",
        url: `${BACKEND}/clients`,
        headers,
      })
        .as("clientsListAfterDelete")
        .then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.have.property("count");
          expect(response.body.count).to.equal(countClients);
        });
    });

    it("Create a new client to delete with his event", function () {
      const name = faker.company.name();
      const description = faker.lorem.lines(1);
      const password = faker.internet.password();
      const email = faker.internet.email();
      const address = faker.address.streetAddress({ useFullAddress: true });
      cy.request({
        method: "POST",
        url: `${BACKEND}/clients`,
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

    it("Create a new event for the new client", function () {
      const ev_name = faker.company.name();
      const ev_description = faker.lorem.lines(1);
      const ev_date = faker.date.soon();
      cy.request({
        method: "POST",
        url: `${BACKEND}/events`,
        headers,
        body: {
          client_id: createdClient.id,
          ev_name,
          ev_description,
          ev_date,
        },
      })
        .as("newEvent")
        .then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.have.property("event");
          createdEvent = response.body.event[0];
        });
    });
    it("Delete the new client with his event", function () {
      cy.request({
        method: "DELETE",
        url: `${BACKEND}/clients/${createdClient.id}`,
        headers,
      })
        .as("deletedClient")
        .then((response) => {
          expect(response.status).to.eq(200);
        });
    });
    it("Verify the new client was deleted", () => {
      cy.request({ method: "GET", url: `${BACKEND}/clients/${createdClient.id}`, headers, failOnStatusCode: false }).then((response) => {
        expect(response.status).to.eq(404);
      });
    });

    it("get the new list of clients after delete with event", function () {
      cy.request({
        method: "GET",
        url: `${BACKEND}/clients`,
        headers,
      })
        .as("clientsListAfterDelete")
        .then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.have.property("count");
          expect(response.body.count).to.equal(countClients);
        });
    });
    it("get the new list of events after delete client with event", function () {
      cy.request({
        method: "GET",
        url: `${BACKEND}/events`,
        headers,
      })
        .as("eventsListAfterDelete")
        .then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.have.property("count");
          expect(response.body.count).to.equal(countEvents);
        });
    });
  });
});
