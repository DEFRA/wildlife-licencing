/**
 * Consume Prepare output
 * @param user.dataValues
 * @returns {any}
 */
export const prepareResponse = u => Object.assign((({ createdAt, updatedAt, ...l }) => l)(u), {
  createdAt: u.createdAt.toISOString(),
  updatedAt: u.updatedAt.toISOString()
})
