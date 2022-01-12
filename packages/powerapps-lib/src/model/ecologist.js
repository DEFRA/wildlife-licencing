/* eslint-disable camelcase */

export const ecologist = {
  targetEntity: 'contacts',
  targetKey: 'contactid',
  targetFields: {
    firstname: { srcPath: 'ecologist.firstname' },
    lastname: { srcPath: 'ecologist.lastname' },
    address1_line1: { srcPath: 'ecologist.address.addrline1' },
    address1_line2: { srcPath: 'ecologist.address.addrline2' },
    address1_line3: { srcPath: 'ecologist.address.addrline3' },
    address1_county: { srcPath: 'ecologist.address.county' },
    address1_postalcode: { srcPath: 'ecologist.address.postcode' },
    address1_telephone1: { srcPath: 'ecologist.phone' },
    emailaddress1: { srcPath: 'ecologist.email' }
  }
}
