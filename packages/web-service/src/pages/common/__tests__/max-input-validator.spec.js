describe('max input validator function', () => {
  beforeEach(() => jest.resetModules())

  it('raises a joi error on an empty text input for experience flow', async () => {
    const payload = { 'enter-experience': '' }
    const context = { context: { state: { sid: { id: 123 } } } }
    jest.doMock('../../../session-cache/cache-decorator.js', () => ({
      cacheDirect: () => {
        return {
          getData: () => { },
          setData: () => { }
        }
      }
    }))
    try {
      const { maxInputValidator } = await import('../max-input-validator.js')
      expect(await maxInputValidator(payload, context, 'enter-experience'))
    } catch (e) {
      expect(e.message).toBe('ValidationError')
      expect(e.details[0].message).toBe('Error: no text entered')
    }
  })

  it('raises a joi error on an empty text input for methods flow', async () => {
    const payload = { 'enter-methods': '' }
    const context = { context: { state: { sid: { id: 123 } } } }
    jest.doMock('../../../session-cache/cache-decorator.js', () => ({
      cacheDirect: () => {
        return {
          getData: () => { },
          setData: () => { }
        }
      }
    }))
    try {
      const { maxInputValidator } = await import('../max-input-validator.js')
      expect(await maxInputValidator(payload, context, 'enter-methods'))
    } catch (e) {
      expect(e.message).toBe('ValidationError')
      expect(e.details[0].message).toBe('Error: no text entered')
    }
  })

  it('raises a joi error if the user enters more than 4,000 characters', async () => {
    const fourThousandAndOneChars = 'dsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsdsdsddsdsdsdsdsd'
    const payload = { 'enter-experience': fourThousandAndOneChars }
    const setCacheMock = jest.fn()
    const context = { context: { state: { sid: { id: 123 } } } }
    jest.doMock('../../../session-cache/cache-decorator.js', () => ({
      cacheDirect: () => {
        return {
          getData: () => { return {} },
          setData: setCacheMock
        }
      }
    }))
    try {
      const { maxInputValidator } = await import('../max-input-validator.js')
      expect(await maxInputValidator(payload, context, 'enter-experience'))
    } catch (e) {
      expect(e.message).toBe('ValidationError')
      expect(e.details[0].message).toBe('Error: max text input exceeded')
      expect(setCacheMock).toHaveBeenCalledWith({ tempInput: fourThousandAndOneChars })
    }
  })

  it('returns undefined if the character count is less than 4000 and more than 0', async () => {
    const payload = { 'enter-experience': ':)' }
    const context = { context: { state: { sid: { id: 123 } } } }
    jest.doMock('../../../session-cache/cache-decorator.js', () => ({
      cacheDirect: () => {
        return {
          getData: () => {},
          setData: () => {}
        }
      }
    }))

    const { maxInputValidator } = await import('../max-input-validator.js')
    expect(await maxInputValidator(payload, context, 'enter-experience')).toBe(undefined)
  })
})
