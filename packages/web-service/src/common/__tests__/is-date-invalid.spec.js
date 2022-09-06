
describe('invalid-date function tests', () => {
  beforeEach(() => jest.resetModules())

  it('returns false if passed a valid date', async () => {
    const { isDateInvalid } = await import('../is-date-invalid.js')
    expect(isDateInvalid(11, 7, '11-7-2022')).toBe(false)
  })

  it('returns true if passed a-z characters in the day', async () => {
    const { isDateInvalid } = await import('../is-date-invalid.js')
    expect(isDateInvalid('11a', 7, '11a-7-2022')).toBe(true)
  })

  it('returns true if passed a-z characters in the month', async () => {
    const { isDateInvalid } = await import('../is-date-invalid.js')
    expect(isDateInvalid(11, '7a', '11-7a-2022')).toBe(true)
  })

  it('returns true if passed a-z characters in the year', async () => {
    const { isDateInvalid } = await import('../is-date-invalid.js')
    expect(isDateInvalid(11, 7, '11-7-2022a')).toBe(true)
  })

  it('returns true if passed a day above 31', async () => {
    const { isDateInvalid } = await import('../is-date-invalid.js')
    expect(isDateInvalid(32, 7, '31-7-2022')).toBe(true)
  })

  it('returns true if passed a day of 0', async () => {
    const { isDateInvalid } = await import('../is-date-invalid.js')
    expect(isDateInvalid(0, 7, '0-7-2022')).toBe(true)
  })

  it('returns true if passed a negative day', async () => {
    const { isDateInvalid } = await import('../is-date-invalid.js')
    expect(isDateInvalid(-1, 7, '-1-7-2022')).toBe(true)
  })

  it('returns true if passed a month greater than 12', async () => {
    const { isDateInvalid } = await import('../is-date-invalid.js')
    expect(isDateInvalid(11, 13, '11-13-2022')).toBe(true)
  })

  it('returns true if passed a month of 0', async () => {
    const { isDateInvalid } = await import('../is-date-invalid.js')
    expect(isDateInvalid(11, 0, '11-7-2022')).toBe(true)
  })

  it('returns true if passed a negative month', async () => {
    const { isDateInvalid } = await import('../is-date-invalid.js')
    expect(isDateInvalid(11, -1, '11--1-2022')).toBe(true)
  })

  it('returns true if passed no arguments', async () => {
    const { isDateInvalid } = await import('../is-date-invalid.js')
    expect(isDateInvalid()).toBe(true)
  })
})
