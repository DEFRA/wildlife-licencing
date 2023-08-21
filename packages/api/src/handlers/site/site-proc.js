/**
 * Consume Prepare output for a site
 * @param site.dataValues
 * @returns {any}
 */
export const prepareResponse = a =>
  Object.assign(
    (({
      createdAt,
      updatedAt,
      userId,
      site,
      targetKeys,
      sddsSiteId,
      submitted,
      updateStatus,
      ...l
    }) => l)(a),
    {
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
      ...a.site
    }
  )

export const alwaysExclude = payload => {
  delete payload.createdAt
  delete payload.updatedAt
  return payload
}
