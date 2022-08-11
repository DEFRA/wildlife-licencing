describe('The habitat grid ref page', () => {
  beforeEach(() => jest.resetModules())

  describe('habitat-grid-ref page', () => {
    it('the habitat-grid-ref page forwards onto habitat-work-start', async () => {
      const { completion } = await import('../habitat-grid-ref.js')
      expect(await completion()).toBe('/habitat-work-start')
    })
  })

  it('the habitat-grid-ref page validates an empty string correctly', async () => {
    const { validator } = await import('../habitat-grid-ref.js')
    try {
      await validator({ 'habitat-grid-ref': '' })
    } catch (e) {
      expect(e.message).toBe('ValidationError')
      expect(e.details[0].message).toBe('Error: no grid ref has been sent')
    }
  })

  it('the habitat-grid-ref page validates an invalid grid ref (of strings) correctly', async () => {
    const { validator } = await import('../habitat-grid-ref.js')
    try {
      await validator({ 'habitat-grid-ref': 'aaaaaaaa' })
    } catch (e) {
      expect(e.message).toBe('ValidationError')
      expect(e.details[0].message).toBe('Error: grid ref is invalid')
    }
  })

  it('the habitat-grid-ref page validates an invalid grid ref (of numbers) correctly', async () => {
    const { validator } = await import('../habitat-grid-ref.js')
    try {
      await validator({ 'habitat-grid-ref': '12121212' })
    } catch (e) {
      expect(e.message).toBe('ValidationError')
      expect(e.details[0].message).toBe('Error: grid ref is invalid')
    }
  })

  it('the habitat-grid-ref page validates a wrong length grid-ref correctly', async () => {
    const { validator } = await import('../habitat-grid-ref.js')
    try {
      await validator({ 'habitat-grid-ref': 'NY39555' })
    } catch (e) {
      expect(e.message).toBe('ValidationError')
      expect(e.details[0].message).toBe('Error: grid ref is invalid')
    }
  })

  it('the habitat-grid-ref page validates a wrong length grid-ref correctly', async () => {
    const { validator } = await import('../habitat-grid-ref.js')
    expect(await validator({ 'habitat-grid-ref': 'NY395551' })).toBe(null)
  })
})
