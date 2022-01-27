
describe('the applications model', () => {
  it('lookup functions are correctly called', async () => {
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

  it('other functions are correctly called', async () => {
    const { applicationModel } = await import('../sdds-application-model.js')
    const applicationNumber = applicationModel.sdds_applications.targetFields.sdds_applicationnumber.srcFunc()
    expect(applicationNumber.length).toBe(6)
    const postcode = applicationModel.sdds_applications.relationships.applicant.targetFields.address1_postalcode.srcFunc({
      applicant: {
        address: {
          postcode: 'bs1 1py'
        }
      }
    })
    expect(postcode).toBe('BS1 1PY')
  })
})
