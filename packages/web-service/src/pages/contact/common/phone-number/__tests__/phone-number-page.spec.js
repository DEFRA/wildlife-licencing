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
      'phone-number': '012%456*78'
    }
    const { getValidator } = await import('../phone-number-page.js')
    const validator = getValidator('APPLICANT', null)
    expect(() => validator(payload, {})).rejects.toThrow()
  })

  it('the validator does not throw an error with a valid phone numbers', async () => {
    const payloads = [
      {
        'phone-number': '0123456789'
      },
      {
        'phone-number': '+44123456789'
      },
      {
        'phone-number': '(00)44123456789'
      }
    ]

    const { getValidator } = await import('../phone-number-page.js')

    payloads.forEach(async payload => {
      const validator = getValidator('APPLICANT', null)
      expect(() => validator(payload, {})).resolves
    })
  })
})
