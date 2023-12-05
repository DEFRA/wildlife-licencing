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
  if (!address) {
    return
  }

  const { uprn, street, locality, addressLine1, addressLine2 } = address
  const isSameLine1 = street === addressLine1
  const isSameLine2 = locality === addressLine2

  const deleteIfTrue = (condition, field) => {
    if (condition) {
      delete address[field]
    }
  }

  deleteIfTrue(uprn && isSameLine1, 'addressLine1')
  deleteIfTrue(uprn && isSameLine2, 'addressLine2')
  deleteIfTrue(!uprn && isSameLine1, 'street')
  deleteIfTrue(!uprn && isSameLine2, 'locality')
}
