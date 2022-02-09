import * as _get from 'lodash.get'

const { default: get } = _get

/* eslint-disable camelcase */
export const contactClass = srcPath => ({
  targetEntity: 'contacts',
  targetKey: 'contactid',
  targetFields: {
    firstname: { srcPath: `${srcPath}.firstname` },
    lastname: { srcPath: `${srcPath}.lastname`, entityTrigger: true },
    ...addressClass(`${srcPath}.address`),
    ...contactDetailsClass(`${srcPath}.contactDetails`)
  }
})

export const accountClass = srcPath => ({
  targetEntity: 'accounts',
  targetKey: 'accountid',
  targetFields: {
    name: { srcPath: `${srcPath}.name`, entityTrigger: true },
    ...addressClass(`${srcPath}.address`),
    ...contactDetailsClass(`${srcPath}.contactDetails`)
  }
})

const addressClass = srcPath => ({
  address1_line1: { srcPath: `${srcPath}.addrline1` },
  address1_line2: { srcPath: `${srcPath}.addrline2` },
  address1_line3: { srcPath: `${srcPath}.addrline3` },
  address1_county: { srcPath: `${srcPath}.county` },
  address1_city: { srcPath: `${srcPath}.town` },
  address1_postalcode: { srcFunc: s => get(s, srcPath)?.postcode?.toUpperCase() || null } // To uppercase
})

const contactDetailsClass = srcPath => ({
  telephone1: { srcPath: `${srcPath}.phone` },
  emailaddress1: { srcPath: `${srcPath}.email` }
})
