/* eslint-disable camelcase */
export const applicant = {
  targetEntity: 'contacts',
  targetKey: 'contactid',
  targetFields: {
    firstname: { srcPath: 'applicant.firstname' },
    lastname: { srcPath: 'applicant.lastname' },
    address1_line1: { srcPath: 'applicant.address.addrline1' },
    address1_line2: { srcPath: 'applicant.address.addrline2' },
    address1_line3: { srcPath: 'applicant.address.addrline3' },
    address1_county: { srcPath: 'applicant.address.county' },
    address1_postalcode: { srcPath: 'applicant.address.postcode' },
    address1_telephone1: { srcPath: 'applicant.phone' },
    emailaddress1: { srcPath: 'applicant.email' }
  }
}
