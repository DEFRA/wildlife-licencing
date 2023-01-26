import { contactURIs } from '../../../../../uris.js'

describe('the user page', () => {
  beforeEach(() => jest.resetModules())

  it('getUserData - user is contact', async () => {
    const request = {
      cache: () => ({
        getData: jest.fn(() => ({ userId: '54b5c443-e5e0-4d81-9daa-671a21bd88ca' }))
      })
    }
    jest.doMock('../../../../../services/api-requests.js', () => ({
      APIRequests: {
        APPLICATION: {
          tags: () => {
            return {
              set: jest.fn()
            }
          }
        },
        CONTACT: {
          role: () => ({
            getByApplicationId: jest.fn(() => ({ userId: '2ca1677a-eb38-47ef-8759-d85b2b4b2e5c' }))
          })
        },
        USER: {
          getById: jest.fn(() => ({ id: '2ca1677a-eb38-47ef-8759-d85b2b4b2e5c', username: 'Keith Moon' }))
        }
      }
    }))
    const { getUserData } = await import('../user.js')
    const result = await getUserData('APPLICANT')(request)
    expect(result).toEqual({ username: 'Keith Moon', yesNo: 'yes', id: '2ca1677a-eb38-47ef-8759-d85b2b4b2e5c' })
  })

  it('getUserData - user is not contact', async () => {
    const request = {
      cache: () => ({
        getData: jest.fn(() => ({ userId: '54b5c443-e5e0-4d81-9daa-671a21bd88ca' }))
      })
    }
    jest.doMock('../../../../../services/api-requests.js', () => ({
      APIRequests: {
        APPLICATION: {
          tags: () => {
            return {
              set: jest.fn()
            }
          }
        },
        CONTACT: {
          role: () => ({
            getByApplicationId: jest.fn(() => ({ userId: '3ca1677a-eb38-47ef-8759-d85b2b4b2e5c' }))
          })
        },
        USER: {
          getById: jest.fn(() => ({ id: '2ca1677a-eb38-47ef-8759-d85b2b4b2e5c', username: 'Keith Moon' }))
        }
      }
    }))
    const { getUserData } = await import('../user.js')
    const result = await getUserData('APPLICANT')(request)
    expect(result).toEqual({ username: 'Keith Moon', yesNo: 'no', id: '2ca1677a-eb38-47ef-8759-d85b2b4b2e5c' })
  })

  it('getUserData - no contact', async () => {
    const request = {
      cache: () => ({
        getData: jest.fn(() => ({ userId: '54b5c443-e5e0-4d81-9daa-671a21bd88ca' }))
      })
    }
    jest.doMock('../../../../../services/api-requests.js', () => ({
      APIRequests: {
        APPLICATION: {
          tags: () => {
            return {
              set: jest.fn()
            }
          }
        },
        CONTACT: {
          role: () => ({
            getByApplicationId: jest.fn(() => null)
          })
        },
        USER: {
          getById: jest.fn(() => ({ id: '2ca1677a-eb38-47ef-8759-d85b2b4b2e5c', username: 'Keith Moon' }))
        }
      }
    }))
    const { getUserData } = await import('../user.js')
    const result = await getUserData('APPLICANT')(request)
    expect(result).toEqual({ username: 'Keith Moon', yesNo: null, id: '2ca1677a-eb38-47ef-8759-d85b2b4b2e5c' })
  })

  describe('setUserData', () => {
    it('if yes, invokes the common operations correctly if no user contact is found', async () => {
      jest.doMock('../../../../../services/api-requests.js', () => ({
        APIRequests: {
          USER: {
            getById: jest.fn(() => ({ username: 'Keith Moon' }))
          },
          CONTACT: {
            findAllByUser: jest.fn(() => [{
              id: 'e8387a83-1165-42e6-afab-add01e77bc4c'
            }]),
            role: () => ({
              getByApplicationId: jest.fn(() => null)
            })
          },
          APPLICATION: {
            tags: () => ({
              set: jest.fn()
            })
          }
        }
      }))

      const mockCreate = jest.fn()
      const mockUnAssign = jest.fn()
      jest.doMock('../../operations.js', () => ({
        contactOperations: () => ({
          create: mockCreate,
          unAssign: mockUnAssign
        })
      }))

      const { setUserData } = await import('../user.js')
      const request = {
        payload: { 'yes-no': 'yes' },
        cache: () => ({
          getData: jest.fn(() => ({
            userId: '81e36e15-88d0-41e2-9399-1c7646ecc5aa',
            applicationId: '412d7297-643d-485b-8745-cc25a0e6ec0a'
          }))
        })
      }
      await setUserData('APPLICANT', 'APPLICANT_ORGANIZATION')(request)

      expect(mockCreate).toHaveBeenCalledWith(true)
      expect(mockUnAssign).toHaveBeenCalled()
    })

    it('if yes, invokes the common operations correctly if user contacts are found', async () => {
      jest.doMock('../../../../../services/api-requests.js', () => ({
        APIRequests: {
          USER: {
            getById: jest.fn(() => ({ id: '81e36e15-88d0-41e2-9399-1c7646ecc5aa', username: 'Keith Moon' }))
          },
          CONTACT: {
            role: () => ({
              getByApplicationId: jest.fn(() => null)
            }),
            findAllByUser: jest.fn(() => [
              { id: 'e8387a83-1165-42e6-afab-add01e77bc4c', userId: '81e36e15-88d0-41e2-9399-1c7646ecc5aa', updatedAt: '2022-12-19T10:22:53Z' },
              { id: 'e8387a83-1165-42e6-afab-add01e77bc4d', userId: '81e36e15-88d0-41e2-9399-1c7646ecc5aa', updatedAt: '2021-12-19T10:22:53Z' }
            ])
          }
        }
      }))

      const mockAssign = jest.fn()
      const mockCreate = jest.fn()
      const mockSetContactIsUser = jest.fn()

      jest.doMock('../../operations.js', () => ({
        contactOperations: () => ({
          create: mockCreate,
          assign: mockAssign,
          setContactIsUser: mockSetContactIsUser
        })
      }))

      const { setUserData } = await import('../user.js')
      const request = {
        payload: { 'yes-no': 'yes' },
        cache: () => ({
          getData: jest.fn(() => ({
            userId: '81e36e15-88d0-41e2-9399-1c7646ecc5aa',
            applicationId: '412d7297-643d-485b-8745-cc25a0e6ec0a'
          }))
        })
      }
      await setUserData('APPLICANT', 'APPLICANT_ORGANIZATION')(request)
      expect(mockSetContactIsUser).toHaveBeenCalledWith(true)
    })

    it('if no, invokes the common operations correctly', async () => {
      jest.doMock('../../../../../services/api-requests.js', () => ({
        APIRequests: {
          USER: {
            getById: jest.fn(() => ({ id: '81e36e15-88d0-41e2-9399-1c7646ecc5aa', username: 'Keith Moon' }))
          },
          CONTACT: {
            findAllByUser: jest.fn(() => [{
              id: 'e8387a83-1165-42e6-afab-add01e77bc4c',
              userId: '81e36e15-88d0-41e2-9399-1c7646ecc5aa',
              updatedAt: '2022-09-13T08:23:45'
            }]),
            role: () => ({
              getByApplicationId: jest.fn(() => null)
            })
          },
          APPLICATION: {
            tags: () => ({
              set: jest.fn()
            })
          }
        }
      }))

      const mockCreate = jest.fn()
      const mockUnAssign = jest.fn()
      jest.doMock('../../operations.js', () => ({
        contactOperations: () => ({
          create: mockCreate,
          unAssign: mockUnAssign
        })
      }))

      const { setUserData } = await import('../user.js')
      const request = {
        payload: { 'yes-no': 'no' },
        cache: () => ({
          getData: jest.fn(() => ({
            userId: '81e36e15-88d0-41e2-9399-1c7646ecc5aa',
            applicationId: '412d7297-643d-485b-8745-cc25a0e6ec0a'
          }))
        })
      }
      await setUserData('APPLICANT', 'APPLICANT_ORGANIZATION')(request)
      expect(mockUnAssign).toHaveBeenCalled()
    })
  })

  describe('userCompletion', () => {
    it('if yes, returns the name page with a mutable contact', async () => {
      jest.doMock('../../../../../services/api-requests.js', () => ({
        APIRequests: {
          CONTACT: {
            role: () => ({
              getByApplicationId: jest.fn(() => ({ id: 'e8387a83-1165-42e6-afab-add01e77bc4c' }))
            }),
            isImmutable: () => false
          }
        }
      }))

      const { userCompletion } = await import('../user.js')
      const request = {
        cache: () => ({
          getData: jest.fn(() => ({
            userId: '54b5c443-e5e0-4d81-9daa-671a21bd88ca',
            applicationId: '35a6c59e-0faf-438b-b4d5-6967d8d075cb'
          })),
          getPageData: jest.fn(() => ({ payload: { 'yes-no': 'yes' } }))
        })
      }
      const result = await userCompletion('APPLICANT', ['ADDITIONAL-APPLICANT'], 'APPLICANT_ORGANISATION', contactURIs.APPLICANT)(request)
      expect(result).toEqual('/applicant-name')
    })

    it('if yes, returns the organisations page with a immutable contact where organisations exist', async () => {
      jest.doMock('../../common.js', () => ({
        hasAccountCandidates: () => true
      }))
      jest.doMock('../../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICATION: {
            tags: () => {
              return {
                get: () => null
              }
            }
          },
          CONTACT: {
            role: () => ({
              getByApplicationId: jest.fn(() => ({ id: 'e8387a83-1165-42e6-afab-add01e77bc4c' }))
            }),
            isImmutable: () => true
          }
        }
      }))

      const { userCompletion } = await import('../user.js')
      const request = {
        cache: () => ({
          getData: jest.fn(() => ({
            userId: '54b5c443-e5e0-4d81-9daa-671a21bd88ca',
            applicationId: '35a6c59e-0faf-438b-b4d5-6967d8d075cb'
          })),
          getPageData: jest.fn(() => ({ payload: { 'yes-no': 'yes' } }))
        })
      }
      const result = await userCompletion('APPLICANT',
        ['ADDITIONAL-APPLICANT'], 'APPLICANT_ORGANISATION', contactURIs.APPLICANT)(request)
      expect(result).toEqual('/applicant-organisations')
    })

    it('if yes, returns the organisation page with a immutable contact where no organisations exist', async () => {
      jest.doMock('../../common.js', () => ({
        hasAccountCandidates: () => false
      }))
      jest.doMock('../../../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICATION: {
            tags: () => {
              return {
                get: () => null
              }
            }
          },
          CONTACT: {
            role: () => ({
              getByApplicationId: jest.fn(() => ({ id: 'e8387a83-1165-42e6-afab-add01e77bc4c' }))
            }),
            isImmutable: () => true
          }
        }
      }))

      const { userCompletion } = await import('../user.js')
      const request = {
        cache: () => ({
          getData: jest.fn(() => ({
            userId: '54b5c443-e5e0-4d81-9daa-671a21bd88ca',
            applicationId: '35a6c59e-0faf-438b-b4d5-6967d8d075cb'
          })),
          getPageData: jest.fn(() => ({ payload: { 'yes-no': 'yes' } }))
        })
      }
      const result = await userCompletion('APPLICANT', ['ADDITIONAL-APPLICANT'],
        'APPLICANT_ORGANISATION', contactURIs.APPLICANT)(request)
      expect(result).toEqual('/applicant-organisation')
    })

    it('if no, returns the name page where no candidate contacts exist', async () => {
      jest.doMock('../../common.js', () => ({
        hasContactCandidates: () => false
      }))

      const { userCompletion } = await import('../user.js')
      const request = {
        cache: () => ({
          getData: jest.fn(() => ({
            userId: '54b5c443-e5e0-4d81-9daa-671a21bd88ca',
            applicationId: '35a6c59e-0faf-438b-b4d5-6967d8d075cb'
          })),
          getPageData: jest.fn(() => ({ payload: { 'yes-no': 'no' } }))
        })
      }
      const result = await userCompletion('APPLICANT', ['ADDITIONAL-APPLICANT'],
        'APPLICANT_ORGANISATION', contactURIs.APPLICANT)(request)
      expect(result).toEqual('/applicant-name')
    })

    it('if no, returns the names page where candidate contacts exist', async () => {
      jest.doMock('../../common.js', () => ({
        hasContactCandidates: () => true
      }))

      const { userCompletion } = await import('../user.js')
      const request = {
        cache: () => ({
          getData: jest.fn(() => ({
            userId: '54b5c443-e5e0-4d81-9daa-671a21bd88ca',
            applicationId: '35a6c59e-0faf-438b-b4d5-6967d8d075cb'
          })),
          getPageData: jest.fn(() => ({ payload: { 'yes-no': 'no' } }))
        })
      }
      const result = await userCompletion('APPLICANT', ['ADDITIONAL-APPLICANT'],
        'APPLICANT_ORGANISATION', contactURIs.APPLICANT)(request)
      expect(result).toEqual('/applicant-names')
    })
  })
})
