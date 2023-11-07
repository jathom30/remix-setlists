import { faker } from "@faker-js/faker";

describe("smoke tests", () => {
  afterEach(() => {
    cy.cleanupUser();
  });

  it("should allow you to register", () => {
    const loginForm = {
      name: faker.name.firstName("male"),
      email: `${faker.internet.userName()}@example.com`,
      password: "passW04d!",
    };

    cy.then(() => ({ email: loginForm.email })).as("user");

    cy.visitAndCheck("/");

    cy.findByRole("link", { name: /sign up/i }).click();

    cy.findByRole("textbox", { name: /name/i }).type(loginForm.name);
    cy.findByRole("textbox", { name: /email/i }).type(loginForm.email);
    cy.findByLabelText(/password/i).type(loginForm.password);
    cy.findByRole("button", { name: /create account/i }).click();

    cy.findByText(/verification sent/i);
  });

  it.only("should allow you to create a band", () => {
    cy.login();
    cy.visitAndCheck("/home");
    cy.findByRole("link", { name: /create new band/i }).click();

    cy.findByText("Create a new band");
    // cy.findByRole('textbox', { name: "name" }).type('My test band')
    // cy.findByRole('button', { name: /create/i }).click()
  });
});
