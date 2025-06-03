import Cypress from 'cypress';

const BASE_URL = 'https://norma.nomoreparties.space/api';
const MAIN_BUN = `[data-cy=${'643d69a5c3f7b9001cfa093c'}]`;
const RESERVE_BUN = `[data-cy=${'643d69a5c3f7b9001cfa093d'}]`;
const MAIN_TOPPING = `[data-cy=${'643d69a5c3f7b9001cfa0949'}]`;

beforeEach(() => {
  cy.intercept('GET', `${BASE_URL}/ingredients`, {
    fixture: 'ingredients.json'
  });
  cy.intercept('POST', `${BASE_URL}/auth/login`, {
    fixture: 'user.json'
  });
  cy.intercept('GET', `${BASE_URL}/auth/user`, {
    fixture: 'user.json'
  });
  cy.intercept('POST', `${BASE_URL}/orders`, {
    fixture: 'orderResponse.json'
  });
  cy.visit('/');
  cy.viewport(1440, 800);
  cy.get('#modals').as('modal');
});

describe('Space Kitchen: Ingredient Management', () => {
  it('counting space components', () => {
    cy.get(MAIN_TOPPING).children('button').click();
    cy.get(MAIN_TOPPING).find('.counter__num').contains('1');
  });

  describe('space burger assembly', () => {
    it('adding space bun and exotic topping', () => {
      cy.get(MAIN_BUN).children('button').click();
      cy.get(MAIN_TOPPING).children('button').click();
    });

    it('adding bun after placing topping', () => {
      cy.get(MAIN_TOPPING).children('button').click();
      cy.get(MAIN_BUN).children('button').click();
    });
  });

  describe('space burger modification', () => {
    it('replacing crater bun with fluorescent bun', () => {
      cy.get(MAIN_BUN).children('button').click();
      cy.get(RESERVE_BUN).children('button').click();
    });

    it('updating bun in a complete burger', () => {
      cy.get(MAIN_BUN).children('button').click();
      cy.get(MAIN_TOPPING).children('button').click();
      cy.get(RESERVE_BUN).children('button').click();
    });
  });
});

describe('space order processing', () => {
  beforeEach(() => {
    window.localStorage.setItem('refreshToken', 'quantum_token');
    cy.setCookie('accessToken', 'nebula_pass');
    cy.getAllLocalStorage().should('be.not.empty');
    cy.getCookie('accessToken').should('be.not.empty');
  });

  afterEach(() => {
    window.localStorage.clear();
    cy.clearAllCookies();
    cy.getAllLocalStorage().should('be.empty');
    cy.getAllCookies().should('be.empty');
  });

  it('creating and verifying space order', () => {
    cy.get(MAIN_BUN).children('button').click();
    cy.get(MAIN_TOPPING).children('button').click();
    cy.get(`[data-cy='order-button']`).click();
    cy.get('@modal').find('h2').contains('38483');
  });
});

describe('space menu interactive elements', () => {
  it('viewing detailed information about space ingredient', () => {
    cy.get('@modal').should('be.empty');
    cy.get(MAIN_TOPPING).children('a').click();
    cy.get('@modal').should('be.not.empty');
    cy.url().should('include', '643d69a5c3f7b9001cfa0949');
  });

  it('closing information with navigation button', () => {
    cy.get('@modal').should('be.empty');
    cy.get(MAIN_TOPPING).children('a').click();
    cy.get('@modal').should('be.not.empty');
    cy.get('@modal').find('button').click();
    cy.get('@modal').should('be.empty');
  });

  it('closing information through overlay area', () => {
    cy.get('@modal').should('be.empty');
    cy.get(MAIN_TOPPING).children('a').click();
    cy.get('@modal').should('be.not.empty');
    cy.get(`[data-cy='overlay']`).click({ force: true });
    cy.get('@modal').should('be.empty');
  });

  it('closing information with hotkey', () => {
    cy.get('@modal').should('be.empty');
    cy.get(MAIN_TOPPING).children('a').click();
    cy.get('@modal').should('be.not.empty');
    cy.get('body').trigger('keydown', { key: 'Escape' });
    cy.get('@modal').should('be.empty');
  });
});
