describe('the phone-number-page', () => {
  beforeEach(() => jest.resetModules())

  it('the validator throws an error with an empty phone number', async () => {
    const payload = {
      'phone-number': ''
    }
    const { getValidator } = await import('../phone-number-page.js')
    const validator = getValidator('APPLICANT', null)
    await expect(() => validator(payload, {})).rejects.toThrow()
  })

  it('the validator throws an error on an invalid phone number', async () => {
    const payload = {
      'phone-number': '!@£$%^&*('
    }
    const { getValidator } = await import('../phone-number-page.js')
    const validator = getValidator('APPLICANT', null)
    await expect(() => validator(payload, {})).rejects.toThrow()
  })

  it('the validator does not throw an error with a valid phone number', async () => {
    const payload = {
      'phone-number': '0123456789'
    }
    const { getValidator } = await import('../phone-number-page.js')
    const validator = getValidator('APPLICANT', null)
    await expect(() => validator(payload, {})).not.rejects
  })
})
