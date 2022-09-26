
describe('The get-habitat-by-id utility', () => {
  beforeEach(() => jest.resetModules())

  describe('get-habitat-by-id function', () => {
    it('picks the correct data object and returns it', async () => {
      jest.doMock('../../../../../services/api-requests.js', () => ({

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

      const { getHabitatById } = await import('../get-habitat-by-id.js')
      expect(await getHabitatById({}, '1bfe075b-377e-472b-b160-a6a454648e23')).toStrictEqual({
        habitatData: {
          id: '1bfe075b-377e-472b-b160-a6a454648e23'
        }
      })
    })
  })
})
