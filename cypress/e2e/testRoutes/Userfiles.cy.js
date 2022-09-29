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
describe("Userfiles list", function () {
  let createdClient = null;
  let createdEvent = null;
  let createdUserfile = null;
  let countEvents = null;
  let countClients = null;
  let countUserfiles = null;
  context("Context /userfiles", function () {
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
    it("get the list of events", function () {
      cy.request({
        method: "GET",
        url: `/events`,
        headers,
      })
        .as("getEvents")
        .then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.have.property("count");
          countEvents = response.body.count;
        });
    });

    it("get the list of userfiles", function () {
      cy.request({
        method: "GET",
        url: `/userfiles`,
        headers,
      })
        .as("getUserfiles")
        .then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.have.property("count");
          countUserfiles = response.body.count;
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

    it("Create a new event for the new client", function () {
      const ev_name = faker.company.name();
      const ev_description = faker.lorem.lines(5);
      const ev_date = faker.date.soon();
      cy.request({
        method: "POST",
        url: `/events`,
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

    it("Create a new userfile for the new client", function () {
      const file_description = faker.lorem.lines(5);
      let formData = new FormData();
      formData.append("client_id", createdClient.id);
      formData.append("file_description", file_description);
      cy.readFile("cypress/fixtures/pdfs/test1.pdf", "binary").then((binary) => {
        const blob = Cypress.Blob.binaryStringToBlob([binary], "application/pdf");
        formData.append("file", blob, "test1.pdf");
      });
      cy.request({
        method: "POST",
        url: `/userfiles`,
        body: formData,
        headers: { ...headers, "Content-Type": `multipart/form-data; boundary=${formData._boundary}` },
      }).then((response) => {
        const responseObj = JSON.parse(String.fromCharCode.apply(null, new Uint8Array(response.body)));
        expect(responseObj).to.have.property("file");
        createdUserfile = responseObj.file[0];
        expect(response.status).to.eq(200);
      });
    });
    it("get the list of userfiles", function () {
      cy.request({
        method: "GET",
        url: `/userfiles`,
        headers,
      })
        .as("getUserfiles")
        .then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.have.property("count");
          expect(response.body.count).to.equal(countUserfiles + 1);
        });
    });
    it("Edit the new created file - only attrs", function () {
      const id = createdUserfile.id;
      const client_id = createdUserfile.client_id;
      const file_description = faker.lorem.lines(3);
      const displayed = !createdUserfile.displayed;
      cy.request({
        method: "PATCH",
        url: `/userfiles/${createdUserfile.id}`,
        headers,
        body: {
          id,
          client_id,
          file_description,
          displayed,
        },
      })
        .as("editedUserfile")
        .then((response) => {
          expect(response.status).to.eq(200);
        });
    });
    it("Edit the new created file with new file", function () {
      const file_description = faker.lorem.lines(3);
      const displayed = !createdUserfile.displayed;
      let formData = new FormData();
      formData.append("id", createdUserfile.id);
      formData.append("client_id", createdUserfile.client_id);
      formData.append("file_description", file_description);
      formData.append("displayed", displayed);
      cy.readFile("cypress/fixtures/pdfs/test2.pdf", "binary").then((binary) => {
        const blob = Cypress.Blob.binaryStringToBlob([binary], "application/pdf");
        formData.append("file", blob, "test2.pdf");
      });
      cy.request({
        method: "PATCH",
        url: `/userfiles/${createdUserfile.id}`,
        body: formData,
        headers: { ...headers, "Content-Type": `multipart/form-data; boundary=${formData._boundary}` },
      }).then((response) => {
        const responseObj = JSON.parse(String.fromCharCode.apply(null, new Uint8Array(response.body)));
        expect(responseObj).to.have.property("file");
        createdUserfile = responseObj.file[0];
        expect(response.status).to.eq(200);
      });
    });

    it("Get the modified file", function () {
      cy.request({
        method: "GET",
        url: `/userfiles/${createdUserfile.id}`,
        headers,
      })
        .as("modifiedUserfile")
        .then((response) => {
          expect(response.status).to.eq(200);
        });
    });
    it("get the new list of userfiles", function () {
      cy.request({
        method: "GET",
        url: `/userfiles`,
        headers,
      })
        .as("UserfilesNewList")
        .then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.have.property("count");
          expect(response.body.count).to.equal(countUserfiles + 1);
        });
    });
    it("Delete the new userfile", function () {
      cy.request({
        method: "DELETE",
        url: `/userfiles/${createdUserfile.id}`,
        headers,
      })
        .as("deletedUserfile")
        .then((response) => {
          expect(response.status).to.eq(200);
        });
    });
    it("Verify the new userfile was deleted", function () {
      cy.request({ method: "GET", url: `/userfiles/${createdUserfile.id}`, headers, failOnStatusCode: false }).then((response) => {
        expect(response.status).to.eq(404);
      });
    });

    it("get the new list of userfiles after delete", function () {
      cy.request({
        method: "GET",
        url: `/userfiles`,
        headers,
      })
        .as("userfilesListAfterDelete")
        .then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.have.property("count");
          expect(response.body.count).to.equal(countUserfiles);
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
