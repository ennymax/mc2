export default class mcPage {
  constructor(tokens) {
    this.tokenArray = Object.values(tokens); // Convert tokens object to array
    this.elements = {
      searchtoken: () =>
        cy.xpath('//input[contains(@placeholder,"Search for tokens")]'),
      token24: () =>
        cy.xpath(
          '//div[@id="content-area"]/div/main/section/div/section/div/div/div[3]/div/div/div/span',
        ),
      tokenlist: () => cy.get('.ais-InfiniteHits'),
      tokenname: () => cy.get('.w-3\\/4 > .text-main'),
      tokenPrice: () =>
        cy.get(
          ':nth-child(1) > :nth-child(3) > .text-main > .gap-2 > span[data-v-0e38f8c2=""]',
        ),
      tokensymbol: () => cy.get('.w-3\\/4 > .text-grey6'),
    };
  }

  /* 
This method navigates to Mc2 Portal
it intercepts all request and wait for all the requests
*/
  visitmc2() {
    cy.intercept('**').as('allRequests');
    cy.visit('/tokens');
    cy.wait('@allRequests');
    return this;
  }

  // Method to click on a token by its name in the table
  clickTokenByName(token) {
    this.elements
      .tokenlist()
      .contains(token.name) // Access token.name
      .click();
  }

  /* 
This method validates the price change between Mobula and mc2 
and calculate the deviation
and checks if deviation is within accepted tolerance
*/
  validatePrice(token) {
    this.elements
      .tokenPrice()
      .invoke('text')
      .then((text) => {
        // Use cy.then to ensure Cypress command chaining
        cy.convertToNumber(text.trim()).then((mc2Price) => {
          cy.convertToNumber(token.price).then((mobulaPrice) => {

            //calculate the price deviation
            cy.calculatePriceDeviation(mc2Price, mobulaPrice).then(
              (deviation) => {
                cy.log('Price Deviation:', deviation);

                // Assert that the deviation is within acceptable limits
                expect(deviation).to.be.lessThan(
                  5,
                  'Deviation exceeds the acceptable threshold',
                );
              },
            );
          });
        });
      });
  }

  /* 
This method validates the token changes in 24H 
and calculates the deviation between the changes using custom commands
and checks if deviation is within accepted tolerance
*/
validateChange24H(token) {
  this.elements
    .token24()
    .invoke('text')
    .then((text) => {
      const mc224hoursChange = text.trim();
      const mobula24hoursChange = token.changes;
      
      // Calculate the deviation
      cy.calculatePriceDeviation(mc224hoursChange.replace('%', ''), mobula24hoursChange.replace('%', ''))
        .then((deviation) => {
          // Log the results for debugging
          cy.log(
            'Price Deviation:', deviation/100,
            'MC2 24-hour Change:', mc224hoursChange,
            'Mobula 24-hour Change:', mobula24hoursChange
          );

          // Assert that the deviation is within acceptable limits
          expect(deviation/100).to.be.lessThan(
            5,
            'Deviation exceeds the acceptable threshold'
          );
        });
    });
}


  // Method to navigate back to the main page
  goBack() {
    cy.go('back');
    return this;
  }

  /* 
This method checks if the token details is publicly available
by checking if the url contains the token symbol
and the token page matches the token name and symbol
*/
  verifyTokenIdentity(token) {
    cy.url().should('include', token.symbol);

    this.elements
      .tokenname()
      .invoke('text') // Extract the token name from mc2 page
      .should('eq', token.name);

    this.elements
      .tokensymbol()
      .invoke('text') // Extract the token symbol from mc2 page
      .should('eq', token.symbol);

    return this;
  }

  // Method to process each token in the array
  processTokens() {
    for (const token of this.tokenArray) {
      this.checkPageIsReady();
      this.clickTokenByName(token); // Click the token with the matched name
      this.verifyTokenIdentity(token);
      this.validatePrice(token);
      this.validateChange24H(token); // Validate change24H
      this.goBack();
      this.checkPageIsReady();
      this.validateSearchField(); // Validate the search input  is vissble on the Home Page
      continue;
    }
  }

  validateSearchField() {
    this.elements.searchtoken().should('be.visible');
    return this;
  }

  checkPageIsReady() {
    cy.document().its('readyState').should('eq', 'complete');
    return this;
  }

  gotoMc2() {
    this.visitmc2();
    return this;
  }
}
