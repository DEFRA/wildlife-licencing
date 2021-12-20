/* eslint-disable camelcase */

export const ecologist = {
  targetEntity: 'contacts',
  targetKey: 'contactid',
  targetFields: {
    firstname: { srcJsonPath: '$.ecologist.firstname' },
    lastname: { srcJsonPath: '$.ecologist.lastname' },
    address1_line1: { srcJsonPath: '$.ecologist.address.addrline1' },
    address1_line2: { srcJsonPath: '$.ecologist.address.addrline2' },
    address1_line3: { srcJsonPath: '$.ecologist.address.addrline3' },
    address1_postalcode: { srcJsonPath: '$.ecologist.address.postcode' },
    address1_telephone1: { srcJsonPath: '$.ecologist.phone' },
    emailaddress1: { srcJsonPath: '$.ecologist.email' }
  }
  // ,
  // relationships: {
  //   foo: {
  //     entity: {
  //       targetEntity: 'foo'
  //     },
  //     fk: 'sdds_fooid@odata.bind'
  //   }
  // }
}
