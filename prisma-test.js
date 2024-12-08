const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // Create a new user
  const user = await prisma.user.create({
    data: {
      email: "user@example.com",
      password: "securepassword",
    },
  });

  console.log("User created:", user);

  // Create a tasting for the user
  const tasting = await prisma.tasting.create({
    data: {
      userId: user.id,
      type: "Red",
    },
  });

  console.log("Tasting created:", tasting);

  // Fetch all tastings for the user
  const userWithTastings = await prisma.user.findUnique({
    where: { id: user.id },
    include: { tastings: true },
  });

  console.log("User with Tastings:", userWithTastings);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
