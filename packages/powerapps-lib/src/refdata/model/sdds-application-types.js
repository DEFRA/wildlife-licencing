export const applicationTypesModel = {
  sdds_applicationtypeses: {
    targetEntity: 'sdds_applicationtypeses',
    targetKey: 'sdds_applicationtypesid',
    targetFields: {
      sdds_applicationname: {
        srcPath: 'name',
        required: true
      },
      sdds_description: {
        srcPath: 'description'
      }
    }
  }
}
