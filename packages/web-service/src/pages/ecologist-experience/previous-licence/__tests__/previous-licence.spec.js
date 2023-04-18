describe('The previous licence page', () => {
  beforeEach(() => jest.resetModules())

  describe('completion function', () => {
    it('returns the enter licence details uri if user selects yes', async () => {
      jest.doMock('../../../../services/api-requests.js', () => ({
        tagStatus: {
          NOT_STARTED: 'not-started'
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
            applicationId: '7c3b13ef-c2fb-4955-942e-764593cf0ada',
            ecologistExperience: {}
          }),
          getPageData: () => ({
            payload: {
              'yes-no': 'yes'
            }
          })
        })
      }
      const { completion } = await import('../previous-licence.js')
      expect(await completion(request)).toBe('/enter-licence-details')
    })
    it('returns the check ecologist details uri on the return journey if user selects no', async () => {
      jest.doMock('../../../../services/api-requests.js', () => ({
        tagStatus: {
          COMPLETE: 'complete',
          NOT_STARTED: 'not-started'
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
            applicationId: '7c3b13ef-c2fb-4955-942e-764593cf0ada',
            ecologistExperience: {
              complete: true
            }
          }),
          getPageData: () => ({
            payload: {
              'yes-no': 'no'
            }
          })
        })
      }
      const { completion } = await import('../previous-licence.js')
      expect(await completion(request)).toBe('/check-ecologist-answers')
    })
    it('returns the enter experience uri on the primary journey if user selects no', async () => {
      jest.doMock('../../../../services/api-requests.js', () => ({
        tagStatus: {
          COMPLETE: 'complete',
          NOT_STARTED: 'not-started'
        },
        APIRequests: {
          APPLICATION: {
            tags: () => ({
              get: () => 'in-progress',
              set: jest.fn()
            })
          }
        }
      }))
      const request = {
        cache: () => ({
          getData: () => ({
            applicationId: '7c3b13ef-c2fb-4955-942e-764593cf0ada',
            ecologistExperience: {}
          }),
          getPageData: () => ({
            payload: {
              'yes-no': 'no'
            }
          })
        })
      }
      const { completion } = await import('../previous-licence.js')
      expect(await completion(request)).toBe('/enter-experience')
    })
  })

  describe('the check data function', () => {
    it('redirects to check ecologist answers if completion-tag is set', async () => {
      const mockRedirect = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        tagStatus: {
          COMPLETE: 'complete',
          NOT_STARTED: 'not-started'
        },
        APIRequests: {
          APPLICATION: {
            tags: () => ({
              get: () => 'complete'
            })
          }
        }
      }))
      const h = {
        redirect: mockRedirect
      }
      const request = {
        cache: () => ({
          getData: () => ({
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc'
          })
        })
      }
      const { checkData } = await import('../previous-licence.js')
      await checkData(request, h)
      expect(mockRedirect).toHaveBeenCalledWith('/check-ecologist-answers')
    })

    it('returns undefined if tag is not set', async () => {
      jest.doMock('../../../../services/api-requests.js', () => ({
        tagStatus: {
          COMPLETE: 'complete',
          NOT_STARTED: 'not-started'
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
      const { checkData } = await import('../previous-licence.js')
      expect(await checkData(request, {})).toBe(undefined)
    })

    it('returns undefined on changing', async () => {
      const request = {
        query: { change: 'true' },
        cache: () => ({
          getData: () => ({
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc',
            ecologistExperience: {
              complete: true
            }
          })
        })
      }
      const { checkData } = await import('../previous-licence.js')
      expect(await checkData(request, {})).toBe(undefined)
    })
  })

  describe('the set data function', () => {
    it('sets previous licence to true calling the api', async () => {
      const mockPut = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        tagStatus: {
          NOT_STARTED: 'not-started'
        },
        APIRequests: {
          APPLICATION: {
            tags: () => ({
              get: () => 'in-progress'
            })
          },
          ECOLOGIST_EXPERIENCE: {
            putExperienceById: mockPut,
            getExperienceById: jest.fn(() => ({}))
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
      const { setData } = await import('../previous-licence.js')
      await setData(request)
      expect(mockPut).toHaveBeenCalledWith('26a3e94f-2280-4ea5-ad72-920d53c110fc', { previousLicence: true })
    })

    it('sets previous licence to false, removes the licence details, calling the api', async () => {
      const mockPut = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        tagStatus: {
          NOT_STARTED: 'not-started'
        },
        APIRequests: {
          APPLICATION: {
            tags: () => ({
              get: () => 'in-progress'
            })
          },
          ECOLOGIST_EXPERIENCE: {
            putExperienceById: mockPut,
            removePreviousLicences: jest.fn(),
            getExperienceById: jest.fn(() => ({ previousLicence: true }))
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
      const { setData } = await import('../previous-licence.js')
      await setData(request)
      expect(mockPut).toHaveBeenCalledWith('26a3e94f-2280-4ea5-ad72-920d53c110fc', { previousLicence: false })
    })
  })

  describe('the get data function', () => {
    it('returns the value of previous licence as no if false', async () => {
      const mockGet = jest.fn(() => 'not-started')
      jest.doMock('../../../../services/api-requests.js', () => ({
        tagStatus: {
          NOT_STARTED: 'not-started'
        },
        APIRequests: {
          APPLICATION: {
            tags: () => {
              return {
                set: jest.fn(),
                get: mockGet
              }
            }
          },
          ECOLOGIST_EXPERIENCE: {
            getExperienceById: jest.fn(() => ({ previousLicence: false }))
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
      const { getData } = await import('../previous-licence.js')
      const result = await getData(request)
      expect(result).toEqual({ yesNo: 'no' })
    })

    it('returns the value of previous licence as yes if true', async () => {
      const mockGet = jest.fn(() => 'not-started')
      jest.doMock('../../../../services/api-requests.js', () => ({
        tagStatus: {
          NOT_STARTED: 'not-started',
          IN_PROGRESS: 'in-progress'
        },
        APIRequests: {
          APPLICATION: {
            tags: () => {
              return {
                set: jest.fn(),
                get: mockGet
              }
            }
          },
          ECOLOGIST_EXPERIENCE: {
            getExperienceById: jest.fn(() => ({ previousLicence: true }))
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
      const { getData } = await import('../previous-licence.js')
      const result = await getData(request)
      expect(result).toEqual({ yesNo: 'yes' })
    })

    it('returns null if the user has no past data inputted', async () => {
      const mockGet = jest.fn(() => 'not-started')
      jest.doMock('../../../../services/api-requests.js', () => ({
        tagStatus: {
          NOT_STARTED: 'not-started'
        },
        APIRequests: {
          APPLICATION: {
            tags: () => {
              return {
                set: jest.fn(),
                get: mockGet
              }
            }
          },
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
      const { getData } = await import('../previous-licence.js')
      const result = await getData(request)
      expect(result).toEqual(null)
    })
  })
})
