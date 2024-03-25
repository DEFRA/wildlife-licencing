import path from 'path'
import { compileTemplate } from '../../../initialise-snapshot-tests.js'

describe('conviction details page handler', () => {
  beforeEach(() => jest.resetModules())
  it('getData returns the detailsOfConvictions of a conviction', async () => {
    jest.doMock('../../../services/api-requests.js', () => ({
      APIRequests: {
        APPLICATION: {
          getById: () => {
            return { isRelatedConviction: true, detailsOfConvictions: 'conviction', applicationId: '2342fce0-3067-4ca5-ae7a-23cae648e45c' }
          }
        }
      }
    }))
    const request = {
      cache: () => ({
        getData: () => {
          return { applicationId: '2342fce0-3067-4ca5-ae7a-23cae648e45c' }
        }
      })
    }

    const { getData } = await import('../conviction-details/conviction-details.js')
    expect(await getData(request)).toStrictEqual({ detailsOfConvictions: 'conviction' })
  })

  describe('conviction details page template', () => {
    it('Matches the snapshot', async () => {
      const template = await compileTemplate(path.join(__dirname, '../conviction-details/conviction-details.njk'))

      const renderedHtml = template.render({
        data: { detailsOfConvictions: 'conviction' }
      })

      expect(renderedHtml).toMatchSnapshot()
    })
  })

  it('setData - update application with details of convictions', async () => {
    const mockUpdate = jest.fn()
    jest.doMock('../../../services/api-requests.js', () => ({
      APIRequests: {
        APPLICATION: {
          getById: () => {
            return { isRelatedConviction: true, applicationId: '2342fce0-3067-4ca5-ae7a-23cae648e45c' }
          },
          update: mockUpdate
        }
      }
    }))
    const request = {
      payload: {
        'conviction-details': 'conviction'
      },
      cache: () => ({
        getData: () => {
          return { applicationId: '2342fce0-3067-4ca5-ae7a-23cae648e45c' }
        }
      })
    }

    const { setData } = await import('../conviction-details/conviction-details.js')
    await setData(request)
    expect(mockUpdate).toHaveBeenCalledWith('2342fce0-3067-4ca5-ae7a-23cae648e45c', {
      isRelatedConviction: true,
      detailsOfConvictions: 'conviction',
      applicationId: '2342fce0-3067-4ca5-ae7a-23cae648e45c'
    })
  })

  it('should redirect user to convictions check answers page', async () => {
    const request = {}

    const { completion } = await import('../conviction-details/conviction-details.js')
    expect(await completion(request)).toBe('/convictions-check-answers')
  })
})
