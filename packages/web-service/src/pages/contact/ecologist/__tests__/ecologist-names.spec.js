describe('ecologist-names', () => {
  beforeEach(() => jest.resetModules())
  it('ecologistNamesCheckData calls the underlying contact functions', async () => {
    const mockContactNamesCheckData = jest.fn()
    jest.doMock('../../common/contact-names/contact-names.js', () => ({
      contactNamesCheckData: () => mockContactNamesCheckData,
      getContactNamesData: jest.fn(),
      setContactNamesData: jest.fn(),
      contactNamesCompletion: jest.fn()
    }))
    const { ecologistNamesCheckData } = await import('../ecologist-names.js')
    await ecologistNamesCheckData({ foo: 'bar' })
    expect(mockContactNamesCheckData).toHaveBeenCalledWith({ foo: 'bar' })
  })

  it('getEcologistNamesData calls the underlying contact functions', async () => {
    const mockGetContactNamesData = jest.fn()
    jest.doMock('../../common/contact-names/contact-names.js', () => ({
      contactNamesCheckData: jest.fn(),
      getContactNamesData: () => mockGetContactNamesData,
      setContactNamesData: jest.fn(),
      contactNamesCompletion: jest.fn()
    }))
    const { getEcologistNamesData } = await import('../ecologist-names.js')
    await getEcologistNamesData({ foo: 'bar' })
    expect(mockGetContactNamesData).toHaveBeenCalledWith({ foo: 'bar' })
  })

  it('setEcologistNamesData calls the underlying contact functions', async () => {
    const mockSetContactNamesData = jest.fn()
    jest.doMock('../../common/contact-names/contact-names.js', () => ({
      contactNamesCheckData: jest.fn(),
      getContactNamesData: jest.fn(),
      setContactNamesData: () => mockSetContactNamesData,
      contactNamesCompletion: jest.fn()
    }))
    const { setEcologistNamesData } = await import('../ecologist-names.js')
    await setEcologistNamesData({ foo: 'bar' })
    expect(mockSetContactNamesData).toHaveBeenCalledWith({ foo: 'bar' })
  })

  it('ecologistNamesCompletion calls the underlying contact functions', async () => {
    const mockEcologistNamesCompletion = jest.fn()
    jest.doMock('../../common/contact-names/contact-names.js', () => ({
      contactNamesCheckData: jest.fn(),
      getContactNamesData: jest.fn(),
      setContactNamesData: jest.fn(),
      contactNamesCompletion: () => mockEcologistNamesCompletion
    }))
    const { ecologistNamesCompletion } = await import('../ecologist-names.js')
    await ecologistNamesCompletion({ foo: 'bar' })
    expect(mockEcologistNamesCompletion).toHaveBeenCalledWith({ foo: 'bar' })
  })
})
