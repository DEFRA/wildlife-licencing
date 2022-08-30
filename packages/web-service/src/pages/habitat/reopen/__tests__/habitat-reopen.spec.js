describe('The habitat reopen page', () => {
  beforeEach(() => jest.resetModules())

  describe('habitat reopen page', () => {
    it('the habitat reopen page forwards onto habitat-entrances page on primary journey', async () => {
      const request = {
        cache: () => ({
          getData: () => ({})
        })
      }
      const { completion } = await import('../habitat-reopen.js')
      expect(await completion(request)).toBe('/habitat-entrances')
    })
    it('the habitat-reopen page forwards onto check-habitat-answers on return journey', async () => {
      const request = {
        cache: () => ({
          getData: () => ({ complete: true })
        })
      }
      const { completion } = await import('../habitat-reopen.js')
      expect(await completion(request)).toBe('/check-habitat-answers')
    })
    it('sets the reopen data correctly', async () => {
      const mockSetData = jest.fn()
      const request = {
        cache: () => ({
          setData: mockSetData,
          getData: () => ({
            habitatData: {}
          }),
          getPageData: () => ({
            payload: {
              'habitat-reopen': true
            }
          })
        })
      }
      const { setData } = await import('../habitat-reopen.js')
      await setData(request)
      expect(mockSetData).toHaveBeenCalledWith({
        habitatData:
          { willReopen: true }
      })
    })
    it('sets the reopen data correctly on return journey', async () => {
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
              'habitat-reopen': true
            }
          })
        })
      }
      jest.doMock('../../../../utils/editTools.js', () => ({
        changeHandler: () => {},
        putData: async () => {}
      }))
      const { setData } = await import('../habitat-reopen.js')
      await setData(request)
      expect(mockSetData).toHaveBeenCalledWith({
        complete: true,
        redirectId: '1e470963-e8bf-41f5-9b0b-52d19c21cb75',
        habitatData:
          { willReopen: true }
      })
    })
  })
})
