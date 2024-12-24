import prisma from "@/prisma";

const checkUserRole = async () => {
  // find role
  const findRoles = await prisma.role.findMany();
  if (findRoles.length === 0) {
    await prisma.role.createMany({
      data: [
        { name: "Super Admin", role: "super_admin" },
        { name: "Admin", role: "admin" },
        { name: "User", role: "user" },
      ],
    });
  }
};

export default checkUserRole;
