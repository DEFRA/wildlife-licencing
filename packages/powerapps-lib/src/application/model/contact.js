/* eslint-disable camelcase */
export const contactClass = cc => ({
  targetEntity: 'contacts',
  targetKey: 'contactid',
  targetFields: {
    firstname: { srcPath: `${cc}.firstname` },
    lastname: { srcPath: `${cc}.lastname` },
    address1_line1: { srcPath: `${cc}.address.addrline1` },
    address1_line2: { srcPath: `${cc}.address.addrline2` },
    address1_line3: { srcPath: `${cc}.address.addrline3` },
    address1_county: { srcPath: `${cc}.address.county` },
    address1_postalcode: { srcPath: `${cc}.address.postcode` },
    address1_telephone1: { srcPath: `${cc}.phone` },
    emailaddress1: { srcPath: `${cc}.email` }
  }
})
