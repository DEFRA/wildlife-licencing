import { PowerPlatformKeys } from '@defra/wls-powerapps-keys'
import { compileTemplate } from '../../../../../initialise-snapshot-tests.js'
import path from 'path'
const { METHOD_IDS: { OBSTRUCT_SETT_WITH_GATES, OBSTRUCT_SETT_WITH_BLOCK_OR_PROOF, DAMAGE_A_SETT, DESTROY_A_SETT, DISTURB_A_SETT } } = PowerPlatformKeys

describe('The habitat activities page', () => {
  beforeEach(() => jest.resetModules())

  describe('habitat-activities page', () => {
    it('the habitat-activities page forwards onto check-habitat-answers page on primary journey', async () => {
      const { completion } = await import('../habitat-activities.js')
      expect(await completion()).toBe('/check-habitat-answers')
    })

    it('the habitat-activities page forwards onto check-habitat-answers if no errors on return journey', async () => {
      const request = {
        cache: () => ({
          getData: () => ({}),
          getPageData: () => ({})
        })
      }
      const { completion } = await import('../habitat-activities.js')
      expect(await completion(request)).toBe('/check-habitat-answers')
    })

    it('getData grabs habitat data from the cache when it is available', async () => {
      const cacheGetDataMock = jest.fn().mockResolvedValue({
        applicationId: '123',
        habitatData: {
          methodIds: [100000010, 100000011]
        }
      })

      const request = {
        query: {
          id: '123'
        },
        cache: () => ({
          getData: cacheGetDataMock
        })
      }

      const getHabitatBySettIdMock = jest.fn()

      const { getData } = await import('../habitat-activities.js')
      expect(await getData(request)).toEqual({
        OBSTRUCT_SETT_WITH_GATES,
        OBSTRUCT_SETT_WITH_BLOCK_OR_PROOF,
        DAMAGE_A_SETT,
        DESTROY_A_SETT,
        DISTURB_A_SETT,
        methodIds: [100000010, 100000011]
      })

      expect(cacheGetDataMock).toHaveBeenCalled()
      expect(getHabitatBySettIdMock).not.toHaveBeenCalled()
    })

    describe('The habitat activities template', () => {
      it('Matches the snapshot', async () => {
        const template = await compileTemplate(path.join(__dirname, '../habitat-activities.njk'))

        const renderedHtml = template.render({
          data: {
            OBSTRUCT_SETT_WITH_GATES,
            OBSTRUCT_SETT_WITH_BLOCK_OR_PROOF,
            DAMAGE_A_SETT,
            DESTROY_A_SETT,
            DISTURB_A_SETT,
            methodIds: [100000010, 100000011]
          }
        })

        expect(renderedHtml).toMatchSnapshot()
      })
    })

    it('getData grabs habitat data from the database when the data is not available in the cache', async () => {
      const settId = '123'
      const applicationId = '321'
      const request = {
        query: {
          id: settId
        },
        cache: () => ({
          getData: () => {
            return {
              applicationId: applicationId,
              habitatData: {
                methodIds: null
              }
            }
          }
        })
      }
      const getHabitatBySettIdMock = jest.fn().mockResolvedValue({
        methodIds: [100000010, 100000011]
      })

      jest.doMock('../../../../../services/api-requests.js', () => ({
        APIRequests: {
          HABITAT: {
            getHabitatBySettId: getHabitatBySettIdMock
          }
        }
      }))

      const { getData } = await import('../habitat-activities.js')
      expect(await getData(request)).toEqual({
        OBSTRUCT_SETT_WITH_GATES,
        OBSTRUCT_SETT_WITH_BLOCK_OR_PROOF,
        DAMAGE_A_SETT,
        DESTROY_A_SETT,
        DISTURB_A_SETT,
        methodIds: [100000010, 100000011]
      })

      expect(getHabitatBySettIdMock).toHaveBeenCalledWith(applicationId, settId)
    })

    it('getData returns no habitat data on primary journey', async () => {
      const applicationId = '321'
      const request = {
        query: { },
        cache: () => ({
          getData: () => {
            return {
              applicationId,
              habitatData: {
                methodIds: null
              }
            }
          }
        })
      }

      const { getData } = await import('../habitat-activities.js')
      expect(await getData(request)).toEqual({
        OBSTRUCT_SETT_WITH_GATES,
        OBSTRUCT_SETT_WITH_BLOCK_OR_PROOF,
        DAMAGE_A_SETT,
        DESTROY_A_SETT,
        DISTURB_A_SETT,
        methodIds: []
      })
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

    it('sets data correctly on primary journey', async () => {
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

      jest.doMock('../../../../../services/api-requests.js', () => ({
        tagStatus: {
          COMPLETE: 'complete'
        },
        APIRequests: ({
          HABITAT: {
            create: mockCreate
          },
          APPLICATION: {
            tags: () => {
              return {
                get: () => 'in-progress',
                set: () => jest.fn()
              }
            }
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
          speciesSubjectId: '60ce79d8-87fb-ec11-82e5-002248c5c45b',
          activityId: '68855554-59ed-ec11-bb3c-000d3a0cee24',
          methodIds: [1000000, 10000001]
        }
      })
      expect(mockCreate).toHaveBeenCalledTimes(1)
    })

    it('sets the activities data correctly on return journey', async () => {
      const mockSetData = jest.fn()
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
              'habitat-activities': [1000000, 10000001]
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

      jest.doMock('../../../../../services/api-requests.js', () => ({
        tagStatus: {
          COMPLETE: 'complete'
        },
        APIRequests: {
          APPLICATION: {
            tags: () => {
              return {
                get: () => 'complete'
              }
            }
          }
        }
      }))

      const { setData } = await import('../habitat-activities.js')
      await setData(request)
      expect(mockSetData).toHaveBeenCalledWith({
        redirectId: '1e470963-e8bf-41f5-9b0b-52d19c21cb75',
        habitatData:
          { methodIds: [1000000, 10000001] }
      })
    })
  })
})
