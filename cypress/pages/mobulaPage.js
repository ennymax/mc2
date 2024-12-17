export default class mobulaPage {
  constructor() {
    this.elements = {
      searchcontainer: () => cy.get('#search'),
      searchtokenField: () => cy.get('.text-light-font-80'),
      token24: () =>
        cy.xpath(
          '(.//*[normalize-space(text()) and normalize-space(.)="Vesting"])[1]/following::p[7]',
        ),
      tokenName: () =>
        cy.xpath(
          '//p[@class="text-[26px] leading-[26px] font-medium text-light-font-100 dark:text-dark-font-100 mr-[5px] flex lg:hidden"]',
        ),
      tokenPrice: () => cy.get('.cursor-default'),
    };
  }

  /* 
  This method navigates to Mobula Portal
  it intercepts all request and wait for all the requests
  */
  visitMobula() {
    cy.intercept('**').as('allRequests'); // Alias the interception
    cy.visit('https://mobula.io');
    cy.wait('@allRequests'); // Use the alias to wait for the request to complete
    return this;
  }

  /* 
This method navigates to Mobula 
and handle alert
*/
  gotoMobula() {
    this.visitMobula();
    return this;
  }

  // Click search token
  clickSearchField() {
    this.elements.searchtokenField().click();
    return this;
  }

  // Search token by token name
  Searchtoken(token) {
    this.elements
      .searchcontainer()
      .should('be.visible')
      .clear()
      .type(token, { delay: 50 }); // Type the token with a slight delay for stability

    return this;
  }

  /* 
token details are fetech from the fixture file and are searched on mobula
searched results are verified and stored in enviromental variables
*/
  getTokenDetails() {
    const tokenResults = {};

    // Load the tokens fixture and process each token
    cy.fixture('tokens').then((tokens) => {
      for (const token of tokens) {
        this.gotoMobula();
        this.clickSearchField();
        this.Searchtoken(token.name);
        cy.contains(token.name + token.symbol)
          .should('be.visible')
          .click();

        // verify token details
        cy.url().should('include', token.name.toLowerCase());
        this.elements.tokenName().should('be.visible');
        this.elements.tokenPrice().should('be.visible');
        this.elements.token24().should('be.visible');

        // Extract and store token details
        this.extractTokenDetails(token, tokenResults);
      }

      // Store results after processing all tokens
      this.storeTokenResults(tokenResults);
    });

    return this;
  }

  // Extract price and 24h change and store them in the results object
  extractTokenDetails(token, tokenResults) {
    this.elements
      .tokenPrice()
      .invoke('text')
      .then((priceText) => {
        const price = priceText.trim();

        this.elements
          .token24()
          .invoke('text')
          .then((changeText) => {
            const change24 = changeText.trim();

            // Store results using token symbol as the key
            tokenResults[token.symbol] = {
              changes: change24,
              name: token.name,
              price,
              symbol: token.symbol,
            };
          });
      });
  }

  // Store token results in Cypress environment variables
  storeTokenResults(tokenResults) {
    cy.wrap(tokenResults).then((results) => {
      Cypress.env('tokenResults', results);
      cy.log('Stored Token Results:', results);
    });
  }
}
