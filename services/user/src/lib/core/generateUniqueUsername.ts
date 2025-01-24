import prisma from "@/prisma";
import generateUsername from "./generateUsername";

async function generateUniqueUsername(firstName: string, lastName: string) {
  let username = generateUsername(
    firstName.toLowerCase() + " " + lastName.toLocaleLowerCase()
  );
  console.log({ username });
  while (true) {
    const data = await prisma.user.findFirst({
      where: { username },
    });
    if (!data) {
      break;
    }
    username = generateUsername(firstName + " " + lastName);
  }
  return username;
}

export default generateUniqueUsername;
