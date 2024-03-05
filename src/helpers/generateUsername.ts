function generateUsername(name: string) {
  // Generate a random number between 1000 and 9999
  const randomNumber = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;

  // Concatenate the name and random number
  const username = `${name}${randomNumber}`;

  return username.replace(" ", "_");
}

export default generateUsername;
