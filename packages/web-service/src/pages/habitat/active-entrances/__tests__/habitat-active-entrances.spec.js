
describe('The habitat active entrances page', () => {
  beforeEach(() => jest.resetModules())

  describe('habitat-active-entrances page', () => {
    it('the habitat-active-entrances page forwards onto habitat-grid-ref page if theres no errors', async () => {
      const request = {
        cache: () => {
          return {
            getData: () => ({}),
            getPageData: () => ({})
          }
        }
      }
      const { completion } = await import('../habitat-active-entrances.js')
      expect(await completion(request)).toBe('/habitat-grid-ref')
    })
    it('the habitat-active-entrances page forwards onto check-habitat-answers with no errors on return journey', async () => {
      const request = {
        cache: () => ({
          getData: () => ({ complete: true }),
          getPageData: () => ({})
        })
      }
      const { completion } = await import('../habitat-active-entrances.js')
      expect(await completion(request)).toBe('/check-habitat-answers')
    })
    it('the habitat-active-entrances page stays on the habitat-active-entrances page if there are errors', async () => {
      const request = {
        cache: () => {
          return {
            getPageData: () => {
              return { error: 'there were problems with user input' }
            },
            getData: () => ({})
          }
        }
      }
      const { completion } = await import('../habitat-active-entrances.js')
      expect(await completion(request)).toBe('/habitat-active-entrances')
    })

    it('sets the active entrance data correctly on primary journey', async () => {
      const mockSetData = jest.fn()
      const request = {
        cache: () => ({
          setData: mockSetData,
          getData: () => ({
            habitatData: {
              numberOfEntrances: 50
            }
          }),
          getPageData: () => ({
            payload: {
              'habitat-active-entrances': 0
            }
          })
        })
      }
      const { setData } = await import('../habitat-active-entrances.js')
      await setData(request)
      expect(mockSetData).toHaveBeenCalledWith({
        habitatData:
        { numberOfActiveEntrances: 0, active: false, numberOfEntrances: 50 }
      })
    })
    it('sets the active entrance data correctly on return journey', async () => {
      const mockSetData = jest.fn()
      const request = {
        query: {
          id: '1e470963-e8bf-41f5-9b0b-52d19c21cb75'
        },
        cache: () => ({
          setData: mockSetData,
          getData: () => ({
            complete: true,
            habitatData: {
              numberOfEntrances: 10
            }
          }),
          getPageData: () => ({
            payload: {
              'habitat-active-entrances': 5
            }
          })
        })
      }
      jest.doMock('../../../../utils/editTools.js', () => ({
        changeHandler: () => {},
        putData: async () => {}
      }))
      const { setData } = await import('../habitat-active-entrances.js')
      await setData(request)
      expect(mockSetData).toHaveBeenCalledWith({
        complete: true,
        redirectId: '1e470963-e8bf-41f5-9b0b-52d19c21cb75',
        habitatData:
          { numberOfActiveEntrances: 5, active: true, numberOfEntrances: 10 }
      })
    })
    it('returns an error if more active entrances than entrances', async () => {
      const request = {
        cache: () => ({
          getData: () => ({
            complete: true,
            habitatData: {
              numberOfEntrances: 3
            }
          }),
          getPageData: () => ({
            payload: {
              'habitat-active-entrances': 5
            }
          }),
          setPageData: () => ({})
        })
      }
      try {
        const { setData } = await import('../habitat-active-entrances.js')
        expect(await setData(request))
      } catch (e) {
        expect(e.message).toBe('ValidationError')
        expect(e.details[0].message).toBe('Error: the date is invalid')
      }
    })
  })
})
