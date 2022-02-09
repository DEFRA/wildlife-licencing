// import { addressClass } from './contact.js'
import * as _get from 'lodash.get'

const { default: get } = _get

export const sddsSites = {
  targetEntity: 'sdds_sites',
  targetKey: 'sdds_siteid',
  array: {
    srcPath: 'sites'
  },
  targetFields: {
    sdds_name: { srcPath: 'name', entityTrigger: true },
    sdds_osgridreference: { srcPath: 'gridReference' },
    sdds_addressline1: { srcPath: 'address.addrline1' },
    sdds_addressline2: { srcPath: 'address.addrline2' },
    sdds_addressline3: { srcPath: 'address.addrline3' },
    sdds_county: { srcPath: 'address.county' },
    sdds_town: { srcPath: 'address.town' },
    sdds_postcode: { srcFunc: s => get(s, 'address')?.postcode?.toUpperCase() || null } // To uppercase
  }
}
