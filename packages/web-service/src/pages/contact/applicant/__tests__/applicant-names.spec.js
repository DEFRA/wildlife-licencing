describe('applicant-names', () => {
  beforeEach(() => jest.resetModules())
  it('contactNamesCheckData calls the underlying contact functions', async () => {
    const mockContactNamesCheckData = jest.fn()
    jest.doMock('../../common/contact-names/contact-names.js', () => ({
      contactNamesCheckData: () => mockContactNamesCheckData,
      getContactNamesData: jest.fn(),
      setContactNamesData: jest.fn(),
      contactNamesCompletion: jest.fn()
    }))
    const { applicantNamesCheckData } = await import('../applicant-names.js')
    await applicantNamesCheckData({ foo: 'bar' })
    expect(mockContactNamesCheckData).toHaveBeenCalledWith({ foo: 'bar' })
  })

  it('getApplicantNamesData calls the underlying contact functions', async () => {
    const mockGetContactNamesData = jest.fn()
    jest.doMock('../../common/contact-names/contact-names.js', () => ({
      contactNamesCheckData: jest.fn(),
      getContactNamesData: () => mockGetContactNamesData,
      setContactNamesData: jest.fn(),
      contactNamesCompletion: jest.fn()
    }))
    const { getApplicantNamesData } = await import('../applicant-names.js')
    await getApplicantNamesData({ foo: 'bar' })
    expect(mockGetContactNamesData).toHaveBeenCalledWith({ foo: 'bar' })
  })

  it('setApplicantNamesData calls the underlying contact functions', async () => {
    const mockSetContactNamesData = jest.fn()
    jest.doMock('../../common/contact-names/contact-names.js', () => ({
      contactNamesCheckData: jest.fn(),
      getContactNamesData: jest.fn(),
      setContactNamesData: () => mockSetContactNamesData,
      contactNamesCompletion: jest.fn()
    }))
    const { setApplicantNamesData } = await import('../applicant-names.js')
    await setApplicantNamesData({ foo: 'bar' })
    expect(mockSetContactNamesData).toHaveBeenCalledWith({ foo: 'bar' })
  })

  it('applicantNamesCompletion calls the underlying contact functions', async () => {
    const mockApplicantNamesCompletion = jest.fn()
    jest.doMock('../../common/contact-names/contact-names.js', () => ({
      contactNamesCheckData: jest.fn(),
      getContactNamesData: jest.fn(),
      setContactNamesData: jest.fn(),
      contactNamesCompletion: () => mockApplicantNamesCompletion
    }))
    const { applicantNamesCompletion } = await import('../applicant-names.js')
    await applicantNamesCompletion({ foo: 'bar' })
    expect(mockApplicantNamesCompletion).toHaveBeenCalledWith({ foo: 'bar' })
  })
})
