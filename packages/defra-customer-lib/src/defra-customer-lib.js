import { DEFRA_CUSTOMER } from '@defra/wls-connectors-lib'

const USER_QUERY = userId => 'contacts(' + userId + ')?$select=emailaddress1,fullname,telephone1,defra_uniquereference,defra_addrcorsubbuildingname,defra_addrcorbuildingname,defra_addrcorbuildingnumber,defra_addrcorstreet,defra_addrcorlocality,defra_addrcortown,defra_addrcorcounty,defra_addrcorpostcode,defra_addrcoruprn'
const ORGANISATION_QUERY = organisationId => 'accounts(' + organisationId + ')?$select=name,emailaddress1,defra_addrregsubbuildingname,defra_addrregbuildingname,defra_addrregbuildingnumber,defra_addrregstreet,defra_addrreglocality,defra_addrregtown,defra_addrregcounty,defra_addrregpostcode,defra_addrreguprn'


const mapAddress = defraContact => ({
  ...(defraContact.defra_addrcorsubbuildingname && { subBuildingName: defraContact.defra_addrcorsubbuildingname }),
  ...(defraContact.defra_addrcorbuildingname && { buildingName: defraContact.defra_addrcorbuildingname }),
  ...(defraContact.defra_addrcorbuildingnumber && { buildingNumber: defraContact.defra_addrcorbuildingnumber }),
  ...(defraContact.defra_addrcorstreet && { street: defraContact.defra_addrcorstreet }),
  ...(defraContact.defra_addrcorlocality && { locality: defraContact.defra_addrcorlocality }),
  ...(defraContact.defra_addrcorlocality && { dependentLocality: defraContact.defra_addrcorlocality }),
  ...(defraContact.defra_addrcortown && { town: defraContact.defra_addrcortown }),
  ...(defraContact.defra_addrcorcounty && { county: defraContact.defra_addrcorcounty }),
  ...(defraContact.defra_addrcorpostcode && { postcode: defraContact.defra_addrcorpostcode }),
  ...(defraContact.defra_addrcoruprn && { uprn: defraContact.defra_addrcoruprn })
})
/**
 * Convert from defra customer schema into local contact schema
 * @param defraContact
 * @returns {{address: {country: string, uprn: string, town: string, locality: string, county: string, postcode: string, dependentLocality: string, subBuildingName: string, buildingName: string, street: string, addressLine1: string, buildingNumber: string, addressLine2: string}, fullName: *, contactDetails: {phone: (string|null|*), email: *}}}
 */
const mapContact = defraContact => ({
  fullName: defraContact.fullname,
  ...(defraContact.emailaddress1 && {
    contactDetails: {
      email: defraContact.emailaddress1,
      ...(defraContact.phone && { email: defraContact.telephone1 })
    }
  }),
  ...(defraContact.defra_addrcorpostcode && {
    address: mapAddress(defraContact)
  })
})

const mapAccount = defraAccount => ({
  name: defraAccount.name,
  ...(defraAccount.emailaddress1 && {
    contactDetails: {
      email: defraAccount.emailaddress1,
      ...(defraAccount.phone && { email: defraAccount.telephone1 })
    }
  }),
  ...(defraAccount.defra_addrregpostcode && {
    address: {
      ...(defraAccount.defra_addrregsubbuildingname && { subBuildingName: defraAccount.defra_addrregsubbuildingname }),
      ...(defraAccount.defra_addrregbuildingname && { buildingName: defraAccount.defra_addrregbuildingname }),
      ...(defraAccount.defra_addrregbuildingnumber && { buildingNumber: defraAccount.defra_addrregbuildingnumber }),
      ...(defraAccount.defra_addrregstreet && { street: defraAccount.defra_addrregstreet }),
      ...(defraAccount.defra_addrreglocality && { locality: defraAccount.defra_addrreglocality }),
      ...(defraAccount.defra_addrregtown && { town: defraAccount.defra_addrregtown }),
      ...(defraAccount.defra_addrregcounty && { county: defraAccount.defra_addrregcounty }),
      ...(defraAccount.defra_addrregpostcode && { postcode: defraAccount.defra_addrregpostcode }),
      ...(defraAccount.defra_addrreguprn && { uprn: defraAccount.defra_addrreguprn })
    }
  })
})

export const getUserData = async userId => mapContact(await DEFRA_CUSTOMER.fetch(USER_QUERY(userId)))
export const getOrganisationData = async organisationId => mapAccount(await DEFRA_CUSTOMER.fetch(ORGANISATION_QUERY(organisationId)))
