// Handle uncaught exception
Cypress.on('uncaught:exception', (error, runnable) => {
  return false;
});

Cypress.Commands.add(
  'calculatePriceDeviation',
  (actualPrice, expectedPrice) => {
    // Ensure both actual and expected prices are numbers
    if (Number.isNaN(actualPrice) || Number.isNaN(expectedPrice)) {
      throw new TypeError('Both actualPrice and expectedPrice must be numbers');
    }

    // Calculate the deviation
    const deviation =
      Math.abs((actualPrice - expectedPrice) / expectedPrice) * 100;

    // Return the deviation
    return deviation;
  },
);

Cypress.Commands.add('formatNumber', (number) => {
  if (number === 0) return '0';

  const absNumber = Math.abs(number);
  let formattedNumber;

  if (absNumber < 1_000) {
    formattedNumber = number.toFixed(0); // No abbreviation
  } else if (absNumber < 1_000_000) {
    formattedNumber = (number / 1_000).toFixed(2) + 'K'; // Thousands
  } else if (absNumber < 1_000_000_000) {
    formattedNumber = (number / 1_000_000).toFixed(2) + 'M'; // Millions
  } else {
    formattedNumber = (number / 1_000_000_000).toFixed(2) + 'B'; // Billions
  }

  return formattedNumber;
});

Cypress.Commands.add('calculatePercentageValue', (baseValue, percentage) => {
  // Remove % and convert to float
  const percentValue = Number.parseFloat(percentage.replace('%', ''));

  // Calculate actual value
  const actualValue = baseValue + (baseValue * percentValue) / 100;

  // Return the calculated value
  return actualValue;
});

Cypress.Commands.add('convertToNumber', (input) => {
  cy.wrap(null).then(() => {
    if (typeof input !== 'string') {
      throw new TypeError('Input must be a string.');
    }

    let value = input.replace('$', '').replace(',', '').trim(); // Remove $, commas, and trim whitespace
    let multiplier = 1;

    // Determine the multiplier based on the abbreviation
    if (value.endsWith('K')) {
      multiplier = 1_000;
      value = value.replace('K', '');
    } else if (value.endsWith('M')) {
      multiplier = 1_000_000;
      value = value.replace('M', '');
    } else if (value.endsWith('B')) {
      multiplier = 1_000_000_000;
      value = value.replace('B', '');
    }

    const number = Number.parseFloat(value);

    // If the result is not a valid number, throw an error
    if (Number.isNaN(number)) {
      throw new TypeError(`Invalid number: ${input}`);
    }

    return number * multiplier;
  });
});
