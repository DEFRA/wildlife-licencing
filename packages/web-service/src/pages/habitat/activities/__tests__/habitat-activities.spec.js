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
  })
})
