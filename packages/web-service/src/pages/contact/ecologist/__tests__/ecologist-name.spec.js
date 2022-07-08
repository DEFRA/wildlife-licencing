
describe('ecologist-name', () => {
  beforeEach(() => jest.resetModules())
  it('getEcologistData calls the underlying contact functions', async () => {
    const mockGetContactData = jest.fn()
    jest.doMock('../../common/contact-name/contact-name.js', () => ({
      getContactData: () => mockGetContactData
    }))
    const { getEcologistData } = await import('../ecologist-name.js')
    getEcologistData({ foo: 'bar' })
    expect(mockGetContactData).toHaveBeenCalledWith({ foo: 'bar' })
  })
  it('setEcologistData calls the underlying contact functions', async () => {
    const mockSetContactData = jest.fn()
    jest.doMock('../../common/contact-name/contact-name.js', () => ({
      setContactData: () => mockSetContactData
    }))
    const { setEcologistData } = await import('../ecologist-name.js')
    setEcologistData({ foo: 'bar' })
    expect(mockSetContactData).toHaveBeenCalledWith({ foo: 'bar' })
  })
})
