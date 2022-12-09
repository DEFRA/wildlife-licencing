/**
 * Clears the data from the "top-level" when a new application is chosen
 * @param request
 * @returns {Promise<Awaited<*>[]>}
 */
export const clearData = async request => {
  const journeyData = await request.cache().getData()
  delete journeyData.habitatData
  await request.cache().setData(journeyData)
}
