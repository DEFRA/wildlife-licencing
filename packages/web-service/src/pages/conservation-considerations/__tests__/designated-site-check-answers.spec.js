jest.spyOn(console, 'error').mockImplementation(() => null)

describe('the sssi check answers functions', () => {
  beforeEach(() => jest.resetModules())

  describe('the getData function', () => {
    it('returns the data to populate the summary table', async () => {
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICATION: {
            tags: () => ({ set: jest.fn() })
          },
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
              designatedSiteId: 'fa5b8103-56a9-ed11-aad1-0022481b53bf',
              designatedSiteType: 100000001,
              permissionFromOwner: true,
              detailsOfPermission: 'DETAILS',
              adviceFromNaturalEngland: true,
              adviceFromWho: 'ADVICE_WHO',
              adviceDescription: 'ADVICE_DESC',
              onSiteOrCloseToSite: 100000001
            }])
          }
        }
      }))
      const request = {
        cache: () => ({
          getData: () => ({
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc'
          })
        })
      }
      const { getData } = await import('../designated-site-check-answers.js')
      const result = await getData(request)
      expect(result).toEqual({
        checkData: [
          {
            id: '344be97d-c928-4753-ae09-f8944ad9f228',
            tabData: [
              {
                key: 'siteName',
                value: 'Ribble Estuary SSSI'
              },
              {
                key: 'permissionFromOwner',
                value: 'yes'
              },
              {
                key: 'detailsOfPermission',
                value: 'DETAILS'
              },
              {
                key: 'adviceFromNaturalEngland',
                value: 'yes'
              },
              {
                key: 'adviceFromWho',
                value: 'ADVICE_WHO'
              },
              {
                key: 'adviceDescription',
                value: 'ADVICE_DESC'
              },
              {
                key: 'onSiteOrCloseToSite',
                value: 100000001
              }
            ]
          }
        ],
        onOrClose: {
          NEXT_TO: 100000001,
          ON: 100000000
        }
      })
    })
  })

  describe('the setData function', () => {
    it('if \'yes\' sets the tag to IN-PROGRESS', async () => {
      const mockSet = jest.fn()
      const mockSetData = jest.fn()
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICATION: {
            tags: () => ({ set: mockSet })
          }
        }
      }))
      const request = {
        payload: { 'yes-no': 'yes' },
        cache: () => ({
          getData: () => ({
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc',
            designatedSite: {
              designatedSiteId: '93b171b3-55a9-ed11-aad1-0022481b53bf',
              id: '344be97d-c928-4753-ae09-f8944ad9f228'
            }
          }),
          setData: mockSetData
        })
      }
      const { setData } = await import('../designated-site-check-answers.js')
      await setData(request)
      expect(mockSet).toHaveBeenCalledWith({ tag: 'conservation', tagState: 'in-progress' })
      expect(mockSetData).toHaveBeenCalledWith({ applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc' })
    })

    it('if \'no\' sets the tag to COMPLETE', async () => {
      const mockSet = jest.fn()
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICATION: {
            tags: () => ({ set: mockSet })
          }
        }
      }))
      const request = {
        payload: { 'yes-no': 'no' },
        cache: () => ({
          getData: () => ({
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc'
          }),
          setData: jest.fn()
        })
      }
      const { setData } = await import('../designated-site-check-answers.js')
      await setData(request)
      expect(mockSet).toHaveBeenCalledWith({ tag: 'conservation', tagState: 'complete' })
    })
  })

  describe('the completion function', () => {
    it('if \'yes\' redirects to the site-name', async () => {
      const request = {
        payload: { 'yes-no': 'yes' }
      }
      const { completion } = await import('../designated-site-check-answers.js')
      const result = await completion(request)
      expect(result).toEqual('/designated-site-name')
    })

    it('if \'no\' redirects to the tasklist', async () => {
      const request = {
        payload: { 'yes-no': 'no' }
      }
      const { completion } = await import('../designated-site-check-answers.js')
      const result = await completion(request)
      expect(result).toEqual('/tasklist')
    })
  })
})
