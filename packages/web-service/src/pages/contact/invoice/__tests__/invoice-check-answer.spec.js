describe('invoice check answers page', () => {
  beforeEach(() => jest.resetModules())

  describe('the getData function', () => {
    it('creates the correct output for the payer is applicant', async () => {
      const tagSet = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        tagStatus: {
          NOT_STARTED: 'not-started'
        },
        APIRequests: {
          CONTACT: {
            role: jest.fn().mockReturnValueOnce({
              getByApplicationId: () => ({ id: '6829ad54-bab7-4a78-8ca9-dcf722117a45' })
            }).mockReturnValueOnce({
              getByApplicationId: () => ({ id: '6829ad54-bab7-4a78-8ca9-dcf722117a45', fullName: 'Keith' })
            }).mockReturnValueOnce(({
              getByApplicationId: () => ({ id: '8829ad54-bab7-4a78-8ca9-dcf722117a45' })
            }))
          },
          ACCOUNT: {
            role: jest.fn().mockReturnValueOnce({
              getByApplicationId: () => ({ id: 'e8387a83-1165-42e6-afab-add01e77bc4c', address: { postcode: '123' } })
            })
          },
          APPLICATION: {
            tags: () => {
              return {
                set: tagSet
              }
            }
          }
        }
      }))
      const request = {
        cache: () => {
          return {
            getData: () => {
              return {
                applicationId: 'f789913d-a095-4150-8aaf-7addd38d3092'
              }
            }
          }
        }
      }
      const { getData } = await import('../invoice-check-answers.js')
      const result = await getData(request)
      expect(result).toEqual({
        checkYourAnswers: [
          {
            key: 'whoIsResponsible',
            value: 'Keith'
          },
          {
            key: 'contactOrganisations'
          },
          {
            key: 'address',
            value: '123'
          },
          {
            key: 'email'
          }
        ],
        responsibility: {
          account: {
            address: { postcode: '123' },
            id: 'e8387a83-1165-42e6-afab-add01e77bc4c'
          },
          contact: {
            fullName: 'Keith',
            id: '6829ad54-bab7-4a78-8ca9-dcf722117a45'
          },
          name: 'Keith',
          responsible: 'applicant'
        }
      })
    })

    it('creates the correct output for the payer is ecologist', async () => {
      const tagSet = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        tagStatus: {
          NOT_STARTED: 'not-started'
        },
        APIRequests: {
          CONTACT: {
            role: jest.fn().mockReturnValueOnce({
              getByApplicationId: () => ({ id: '6829ad54-bab7-4a78-8ca9-dcf722117a45' })
            }).mockReturnValueOnce({
              getByApplicationId: () => ({ id: '8829ad54-bab7-4a78-8ca9-dcf722117a45' })
            }).mockReturnValueOnce(({
              getByApplicationId: () => ({ id: '6829ad54-bab7-4a78-8ca9-dcf722117a45', fullName: 'Keith' })
            }))
          },
          ACCOUNT: {
            role: jest.fn().mockReturnValueOnce({
              getByApplicationId: () => ({ id: 'e8387a83-1165-42e6-afab-add01e77bc4c', address: { postcode: '123' } })
            })
          },
          APPLICATION: {
            tags: () => {
              return {
                set: tagSet
              }
            }
          }
        }
      }))
      const request = {
        cache: () => {
          return {
            getData: () => {
              return {
                applicationId: 'f789913d-a095-4150-8aaf-7addd38d3092'
              }
            }
          }
        }
      }
      const { getData } = await import('../invoice-check-answers.js')
      const result = await getData(request)
      expect(result).toEqual({
        checkYourAnswers: [
          {
            key: 'whoIsResponsible',
            value: 'Keith'
          },
          {
            key: 'contactOrganisations'
          },
          {
            key: 'address',
            value: '123'
          },
          {
            key: 'email'
          }
        ],
        responsibility: {
          account: {
            address: { postcode: '123' },
            id: 'e8387a83-1165-42e6-afab-add01e77bc4c'
          },
          contact: {
            fullName: 'Keith',
            id: '6829ad54-bab7-4a78-8ca9-dcf722117a45'
          },
          name: 'Keith',
          responsible: 'ecologist'
        }
      })
    })

    it('creates the correct output for the payer is other', async () => {
      const tagSet = jest.fn()
      jest.doMock('../../common/common-handler.js', () => {
        const actual = jest.requireActual('../../common/common-handler.js')
        return {
          checkHasContact: actual.checkHasContact,
          canBeUser: () => true
        }
      })
      jest.doMock('../../../../services/api-requests.js', () => ({
        tagStatus: {
          NOT_STARTED: 'not-started'
        },
        APIRequests: {
          CONTACT: {
            role: jest.fn().mockReturnValueOnce({
              getByApplicationId: () => ({ id: '6829ad54-bab7-4a78-8ca9-dcf722117a45', fullName: 'Keith' })
            }).mockReturnValueOnce({
              getByApplicationId: () => ({ id: '8829ad54-bab7-4a78-8ca9-dcf722117a45' })
            }).mockReturnValueOnce(({
              getByApplicationId: () => ({ id: '9829ad54-bab7-4a78-8ca9-dcf722117a45' })
            }))
          },
          ACCOUNT: {
            role: jest.fn().mockReturnValueOnce({
              getByApplicationId: () => ({ id: 'e8387a83-1165-42e6-afab-add01e77bc4c', address: { postcode: '123' } })
            })
          },
          APPLICATION: {
            tags: () => {
              return {
                set: tagSet
              }
            }
          }
        }
      }))
      const request = {
        cache: () => {
          return {
            getData: () => {
              return {
                applicationId: 'f789913d-a095-4150-8aaf-7addd38d3092'
              }
            }
          }
        }
      }
      const { getData } = await import('../invoice-check-answers.js')
      const result = await getData(request)
      expect(result).toEqual({
        checkYourAnswers: [
          {
            key: 'whoIsResponsible',
            value: 'Keith'
          },
          {
            key: 'contactIsUser',
            value: 'no'
          },
          {
            key: 'contactIsOrganisation',
            value: 'yes'
          },
          {
            key: 'contactOrganisations'
          },
          {
            key: 'address',
            value: '123'
          },
          {
            key: 'email'
          }
        ],
        responsibility: {
          account: {
            address: {
              postcode: '123'
            },
            id: 'e8387a83-1165-42e6-afab-add01e77bc4c'
          },
          contact: {
            fullName: 'Keith',
            id: '6829ad54-bab7-4a78-8ca9-dcf722117a45'
          },
          name: 'Keith',
          responsible: 'other'
        }
      })
    })
  })

  describe('the completion function', () => {
    it('sets the tag in completion', async () => {
      const tagSet = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        tagStatus: {
          NOT_STARTED: 'not-started'
        },
        APIRequests: {
          APPLICATION: {
            tags: () => {
              return {
                set: tagSet
              }
            }
          }
        }
      }))
      const request = {
        cache: () => {
          return {
            getData: () => {
              return {
                applicationId: 'abe123'
              }
            }
          }
        }
      }
      const { completion } = await import('../invoice-check-answers.js')
      await completion(request)
      expect(tagSet).toHaveBeenCalledTimes(1)
    })

    it('returns TASKLIST.uri', async () => {
      const tagSet = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        tagStatus: {
          NOT_STARTED: 'not-started'
        },
        APIRequests: {
          APPLICATION: {
            tags: () => {
              return {
                set: tagSet
              }
            }
          }
        }
      }))
      const request = {
        cache: () => {
          return {
            getData: () => {
              return {
                applicationId: 'abe123'
              }
            }
          }
        }
      }
      const { completion } = await import('../invoice-check-answers.js')
      expect(await completion(request)).toBe('/tasklist')
      expect(tagSet).toHaveBeenCalledTimes(1)
    })
  })
})
