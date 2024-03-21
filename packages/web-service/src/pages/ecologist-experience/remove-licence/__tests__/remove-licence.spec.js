import path from 'path'
import { compileTemplate } from '../../../../initialise-snapshot-tests.js'

describe('The remove licence page', () => {
  beforeEach(() => jest.resetModules())

  describe('completion function', () => {
    it('returns the licence uri if user selects yes', async () => {
      const { completion } = await import('../remove-licence.js')
      expect(completion()).toBe('/previous-individual-badger-licence-details')
    })
  })

  describe('get data function', () => {
    it('returns the licence number', async () => {
      const request = {
        query: {
          licence: 'A1234'
        },
        cache: () => ({
          getData: () => ({
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc'
          }),
          setData: jest.fn()
        })
      }
      const { getData } = await import('../remove-licence.js')
      expect(await getData(request)).toBe('A1234')
    })
  })

  describe('The remove licence page template', () => {
    it('Matches the snapshot', async () => {
      const template = await compileTemplate(path.join(__dirname, '../remove-licence.njk'))

      const renderedHtml = template.render({
        data: 'A1234'
      })

      expect(renderedHtml).toMatchSnapshot()
    })
  })

  describe('set data function', () => {
    it('does not delete a licence if the user selects \'no\'', async () => {
      const mockPut = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          ECOLOGIST_EXPERIENCE: {
            getExperienceById: jest.fn(() => ({ licenceDetails: ['AZ1234'] })),
            putExperienceById: mockPut
          }
        }
      }))
      const mockSet = jest.fn()
      const request = {
        payload: {
          'remove-licence': 'no'
        },
        query: {
          licence: 'AZ1234'
        },
        cache: () => ({
          getData: () => ({
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc',
            ecologistExperienceTemp: { licence: 'AZ1234' }
          }),
          setData: mockSet
        })
      }
      const { setData } = await import('../remove-licence.js')
      await setData(request)
      expect(mockSet).toHaveBeenCalledWith({ applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc' })
      expect(mockPut).toHaveBeenCalledTimes(0)
    })

    it('does deletes a licence if the user selects \'yes\' - for the last licence', async () => {
      const mockRemove = jest.fn()
      const mockPut = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          ECOLOGIST_EXPERIENCE: {
            removePreviousLicence: mockRemove,
            getPreviousLicences: () => [],
            getExperienceById: () => ({}),
            putExperienceById: mockPut
          }
        }
      }))
      const mockSet = jest.fn()
      const request = {
        payload: {
          'remove-licence': 'yes'
        },
        query: {
          licence: 'AZ1234'
        },
        cache: () => ({
          getData: () => ({
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc',
            ecologistExperienceTemp: { licence: 'AZ1234' }
          }),
          setData: mockSet
        })
      }
      const { setData } = await import('../remove-licence.js')
      await setData(request)
      expect(mockSet).toHaveBeenCalledWith({ applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc' })
      expect(mockRemove).toHaveBeenCalledWith('26a3e94f-2280-4ea5-ad72-920d53c110fc', 'AZ1234')
      expect(mockPut).toHaveBeenCalledWith('26a3e94f-2280-4ea5-ad72-920d53c110fc', { previousLicence: false, previousLicencesAllRemoved: true })
    })

    it('does deletes a licence if the user selects \'yes\' - licences remaining', async () => {
      const mockRemove = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          ECOLOGIST_EXPERIENCE: {
            removePreviousLicence: mockRemove,
            getPreviousLicences: () => [{ id: '739f4e35-9e06-4585-b52a-c4144d94f7f7' }]
          }
        }
      }))
      const mockSet = jest.fn()
      const request = {
        payload: {
          'remove-licence': 'yes'
        },
        query: {
          licence: 'AZ1234'
        },
        cache: () => ({
          getData: () => ({
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc',
            ecologistExperienceTemp: { licence: 'AZ1234' }
          }),
          setData: mockSet
        })
      }
      const { setData } = await import('../remove-licence.js')
      await setData(request)
      expect(mockSet).toHaveBeenCalledWith({ applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc' })
      expect(mockRemove).toHaveBeenCalledWith('26a3e94f-2280-4ea5-ad72-920d53c110fc', 'AZ1234')
    })
  })
})
