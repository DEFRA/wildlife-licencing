import path from 'path'
import { compileTemplate } from '../../../initialise-snapshot-tests.js'

jest.spyOn(console, 'error').mockImplementation(() => null)

describe('the designated site proximity functions', () => {
  beforeEach(() => jest.resetModules())

  const testData = {
    proximity: 100000000,
    values: {
      NEXT_TO: 100000001,
      ON: 100000000
    }
  }

  describe('the getData function', () => {
    it('returns the onSiteOrCloseToSite details from the designated site', async () => {
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          DESIGNATED_SITES: {
            get: jest.fn(() => [{
              id: '344be97d-c928-4753-ae09-f8944ad9f228',
              designatedSiteId: 'fa5b8103-56a9-ed11-aad1-0022481b53bf',
              designatedSiteType: 100000001,
              onSiteOrCloseToSite: 100000000
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
      const { getData } = await import('../designated-site-proximity.js')
      const result = await getData(request)
      expect(result).toEqual(testData)
    })
  })

  describe('designated-site-proximity page template', () => {
    it('Matches the snapshot', async () => {
      const template = await compileTemplate(path.join(__dirname, '../designated-site-proximity.njk'))

      const renderedHtml = template.render({
        data: testData
      })

      expect(renderedHtml).toMatchSnapshot()
    })
  })

  describe('the setData function', () => {
    it('sets the onSiteOrCloseToSite details', async () => {
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
        payload: { proximity: '100000001' },
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
      const { setData } = await import('../designated-site-proximity.js')
      await setData(request)
      expect(mockUpdate).toHaveBeenCalledWith('26a3e94f-2280-4ea5-ad72-920d53c110fc',
        '344be97d-c928-4753-ae09-f8944ad9f228',
        {
          designatedSiteId: 'fa5b8103-56a9-ed11-aad1-0022481b53bf',
          designatedSiteType: 100000001,
          onSiteOrCloseToSite: 100000001,
          id: '344be97d-c928-4753-ae09-f8944ad9f228'
        })
    })
  })
})
