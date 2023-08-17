/**
 * Prepare output
 * @param a
 * @returns {any}
 */
export const prepareResponse = (a) =>
  Object.assign(
    (({
      createdAt,
      updatedAt,
      applicationId,
      permission,
      submitted,
      sddsPermissionId,
      updateStatus,
      ...l
    }) => l)(a),
    {
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
      ...a.permission
    }
  )

export const alwaysExclude = (payload) => {
  delete payload.id
  delete payload.applicationId
  delete payload.createdAt
  delete payload.updatedAt
  return payload
}
