import { settDistruptionMethods } from '../../../../utils/sett-disturb-methods.js'

describe('The habitat activities page', () => {
  beforeEach(() => jest.resetModules())

  describe('habitat-activities page', () => {
    it('the habitat-activities page forwards onto check-habitat-answers page', async () => {
      const { completion } = await import('../habitat-activities.js')
      expect(await completion()).toBe('/check-habitat-answers')
    })

    it('the habitat-activities page delivers the correct data from the getData call', async () => {
      const { getData } = await import('../habitat-activities.js')
      const expected = settDistruptionMethods
      expect(await getData()).toEqual(expected)
    })

    it('if the user doesnt fill a checkbox - it raises an error', async () => {
      try {
        const payload = { 'habitat-activities': '' }
        const { validator } = await import('../habitat-activities.js')
        expect(await validator(payload))
      } catch (e) {
        expect(e.message).toBe('ValidationError')
        expect(e.details[0].message).toBe('Error: no way of affecting the sett has been selected')
      }
    })

    it('if the user fills out a checkbox - validator returns nothing', async () => {
      const payload = { 'habitat-activities': 'Obstruct the sett with a gate' }
      const { validator } = await import('../habitat-activities.js')
      expect(await validator(payload)).toBe(undefined)
    })

    it('sets data correctly', async () => {
      const mockSet = jest.fn()
      const mockCreate = jest.fn()
      const request = {
        cache: () => ({
          setData: mockSet,
          getData: () => ({
            habitatData: {
              numberOfEntrances: 10,
              numberOfActiveEntrances: 5
            }
          }),
          getPageData: () => ({
            payload: {
              'habitat-activities': [1000000, 10000001]
            }
          })
        })
      }
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: ({
          HABITAT: {
            create: mockCreate
          }
        })
      }))

      jest.doMock('uuid', () => ({
        v4: () => '56ea844c-a2ba-4af8-9b2d-425a9e1c21c8'
      }))
      const { setData } = await import('../habitat-activities.js')
      await setData(request)
      expect(mockSet).toHaveBeenCalledWith({
        habitatData: {
          numberOfEntrances: 10,
          numberOfActiveEntrances: 5,
          speciesId: 'fedb14b6-53a8-ec11-9840-0022481aca85',
          activityId: '68855554-59ed-ec11-bb3c-000d3a0cee24',
          methodIds: [1000000, 10000001],
          active: true
        }
      })
      expect(mockCreate).toHaveBeenCalledTimes(1)
    })
  })
})
