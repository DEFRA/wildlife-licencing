describe('invoice contact details page', () => {
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
      const { getData } = await import('../invoice-contact-details.js')
      const result = await getData(request)
      expect(result).toEqual({
        checkYourAnswers: [
          {
            key: 'whoIsResponsible',
            value: 'Keith'
          },
          {
            key: 'email',
            value: undefined
          },
          {
            key: 'contactOrganisations',
            value: undefined
          },
          {
            key: 'address',
            value: '123'
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
      const { getData } = await import('../invoice-contact-details.js')
      const result = await getData(request)
      expect(result).toEqual({
        checkYourAnswers: [
          {
            key: 'whoIsResponsible',
            value: 'Keith'
          },
          {
            key: 'email',
            value: undefined
          },
          {
            key: 'contactOrganisations',
            value: undefined
          },
          {
            key: 'address',
            value: '123'
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
  })

  describe('the completion function', () => {
    it('returns purchase order page if input it yes', async () => {
      const request = {
        cache: () => {
          return {
            getPageData: () => {
              return {
                payload: {
                  'yes-no': 'yes'
                }
              }
            }
          }
        }
      }
      const { completion } = await import('../invoice-contact-details.js')
      expect(await completion(request)).toBe('/invoice-payer-check-answers')
    })
    it('returns the invoice responsible page if input is no', async () => {
      const request = {
        cache: () => {
          return {
            getPageData: () => {
              return {
                payload: {
                  'yes-no': 'no'
                }
              }
            }
          }
        }
      }
      const { completion } = await import('../invoice-contact-details.js')
      expect(await completion(request)).toBe('/invoice-payer-responsibility')
    })
  })

  it('getData calls the necessary contact APIs', async () => {
    const roleFn = jest.fn()
    const getByApplicationIdMock = jest.fn()
    const accountRoleFn = jest.fn()

    roleFn.mockImplementation(() => { return { id: '', getByApplicationId: getByApplicationIdMock } })
    getByApplicationIdMock.mockImplementation(() => { return { id: '' } })
    accountRoleFn.mockImplementation(() => { return { getByApplicationId: jest.fn() } })

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
        ACCOUNT: {
          role: accountRoleFn
        },
        CONTACT: {
          role: roleFn
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
    const { getData } = await import('../invoice-contact-details.js')
    await getData(request)
    expect(roleFn).toHaveBeenCalledWith('APPLICANT')
    expect(roleFn).toHaveBeenCalledWith('ECOLOGIST')
    expect(roleFn).toHaveBeenCalledWith('PAYER')
  })
})
