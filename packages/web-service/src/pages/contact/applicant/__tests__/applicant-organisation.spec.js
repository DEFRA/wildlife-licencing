describe('applicant-organisation', () => {
  beforeEach(() => jest.resetModules())
  it('setApplicantOrganisationData calls the underlying get account correctly', async () => {
    const mockSetContactAccountData = jest.fn()
    jest.doMock('../../common/account/account.js', () => ({
      setContactAccountData: () => mockSetContactAccountData,
      getContactAccountData: jest.fn()
    }))
    const { setApplicantOrganisationData } = await import('../applicant-organisation.js')
    await setApplicantOrganisationData({ foo: 'bar' })
    expect(mockSetContactAccountData).toHaveBeenCalledWith({ foo: 'bar' })
  })
  it('getApplicantOrganisationData calls the underlying get account correctly', async () => {
    const mockGetContactAccountData = jest.fn()
    jest.doMock('../../common/account/account.js', () => ({
      setContactAccountData: jest.fn(),
      getContactAccountData: () => mockGetContactAccountData
    }))
    const { getApplicantOrganisationData } = await import('../applicant-organisation.js')
    await getApplicantOrganisationData({ foo: 'bar' })
    expect(mockGetContactAccountData).toHaveBeenCalledWith({ foo: 'bar' })
  })
})
