/**
 * Consume Prepare output for an application-site
 * @param applicationSite.dataValues
 * @returns {any}
 */
export const prepareResponse = as => Object.assign((({
  createdAt,
  updatedAt,
  userId,
  sddsApplicationId,
  sddsSiteId,
  submitted,
  updateStatus,
  ...l
}) => l)(as), {
  createdAt: as.createdAt.toISOString(),
  updatedAt: as.updatedAt.toISOString()
})
