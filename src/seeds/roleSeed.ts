import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

(async () => {
  const role = await prisma.role.createMany({
    data: [
      {
        name: "User",
        role: "user",
      },
      {
        name: "Admin",
        role: "admin",
      },
      {
        name: "Super Admin",
        role: "super_admin",
      },
    ],
  });
  if (role) {
    console.log(`${role.count} data inserted successfully!`);
  } else {
    console.log("Data insertion failed!");
  }
})();
