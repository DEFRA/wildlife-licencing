/**
 * Consume Prepare output for a site
 * @param contact.dataValues
 * @returns {any}
 */
export const prepareResponse = a => Object.assign((({
  createdAt,
  updatedAt,
  contact,
  targetKeys,
  sddsContactId,
  submitted,
  updateStatus,
  ...l
}) => l)(a), {
  createdAt: a.createdAt.toISOString(),
  updatedAt: a.updatedAt.toISOString(),
  ...a.contact
})
