export const applicationTypesModel = {
  sdds_applicationtypeses: {
    targetEntity: 'sdds_applicationtypeses',
    targetKey: 'sdds_applicationtypesid',
    targetFields: {
      sdds_applicationname: {
        srcPath: 'name'
      },
      sdds_description: {
        srcPath: 'description'
      }
    }
  }
}
