
describe('is-date function tests', () => {
  beforeEach(() => jest.resetModules())

  it('returns true if passed a valid date', async () => {
    const date = '11-07-2022'
    const { isDate } = await import('../is-date.js')
    expect(isDate(date)).toBe(true)
  })

  it('returns false if passed the string badgers', async () => {
    const date = 'badgers'
    const { isDate } = await import('../is-date.js')
    expect(isDate(date)).toBe(false)
  })

  it('returns false if passed a date with a-z characters', async () => {
    const date = '40-1o-3022'
    const { isDate } = await import('../is-date.js')
    expect(isDate(date)).toBe(false)
  })

  it('returns false if passed an invalid date', async () => {
    const date = '40-10-3022'
    const { isDate } = await import('../is-date.js')
    expect(isDate(date)).toBe(false)
  })
})
