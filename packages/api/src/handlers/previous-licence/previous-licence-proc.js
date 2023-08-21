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
      licence,
      submitted,
      sddsPreviousLicenceId,
      updateStatus,
      ...l
    }) => l)(a),
    {
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
      ...a.licence
    }
  )

export const alwaysExclude = payload => {
  const result = Object.assign({}, payload)
  delete result.id
  delete result.applicationId
  delete result.sddsPreviousLicenceId
  delete result.createdAt
  delete result.updatedAt
  return result
}
