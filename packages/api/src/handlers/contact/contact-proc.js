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
  submitted: a.submitted?.toISOString(),
  ...a.contact
})

export const alwaysExclude = payload => {
  const result = Object.assign({}, payload)
  delete result.id
  delete result.submitted
  delete result.createdAt
  delete result.updatedAt
  delete result.userId
  return result
}
