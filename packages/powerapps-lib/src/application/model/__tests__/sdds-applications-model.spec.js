
describe('the applications model', () => {
  it('field functions are correct', async () => {
    const mockGetReferenceDataIdByName = jest.fn()
    const mockGetReferenceDataNameById = jest.fn()

    jest.doMock('../../../refdata/cache.js', () => ({
      getReferenceDataIdByName: mockGetReferenceDataIdByName,
      getReferenceDataNameById: mockGetReferenceDataNameById
    }))

    const { applicationModel } = await import('../sdds-application-model.js')
    const sourceRemote = applicationModel.sdds_applications.targetFields.sdds_sourceremote.srcFunc()
    expect(sourceRemote).toBe(true)

    await applicationModel.sdds_applications.targetFields
      .sdds_applicationtypesid.srcFunc({ applicationType: 'type' })
    await expect(mockGetReferenceDataIdByName).toHaveBeenCalledWith('sdds_applicationtypeses', 'type')

    await applicationModel.sdds_applications.targetFields
      .sdds_applicationpurpose.srcFunc({ applicationPurpose: 'purpose' })
    await expect(mockGetReferenceDataIdByName).toHaveBeenCalledWith('sdds_applicationpurposes', 'purpose')

    await applicationModel.sdds_applications.relationships
      .sdds_applicationtypesid.targetFields.sdds_applicationtypesid.tgtFunc({ sdds_applicationtypesid: 123 })
    await expect(mockGetReferenceDataNameById).toHaveBeenCalledWith('sdds_applicationtypeses', 123)

    await applicationModel.sdds_applications.relationships
      .sdds_applicationpurpose.targetFields.sdds_applicationpurposeid.tgtFunc({ sdds_applicationpurposeid: 456 })
    await expect(mockGetReferenceDataNameById).toHaveBeenCalledWith('sdds_applicationpurposes', 456)
  })
})
