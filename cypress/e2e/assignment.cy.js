import mcPage from '../pages/mcPage';
import MobulaPage from '../pages/mobulaPage';

// Instantiate MobulaPage globally
const mobulaPage = new MobulaPage();

describe('Test to validate mc2 token information', () => {
  before('Fetch Token Details', () => {
    // Get token details from Mobula and store them in Cypress environment
    mobulaPage.getTokenDetails();
  });

  it('Validates token information and price deviation on MC2', function () {
    // Retrieve token details from Cypress environment
    const tokenDetails = Cypress.env('tokenResults');
    const mcpage = new mcPage(tokenDetails);

    // Navigate to MC2 and validate token information
    mcpage.gotoMc2().processTokens();
  });
});
