
describe('The habitat activities page', () => {
  beforeEach(() => jest.resetModules())

  describe('habitat-activities page', () => {
    it('the habitat-activities page forwards onto check-habitat-answers page', async () => {
      const { completion } = await import('../habitat-activities.js')
      expect(await completion()).toBe('/check-habitat-answers')
    })

    it('the habitat-activities page delivers the correct data from the getData call', async () => {
      const { getData } = await import('../habitat-activities.js')
      const { PowerPlatformKeys } = await import('@defra/wls-powerapps-keys')
      const { METHOD_IDS } = PowerPlatformKeys
      expect(await getData()).toEqual(METHOD_IDS)
    })
    it('if the user doesnt input a method - it raises an error', async () => {
      try {
        const payload = {}
        const { validator } = await import('../habitat-activities.js')
        expect(await validator(payload))
      } catch (e) {
        expect(e.message).toBe('ValidationError')
        expect(e.details[0].message).toBe('Error: no way of affecting the sett has been selected')
      }
    })
    it('if the user does input a method - it returns nothing', async () => {
      try {
        const payload = { 'habitat-activities': 'move the badgers' }
        const { validator } = await import('../habitat-activities.js')
        expect(await validator(payload)).toBe(undefined)
      } catch (e) {
        expect(e.message).toBe('ValidationError')
        expect(e.details[0].message).toBe('Error: no way of affecting the sett has been selected')
      }
    })
  })
})
