/**
 * An address if manually entered will have addressLine1 and addressLine2
 * whereas a looked up address has street and locality
 * In the 2-way address mapping both addressLine1 and street are mapped in the inbound from teh source address_line1
 * and so address line 1 is duplicated. Same for address line 2 and locality
 * So this is a bit of a kludge to intercept and the database write but easier than changing the mapping functionality
 * to operate on rows rather than fields.
 * @param address
 */
export const addressProcess = address => {
  if (address) {
    if (address.uprn) {
      if (address?.street === address?.addressLine1) {
        delete address.addressLine1
      }
      if (address?.locality === address?.addressLine2) {
        delete address.addressLine2
      }
    } else {
      if (address?.street === address?.addressLine1) {
        delete address.street
      }
      if (address?.locality === address?.addressLine2) {
        delete address.locality
      }
    }
  }
}
