import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/utils/hash";
const prisma = new PrismaClient();
const main = async () => {
  await prisma.user_type.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: "ADMIN",
    },
  });
  await prisma.user_type.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      name: "CUSTOMER",
    },
  });
  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@glamoons.com",
      password: (await hashPassword("test123!")).hash,
      type: { connect: { id: 1 } },
      firstname: "Kamil",
      lastname: "Czech",
    },
  });
};
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
