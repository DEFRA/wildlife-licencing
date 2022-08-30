
describe('The habitat types page', () => {
  beforeEach(() => jest.resetModules())

  describe('habitat types page', () => {
    it('the habitat types page forwards onto habitat-reopen page on primary journey', async () => {
      const request = {
        cache: () => ({
          getData: () => ({})
        })
      }
      const { completion } = await import('../habitat-types.js')
      expect(await completion(request)).toBe('/habitat-reopen')
    })
    it('the habitat-types page forwards onto check-habitat-answers on return journey', async () => {
      const request = {
        cache: () => ({
          getData: () => ({ complete: true })
        })
      }
      const { completion } = await import('../habitat-types.js')
      expect(await completion(request)).toBe('/check-habitat-answers')
    })
    it('sets the entrance data correctly on primary journey', async () => {
      const mockSetData = jest.fn()
      const request = {
        cache: () => ({
          setData: mockSetData,
          getData: () => ({
            habitatData: {}
          }),
          getPageData: () => ({
            payload: {
              'habitat-types': '100000011'
            }
          })
        })
      }
      const { setData } = await import('../habitat-types.js')
      await setData(request)
      expect(mockSetData).toHaveBeenCalledWith({
        habitatData:
          { settType: 100000011 }
      })
    })
    it('sets the type data correctly on return journey', async () => {
      const mockSetData = jest.fn()
      const request = {
        query: {
          id: '1e470963-e8bf-41f5-9b0b-52d19c21cb75'
        },
        cache: () => ({
          setData: mockSetData,
          getData: () => ({
            complete: true,
            habitatData: {}
          }),
          getPageData: () => ({
            payload: {
              'habitat-types': '100000011'
            }
          })
        })
      }
      jest.doMock('../../../../utils/editTools.js', () => ({
        changeHandler: () => {},
        putData: async () => {}
      }))
      const { setData } = await import('../habitat-types.js')
      await setData(request)
      expect(mockSetData).toHaveBeenCalledWith({
        complete: true,
        redirectId: '1e470963-e8bf-41f5-9b0b-52d19c21cb75',
        habitatData:
          { settType: 100000011 }
      })
    })
    it('getData returns the settTypes', async () => {
      const { getData } = await import('../habitat-types.js')
      const { settTypes } = await import('../../../../utils/sett-type.js')
      expect(getData()).toStrictEqual({ settTypes })
    })
  })
})
