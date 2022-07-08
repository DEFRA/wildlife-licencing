
describe('applicant-name', () => {
  beforeEach(() => jest.resetModules())
  it('getApplicantData calls the underlying contact functions', async () => {
    const mockGetContactData = jest.fn()
    jest.doMock('../../common/contact-name/contact-name.js', () => ({
      getContactData: () => mockGetContactData
    }))
    const { getApplicantData } = await import('../applicant-name.js')
    await getApplicantData({ foo: 'bar' })
    expect(mockGetContactData).toHaveBeenCalledWith({ foo: 'bar' })
  })
  it('setApplicantData calls the underlying contact functions', async () => {
    const mockSetContactData = jest.fn()
    jest.doMock('../../common/contact-name/contact-name.js', () => ({
      setContactData: () => mockSetContactData
    }))
    const { setApplicantData } = await import('../applicant-name.js')
    await setApplicantData({ foo: 'bar' })
    expect(mockSetContactData).toHaveBeenCalledWith({ foo: 'bar' })
  })
})
