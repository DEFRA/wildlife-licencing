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
      licenceId,
      returnData,
      submitted,
      userSubmission,
      sddsReturnId,
      updateStatus,
      ...l
    }) => l)(a),
    {
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
      ...a.returnData
    }
  )

export const alwaysExclude = payload => {
  delete payload.id
  delete payload.licenceId
  delete payload.createdAt
  delete payload.updatedAt
  return payload
}
