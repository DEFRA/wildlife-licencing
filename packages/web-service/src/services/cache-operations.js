/**
 * Clears the data from the "top-level" when a new application is chosen
 * @param request
 * @returns {Promise<Awaited<*>[]>}
 */
export const clearData = async journeyData => {
  delete journeyData.habitatData
  delete journeyData.additionalContact
}
