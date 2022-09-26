
describe('The put-habitat-by-id utility', () => {
  beforeEach(() => jest.resetModules())

  describe('put-habitat-by-id function', () => {
    it('correctly adds the data to the correct habitat entry', async () => {
      const journeyData = {
        applicationId: '1bfe075b-377e-472b-b160-a6a454648e23',
        habitatData: {
          id: '56ea844c-a2ba-4af8-9b2d-425a9e1c21c8'
        }
      }

      const mockPut = jest.fn(() => {})
      jest.doMock('../../../../../services/api-requests.js', () => ({
        APIRequests: {
          HABITAT: {
            putHabitatById: mockPut
          }
        }
      }))

      const { putHabitatById } = await import('../put-habitat-by-id.js')
      await putHabitatById(journeyData)
      expect(mockPut).toHaveBeenCalledWith('1bfe075b-377e-472b-b160-a6a454648e23',
        '56ea844c-a2ba-4af8-9b2d-425a9e1c21c8',
        { id: '56ea844c-a2ba-4af8-9b2d-425a9e1c21c8' }
      )
    })
  })
})
