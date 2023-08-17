/**
 * Consume Prepare output
 * @param return.dataValues
 * @returns {any}
 */
export const prepareResponse = (a) =>
  Object.assign((({ ...l }) => l)(a), {
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString()
  })
