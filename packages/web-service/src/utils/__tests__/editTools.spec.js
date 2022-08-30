
describe('The editTools utility', () => {
  beforeEach(() => jest.resetModules())

  describe('changeHandler function', () => {
    it('picks the correct data object and returns it', async () => {
      jest.doMock('../../services/api-requests.js', () => ({
        APIRequests: {
          HABITAT: {
            getHabitatsById: () => ([{
              id: '56ea844c-a2ba-4af8-9b2d-425a9e1c21c8'
            },
            {
              id: '1bfe075b-377e-472b-b160-a6a454648e23'
            }])
          }
        }
      }))
      const { changeHandler } = await import('../editTools.js')
      expect(await changeHandler({}, '1bfe075b-377e-472b-b160-a6a454648e23')).toStrictEqual({
        habitatData: {
          id: '1bfe075b-377e-472b-b160-a6a454648e23'
        }
      })
    })
  })
  describe('putData function', () => {
    it('correctly adds the data to the correct habitat entry', async () => {
      const journeyData = {
        applicationId: '1bfe075b-377e-472b-b160-a6a454648e23',
        habitatData: {
          id: '56ea844c-a2ba-4af8-9b2d-425a9e1c21c8'
        }
      }
      const mockPut = jest.fn(() => {})
      jest.doMock('../../services/api-requests.js', () => ({
        APIRequests: {
          HABITAT: {
            putHabitatById: mockPut
          }
        }
      }))
      const { putData } = await import('../editTools.js')
      await putData(journeyData)
      expect(mockPut).toHaveBeenCalledWith('1bfe075b-377e-472b-b160-a6a454648e23',
        '56ea844c-a2ba-4af8-9b2d-425a9e1c21c8',
        { id: '56ea844c-a2ba-4af8-9b2d-425a9e1c21c8' })
    })
  })
})
