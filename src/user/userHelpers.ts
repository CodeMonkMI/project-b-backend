import { blood_type } from "@prisma/client";

export const BLOOD_GROUPS: blood_type[] = [
  "A_POSITIVE",
  "A_NEGATIVE",
  "B_POSITIVE",
  "B_NEGATIVE",
  "AB_POSITIVE",
  "AB_NEGATIVE",
  "O_POSITIVE",
  "O_NEGATIVE",
];

export const randomPassword = (length: number) => {
  const chars =
    "0123456789abcdefghijklmnopqrstuvwxyz!@#$%^&*()ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let password = "";
  for (let i = 0; i <= length; i++) {
    const randomNumber = Math.floor(Math.random() * chars.length);
    password += chars.substring(randomNumber, randomNumber + 1);
  }
  return password;
};

export const nextRoleName = (name: string) => {
  if (name === "user") return "admin";
  if (name === "admin") return "super_admin";
  return name;
};
export const prevRoleName = (name: string) => {
  if (name === "super_admin") return "admin";
  if (name === "admin") return "user";
  return name;
};
