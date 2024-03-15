describe('The habitat name page', () => {
  beforeEach(() => jest.resetModules())

  describe('habitat-name page', () => {
    it('the habitat-name page forwards onto habitat-types page', async () => {
      const { completion } = await import('../sett-name.js')
      expect(await completion()).toBe('/sett-use-category')
    })

    it('sets the name correctly', async () => {
      const mockSetData = jest.fn()
      const request = {
        cache: () => ({
          setData: mockSetData,
          getData: () => ({
            habitatData: {}
          }),
          getPageData: () => ({
            payload: {
              'habitat-name': 'Badgerland'
            }
          })
        })
      }
      const { setData } = await import('../sett-name.js')
      await setData(request)
      expect(mockSetData).toHaveBeenCalledWith({
        habitatData:
          { name: 'Badgerland' }
      })
    })

    it('sets the name correctly if no journey data exists', async () => {
      const mockSetData = jest.fn()
      const request = {
        cache: () => ({
          setData: mockSetData,
          getData: () => ({
            habitatData: undefined
          }),
          getPageData: () => ({
            payload: {
              'habitat-name': 'Badgerland'
            }
          })
        })
      }
      const { setData } = await import('../sett-name.js')
      await setData(request)
      expect(mockSetData).toHaveBeenCalledWith({
        habitatData:
          { name: 'Badgerland' }
      })
    })

    it('getData returns the correct object', async () => {
      const result = { habitatData: { name: 'The corner of my garden' } }
      const request = {
        cache: () => ({
          getData: () => {
            return result
          }
        })
      }

      const { getData } = await import('../sett-name.js')
      expect(await getData(request)).toStrictEqual({ name: result.habitatData.name })
    })
  })
})
