import { faker } from "@faker-js/faker";
import { User } from "../models/user.js";

const createUSer = async (numUsers) => {
  try {
    const usersPromise = [];
    for (let i = 0; i < numUsers; i++) {
      const tempUser = User.create({
        name: faker.person.fullName(),
        username: faker.internet.userName(),
        bio: faker.lorem.sentence(10),
        password: "password",
        avatar: {
          url: faker.image.avatar(),
          public_id: faker.system.fileName(),
        },
      });
      usersPromise.push(tempUser);
    }
    await Promise.all(usersPromise);
    
    process.exit(1);
  } catch (error) {
    
    process.exit(1);
  }
};

export { createUSer };

