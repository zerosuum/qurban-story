import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined in environment variables");
}

const pool = new Pool({
  connectionString,
});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const adapter = new PrismaPg(pool as any);

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log("Starting database seed...");

  await prisma.animalSpecies.createMany({
    data: [
      {
        name: "GOAT",
        maxParticipants: 1,
      },
      {
        name: "SHEEP",
        maxParticipants: 1,
      },
      {
        name: "COW",
        maxParticipants: 7,
      },
    ],
    skipDuplicates: true,
  });

  console.log("Animal species seeded successfully");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
