describe('The class mitigation page', () => {
  beforeEach(() => jest.resetModules())

  describe('completion function', () => {
    it('returns the enter-class-mitigation-details uri if the journey isnt complete', async () => {
      jest.doMock('../../../../services/api-requests.js', () => ({
        tagStatus: {
          NOT_STARTED: 'not-started',
          COMPLETE: 'complete',
          COMPLETE_NOT_CONFIRMED: 'complete-not-confirmed'
        },
        APIRequests: {
          APPLICATION: {
            tags: () => {
              return { get: () => 'in-progress' }
            }
          }
        }
      }))
      const request = {
        cache: () => ({
          getData: () => {
            return { applicationId: 'abc123' }
          }
        })
      }
      const { completion } = await import('../class-mitigation.js')
      expect(await completion(request)).toBe('/enter-class-mitigation-details')
    })
    it('returns the enter-class-mitigation-details uri if the journey isnt complete', async () => {
      jest.doMock('../../../../services/api-requests.js', () => ({
        tagStatus: {
          NOT_STARTED: 'not-started',
          COMPLETE: 'complete',
          COMPLETE_NOT_CONFIRMED: 'complete-not-confirmed'
        },
        APIRequests: {
          APPLICATION: {
            tags: () => {
              return { get: () => 'complete' }
            }
          }
        }
      }))
      const request = {
        cache: () => ({
          getData: () => {
            return { applicationId: 'abc123' }
          }
        })
      }
      const { completion } = await import('../class-mitigation.js')
      expect(await completion(request)).toBe('/check-ecologist-answers')
    })
  })

  describe('the get data function', () => {
    it('returns the value of classMitigation when false', async () => {
      jest.doMock('../../../../services/api-requests.js', () => ({
        tagStatus: {
          NOT_STARTED: 'not-started'
        },
        APIRequests: {
          ECOLOGIST_EXPERIENCE: {
            getExperienceById: jest.fn(() => ({ classMitigation: false }))
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
      const { getData } = await import('../class-mitigation.js')
      const result = await getData(request)
      expect(result).toEqual({ yesNo: 'no' })
    })

    it('returns the value of classMitigation when true', async () => {
      jest.doMock('../../../../services/api-requests.js', () => ({
        tagStatus: {
          NOT_STARTED: 'not-started'
        },
        APIRequests: {
          ECOLOGIST_EXPERIENCE: {
            getExperienceById: jest.fn(() => ({ classMitigation: true }))
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
      const { getData } = await import('../class-mitigation.js')
      const result = await getData(request)
      expect(result).toEqual({ yesNo: 'yes' })
    })

    it('returns null if the user has no past data inputted', async () => {
      jest.doMock('../../../../services/api-requests.js', () => ({
        tagStatus: {
          NOT_STARTED: 'not-started'
        },
        APIRequests: {
          ECOLOGIST_EXPERIENCE: {
            getExperienceById: jest.fn(() => ({}))
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
      const { getData } = await import('../class-mitigation.js')
      const result = await getData(request)
      expect(result).toEqual(null)
    })
  })

  describe('set data function', () => {
    it('write the data to the database if \'no\'', async () => {
      const mockPut = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        tagStatus: {
          COMPLETE: 'complete'
        },
        APIRequests: {
          ECOLOGIST_EXPERIENCE: {
            getExperienceById: jest.fn(() => ({ classMitigation: true, classMitigationDetails: 'details' })),
            putExperienceById: mockPut
          },
          APPLICATION: {
            tags: () => ({
              set: () => jest.fn()
            })
          }
        }
      }))
      const request = {
        payload: {
          'yes-no': 'no'
        },
        cache: () => ({
          getData: () => ({
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc'
          })
        })
      }
      const { setData } = await import('../class-mitigation.js')
      await setData(request)
      expect(mockPut).toHaveBeenCalledWith('26a3e94f-2280-4ea5-ad72-920d53c110fc', { classMitigation: false })
    })

    it('will set the tag status to in-progress if the user goes from yes on the primary journey to no on the return journey', async () => {
      const mockSet = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        tagStatus: {
          COMPLETE: 'complete',
          IN_PROGRESS: 'in-progress'
        },
        APIRequests: {
          ECOLOGIST_EXPERIENCE: {
            getExperienceById: jest.fn(() => ({ classMitigation: false })),
            putExperienceById: jest.fn()
          },
          APPLICATION: {
            tags: () => ({
              set: mockSet
            })
          }
        }
      }))
      const request = {
        payload: {
          'yes-no': 'yes'
        },
        cache: () => ({
          getData: () => ({
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc'
          })
        })
      }
      const { setData } = await import('../class-mitigation.js')
      await setData(request)
      expect(mockSet).toHaveBeenCalledWith({ tag: 'ecologist-experience', tagState: 'in-progress' })
    })

    it('write the data to the database if \'yes\'', async () => {
      const mockPut = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        tagStatus: {
          NOT_STARTED: 'not-started'
        },
        APIRequests: {
          ECOLOGIST_EXPERIENCE: {
            getExperienceById: jest.fn(() => ({})),
            putExperienceById: mockPut
          },
          APPLICATION: {
            tags: () => ({
              get: () => 'complete'
            })
          }
        }
      }))
      const request = {
        payload: {
          'yes-no': 'yes'
        },
        cache: () => ({
          getData: () => ({
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc'
          })
        })
      }
      const { setData } = await import('../class-mitigation.js')
      await setData(request)
      expect(mockPut).toHaveBeenCalledWith('26a3e94f-2280-4ea5-ad72-920d53c110fc', { classMitigation: true })
    })
  })
})
