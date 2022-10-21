describe('The check ecologist answers page', () => {
  beforeEach(() => jest.resetModules())

  describe('check data function', () => {
    it('redirects to the applications if applicationId is not set', async () => {
      const request = {
        cache: () => ({
          getData: () => ({})
        })
      }
      const h = { redirect: jest.fn() }
      const { checkData } = await import('../check-ecologist-answers.js')
      await checkData(request, h)
      expect(h.redirect).toHaveBeenCalledWith('/applications')
    })
    it('redirects to the previous licence if the tag is not set', async () => {
      jest.doMock('../../../../services/api-requests.js', () => ({
        tagStatus: {
          COMPLETE: 'complete'
        },
        APIRequests: {
          APPLICATION: {
            tags: () => ({
              get: () => 'in-progress'
            })
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
      const h = { redirect: jest.fn() }
      const { checkData } = await import('../check-ecologist-answers.js')
      await checkData(request, h)
      expect(h.redirect).toHaveBeenCalledWith('/previous-licence')
    })

    it('returns null if tag is et', async () => {
      jest.doMock('../../../../services/api-requests.js', () => ({
        tagStatus: {
          COMPLETE: 'complete'
        },
        APIRequests: {
          APPLICATION: {
            tags: () => ({
              get: () => 'complete'
            })
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
      const h = { }
      const { checkData } = await import('../check-ecologist-answers.js')
      const result = await checkData(request, h)
      expect(result).toBeNull()
    })
  })

  describe('get data function', () => {
    it('gets the experience data from the database', async () => {
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          ECOLOGIST_EXPERIENCE: {
            getPreviousLicences: jest.fn(() => ['D333']),
            getExperienceById: jest.fn(() => ({
              licenceDetails: [
                'D333'
              ],
              previousLicence: true,
              methodExperience: 'methods',
              experienceDetails: 'experience',
              classMitigation: true,
              classMitigationDetails: 'AX123'
            }))
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
      const { getData } = await import('../check-ecologist-answers.js')
      const result = await getData(request)
      expect(result).toEqual([
        {
          key: 'previousLicence',
          value: 'yes'
        },
        {
          key: 'licenceDetails',
          value: 'D333'
        },
        {
          key: 'experienceDetails',
          value: 'experience'
        },
        {
          key: 'methodExperience',
          value: 'methods'
        },
        {
          key: 'classMitigation',
          value: 'yes'
        },
        {
          key: 'classMitigationDetails',
          value: 'AX123'
        }
      ])
    })
    it('gets the experience data from the database - no previous, no class', async () => {
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          ECOLOGIST_EXPERIENCE: {
            getPreviousLicences: jest.fn(() => []),
            getExperienceById: jest.fn(() => ({
              previousLicence: false,
              methodExperience: 'methods',
              experienceDetails: 'experience',
              classMitigation: false
            }))
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
      const { getData } = await import('../check-ecologist-answers.js')
      const result = await getData(request)
      expect(result).toEqual([
        {
          key: 'previousLicence',
          value: 'no'
        },
        {
          key: 'experienceDetails',
          value: 'experience'
        },
        {
          key: 'methodExperience',
          value: 'methods'
        },
        {
          key: 'classMitigation',
          value: 'no'
        }
      ])
    })
  })

  describe('completion function', () => {
    it('returns the tasklist uri', async () => {
      const { completion } = await import('../check-ecologist-answers.js')
      expect(await completion()).toBe('/tasklist')
    })
  })
})
