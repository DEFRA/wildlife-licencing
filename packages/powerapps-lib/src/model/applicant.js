/* eslint-disable camelcase */
export const applicant = {
  targetEntity: 'contacts',
  targetKey: 'contactid',
  targetFields: {
    firstname: { srcJsonPath: '$.applicant.firstname' },
    lastname: { srcJsonPath: '$.applicant.lastname' },
    address1_line1: { srcJsonPath: '$.applicant.address.addrline1' },
    address1_line2: { srcJsonPath: '$.applicant.address.addrline2' },
    address1_line3: { srcJsonPath: '$.applicant.address.addrline3' },
    address1_postalcode: { srcJsonPath: '$.applicant.address.postcode' },
    address1_telephone1: { srcJsonPath: '$.applicant.phone' },
    emailaddress1: { srcJsonPath: '$.applicant.email' }
  }
}
