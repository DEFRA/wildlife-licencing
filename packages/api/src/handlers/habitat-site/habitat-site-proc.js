/**
 * Prepare output
 * @param a
 * @returns {any}
 */
export const prepareResponse = a =>
  Object.assign(
    (({
      createdAt,
      updatedAt,
      applicationId,
      habitatSite,
      submitted,
      sddsHabitatSiteId,
      updateStatus,
      ...l
    }) => l)(a),
    {
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
      ...a.habitatSite
    }
  )

export const alwaysExclude = payload => {
  delete payload.id
  delete payload.applicationId
  delete payload.createdAt
  delete payload.updatedAt
  return payload
}
