describe('The habitat grid ref page', () => {
  beforeEach(() => jest.resetModules())

  describe('sett-grif-reference page', () => {
    it('the sett-grif-reference page forwards onto start-date-licensed-activity-on-this-sett on primary journey', async () => {
      jest.doMock('../../../../../services/api-requests.js', () => ({
        tagStatus: {
          COMPLETE: 'complete'
        },
        APIRequests: ({
          APPLICATION: {
            tags: () => {
              return { get: () => 'in-progress' }
            }
          }
        })
      }))
      const request = {
        cache: () => ({
          getData: () => ({ applicationId: '123abc' })
        })
      }
      const { completion } = await import('../sett-grid-reference.js')
      expect(await completion(request)).toBe('/start-date-licensed-activity-on-this-sett')
    })

    it('the sett-grif-reference page forwards onto check-habitat-answers on return journey', async () => {
      jest.doMock('../../../../../services/api-requests.js', () => ({
        tagStatus: {
          COMPLETE: 'complete'
        },
        APIRequests: {
          APPLICATION: {
            tags: () => {
              return { get: () => 'complete' }
            }
          }
        }
      }))
      const request = {
        cache: () => ({
          getData: () => ({})
        })
      }
      const { completion } = await import('../sett-grid-reference.js')
      expect(await completion(request)).toBe('/check-habitat-answers')
    })

    it('sets the grid ref data correctly on primary journey', async () => {
      const mockSetData = jest.fn()
      jest.doMock('../../../../../services/api-requests.js', () => ({
        tagStatus: {
          COMPLETE: 'complete'
        },
        APIRequests: {
          APPLICATION: {
            tags: () => {
              return { get: () => 'in-progress' }
            }
          }
        }
      }))

      const request = {
        cache: () => ({
          setData: mockSetData,
          getData: () => ({
            habitatData: {}
          }),
          getPageData: () => ({
            payload: {
              'habitat-grid-ref': 'NY123456'
            }
          })
        })
      }
      const { setData } = await import('../sett-grid-reference.js')
      await setData(request)
      expect(mockSetData).toHaveBeenCalledWith({
        habitatData:
          { gridReference: 'NY123456' }
      })
    })

    it('sets the grid ref data correctly on return journey', async () => {
      const mockSetData = jest.fn()
      jest.doMock('../../../../../services/api-requests.js', () => ({
        tagStatus: {
          COMPLETE: 'complete'
        },
        APIRequests: {
          APPLICATION: {
            tags: () => {
              return { get: () => 'complete' }
            }
          }
        }
      }))

      const request = {
        query: {
          id: '1e470963-e8bf-41f5-9b0b-52d19c21cb75'
        },
        cache: () => ({
          setData: mockSetData,
          getData: () => ({
            habitatData: {}
          }),
          getPageData: () => ({
            payload: {
              'habitat-grid-ref': 'NY123456'
            }
          })
        })
      }

      jest.doMock('../../common/get-habitat-by-id.js', () => ({
        getHabitatById: () => {}
      }))

      jest.doMock('../../common/put-habitat-by-id.js', () => ({
        putHabitatById: () => {}
      }))

      const { setData } = await import('../sett-grid-reference.js')
      await setData(request)
      expect(mockSetData).toHaveBeenCalledWith({
        redirectId: '1e470963-e8bf-41f5-9b0b-52d19c21cb75',
        habitatData:
          { gridReference: 'NY123456' }
      })
    })

    it('getData returns the correct object', async () => {
      const result = { habitatData: { gridReference: 'NY395557' } }
      const request = {
        cache: () => ({
          getData: () => {
            return result
          }
        })
      }

      const { getData } = await import('../sett-grid-reference.js')
      expect(await getData(request)).toStrictEqual({ gridReference: result.habitatData.gridReference })
    })

    it('should throw an error when the user does not enter a habitat grid refernce', async () => {
      try {
        const payload = { 'habitat-grid-ref': '' }
        const { validator } = await import('../sett-grid-reference.js')
        expect(await validator(payload))
      } catch (e) {
        expect(e.message).toBe('ValidationError')
        expect(e.details[0].message).toBe('Error: You have not entered a grid reference')
      }
    })

    it('should throw an error when the habitat grid reference is wrong', async () => {
      try {
        const payload = { 'habitat-grid-ref': 'N123456' }
        const { validator } = await import('../sett-grid-reference.js')
        expect(await validator(payload))
      } catch (e) {
        expect(e.message).toBe('ValidationError')
        expect(e.details[0].message).toBe('Error: The grid reference you have entered is not in the right format')
      }
    })

    it('should throw an when the user enters the habitat grid reference does not exist', async () => {
      try {
        const payload = { 'habitat-grid-ref': 'hh123456' }
        const { validator } = await import('../sett-grid-reference.js')
        expect(await validator(payload))
      } catch (e) {
        expect(e.message).toBe('ValidationError')
        expect(e.details[0].message).toBe('Error: The reference you have entered is not an existing grid reference')
      }
    })

    it('should not throw an error for a correct grid reference of the habitat', async () => {
      const payload = { 'habitat-grid-ref': 'NY395557' }
      const { validator } = await import('../sett-grid-reference.js')
      expect(await validator(payload)).toBeUndefined()
    })
  })
})
