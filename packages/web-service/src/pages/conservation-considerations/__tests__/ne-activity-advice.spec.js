import path from 'path'
import { compileTemplate } from '../../../initialise-snapshot-tests.js'

jest.spyOn(console, 'error').mockImplementation(() => null)

describe('the natural england activity advice functions', () => {
  beforeEach(() => jest.resetModules())

  describe('the getData function', () => {
    it('returns the advice details from the designated site', async () => {
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          DESIGNATED_SITES: {
            get: jest.fn(() => [{
              id: '344be97d-c928-4753-ae09-f8944ad9f228',
              designatedSiteId: 'fa5b8103-56a9-ed11-aad1-0022481b53bf',
              designatedSiteType: 100000001,
              adviceFromWho: 'Michelle',
              adviceDescription: 'Just do it'
            }])
          }
        }
      }))
      const request = {
        cache: () => ({
          getData: () => ({
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc',
            designatedSite: {
              designatedSiteId: 'fa5b8103-56a9-ed11-aad1-0022481b53bf',
              id: '344be97d-c928-4753-ae09-f8944ad9f228'
            }
          })
        })
      }
      const { getData } = await import('../ne-activity-advice.js')
      const result = await getData(request)
      expect(result).toEqual({
        'advice-description': 'Just do it',
        'advice-from-who': 'Michelle'
      })
    })
  })

  describe('ne-activity-advice page template', () => {
    it('Matches the snapshot', async () => {
      const template = await compileTemplate(path.join(__dirname, '../ne-activity-advice.njk'))

      const renderedHtml = template.render({
        data: {
          'advice-description': 'Just do it',
          'advice-from-who': 'Michelle'
        }
      })

      expect(renderedHtml).toMatchSnapshot()
    })
  })

  describe('the setData function', () => {
    it('sets the data in the designated site', async () => {
      const mockUpdate = jest.fn()
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          DESIGNATED_SITES: {
            get: jest.fn(() => [{
              id: '344be97d-c928-4753-ae09-f8944ad9f228',
              designatedSiteId: 'fa5b8103-56a9-ed11-aad1-0022481b53bf',
              designatedSiteType: 100000001
            }]),
            update: mockUpdate
          }
        }
      }))
      const request = {
        payload: {
          'advice-description': 'Just do it',
          'advice-from-who': 'Michelle'
        },
        cache: () => ({
          getData: () => ({
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc',
            designatedSite: {
              designatedSiteId: 'fa5b8103-56a9-ed11-aad1-0022481b53bf',
              id: '344be97d-c928-4753-ae09-f8944ad9f228'
            }
          })
        })
      }

      const { setData } = await import('../ne-activity-advice.js')
      await setData(request)
      expect(mockUpdate).toHaveBeenCalledWith('26a3e94f-2280-4ea5-ad72-920d53c110fc',
        '344be97d-c928-4753-ae09-f8944ad9f228', {
          adviceDescription: 'Just do it',
          adviceFromWho: 'Michelle',
          designatedSiteId: 'fa5b8103-56a9-ed11-aad1-0022481b53bf',
          designatedSiteType: 100000001,
          id: '344be97d-c928-4753-ae09-f8944ad9f228'
        })
    })
  })
})
