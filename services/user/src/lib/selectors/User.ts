class Selector {
  private defaultSelector = {
    id: true,
    email: true,
    password: true,
    username: true,
    isVerified: true,
    isDelete: true,
    createdAt: true,
    role: {
      select: {
        name: true,
        role: true,
      },
    },
  };
  public getSingle() {
    return this.defaultSelector;
  }
  public getAll() {
    return this.defaultSelector;
  }
}

const UserSelector = new Selector();
export default UserSelector;
