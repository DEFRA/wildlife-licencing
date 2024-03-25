import path from 'path'
import { compileTemplate } from '../../../initialise-snapshot-tests.js'

jest.spyOn(console, 'error').mockImplementation(() => null)

describe('the special area remove functions', () => {
  beforeEach(() => jest.resetModules())

  describe('the getData function', () => {
    it('returns the site name to be deleted', async () => {
      const mockSet = jest.fn()
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          DESIGNATED_SITES: {
            getDesignatedSites: jest.fn(() => [
              {
                id: 'fa5b8103-56a9-ed11-aad1-0022481b53bf',
                siteName: 'Ribble Estuary',
                siteType: 100000001
              }
            ]),
            get: jest.fn(() => [{
              id: '344be97d-c928-4753-ae09-f8944ad9f228',
              designatedSiteId: 'fa5b8103-56a9-ed11-aad1-0022481b53bf'
            }])
          }
        }
      }))
      const request = {
        query: { id: '344be97d-c928-4753-ae09-f8944ad9f228' },
        cache: () => ({
          getData: () => ({
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc'
          }),
          setData: mockSet
        })
      }
      const { getData } = await import('../designated-site-remove.js')
      const result = await getData(request)
      expect(result).toEqual({ name: 'Ribble Estuary SSSI' })
    })
  })

  describe('designated-site-remove page template', () => {
    it('Matches the snapshot', async () => {
      const template = await compileTemplate(path.join(__dirname, '../designated-site-remove.njk'))

      const renderedHtml = template.render({
        data: { name: 'Ribble Estuary SSSI' }
      })

      expect(renderedHtml).toMatchSnapshot()
    })
  })

  describe('the setData function', () => {
    it('if \'yes\' removes the site', async () => {
      const mockDestroy = jest.fn()
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          DESIGNATED_SITES: {
            destroy: mockDestroy
          }
        }
      }))
      const request = {
        payload: { 'yes-no': 'yes' },
        cache: () => ({
          setData: jest.fn(),
          getData: () => ({
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc',
            designatedSite: { id: '56ea844c-a2ba-4af8-9b2d-425a9e1c21c8' }
          })
        })
      }
      const { setData } = await import('../designated-site-remove.js')
      await setData(request)
      expect(mockDestroy).toHaveBeenCalledWith('26a3e94f-2280-4ea5-ad72-920d53c110fc', '56ea844c-a2ba-4af8-9b2d-425a9e1c21c8')
    })

    it('if \'no\' does nothing', async () => {
      const mockDestroy = jest.fn()
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          DESIGNATED_SITES: {
            destroy: mockDestroy
          }
        }
      }))
      const request = {
        payload: { 'yes-no': 'no' },
        cache: () => ({
          setData: jest.fn(),
          getData: () => ({
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc',
            designatedSite: { id: '56ea844c-a2ba-4af8-9b2d-425a9e1c21c8' }
          })
        })
      }
      const { setData } = await import('../designated-site-remove.js')
      await setData(request)
      expect(mockDestroy).not.toHaveBeenCalled()
    })
  })
})
