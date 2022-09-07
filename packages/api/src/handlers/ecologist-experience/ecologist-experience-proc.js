/**
 * Consume Prepare output for a site
 * @param site.dataValues
 * @returns {any}
 */
export const prepareResponse = a => {
  Object.assign((({
    createdAt,
    updatedAt,
    updateStatus,
    applicationId,
    ...experience
  }) => experience)(a), {
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString()
  })
  a.ecologistExperience = a.experience
  delete a.experience
  delete a.ecologistExperience.complete
  return a
}

export const alwaysExclude = payload => {
  delete payload.createdAt
  delete payload.updatedAt
  return payload
}
