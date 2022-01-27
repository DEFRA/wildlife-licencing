export const applicationPurposesModel = {
  sdds_applicationpurposes: {
    targetEntity: 'sdds_applicationpurposes',
    targetKey: 'sdds_applicationpurposeid',
    targetFields: {
      sdds_name: {
        srcPath: 'name',
        required: true
      },
      sdds_description: {
        srcPath: 'description'
      }
    }
  }
}
