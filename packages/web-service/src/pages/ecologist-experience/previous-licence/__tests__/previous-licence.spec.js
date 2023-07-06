describe('The previous licence page', () => {
  beforeEach(() => jest.resetModules())

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

  describe('the set data function', () => {
    it('if yes then sets previous licence to true calling the api', async () => {
      const mockPut = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICATION: {
            tags: () => ({
              get: () => 'in-progress',
              set: () => {}
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

    it('if no sets previous licence to false, removes the licence details, calling the api', async () => {
      const mockPut = jest.fn()
      const mockRemovePreviousLicences = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICATION: {
            tags: () => ({
              set: () => {}
            })
          },
          ECOLOGIST_EXPERIENCE: {
            putExperienceById: mockPut,
            removePreviousLicences: mockRemovePreviousLicences,
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
      expect(mockRemovePreviousLicences).toHaveBeenCalledWith('26a3e94f-2280-4ea5-ad72-920d53c110fc')
    })
  })

  describe('completion function', () => {
    it('returns the enter licence details uri if user selects yes', async () => {
      const request = {
        payload: {
          'yes-no': 'yes'
        }
      }
      const { completion } = await import('../previous-licence.js')
      expect(await completion(request)).toBe('/enter-licence-details')
    })

    it('returns the experience details page if user selects no and the experience details have not been set', async () => {
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          ECOLOGIST_EXPERIENCE: {
            getExperienceById: () => ({})
          }
        }
      }))
      const request = {
        cache: () => ({
          getData: () => ({
            applicationId: '7c3b13ef-c2fb-4955-942e-764593cf0ada'
          })
        }),
        payload: {
          'yes-no': 'no'
        }
      }
      const { completion } = await import('../previous-licence.js')
      expect(await completion(request)).toBe('/enter-experience')
    })

    it('returns the experience methods page if user selects no and the experience methods have not been set', async () => {
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          ECOLOGIST_EXPERIENCE: {
            getExperienceById: () => ({
              experienceDetails: 'details'
            })
          }
        }
      }))
      const request = {
        cache: () => ({
          getData: () => ({
            applicationId: '7c3b13ef-c2fb-4955-942e-764593cf0ada'
          })
        }),
        payload: {
          'yes-no': 'no'
        }
      }
      const { completion } = await import('../previous-licence.js')
      expect(await completion(request)).toBe('/enter-methods')
    })

    it('returns the class licence page if user selects no and the class licence has not been set', async () => {
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          ECOLOGIST_EXPERIENCE: {
            getExperienceById: () => ({
              experienceDetails: 'details',
              methodExperience: 'methods'
            })
          }
        }
      }))
      const request = {
        cache: () => ({
          getData: () => ({
            applicationId: '7c3b13ef-c2fb-4955-942e-764593cf0ada'
          })
        }),
        payload: {
          'yes-no': 'no'
        }
      }
      const { completion } = await import('../previous-licence.js')
      expect(await completion(request)).toBe('/class-mitigation')
    })

    it('returns the check page if user selects no and the class licence has been set', async () => {
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICATION: {
            tags: () => ({
              set: () => {}
            })
          },
          ECOLOGIST_EXPERIENCE: {
            getExperienceById: () => ({
              experienceDetails: 'details',
              methodExperience: 'methods',
              classMitigation: false
            })
          }
        }
      }))
      const request = {
        cache: () => ({
          getData: () => ({
            applicationId: '7c3b13ef-c2fb-4955-942e-764593cf0ada'
          })
        }),
        payload: {
          'yes-no': 'no'
        }
      }
      const { completion } = await import('../previous-licence.js')
      expect(await completion(request)).toBe('/check-ecologist-answers')
    })
  })

  it('setData resets the application tags journey if the user changes their answer for the previous answer question', async () => {
    const mockSet = jest.fn()
    jest.doMock('../../../../services/api-requests.js', () => ({
      tagStatus: {
        NOT_STARTED: 'not-started',
        IN_PROGRESS: 'in-progress'
      },
      APIRequests: {
        APPLICATION: {
          tags: () => ({
            get: () => 'complete',
            set: mockSet
          })
        },
        ECOLOGIST_EXPERIENCE: {
          putExperienceById: mockSet,
          getExperienceById: () => {
            return {
              previousLicence: false
            }
          }
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
    expect(mockSet).toHaveBeenCalledWith({ tag: 'ecologist-experience', tagState: 'in-progress' })
  })
})
