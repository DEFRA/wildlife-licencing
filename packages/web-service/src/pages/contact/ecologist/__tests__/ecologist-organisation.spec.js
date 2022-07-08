describe('ecologist-organisation', () => {
  beforeEach(() => jest.resetModules())
  it('setEcologistOrganisationData calls the underlying get account correctly', async () => {
    const mockSetContactAccountData = jest.fn()
    jest.doMock('../../common/account/account.js', () => ({
      setContactAccountData: () => mockSetContactAccountData,
      getContactAccountData: jest.fn()
    }))
    const { setEcologistOrganisationData } = await import('../ecologist-organisation.js')
    await setEcologistOrganisationData({ foo: 'bar' })
    expect(mockSetContactAccountData).toHaveBeenCalledWith({ foo: 'bar' })
  })
  it('getEcologistOrganisationData calls the underlying get account correctly', async () => {
    const mockGetContactAccountData = jest.fn()
    jest.doMock('../../common/account/account.js', () => ({
      setContactAccountData: jest.fn(),
      getContactAccountData: () => mockGetContactAccountData
    }))
    const { getEcologistOrganisationData } = await import('../ecologist-organisation.js')
    await getEcologistOrganisationData({ foo: 'bar' })
    expect(mockGetContactAccountData).toHaveBeenCalledWith({ foo: 'bar' })
  })
})
