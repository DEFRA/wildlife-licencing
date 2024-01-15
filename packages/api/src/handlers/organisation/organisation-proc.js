/**
 * Consume Prepare output for a site
 * @param site.dataValues
 * @returns {any}
 */
export const prepareResponse = a => {
  const { createdAt, updatedAt, organisation, ...rest } = a
  return {
    ...rest,
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
    ...organisation
  }
}
