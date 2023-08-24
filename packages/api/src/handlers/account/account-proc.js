/**
 * Consume Prepare output for a site
 * @param contact.dataValues
 * @returns {any}
 */
export const prepareResponse = a => Object.assign((({
  createdAt,
  updatedAt,
  account,
  targetKeys,
  sddsAccountId,
  updateStatus,
  submitted,
  ...l
}) => l)(a), {
  createdAt: a.createdAt.toISOString(),
  updatedAt: a.updatedAt.toISOString(),
  submitted: a.submitted?.toISOString(),
  ...a.account
})

export const alwaysExclude = payload => {
  const result = Object.assign({}, payload)
  delete result.id
  delete result.organisationId
  delete result.submitted
  delete result.createdAt
  delete result.updatedAt
  delete result.cloneOf
  return result
}
