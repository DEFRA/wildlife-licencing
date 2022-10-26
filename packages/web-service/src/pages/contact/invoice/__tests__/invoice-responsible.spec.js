
describe('the invoice-responsible page', () => {
  beforeEach(() => jest.resetModules())

  describe('checkData', () => {
    it('returns to applications page if there is no application set', async () => {
      const request = {
        cache: () => ({
          getData: jest.fn(() => ({
            userId: '412d7297-643d-485b-8745-cc25a0e6ec0a'
          }))
        })
      }
      const h = {
        redirect: jest.fn(() => 'redirect')
      }
      const { checkData } = await import('../invoice-responsible.js')
      await checkData(request, h)
      expect(h.redirect).toHaveBeenCalledWith('/applications')
    })

    it('returns to the tasklist page if there is no applicant set', async () => {
      jest.doMock('../../../../services/api-requests.js', () => ({
        tagStatus: {
          NOT_STARTED: 'not-started'
        },
        APIRequests: {
          CONTACT: {
            role: () => ({
              getByApplicationId: jest.fn(() => null)
            })
          }
        }
      }))
      const request = {
        cache: () => ({
          getData: jest.fn(() => ({
            userId: '412d7297-643d-485b-8745-cc25a0e6ec0a',
            applicationId: '1c3e7655-bb74-4420-9bf0-0bd710987f10'
          }))
        })
      }
      const h = {
        redirect: jest.fn(() => 'redirect')
      }
      const { checkData } = await import('../invoice-responsible.js')
      await checkData(request, h)
      expect(h.redirect).toHaveBeenCalledWith('/tasklist')
    })

    it('returns to the tasklist page if there is no ecologist set', async () => {
      jest.doMock('../../../../services/api-requests.js', () => ({
        tagStatus: {
          NOT_STARTED: 'not-started'
        },
        APIRequests: {
          CONTACT: {
            role: jest.fn()
              .mockReturnValueOnce({ getByApplicationId: () => ({ id: '56ea844c-a2ba-4af8-9b2d-425a9e1c21c8' }) })
              .mockReturnValueOnce({ getByApplicationId: () => null })
          }
        }
      }))
      const request = {
        cache: () => ({
          getData: jest.fn(() => ({
            userId: '412d7297-643d-485b-8745-cc25a0e6ec0a',
            applicationId: '1c3e7655-bb74-4420-9bf0-0bd710987f10'
          }))
        })
      }
      const h = {
        redirect: jest.fn(() => 'redirect')
      }
      const { checkData } = await import('../invoice-responsible.js')
      await checkData(request, h)
      expect(h.redirect).toHaveBeenCalledWith('/tasklist')
    })

    it('returns null if there is an applicant and an ecologist set', async () => {
      jest.doMock('../../../../services/api-requests.js', () => ({
        tagStatus: {
          NOT_STARTED: 'not-started'
        },
        APIRequests: {
          CONTACT: {
            role: jest.fn()
              .mockReturnValueOnce({ getByApplicationId: () => ({ id: '56ea844c-a2ba-4af8-9b2d-425a9e1c21c8' }) })
              .mockReturnValueOnce({ getByApplicationId: () => ({ id: '412d7297-643d-485b-8745-cc25a0e6ec0a' }) })
          }
        }
      }))
      const request = {
        cache: () => ({
          getData: jest.fn(() => ({
            userId: '412d7297-643d-485b-8745-cc25a0e6ec0a',
            applicationId: '1c3e7655-bb74-4420-9bf0-0bd710987f10'
          }))
        })
      }
      const h = {
        redirect: jest.fn(() => 'redirect')
      }
      const { checkData } = await import('../invoice-responsible.js')
      const result = await checkData(request, h)
      expect(result).toBeNull()
    })
  })

  describe('getData', () => {
    it('returns correctly with no payer set', async () => {
      jest.doMock('../../../../services/api-requests.js', () => ({
        tagStatus: {
          NOT_STARTED: 'not-started'
        },
        APIRequests: {
          APPLICATION: {
            tags: () => {
              return {
                set: jest.fn()
              }
            }
          },
          CONTACT: {
            role: jest.fn()
              .mockReturnValueOnce({ getByApplicationId: () => ({ id: '56ea844c-a2ba-4af8-9b2d-425a9e1c21c8', fullName: 'Joe Bloggs' }) })
              .mockReturnValueOnce({ getByApplicationId: () => ({ id: '412d7297-643d-485b-8745-cc25a0e6ec0a', fullName: 'Sydney James' }) })
              .mockReturnValueOnce({ getByApplicationId: () => null })
          }
        }
      }))
      const request = {
        cache: () => ({
          getData: jest.fn(() => ({
            userId: '412d7297-643d-485b-8745-cc25a0e6ec0a',
            applicationId: '1c3e7655-bb74-4420-9bf0-0bd710987f10'
          }))
        })
      }

      const { getData } = await import('../invoice-responsible.js')
      const result = await getData(request)
      expect(result).toEqual({
        applicantName: 'Joe Bloggs',
        ecologistName: 'Sydney James',
        currentPayer: null
      })
    })

    it('returns correctly with payer set to applicant', async () => {
      jest.doMock('../../../../services/api-requests.js', () => ({
        tagStatus: {
          NOT_STARTED: 'not-started'
        },
        APIRequests: {
          APPLICATION: {
            tags: () => {
              return {
                set: jest.fn()
              }
            }
          },
          CONTACT: {
            role: jest.fn()
              .mockReturnValueOnce({ getByApplicationId: () => ({ id: '56ea844c-a2ba-4af8-9b2d-425a9e1c21c8', fullName: 'Joe Bloggs' }) })
              .mockReturnValueOnce({ getByApplicationId: () => ({ id: '412d7297-643d-485b-8745-cc25a0e6ec0a', fullName: 'Sydney James' }) })
              .mockReturnValueOnce({ getByApplicationId: () => ({ id: '56ea844c-a2ba-4af8-9b2d-425a9e1c21c8' }) })
          }
        }
      }))
      const request = {
        cache: () => ({
          getData: jest.fn(() => ({
            userId: '412d7297-643d-485b-8745-cc25a0e6ec0a',
            applicationId: '1c3e7655-bb74-4420-9bf0-0bd710987f10'
          }))
        })
      }

      const { getData } = await import('../invoice-responsible.js')
      const result = await getData(request)
      expect(result).toEqual({
        applicantName: 'Joe Bloggs',
        ecologistName: 'Sydney James',
        currentPayer: 'applicant'
      })
    })

    it('returns correctly with payer set to ecologist', async () => {
      jest.doMock('../../../../services/api-requests.js', () => ({
        tagStatus: {
          NOT_STARTED: 'not-started'
        },
        APIRequests: {
          APPLICATION: {
            tags: () => {
              return {
                set: jest.fn()
              }
            }
          },
          CONTACT: {
            role: jest.fn()
              .mockReturnValueOnce({ getByApplicationId: () => ({ id: '56ea844c-a2ba-4af8-9b2d-425a9e1c21c8', fullName: 'Joe Bloggs' }) })
              .mockReturnValueOnce({ getByApplicationId: () => ({ id: '412d7297-643d-485b-8745-cc25a0e6ec0a', fullName: 'Sydney James' }) })
              .mockReturnValueOnce({ getByApplicationId: () => ({ id: '412d7297-643d-485b-8745-cc25a0e6ec0a' }) })
          }
        }
      }))
      const request = {
        cache: () => ({
          getData: jest.fn(() => ({
            userId: '412d7297-643d-485b-8745-cc25a0e6ec0a',
            applicationId: '1c3e7655-bb74-4420-9bf0-0bd710987f10'
          }))
        })
      }

      const { getData } = await import('../invoice-responsible.js')
      const result = await getData(request)
      expect(result).toEqual({
        applicantName: 'Joe Bloggs',
        ecologistName: 'Sydney James',
        currentPayer: 'ecologist'
      })
    })

    it('returns correctly with payer set to other', async () => {
      jest.doMock('../../../../services/api-requests.js', () => ({
        tagStatus: {
          NOT_STARTED: 'not-started'
        },
        APIRequests: {
          APPLICATION: {
            tags: () => {
              return {
                set: jest.fn()
              }
            }
          },
          CONTACT: {
            role: jest.fn()
              .mockReturnValueOnce({ getByApplicationId: () => ({ id: '56ea844c-a2ba-4af8-9b2d-425a9e1c21c8', fullName: 'Joe Bloggs' }) })
              .mockReturnValueOnce({ getByApplicationId: () => ({ id: '412d7297-643d-485b-8745-cc25a0e6ec0a', fullName: 'Sydney James' }) })
              .mockReturnValueOnce({ getByApplicationId: () => ({ id: 'f6a4d9e0-2611-44cb-9ea3-12bb7e5459eb' }) })
          }
        }
      }))
      const request = {
        cache: () => ({
          getData: jest.fn(() => ({
            userId: '412d7297-643d-485b-8745-cc25a0e6ec0a',
            applicationId: '1c3e7655-bb74-4420-9bf0-0bd710987f10'
          }))
        })
      }

      const { getData } = await import('../invoice-responsible.js')
      const result = await getData(request)
      expect(result).toEqual({
        applicantName: 'Joe Bloggs',
        ecologistName: 'Sydney James',
        currentPayer: 'other'
      })
    })
  })

  describe('setData', () => {
    it('saves correctly with payer set to applicant', async () => {
      const mockAssignContact = jest.fn()
      const mockAssignAccount = jest.fn()

      const mockContactRole = jest.fn()
        .mockReturnValue({
          assign: mockAssignContact,
          getByApplicationId: () => ({ id: '56ea844c-a2ba-4af8-9b2d-425a9e1c21c8', fullName: 'Joe Bloggs' })
        })

      const mockAccountRole = jest.fn()
        .mockReturnValue({
          assign: mockAssignAccount,
          getByApplicationId: () => ({ id: '66ea844c-a2ba-4af8-9b2d-425a9e1c21c8', name: 'Eco. ltd.' })
        })

      jest.doMock('../../../../services/api-requests.js', () => ({
        tagStatus: {
          NOT_STARTED: 'not-started'
        },
        APIRequests: {
          CONTACT: {
            role: mockContactRole
          },
          ACCOUNT: {
            role: mockAccountRole
          }
        }
      }))

      const request = {
        payload: {
          responsible: 'applicant'
        },
        cache: () => ({
          getData: jest.fn(() => ({
            applicationId: '1c3e7655-bb74-4420-9bf0-0bd710987f10'
          }))
        })
      }

      const { setData } = await import('../invoice-responsible.js')
      await setData(request)

      expect(mockContactRole).toHaveBeenCalledWith('PAYER')
      expect(mockContactRole).toHaveBeenCalledWith('APPLICANT')
      expect(mockAccountRole).toHaveBeenCalledWith('APPLICANT-ORGANISATION')
      expect(mockAccountRole).toHaveBeenCalledWith('PAYER-ORGANISATION')
      expect(mockAssignContact).toHaveBeenCalledWith('1c3e7655-bb74-4420-9bf0-0bd710987f10', '56ea844c-a2ba-4af8-9b2d-425a9e1c21c8')
      expect(mockAssignAccount).toHaveBeenCalledWith('1c3e7655-bb74-4420-9bf0-0bd710987f10', '66ea844c-a2ba-4af8-9b2d-425a9e1c21c8')
    })

    it('saves correctly with payer set to ecologist', async () => {
      const mockAssignContact = jest.fn()
      const mockAssignAccount = jest.fn()

      const mockContactRole = jest.fn()
        .mockReturnValue({
          assign: mockAssignContact,
          getByApplicationId: () => ({ id: '56ea844c-a2ba-4af8-9b2d-425a9e1c21c8', fullName: 'Joe Bloggs' })
        })

      const mockAccountRole = jest.fn()
        .mockReturnValue({
          assign: mockAssignAccount,
          getByApplicationId: () => ({ id: '66ea844c-a2ba-4af8-9b2d-425a9e1c21c8', name: 'Eco. ltd.' })
        })

      jest.doMock('../../../../services/api-requests.js', () => ({
        tagStatus: {
          NOT_STARTED: 'not-started'
        },
        APIRequests: {
          CONTACT: {
            role: mockContactRole
          },
          ACCOUNT: {
            role: mockAccountRole
          }
        }
      }))

      const request = {
        payload: {
          responsible: 'ecologist'
        },
        cache: () => ({
          getData: jest.fn(() => ({
            applicationId: '1c3e7655-bb74-4420-9bf0-0bd710987f10'
          }))
        })
      }

      const { setData } = await import('../invoice-responsible.js')
      await setData(request)

      expect(mockContactRole).toHaveBeenCalledWith('PAYER')
      expect(mockContactRole).toHaveBeenCalledWith('ECOLOGIST')
      expect(mockAccountRole).toHaveBeenCalledWith('ECOLOGIST-ORGANISATION')
      expect(mockAccountRole).toHaveBeenCalledWith('PAYER-ORGANISATION')
      expect(mockAssignContact).toHaveBeenCalledWith('1c3e7655-bb74-4420-9bf0-0bd710987f10', '56ea844c-a2ba-4af8-9b2d-425a9e1c21c8')
      expect(mockAssignAccount).toHaveBeenCalledWith('1c3e7655-bb74-4420-9bf0-0bd710987f10', '66ea844c-a2ba-4af8-9b2d-425a9e1c21c8')
    })

    it('clears correctly with payer set to other', async () => {
      const mockUnAssignContact = jest.fn()
      const mockUnAssignAccount = jest.fn()

      const mockContactRole = jest.fn()
        .mockReturnValue({
          unAssign: mockUnAssignContact,
          getByApplicationId: () => ({ id: '56ea844c-a2ba-4af8-9b2d-425a9e1c21c8', fullName: 'Joe Bloggs' })
        })

      const mockAccountRole = jest.fn()
        .mockReturnValue({
          unAssign: mockUnAssignAccount,
          getByApplicationId: () => ({ id: '66ea844c-a2ba-4af8-9b2d-425a9e1c21c8', name: 'Eco. ltd.' })
        })

      jest.doMock('../../../../services/api-requests.js', () => ({
        tagStatus: {
          NOT_STARTED: 'not-started'
        },
        APIRequests: {
          CONTACT: {
            role: mockContactRole
          },
          ACCOUNT: {
            role: mockAccountRole
          }
        }
      }))

      const request = {
        payload: {
          responsible: 'other'
        },
        cache: () => ({
          getData: jest.fn(() => ({
            applicationId: '1c3e7655-bb74-4420-9bf0-0bd710987f10'
          }))
        })
      }

      const { setData } = await import('../invoice-responsible.js')
      await setData(request)

      expect(mockContactRole).toHaveBeenCalledWith('PAYER')
      expect(mockAccountRole).toHaveBeenCalledWith('PAYER-ORGANISATION')
      expect(mockUnAssignContact).toHaveBeenCalledWith('1c3e7655-bb74-4420-9bf0-0bd710987f10', '56ea844c-a2ba-4af8-9b2d-425a9e1c21c8')
      expect(mockUnAssignAccount).toHaveBeenCalledWith('1c3e7655-bb74-4420-9bf0-0bd710987f10', '66ea844c-a2ba-4af8-9b2d-425a9e1c21c8')
    })
  })

  describe('completion', () => {
    it('go to the user page if other is chosen', async () => {
      jest.doMock('../../../../services/api-requests.js', () => ({
        tagStatus: {
          NOT_STARTED: 'not-started'
        }
      }))
      const request = {
        cache: () => ({
          getPageData: () => ({
            payload: { responsible: 'other' }
          })
        })
      }

      const { completion } = await import('../invoice-responsible.js')
      const result = await completion(request)
      expect(result).toEqual('/invoice-user')
    })

    it('go to the tasklist page if other is not chosen', async () => {
      jest.doMock('../../../../services/api-requests.js', () => ({
        tagStatus: {
          COMPLETE: 'complete'
        },
        APIRequests: {
          APPLICATION: {
            tags: () => {
              return {
                set: jest.fn()
              }
            }
          }
        }
      }))
      const request = {
        cache: () => ({
          getData: () => {
            return { applicationId: 'ab28sks' }
          },
          getPageData: () => ({
            payload: { responsible: 'applicant' }
          })
        })
      }

      const { completion } = await import('../invoice-responsible.js')
      const result = await completion(request)
      expect(result).toEqual('/tasklist')
    })
  })
})
