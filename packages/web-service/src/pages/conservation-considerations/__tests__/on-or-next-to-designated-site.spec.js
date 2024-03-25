import path from 'path'
import { compileTemplate } from '../../../initialise-snapshot-tests.js'

jest.spyOn(console, 'error').mockImplementation(() => null)

describe('the on or next to designated site start functions', () => {
  beforeEach(() => jest.resetModules())

  describe('the getData function', () => {
    it('returns the onOrNextToDesignatedSite flag', async () => {
      const request = {
        cache: () => ({
          getData: () => ({
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc'
          })
        })
      }
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICATION: {
            getById: jest.fn(() => ({
              onOrNextToDesignatedSite: true
            })),
            tags: () => ({
              set: () => jest.fn()
            })
          }
        }
      }))

      const { getData } = await import('../on-or-next-to-designated-site.js')
      const result = await getData(request)
      expect(result).toEqual({ yesNo: 'yes' })
    })
  })

  describe('on-or-next-to-designated-site page template', () => {
    it('Matches the snapshot', async () => {
      const template = await compileTemplate(path.join(__dirname, '../on-or-next-to-designated-site.njk'))

      const renderedHtml = template.render({
        data: { yesNo: 'yes' }
      })

      expect(renderedHtml).toMatchSnapshot()
    })
  })

  describe('the setData function', () => {
    it('stores the onOrNextToDesignatedSite flag', async () => {
      const mockUpdate = jest.fn()
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICATION: {
            getById: jest.fn(() => ({
              foo: 'bar',
              onOrNextToDesignatedSite: false
            })),
            update: mockUpdate
          }
        }
      }))
      const request = {
        payload: { 'yes-no': 'yes' },
        cache: () => ({
          getData: () => ({
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc'
          })
        })
      }

      const { setData } = await import('../on-or-next-to-designated-site.js')
      await setData(request)
      expect(mockUpdate).toHaveBeenCalledWith('26a3e94f-2280-4ea5-ad72-920d53c110fc', { foo: 'bar', onOrNextToDesignatedSite: true })
    })
  })

  describe('the completion function', () => {
    it('redirects to the check answers page if answer is no', async () => {
      const { completion } = await import('../on-or-next-to-designated-site.js')
      const request = {
        payload: { 'yes-no': 'no' }
      }
      const result = await completion(request)
      expect(result).toEqual('/designated-site-check-answers')
    })

    it('redirects to the start page if answer is yes', async () => {
      const { completion } = await import('../on-or-next-to-designated-site.js')
      const request = {
        payload: { 'yes-no': 'yes' }
      }
      const result = await completion(request)
      expect(result).toEqual('/designated-site-start')
    })
  })
})
