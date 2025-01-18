class Selector {
  private defaultSelector = {
    id: true,
    firstName: true,
    lastName: true,
    displayName: true,
    fatherName: true,
    motherName: true,
    address: true,
    streetAddress: true,
    upzila: true,
    zila: true,
    phoneNo: true,
    lastDonation: true,
    bloodGroup: true,
    image: true,
    userId: true,
  };
  public getDefault() {
    return this.defaultSelector;
  }
}

const ProfileSelector = new Selector();
export default ProfileSelector;
