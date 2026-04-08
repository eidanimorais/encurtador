import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD?.trim();

  if (!email || !password) {
    throw new Error("Defina ADMIN_EMAIL e ADMIN_PASSWORD no .env antes de criar o admin.");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      role: "OWNER",
    },
    create: {
      email,
      name: "Admin",
      passwordHash,
      role: "OWNER",
    },
  });

  console.log(`Admin pronto: ${email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
