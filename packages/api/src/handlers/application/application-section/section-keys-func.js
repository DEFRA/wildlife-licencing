/**
 * Decorate the targetKeys object on the application table if that key has been retrieved from elsewhere, for instance
 * the reuse of another contact record
 * @param targetKeys
 * @param applicationId
 * @param section
 * @param powerAppsKey
 * @param powerAppsTable
 */
export const sectionKeyFunc = (
  targetKeys,
  applicationId,
  section,
  powerAppsKey,
  powerAppsTable
) => {
  const sectionPath = `application.${section}`

  // If the keys are not initialized then initialize them
  if (!targetKeys) {
    targetKeys = [
      {
        apiTable: 'applications',
        apiKey: applicationId,
        apiBasePath: 'application',
        powerAppsTable: 'sdds_applications'
      }
    ]
  }

  const elem = targetKeys.find(k => k.apiBasePath === sectionPath)

  // Either amend or add the section key
  if (elem) {
    elem.powerAppsKey = powerAppsKey
  } else {
    targetKeys.push({
      apiKey: null,
      apiTable: 'applications',
      apiBasePath: sectionPath,
      powerAppsKey: powerAppsKey,
      powerAppsTable: powerAppsTable
    })
  }

  return targetKeys
}
