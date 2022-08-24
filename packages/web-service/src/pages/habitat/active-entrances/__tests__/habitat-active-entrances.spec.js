
describe('The habitat active entrances page', () => {
  beforeEach(() => jest.resetModules())

  describe('habitat-active-entrances page', () => {
    it('the habitat-active-entrances page forwards onto habitat-grid-ref page if theres no errors', async () => {
      const request = {
        cache: () => {
          return {
            getPageData: () => {
              return {}
            }
          }
        }
      }
      const { completion } = await import('../habitat-active-entrances.js')
      expect(await completion(request)).toBe('/habitat-grid-ref')
    })

    it('the habitat-active-entrances page stays on the habitat-active-entrances page if there are errors', async () => {
      const request = {
        cache: () => {
          return {
            getPageData: () => {
              return { error: 'there were problems with user input' }
            }
          }
        }
      }
      const { completion } = await import('../habitat-active-entrances.js')
      expect(await completion(request)).toBe('/habitat-active-entrances')
    })

    it('sets the active entrance data correctly', async () => {
      const mockSetData = jest.fn()
      const request = {
        cache: () => ({
          setData: mockSetData,
          getData: () => ({
            habitatData: {}
          }),
          getPageData: () => ({
            payload: {
              'habitat-active-entrances': 99
            }
          })
        })
      }
      const { setData } = await import('../habitat-active-entrances.js')
      await setData(request)
      expect(mockSetData).toHaveBeenCalledWith({
        habitatData:
        { numberOfActiveEntrances: 99 }
      })
    })
  })
})
