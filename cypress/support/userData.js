import { faker } from '@faker-js/faker';

export const generateRandomUser = () => {
  const firstName = faker.person.firstName();
  const middleName = faker.person.middleName();
  const lastName = faker.person.lastName();
  const recipientCode = faker.person.zodiacSign();
  const tenDigitNumber = faker.number.int({
    max: 9_999_999_999,
    min: 1_000_000_000,
  });
  const Description = faker.lorem.sentence(20);

  return {
    Description,
    firstName,
    lastName,
    middleName,
    recipientCode,
    tenDigitNumber,
  };
};
