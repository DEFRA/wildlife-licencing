describe('contact operations', () => {
  beforeEach(() => jest.resetModules())
  describe('contactOperations', () => {
    it('the create function generates the correct contact', async () => {
      const mockCreate = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          CONTACT: {
            role: () => ({
              getByApplicationId: jest.fn(() => null),
              create: mockCreate
            })
          }
        }
      }))
      const { contactOperations } = await import('../operations.js')
      const contactOps = contactOperations('APPLICANT', '54b5c443-e5e0-4d81-9daa-671a21bd88ca',
        'f6a4d9e0-2611-44cb-9ea3-12bb7e5459eb')
      await contactOps.create(false, 'Brian Ferry')
      expect(mockCreate).toHaveBeenCalledWith('54b5c443-e5e0-4d81-9daa-671a21bd88ca', { fullName: 'Brian Ferry' })
    })

    it('the create function does nothing where a contact is already assigned', async () => {
      const mockCreate = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          CONTACT: {
            role: () => ({
              getByApplicationId: jest.fn(() => ({ id: '54b5c443-e5e0-4d81-9daa-671a21bd88ca' })),
              create: mockCreate
            })
          }
        }
      }))
      const { contactOperations } = await import('../operations.js')
      const contactOps = contactOperations('APPLICANT', '54b5c443-e5e0-4d81-9daa-671a21bd88ca',
        'f6a4d9e0-2611-44cb-9ea3-12bb7e5459eb')
      await contactOps.create(false, 'Brian Ferry')
      expect(mockCreate).not.toHaveBeenCalled()
    })

    it('the create function generates the correct contact as the signed in user', async () => {
      const mockCreate = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          CONTACT: {
            role: () => ({
              getByApplicationId: jest.fn(() => null),
              create: mockCreate
            })
          },
          USER: {
            getById: jest.fn(() => ({
              id: '54b5c443-e5e0-4d81-9daa-671a21bd88ca',
              username: 'brian.ferry@roxymusic.com'
            }))
          }
        }
      }))
      const { contactOperations } = await import('../operations.js')
      const contactOps = contactOperations('APPLICANT', '54b5c443-e5e0-4d81-9daa-671a21bd88ca',
        'f6a4d9e0-2611-44cb-9ea3-12bb7e5459eb')
      await contactOps.create(true, 'Brian Ferry')
      expect(mockCreate).toHaveBeenCalledWith('54b5c443-e5e0-4d81-9daa-671a21bd88ca',
        { contactDetails: { email: 'brian.ferry@roxymusic.com' }, fullName: 'Brian Ferry', userId: '54b5c443-e5e0-4d81-9daa-671a21bd88ca' })
    })

    it('the assign function reassigned a contact where a contact is already assigned', async () => {
      const mockUnlink = jest.fn()
      const mockAssign = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          CONTACT: {
            role: () => ({
              getByApplicationId: jest.fn()
                .mockReturnValueOnce({ id: '64b5c443-e5e0-4d81-9daa-671a21bd88ca' })
                .mockReturnValue({ id: '2ca1677a-eb38-47ef-8759-d85b2b4b2e5c' }),
              unLink: mockUnlink,
              assign: mockAssign
            })
          }
        }
      }))
      const { contactOperations } = await import('../operations.js')
      const contactOps = contactOperations('APPLICANT', '8d79bc16-02fe-4e3c-85ac-b8d792b59b94',
        'f6a4d9e0-2611-44cb-9ea3-12bb7e5459eb')
      await contactOps.assign('2ca1677a-eb38-47ef-8759-d85b2b4b2e5c')
      expect(mockUnlink).toHaveBeenCalledWith('8d79bc16-02fe-4e3c-85ac-b8d792b59b94', '64b5c443-e5e0-4d81-9daa-671a21bd88ca')
      expect(mockAssign).toHaveBeenCalledWith('8d79bc16-02fe-4e3c-85ac-b8d792b59b94', '2ca1677a-eb38-47ef-8759-d85b2b4b2e5c')
    })

    it('the assign function does nothing if the contact is not changing', async () => {
      const mockUnlink = jest.fn()
      const mockAssign = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          CONTACT: {
            role: () => ({
              getByApplicationId: jest.fn()
                .mockReturnValueOnce({ id: '2ca1677a-eb38-47ef-8759-d85b2b4b2e5c' }),
              unLink: mockUnlink,
              assign: mockAssign
            })
          }
        }
      }))
      const { contactOperations } = await import('../operations.js')
      const contactOps = contactOperations('APPLICANT', '8d79bc16-02fe-4e3c-85ac-b8d792b59b94',
        'f6a4d9e0-2611-44cb-9ea3-12bb7e5459eb')
      await contactOps.assign('2ca1677a-eb38-47ef-8759-d85b2b4b2e5c')
      expect(mockUnlink).not.toHaveBeenCalled()
      expect(mockAssign).not.toHaveBeenCalled()
    })

    it('the assign function does not unlink if no contact is yet assigned', async () => {
      const mockUnlink = jest.fn()
      const mockAssign = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          CONTACT: {
            role: () => ({
              getByApplicationId: jest.fn()
                .mockReturnValueOnce(null)
                .mockReturnValueOnce({ id: '2ca1677a-eb38-47ef-8759-d85b2b4b2e5c' }),
              unLink: mockUnlink,
              assign: mockAssign
            })
          }
        }
      }))
      const { contactOperations } = await import('../operations.js')
      const contactOps = contactOperations('APPLICANT', '8d79bc16-02fe-4e3c-85ac-b8d792b59b94',
        'f6a4d9e0-2611-44cb-9ea3-12bb7e5459eb')
      await contactOps.assign('2ca1677a-eb38-47ef-8759-d85b2b4b2e5c')
      expect(mockUnlink).not.toHaveBeenCalled()
      expect(mockAssign).toHaveBeenCalledWith('8d79bc16-02fe-4e3c-85ac-b8d792b59b94', '2ca1677a-eb38-47ef-8759-d85b2b4b2e5c')
    })

    it('the unAssign function calls unlink if a contact is assigned', async () => {
      const mockUnlink = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          CONTACT: {
            role: () => ({
              getByApplicationId: jest.fn()
                .mockReturnValue({ id: '2ca1677a-eb38-47ef-8759-d85b2b4b2e5c' }),
              unLink: mockUnlink
            })
          }
        }
      }))
      const { contactOperations } = await import('../operations.js')
      const contactOps = contactOperations('APPLICANT',
        '8d79bc16-02fe-4e3c-85ac-b8d792b59b94',
        'f6a4d9e0-2611-44cb-9ea3-12bb7e5459eb')
      await contactOps.unAssign('2ca1677a-eb38-47ef-8759-d85b2b4b2e5c')
      expect(mockUnlink).toHaveBeenCalledWith('8d79bc16-02fe-4e3c-85ac-b8d792b59b94', '2ca1677a-eb38-47ef-8759-d85b2b4b2e5c')
    })

    it('the unAssign function does nothing if no contact is assigned', async () => {
      const mockUnlink = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          CONTACT: {
            role: () => ({
              getByApplicationId: jest.fn().mockReturnValue(null),
              unLink: mockUnlink
            })
          }
        }
      }))
      const { contactOperations } = await import('../operations.js')
      const contactOps = contactOperations('APPLICANT',
        '8d79bc16-02fe-4e3c-85ac-b8d792b59b94',
        'f6a4d9e0-2611-44cb-9ea3-12bb7e5459eb')
      await contactOps.unAssign('2ca1677a-eb38-47ef-8759-d85b2b4b2e5c')
      expect(mockUnlink).not.toHaveBeenCalled()
    })

    it('the setName function will migrate an immutable contact', async () => {
      const mockCreate = jest.fn()
      const mockUnAssign = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          USER: {
            getById: jest.fn().mockReturnValue({ id: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c' })
          },
          CONTACT: {
            role: () => ({
              create: mockCreate,
              unAssign: mockUnAssign,
              getByApplicationId: jest.fn().mockReturnValue(
                {
                  id: '2ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
                  address: 'Address',
                  contactDetails: { email: 'email@email.com' },
                  cloneOf: '3ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
                  userId: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c'
                })
            }),
            isImmutable: () => true
          }
        }
      }))
      const { contactOperations } = await import('../operations.js')
      const contactOps = contactOperations('APPLICANT',
        '8d79bc16-02fe-4e3c-85ac-b8d792b59b94',
        'f6a4d9e0-2611-44cb-9ea3-12bb7e5459eb')
      await contactOps.setName('Jon Bonham')
      expect(mockUnAssign).toHaveBeenCalledWith('8d79bc16-02fe-4e3c-85ac-b8d792b59b94', '2ca1677a-eb38-47ef-8759-d85b2b4b2e5c')
      expect(mockCreate).toHaveBeenCalledWith('8d79bc16-02fe-4e3c-85ac-b8d792b59b94',
        {
          address: 'Address',
          cloneOf: '2ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
          contactDetails: { email: 'email@email.com' },
          fullName: 'Jon Bonham',
          userId: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c'
        })
    })

    it('the setName function does nothing if no contact is assigned', async () => {
      const mockUpdate = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          CONTACT: {
            role: () => ({
              getByApplicationId: jest.fn().mockReturnValue(null),
              update: mockUpdate
            })
          },
          isImmutable: () => true
        }
      }))
      const { contactOperations } = await import('../operations.js')
      const contactOps = contactOperations('APPLICANT',
        '8d79bc16-02fe-4e3c-85ac-b8d792b59b94',
        'f6a4d9e0-2611-44cb-9ea3-12bb7e5459eb')
      await contactOps.setName('Jon Bonham')
      expect(mockUpdate).not.toHaveBeenCalled()
    })

    it('the setName function sets the name if a contact is assigned and retains any other details', async () => {
      const mockUpdate = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          CONTACT: {
            role: () => ({
              getByApplicationId: jest.fn().mockReturnValue({
                id: '2ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
                address: 'Address',
                contactDetails: { email: 'email@email.com' },
                cloneOf: '3ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
                userId: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c'
              })
            }),
            isImmutable: () => false,
            update: mockUpdate
          }
        }
      }))
      const { contactOperations } = await import('../operations.js')
      const contactOps = contactOperations('APPLICANT',
        '8d79bc16-02fe-4e3c-85ac-b8d792b59b94',
        'f6a4d9e0-2611-44cb-9ea3-12bb7e5459eb')
      await contactOps.setName('Jon Bonham')
      expect(mockUpdate).toHaveBeenCalledWith('2ca1677a-eb38-47ef-8759-d85b2b4b2e5c', {
        address: 'Address',
        cloneOf: '3ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
        contactDetails: { email: 'email@email.com' },
        fullName: 'Jon Bonham',
        userId: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c'
      })
    })
    it('contact is mutable', async () => {
      const mockUpdateContact = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          USER: {
            getById: jest.fn().mockReturnValue({
              id: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
              username: 'Roger.Walters@email.com'
            })
          },
          CONTACT: {
            role: () => ({
              getByApplicationId: jest.fn().mockReturnValue({
                id: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
                contactDetails: { email: 'richard.wright@email.com' },
                cloneOf: '3ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
                fullName: 'Richard Wright',
                address: 'Address'
              })
            }),
            isImmutable: () => false,
            update: mockUpdateContact
          }
        }
      }))
      const { contactOperations } = await import('../operations.js')
      const ops = contactOperations('APPLICANT',
        '2ca1677a-eb38-47ef-8759-d85b2b4b2e5c', '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c')
      await ops.setContactIsUser(true)
      expect(mockUpdateContact).toHaveBeenCalledWith('4ca1677a-eb38-47ef-8759-d85b2b4b2e5c', {
        contactDetails: { email: 'Roger.Walters@email.com' },
        cloneOf: '3ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
        fullName: 'Richard Wright',
        address: 'Address',
        userId: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c'
      })
    })

    it('contact is immutable', async () => {
      const mockCreateContact = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          USER: {
            getById: jest.fn().mockReturnValue({
              id: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
              username: 'Roger.Walters@email.com'
            })
          },
          CONTACT: {
            role: () => ({
              getByApplicationId: jest.fn().mockReturnValue({
                id: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
                contactDetails: { email: 'richard.wright@email.com' },
                cloneOf: '3ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
                fullName: 'Richard Wright',
                address: 'Address'
              }),
              create: mockCreateContact,
              unAssign: jest.fn()
            }),
            isImmutable: () => true
          }
        }
      }))
      const { contactOperations } = await import('../operations.js')
      const ops = contactOperations('APPLICANT',
        '2ca1677a-eb38-47ef-8759-d85b2b4b2e5c', '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c')
      await ops.setContactIsUser(true)
      expect(mockCreateContact).toHaveBeenCalledWith('2ca1677a-eb38-47ef-8759-d85b2b4b2e5c', {
        contactDetails: { email: 'Roger.Walters@email.com' },
        cloneOf: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
        fullName: 'Richard Wright',
        address: 'Address',
        userId: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c'
      })
    })

    it('contact is mutable', async () => {
      const mockUpdateContact = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          USER: {
            getById: jest.fn().mockReturnValue({
              id: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
              username: 'Roger.Walters@email.com'
            })
          },
          CONTACT: {
            role: () => ({
              getByApplicationId: jest.fn().mockReturnValue({
                id: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
                contactDetails: { email: 'RickWright@email.com' },
                cloneOf: '3ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
                fullName: 'Richard Wright',
                address: 'Address',
                userId: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c'
              })
            }),
            isImmutable: () => false,
            update: mockUpdateContact
          }
        }
      }))
      const { contactOperations } = await import('../operations.js')
      const ops = contactOperations('APPLICANT',
        '2ca1677a-eb38-47ef-8759-d85b2b4b2e5c', '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c')
      await ops.setContactIsUser(false)
      expect(mockUpdateContact).toHaveBeenCalledWith('4ca1677a-eb38-47ef-8759-d85b2b4b2e5c', {
        contactDetails: { email: 'RickWright@email.com' },
        cloneOf: '3ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
        fullName: 'Richard Wright',
        address: 'Address'
      })
    })

    it('contact is immutable', async () => {
      const mockCreateContact = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          USER: {
            getById: jest.fn().mockReturnValue({
              id: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
              username: 'Roger.Walters@email.com'
            })
          },
          CONTACT: {
            role: () => ({
              getByApplicationId: jest.fn().mockReturnValue({
                id: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
                contactDetails: { email: 'richard.wright@email.com' },
                cloneOf: '3ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
                fullName: 'Richard Wright',
                address: 'Address',
                userId: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c'
              }),
              create: mockCreateContact,
              unAssign: jest.fn()
            }),
            isImmutable: () => true
          },
          ACCOUNT: {
            role: () => ({
              getByApplicationId: jest.fn().mockReturnValue(null)
            })
          }
        }
      }))
      const { contactOperations } = await import('../operations.js')
      const ops = contactOperations('APPLICANT',
        '2ca1677a-eb38-47ef-8759-d85b2b4b2e5c', '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c')
      await ops.setContactIsUser(false)
      expect(mockCreateContact).toHaveBeenCalledWith('2ca1677a-eb38-47ef-8759-d85b2b4b2e5c', {
        contactDetails: { email: 'richard.wright@email.com' },
        cloneOf: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
        fullName: 'Richard Wright',
        address: 'Address'
      })
    })
  })

  describe('accountOperations', () => {
    it('creates the account with the name supplied', async () => {
      const mockCreate = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          ACCOUNT: {
            role: () => ({
              getByApplicationId: jest.fn().mockReturnValue(null),
              create: mockCreate
            })
          }
        }
      }))
      const { accountOperations } = await import('../operations.js')
      const acctOps = accountOperations('APPLICANT_ORGANISATION', '8d79bc16-02fe-4e3c-85ac-b8d792b59b94')
      await acctOps.create('Organisation name')
      expect(mockCreate).toHaveBeenCalledWith('8d79bc16-02fe-4e3c-85ac-b8d792b59b94', { name: 'Organisation name' })
    })

    it('creates the account with no name', async () => {
      const mockCreate = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          ACCOUNT: {
            role: () => ({
              getByApplicationId: jest.fn().mockReturnValue(null),
              create: mockCreate
            })
          }
        }
      }))
      const { accountOperations } = await import('../operations.js')
      const acctOps = accountOperations('APPLICANT_ORGANISATION', '8d79bc16-02fe-4e3c-85ac-b8d792b59b94')
      await acctOps.create()
      expect(mockCreate).toHaveBeenCalledWith('8d79bc16-02fe-4e3c-85ac-b8d792b59b94', {})
    })

    it('does not create an account if one is assigned', async () => {
      const mockCreate = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          ACCOUNT: {
            role: () => ({
              getByApplicationId: jest.fn().mockReturnValue({ id: '3ca1677a-eb38-47ef-8759-d85b2b4b2e5c' }),
              create: mockCreate
            })
          }
        }
      }))
      const { accountOperations } = await import('../operations.js')
      const acctOps = accountOperations('APPLICANT_ORGANISATION', '8d79bc16-02fe-4e3c-85ac-b8d792b59b94')
      await acctOps.create()
      expect(mockCreate).not.toHaveBeenCalled()
    })

    it('assign re-assigns the account if one is already assigned', async () => {
      const mockUnlink = jest.fn()
      const mockAssign = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          ACCOUNT: {
            role: () => ({
              getByApplicationId: jest.fn()
                .mockReturnValueOnce({ id: '64b5c443-e5e0-4d81-9daa-671a21bd88ca' }),
              unLink: mockUnlink,
              assign: mockAssign
            })
          }
        }
      }))
      const { accountOperations } = await import('../operations.js')
      const acctOps = accountOperations('APPLICANT_ORGANISATION', '8d79bc16-02fe-4e3c-85ac-b8d792b59b94')
      await acctOps.assign('2ca1677a-eb38-47ef-8759-d85b2b4b2e5c')
      expect(mockUnlink).toHaveBeenCalledWith('8d79bc16-02fe-4e3c-85ac-b8d792b59b94', '64b5c443-e5e0-4d81-9daa-671a21bd88ca')
      expect(mockAssign).toHaveBeenCalledWith('8d79bc16-02fe-4e3c-85ac-b8d792b59b94', '2ca1677a-eb38-47ef-8759-d85b2b4b2e5c')
    })

    it('assign assigns a new the account', async () => {
      const mockUnlink = jest.fn()
      const mockAssign = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          ACCOUNT: {
            role: () => ({
              getByApplicationId: jest.fn()
                .mockReturnValueOnce(null),
              unLink: mockUnlink,
              assign: mockAssign
            })
          }
        }
      }))
      const { accountOperations } = await import('../operations.js')
      const acctOps = accountOperations('APPLICANT_ORGANISATION', '8d79bc16-02fe-4e3c-85ac-b8d792b59b94')
      await acctOps.assign('2ca1677a-eb38-47ef-8759-d85b2b4b2e5c')
      expect(mockUnlink).not.toHaveBeenCalled()
      expect(mockAssign).toHaveBeenCalledWith('8d79bc16-02fe-4e3c-85ac-b8d792b59b94', '2ca1677a-eb38-47ef-8759-d85b2b4b2e5c')
    })

    it('un-assign un-assigns an account', async () => {
      const mockUnlink = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          ACCOUNT: {
            role: () => ({
              getByApplicationId: jest.fn()
                .mockReturnValueOnce({ id: '64b5c443-e5e0-4d81-9daa-671a21bd88ca' }),
              unLink: mockUnlink
            })
          }
        }
      }))
      const { accountOperations } = await import('../operations.js')
      const acctOps = accountOperations('APPLICANT_ORGANISATION', '8d79bc16-02fe-4e3c-85ac-b8d792b59b94')
      await acctOps.unAssign()
      expect(mockUnlink).toHaveBeenCalledWith('8d79bc16-02fe-4e3c-85ac-b8d792b59b94', '64b5c443-e5e0-4d81-9daa-671a21bd88ca')
    })

    it('the setName function sets the name if an account is assigned and retains any other details', async () => {
      const mockUpdate = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          ACCOUNT: {
            role: () => ({
              getByApplicationId: jest.fn().mockReturnValue(
                {
                  id: '2ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
                  address: 'Address',
                  contactDetails: { email: 'email@email.com' },
                  cloneOf: '3ca1677a-eb38-47ef-8759-d85b2b4b2e5c'
                })
            }),
            isImmutable: () => false,
            update: mockUpdate
          }
        }
      }))
      const { accountOperations } = await import('../operations.js')
      const acctOps = accountOperations('APPLICANT_ORGANISATION', '8d79bc16-02fe-4e3c-85ac-b8d792b59b94')
      await acctOps.setName('Led Zeppelin')
      expect(mockUpdate).toHaveBeenCalledWith('2ca1677a-eb38-47ef-8759-d85b2b4b2e5c', {
        address: 'Address',
        cloneOf: '3ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
        contactDetails: { email: 'email@email.com' },
        name: 'Led Zeppelin'
      })
    })

    it('the setName function does nothing if the account is immutable', async () => {
      const mockUpdate = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          ACCOUNT: {
            role: () => ({
              getByApplicationId: jest.fn().mockReturnValue(
                {
                  id: '2ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
                  address: 'Address',
                  contactDetails: { email: 'email@email.com' },
                  cloneOf: '3ca1677a-eb38-47ef-8759-d85b2b4b2e5c'
                }),
              update: mockUpdate
            }),
            isImmutable: () => true
          }
        }
      }))
      const { accountOperations } = await import('../operations.js')
      const acctOps = accountOperations('APPLICANT_ORGANISATION', '8d79bc16-02fe-4e3c-85ac-b8d792b59b94')
      await acctOps.setName('Led Zeppelin')
      expect(mockUpdate).not.toHaveBeenCalled()
    })

    it('the setName function does nothing if no account is assigned', async () => {
      const mockUpdate = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          ACCOUNT: {
            role: () => ({
              getByApplicationId: jest.fn().mockReturnValue(null),
              update: mockUpdate
            })
          }
        }
      }))
      const { accountOperations } = await import('../operations.js')
      const acctOps = accountOperations('APPLICANT_ORGANISATION', '8d79bc16-02fe-4e3c-85ac-b8d792b59b94')
      await acctOps.setName('Led Zeppelin')
      expect(mockUpdate).not.toHaveBeenCalled()
    })
  })

  describe('contactAccountOperations - setEmailAddress', () => {
    it('sets the email address on a mutable contact, retaining other fields', async () => {
      const mockUpdate = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          USER: {
            getById: jest.fn().mockReturnValue({ id: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c' })
          },
          CONTACT: {
            role: () => ({
              getByApplicationId: jest.fn().mockReturnValue({
                id: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
                address: 'Address',
                cloneOf: '3ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
                userId: '2ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
                fullName: 'Richard Wright'
              })
            }),
            update: mockUpdate,
            isImmutable: () => false
          },
          ACCOUNT: {
            role: () => ({
              getByApplicationId: jest.fn().mockReturnValue(null)
            }),
            isImmutable: () => null
          }
        }
      }))
      const { contactAccountOperations } = await import('../operations.js')
      const ops = contactAccountOperations('APPLICANT', 'APPLICANT_ORGANISATION',
        '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c', '2ca1677a-eb38-47ef-8759-d85b2b4b2e5c')
      await ops.setEmailAddress('Rick.wright@email.com')
      expect(mockUpdate).toHaveBeenCalledWith('4ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
        {
          address: 'Address',
          cloneOf: '3ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
          contactDetails: { email: 'Rick.wright@email.com' },
          fullName: 'Richard Wright',
          userId: '2ca1677a-eb38-47ef-8759-d85b2b4b2e5c'
        }
      )
    })

    it('sets the email address on a clone of an immutable contact, retaining other fields - user associated', async () => {
      const mockCreate = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          USER: {
            getById: jest.fn().mockReturnValue({ id: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c' })
          },
          CONTACT: {
            role: () => ({
              getByApplicationId: jest.fn().mockReturnValue({
                id: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
                address: 'Address',
                userId: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
                fullName: 'Richard Wright'
              }),
              create: mockCreate,
              unAssign: jest.fn()
            }),
            isImmutable: () => true
          },
          ACCOUNT: {
            role: () => ({
              getByApplicationId: jest.fn().mockReturnValue(null)
            }),
            isImmutable: () => null
          }
        }
      }))
      const { contactAccountOperations } = await import('../operations.js')
      const ops = contactAccountOperations('APPLICANT', 'APPLICANT_ORGANISATION',
        '2ca1677a-eb38-47ef-8759-d85b2b4b2e5c', '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c')
      await ops.setEmailAddress('Rick.wright@email.com')
      expect(mockCreate).toHaveBeenCalledWith('2ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
        {
          address: 'Address',
          cloneOf: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
          contactDetails: { email: 'Rick.wright@email.com' },
          fullName: 'Richard Wright',
          userId: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c'
        }
      )
    })

    it('sets the email address on a clone of an immutable contact, retaining other fields - no user associated', async () => {
      const mockCreate = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          USER: {
            getById: jest.fn().mockReturnValue({ id: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c' })
          },
          CONTACT: {
            role: () => ({
              getByApplicationId: jest.fn().mockReturnValue({
                id: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
                address: 'Address',
                fullName: 'Richard Wright'
              }),
              create: mockCreate,
              unAssign: jest.fn()
            }),
            isImmutable: () => true
          },
          ACCOUNT: {
            role: () => ({
              getByApplicationId: jest.fn().mockReturnValue(null)
            }),
            isImmutable: () => null
          }
        }
      }))
      const { contactAccountOperations } = await import('../operations.js')
      const ops = contactAccountOperations('APPLICANT', 'APPLICANT_ORGANISATION',
        '2ca1677a-eb38-47ef-8759-d85b2b4b2e5c', '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c')
      await ops.setEmailAddress('Rick.wright@email.com')
      expect(mockCreate).toHaveBeenCalledWith('2ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
        {
          address: 'Address',
          cloneOf: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
          contactDetails: { email: 'Rick.wright@email.com' },
          fullName: 'Richard Wright'
        }
      )
    })

    it('sets the email address on a mutable account, retaining other fields', async () => {
      const mockUpdate = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          USER: {
            getById: jest.fn().mockReturnValue({ id: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c' })
          },
          CONTACT: {
            role: () => ({
              getByApplicationId: jest.fn().mockReturnValue({
                id: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
                fullName: 'Richard Wright',
                userId: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c'
              })
            }),
            isImmutable: () => false
          },
          ACCOUNT: {
            role: () => ({
              getByApplicationId: jest.fn().mockReturnValue({
                id: '6ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
                address: 'Address',
                name: 'Pink Floyd'
              }),
              unAssign: jest.fn()
            }),
            update: mockUpdate,
            isImmutable: () => false
          }
        }
      }))
      const { contactAccountOperations } = await import('../operations.js')
      const ops = contactAccountOperations('APPLICANT', 'APPLICANT_ORGANISATION',
        '2ca1677a-eb38-47ef-8759-d85b2b4b2e5c', '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c')
      await ops.setEmailAddress('Rick.wright@pinkfloyd.com')
      expect(mockUpdate).toHaveBeenCalledWith('6ca1677a-eb38-47ef-8759-d85b2b4b2e5c', {
        address: 'Address',
        contactDetails: { email: 'Rick.wright@pinkfloyd.com' },
        name: 'Pink Floyd'
      })
    })

    it('sets the email address on a clone of an immutable account, retaining other fields', async () => {
      const mockCreate = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          USER: {
            getById: jest.fn().mockReturnValue({ id: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c' })
          },
          CONTACT: {
            role: () => ({
              getByApplicationId: jest.fn().mockReturnValue({
                id: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
                fullName: 'Richard Wright'
              })
            }),
            isImmutable: () => false
          },
          ACCOUNT: {
            role: () => ({
              getByApplicationId: jest.fn().mockReturnValue({
                id: '6ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
                address: 'Address',
                userId: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
                name: 'Pink Floyd'
              }),
              create: mockCreate,
              unAssign: jest.fn()
            }),
            isImmutable: () => true
          }
        }
      }))
      const { contactAccountOperations } = await import('../operations.js')
      const ops = contactAccountOperations('APPLICANT', 'APPLICANT_ORGANISATION',
        '2ca1677a-eb38-47ef-8759-d85b2b4b2e5c', '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c')
      await ops.setEmailAddress('Rick.wright@pinkfloyd.com')
      expect(mockCreate).toHaveBeenCalledWith('2ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
        {
          address: 'Address',
          contactDetails: { email: 'Rick.wright@pinkfloyd.com' },
          name: 'Pink Floyd',
          cloneOf: '6ca1677a-eb38-47ef-8759-d85b2b4b2e5c'
        }
      )
    })
  })

  describe('contactAccountOperations - setAddress', () => {
    it('sets the address on a mutable contact, retaining other fields', async () => {
      const mockUpdate = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          USER: {
            getById: jest.fn().mockReturnValue({ id: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c' })
          },
          CONTACT: {
            role: () => ({
              getByApplicationId: jest.fn().mockReturnValue({
                id: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
                contactDetails: { email: 'David.Gilmore@floyd.com' },
                cloneOf: '3ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
                userId: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
                fullName: 'Richard Wright'
              })
            }),
            isImmutable: () => false,
            update: mockUpdate
          },
          ACCOUNT: {
            role: () => ({
              getByApplicationId: jest.fn().mockReturnValue(null)
            }),
            isImmutable: () => null
          }
        }
      }))
      const { contactAccountOperations } = await import('../operations.js')
      const ops = contactAccountOperations('APPLICANT', 'APPLICANT_ORGANISATION',
        '2ca1677a-eb38-47ef-8759-d85b2b4b2e5c', '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c')
      await ops.setAddress('Address')
      expect(mockUpdate).toHaveBeenCalledWith('4ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
        {
          address: 'Address',
          cloneOf: '3ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
          contactDetails: { email: 'David.Gilmore@floyd.com' },
          fullName: 'Richard Wright',
          userId: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c'
        }
      )
    })

    it('sets the address on a clone of an immutable contact, retaining other fields - user associated', async () => {
      const mockCreate = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          USER: {
            getById: jest.fn().mockReturnValue({ id: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c' })
          },
          CONTACT: {
            role: () => ({
              getByApplicationId: jest.fn().mockReturnValue({
                id: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
                address: 'Address',
                userId: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
                fullName: 'Richard Wright'
              }),
              create: mockCreate,
              unAssign: jest.fn()
            }),
            isImmutable: () => true
          },
          ACCOUNT: {
            role: () => ({
              getByApplicationId: jest.fn().mockReturnValue(null)
            }),
            isImmutable: () => null
          }
        }
      }))
      const { contactAccountOperations } = await import('../operations.js')
      const ops = contactAccountOperations('APPLICANT', 'APPLICANT_ORGANISATION',
        '2ca1677a-eb38-47ef-8759-d85b2b4b2e5c', '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c')
      await ops.setEmailAddress('Rick.wright@email.com')
      expect(mockCreate).toHaveBeenCalledWith('2ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
        {
          address: 'Address',
          cloneOf: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
          contactDetails: { email: 'Rick.wright@email.com' },
          fullName: 'Richard Wright',
          userId: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c'
        }
      )
    })

    it('sets the address on a clone of an immutable contact, retaining other fields - no user associated', async () => {
      const mockCreate = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          USER: {
            getById: jest.fn().mockReturnValue({ id: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c' })
          },
          CONTACT: {
            role: () => ({
              getByApplicationId: jest.fn().mockReturnValue({
                id: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
                contactDetails: { email: 'David.Gilmore@floyd.com' },
                fullName: 'David Gilmore'
              }),
              create: mockCreate,
              unAssign: jest.fn()
            }),
            isImmutable: () => true
          },
          ACCOUNT: {
            role: () => ({
              getByApplicationId: jest.fn().mockReturnValue(null)
            }),
            isImmutable: () => true
          }
        }
      }))
      const { contactAccountOperations } = await import('../operations.js')
      const ops = contactAccountOperations('APPLICANT', 'APPLICANT_ORGANISATION',
        '2ca1677a-eb38-47ef-8759-d85b2b4b2e5c', '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c')
      await ops.setAddress('Address')
      expect(mockCreate).toHaveBeenCalledWith('2ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
        {
          address: 'Address',
          cloneOf: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
          contactDetails: { email: 'David.Gilmore@floyd.com' },
          fullName: 'David Gilmore'
        }
      )
    })

    it('sets the address on a clone of a mutable account, retaining other fields', async () => {
      const mockUpdate = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          USER: {
            getById: jest.fn().mockReturnValue({ id: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c' })
          },
          CONTACT: {
            role: () => ({
              getByApplicationId: jest.fn().mockReturnValue({
                id: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c'
              })
            }),
            isImmutable: () => false
          },
          ACCOUNT: {
            role: () => ({
              getByApplicationId: jest.fn().mockReturnValue({
                id: '6ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
                contactDetails: { email: 'David.Gilmore@floyd.com' },
                name: 'Pink Floyd'
              }),
              unAssign: jest.fn()
            }),
            isImmutable: () => false,
            update: mockUpdate
          }
        }
      }))
      const { contactAccountOperations } = await import('../operations.js')
      const ops = contactAccountOperations('APPLICANT', 'APPLICANT_ORGANISATION',
        '2ca1677a-eb38-47ef-8759-d85b2b4b2e5c', '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c')
      await ops.setAddress('Address')
      expect(mockUpdate).toHaveBeenCalledWith('6ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
        {
          address: 'Address',
          contactDetails: { email: 'David.Gilmore@floyd.com' },
          name: 'Pink Floyd'
        }
      )
    })

    it('sets the address on a clone of an immutable account, retaining other fields', async () => {
      const mockCreate = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          USER: {
            getById: jest.fn().mockReturnValue({ id: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c' })
          },
          CONTACT: {
            role: () => ({
              getByApplicationId: jest.fn().mockReturnValue({
                id: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c'
              })
            }),
            isImmutable: () => false
          },
          ACCOUNT: {
            role: () => ({
              getByApplicationId: jest.fn().mockReturnValue({
                id: '6ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
                contactDetails: { email: 'David.Gilmore@floyd.com' },
                name: 'Pink Floyd'
              }),
              create: mockCreate,
              unAssign: jest.fn()
            }),
            isImmutable: () => true
          }
        }
      }))
      const { contactAccountOperations } = await import('../operations.js')
      const ops = contactAccountOperations('APPLICANT', 'APPLICANT_ORGANISATION',
        '2ca1677a-eb38-47ef-8759-d85b2b4b2e5c', '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c')
      await ops.setAddress('Address')
      expect(mockCreate).toHaveBeenCalledWith('2ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
        {
          address: 'Address',
          contactDetails: { email: 'David.Gilmore@floyd.com' },
          name: 'Pink Floyd',
          cloneOf: '6ca1677a-eb38-47ef-8759-d85b2b4b2e5c'
        }
      )
    })
  })

  describe('contactAccountOperations - setOrganisation to true', () => {
    it('contact mutable - user assigned', async () => {
      const mockUpdateAccount = jest.fn()
      const mockUpdateContact = jest.fn()
      const mockCreateAccount = jest.fn(() => ({ id: '3ca1677a-eb38-47ef-8759-d85b2b4b2e5c' }))
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          USER: {
            getById: jest.fn().mockReturnValue({ id: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c', username: 'Roger.Walters@email.com' })
          },
          CONTACT: {
            role: () => ({
              getByApplicationId: jest.fn().mockReturnValue({
                id: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
                contactDetails: { email: 'David.Gilmore@floyd.com' },
                cloneOf: '3ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
                userId: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
                fullName: 'Roger Walters',
                address: 'Contact address'
              })
            }),
            isImmutable: () => false,
            update: mockUpdateContact
          },
          ACCOUNT: {
            role: () => ({
              getByApplicationId: jest.fn().mockReturnValue(null),
              create: mockCreateAccount
            }),
            isImmutable: () => null,
            update: mockUpdateAccount
          }
        }
      }))
      const { contactAccountOperations } = await import('../operations.js')
      const ops = contactAccountOperations('APPLICANT', 'APPLICANT_ORGANISATION',
        '2ca1677a-eb38-47ef-8759-d85b2b4b2e5c', '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c')
      await ops.setOrganisation(true)
      expect(mockCreateAccount).toHaveBeenCalledWith('2ca1677a-eb38-47ef-8759-d85b2b4b2e5c', {})
      expect(mockUpdateAccount).toHaveBeenCalledWith('3ca1677a-eb38-47ef-8759-d85b2b4b2e5c', {
        address: 'Contact address',
        contactDetails: { email: 'David.Gilmore@floyd.com' }
      })
      expect(mockUpdateContact).toHaveBeenCalledWith('4ca1677a-eb38-47ef-8759-d85b2b4b2e5c', {
        fullName: 'Roger Walters',
        contactDetails: { email: 'Roger.Walters@email.com' },
        userId: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
        cloneOf: '3ca1677a-eb38-47ef-8759-d85b2b4b2e5c'
      })
    })

    it('contact immutable - user assigned', async () => {
      const mockCreateAccount = jest.fn(() => ({ id: '09328cd0-65e7-4831-bb47-1ad3ee1d0069' }))
      const mockCreateContact = jest.fn(() => ({ id: '3a0fd3af-cd68-43ac-a0b4-123b79aaa83b' }))
      const mockUpdateAccount = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          USER: {
            getById: jest.fn().mockReturnValue({ id: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c', username: 'Roger.Walters@email.com' })
          },
          CONTACT: {
            role: () => ({
              getByApplicationId: jest.fn().mockReturnValue({
                id: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
                contactDetails: { email: 'David.Gilmore@floyd.com' },
                cloneOf: '3ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
                userId: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
                fullName: 'Roger Walters',
                address: 'Contact address'
              }),
              unAssign: jest.fn(),
              create: mockCreateContact
            }),
            isImmutable: () => true
          },
          ACCOUNT: {
            role: () => ({
              getByApplicationId: jest.fn().mockReturnValue(null),
              create: mockCreateAccount
            }),
            isImmutable: () => null,
            update: mockUpdateAccount
          }
        }
      }))
      const { contactAccountOperations } = await import('../operations.js')
      const ops = contactAccountOperations('APPLICANT', 'APPLICANT_ORGANISATION',
        '2ca1677a-eb38-47ef-8759-d85b2b4b2e5c', '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c')
      await ops.setOrganisation(true)
      expect(mockCreateAccount).toHaveBeenCalledWith('2ca1677a-eb38-47ef-8759-d85b2b4b2e5c', {})
      expect(mockUpdateAccount).toHaveBeenCalledWith('09328cd0-65e7-4831-bb47-1ad3ee1d0069', {
        address: 'Contact address',
        contactDetails: { email: 'David.Gilmore@floyd.com' }
      })
      expect(mockCreateContact).toHaveBeenCalledWith('2ca1677a-eb38-47ef-8759-d85b2b4b2e5c', {
        cloneOf: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
        contactDetails: { email: 'Roger.Walters@email.com' },
        fullName: 'Roger Walters',
        userId: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c'
      })
    })

    it('contact mutable - user not assigned', async () => {
      const mockUpdateAccount = jest.fn()
      const mockUpdateContact = jest.fn()
      const mockCreateAccount = jest.fn(() => ({ id: '3ca1677a-eb38-47ef-8759-d85b2b4b2e5c' }))
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          USER: {
            getById: jest.fn().mockReturnValue({ id: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c', username: 'Roger.Walters@email.com' })
          },
          CONTACT: {
            role: () => ({
              getByApplicationId: jest.fn().mockReturnValue({
                id: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
                contactDetails: { email: 'David.Gilmore@floyd.com' },
                cloneOf: '3ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
                fullName: 'Richard Wright',
                address: 'Contact address'
              })
            }),
            isImmutable: () => false,
            update: mockUpdateContact
          },
          ACCOUNT: {
            role: () => ({
              getByApplicationId: jest.fn().mockReturnValue(null),
              create: mockCreateAccount
            }),
            isImmutable: () => null,
            update: mockUpdateAccount
          }
        }
      }))
      const { contactAccountOperations } = await import('../operations.js')
      const ops = contactAccountOperations('APPLICANT', 'APPLICANT_ORGANISATION',
        '2ca1677a-eb38-47ef-8759-d85b2b4b2e5c', '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c')
      await ops.setOrganisation(true)
      expect(mockCreateAccount).toHaveBeenCalledWith('2ca1677a-eb38-47ef-8759-d85b2b4b2e5c', {})
      expect(mockUpdateAccount).toHaveBeenCalledWith('3ca1677a-eb38-47ef-8759-d85b2b4b2e5c', {
        address: 'Contact address',
        contactDetails: { email: 'David.Gilmore@floyd.com' }
      })
      expect(mockUpdateContact).toHaveBeenCalledWith('4ca1677a-eb38-47ef-8759-d85b2b4b2e5c', {
        fullName: 'Richard Wright',
        cloneOf: '3ca1677a-eb38-47ef-8759-d85b2b4b2e5c'
      })
    })

    it('contact immutable - user not assigned', async () => {
      const mockCreateAccount = jest.fn(() => ({ id: '09328cd0-65e7-4831-bb47-1ad3ee1d0069' }))
      const mockCreateContact = jest.fn(() => ({ id: '3a0fd3af-cd68-43ac-a0b4-123b79aaa83b' }))
      const mockUpdateAccount = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          USER: {
            getById: jest.fn().mockReturnValue({ id: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c', username: 'Roger.Walters@email.com' })
          },
          CONTACT: {
            role: () => ({
              getByApplicationId: jest.fn().mockReturnValue({
                id: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
                contactDetails: { email: 'David.Gilmore@floyd.com' },
                cloneOf: '3ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
                fullName: 'Richard Wright',
                address: 'Contact address'
              }),
              unAssign: jest.fn(),
              create: mockCreateContact
            }),
            isImmutable: () => true
          },
          ACCOUNT: {
            role: () => ({
              getByApplicationId: jest.fn().mockReturnValue(null),
              create: mockCreateAccount
            }),
            isImmutable: () => null,
            update: mockUpdateAccount
          }
        }
      }))
      const { contactAccountOperations } = await import('../operations.js')
      const ops = contactAccountOperations('APPLICANT', 'APPLICANT_ORGANISATION',
        '2ca1677a-eb38-47ef-8759-d85b2b4b2e5c', '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c')
      await ops.setOrganisation(true)
      expect(mockCreateAccount).toHaveBeenCalledWith('2ca1677a-eb38-47ef-8759-d85b2b4b2e5c', {})
      expect(mockUpdateAccount).toHaveBeenCalledWith('09328cd0-65e7-4831-bb47-1ad3ee1d0069', {
        address: 'Contact address',
        contactDetails: { email: 'David.Gilmore@floyd.com' }
      })
      expect(mockCreateContact).toHaveBeenCalledWith('2ca1677a-eb38-47ef-8759-d85b2b4b2e5c', {
        cloneOf: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
        fullName: 'Richard Wright'
      })
    })
  })

  describe('contactAccountOperations - setOrganisation to false', () => {
    it('contact and account mutable - user assigned', async () => {
      const mockUpdateContact = jest.fn()
      const mockUnlinkAccount = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          USER: {
            getById: jest.fn().mockReturnValue({ id: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c', username: 'Roger.Walters@email.com' })
          },
          CONTACT: {
            role: () => ({
              getByApplicationId: jest.fn().mockReturnValue({
                id: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
                contactDetails: { email: 'Roger.Walters@email.com' },
                cloneOf: '3ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
                userId: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
                fullName: 'Roger Walters'
              })
            }),
            isImmutable: () => false,
            update: mockUpdateContact
          },
          ACCOUNT: {
            role: () => ({
              getByApplicationId: jest.fn().mockReturnValue({
                id: '668ee1f0-073d-480c-a802-59db362897e6',
                cloneOf: 'e6b8de2e-51dc-4196-aa69-5725b3aff732',
                name: 'Pink Floyd',
                contactDetails: { email: 'pinkfloyd@email.com' },
                address: 'Address'
              }),
              unLink: mockUnlinkAccount
            }),
            isImmutable: () => false
          }
        }
      }))
      const { contactAccountOperations } = await import('../operations.js')
      const ops = contactAccountOperations('APPLICANT', 'APPLICANT_ORGANISATION',
        '2ca1677a-eb38-47ef-8759-d85b2b4b2e5c', '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c')
      await ops.setOrganisation(false)
      expect(mockUpdateContact).toHaveBeenCalledWith('4ca1677a-eb38-47ef-8759-d85b2b4b2e5c', {
        contactDetails: { email: 'Roger.Walters@email.com' },
        cloneOf: '3ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
        userId: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
        fullName: 'Roger Walters',
        address: 'Address'
      })
      expect(mockUnlinkAccount).toHaveBeenCalledWith('2ca1677a-eb38-47ef-8759-d85b2b4b2e5c', '668ee1f0-073d-480c-a802-59db362897e6')
    })

    it('contact and account mutable - user assigned - alternative email selected', async () => {
      const mockUpdateContact = jest.fn()
      const mockUnlinkAccount = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          USER: {
            getById: jest.fn().mockReturnValue({ id: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c', username: 'Roger.Walters@email.com' })
          },
          CONTACT: {
            role: () => ({
              getByApplicationId: jest.fn().mockReturnValue({
                id: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
                contactDetails: { email: 'nick.mason@email.com' },
                cloneOf: '3ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
                userId: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
                fullName: 'Roger Walters'
              })
            }),
            isImmutable: () => false,
            update: mockUpdateContact
          },
          ACCOUNT: {
            role: () => ({
              getByApplicationId: jest.fn().mockReturnValue({
                id: '668ee1f0-073d-480c-a802-59db362897e6',
                cloneOf: 'e6b8de2e-51dc-4196-aa69-5725b3aff732',
                name: 'Pink Floyd',
                contactDetails: { email: 'pinkfloyd@email.com' },
                address: 'Address'
              }),
              unLink: mockUnlinkAccount
            }),
            isImmutable: () => false
          }
        }
      }))
      const { contactAccountOperations } = await import('../operations.js')
      const ops = contactAccountOperations('APPLICANT', 'APPLICANT_ORGANISATION',
        '2ca1677a-eb38-47ef-8759-d85b2b4b2e5c', '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c')
      await ops.setOrganisation(false)
      expect(mockUpdateContact).toHaveBeenCalledWith('4ca1677a-eb38-47ef-8759-d85b2b4b2e5c', {
        contactDetails: { email: 'pinkfloyd@email.com' },
        cloneOf: '3ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
        userId: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
        fullName: 'Roger Walters',
        address: 'Address'
      })
      expect(mockUnlinkAccount).toHaveBeenCalledWith('2ca1677a-eb38-47ef-8759-d85b2b4b2e5c', '668ee1f0-073d-480c-a802-59db362897e6')
    })

    it('contact and account mutable - user not assigned', async () => {
      const mockUpdateContact = jest.fn()
      const mockUnlinkAccount = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          USER: {
            getById: jest.fn().mockReturnValue({ id: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c', username: 'Roger.Walters@email.com' })
          },
          CONTACT: {
            role: () => ({
              getByApplicationId: jest.fn().mockReturnValue({
                id: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
                cloneOf: '3ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
                fullName: 'Nick Mason'
              })
            }),
            isImmutable: () => false,
            update: mockUpdateContact
          },
          ACCOUNT: {
            role: () => ({
              getByApplicationId: jest.fn().mockReturnValue({
                id: '668ee1f0-073d-480c-a802-59db362897e6',
                cloneOf: 'e6b8de2e-51dc-4196-aa69-5725b3aff732',
                name: 'Pink Floyd',
                contactDetails: { email: 'pinkfloyd@email.com' },
                address: 'Address'
              }),
              unLink: mockUnlinkAccount
            }),
            isImmutable: () => false
          }
        }
      }))
      const { contactAccountOperations } = await import('../operations.js')
      const ops = contactAccountOperations('APPLICANT', 'APPLICANT_ORGANISATION',
        '2ca1677a-eb38-47ef-8759-d85b2b4b2e5c', '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c')
      await ops.setOrganisation(false)
      expect(mockUpdateContact).toHaveBeenCalledWith('4ca1677a-eb38-47ef-8759-d85b2b4b2e5c', {
        contactDetails: { email: 'pinkfloyd@email.com' },
        cloneOf: '3ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
        fullName: 'Nick Mason',
        address: 'Address'
      })
      expect(mockUnlinkAccount).toHaveBeenCalledWith('2ca1677a-eb38-47ef-8759-d85b2b4b2e5c', '668ee1f0-073d-480c-a802-59db362897e6')
    })

    it('contact and account immutable - user assigned', async () => {
      const mockCreateContact = jest.fn()
      const mockUnAssignContact = jest.fn()
      const mockUnLinkAccount = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          USER: {
            getById: jest.fn().mockReturnValue({ id: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c', username: 'Roger.Walters@email.com' })
          },
          CONTACT: {
            role: () => ({
              getByApplicationId: jest.fn().mockReturnValue({
                id: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
                contactDetails: { email: 'Roger.Walters@email.com' },
                cloneOf: '3ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
                userId: '7ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
                fullName: 'Roger Walters'
              }),
              create: mockCreateContact,
              unAssign: mockUnAssignContact
            }),
            isImmutable: () => true
          },
          ACCOUNT: {
            role: () => ({
              getByApplicationId: jest.fn().mockReturnValue({
                id: '668ee1f0-073d-480c-a802-59db362897e6',
                cloneOf: 'e6b8de2e-51dc-4196-aa69-5725b3aff732',
                name: 'Pink Floyd',
                contactDetails: { email: 'pinkfloyd@email.com' },
                address: 'Address'
              }),
              unLink: mockUnLinkAccount
            }),
            isImmutable: () => true
          }
        }
      }))
      const { contactAccountOperations } = await import('../operations.js')
      const ops = contactAccountOperations('APPLICANT', 'APPLICANT_ORGANISATION',
        '2ca1677a-eb38-47ef-8759-d85b2b4b2e5c', '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c')
      await ops.setOrganisation(false)
      expect(mockCreateContact).toHaveBeenCalledWith('2ca1677a-eb38-47ef-8759-d85b2b4b2e5c', {
        contactDetails: { email: 'Roger.Walters@email.com' },
        cloneOf: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
        userId: '7ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
        fullName: 'Roger Walters',
        address: 'Address'
      })
      expect(mockUnLinkAccount).toHaveBeenCalledWith('2ca1677a-eb38-47ef-8759-d85b2b4b2e5c', '668ee1f0-073d-480c-a802-59db362897e6')
    })

    it('contact and account immutable - user assigned - alternative email selected', async () => {
      const mockCreateContact = jest.fn()
      const mockUnAssignContact = jest.fn()
      const mockUnLinkAccount = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          USER: {
            getById: jest.fn().mockReturnValue({ id: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c', username: 'Roger.Walters@email.com' })
          },
          CONTACT: {
            role: () => ({
              getByApplicationId: jest.fn().mockReturnValue({
                id: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
                contactDetails: { email: 'Nick.Mason@email.com' },
                cloneOf: '3ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
                userId: '7ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
                fullName: 'Roger Walters'
              }),
              create: mockCreateContact,
              unAssign: mockUnAssignContact
            }),
            isImmutable: () => true
          },
          ACCOUNT: {
            role: () => ({
              getByApplicationId: jest.fn().mockReturnValue({
                id: '668ee1f0-073d-480c-a802-59db362897e6',
                cloneOf: 'e6b8de2e-51dc-4196-aa69-5725b3aff732',
                name: 'Pink Floyd',
                contactDetails: { email: 'pinkfloyd@email.com' },
                address: 'Address'
              }),
              unLink: mockUnLinkAccount
            }),
            isImmutable: () => true
          }
        }
      }))
      const { contactAccountOperations } = await import('../operations.js')
      const ops = contactAccountOperations('APPLICANT', 'APPLICANT_ORGANISATION',
        '2ca1677a-eb38-47ef-8759-d85b2b4b2e5c', '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c')
      await ops.setOrganisation(false)
      expect(mockCreateContact).toHaveBeenCalledWith('2ca1677a-eb38-47ef-8759-d85b2b4b2e5c', {
        contactDetails: { email: 'pinkfloyd@email.com' },
        cloneOf: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
        userId: '7ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
        fullName: 'Roger Walters',
        address: 'Address'
      })
      expect(mockUnLinkAccount).toHaveBeenCalledWith('2ca1677a-eb38-47ef-8759-d85b2b4b2e5c', '668ee1f0-073d-480c-a802-59db362897e6')
    })

    it('contact and account immutable - user not assigned', async () => {
      const mockCreateContact = jest.fn()
      const mockUnAssignContact = jest.fn()
      const mockUnLinkAccount = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          USER: {
            getById: jest.fn().mockReturnValue({ id: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c', username: 'Roger.Walters@email.com' })
          },
          CONTACT: {
            role: () => ({
              getByApplicationId: jest.fn().mockReturnValue({
                id: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
                cloneOf: '3ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
                fullName: 'Roger Walters'
              }),
              create: mockCreateContact,
              unAssign: mockUnAssignContact
            }),
            isImmutable: () => true
          },
          ACCOUNT: {
            role: () => ({
              getByApplicationId: jest.fn().mockReturnValue({
                id: '668ee1f0-073d-480c-a802-59db362897e6',
                cloneOf: 'e6b8de2e-51dc-4196-aa69-5725b3aff732',
                name: 'Pink Floyd',
                contactDetails: { email: 'pinkfloyd@email.com' },
                address: 'Address'
              }),
              unLink: mockUnLinkAccount
            }),
            isImmutable: () => true
          }
        }
      }))
      const { contactAccountOperations } = await import('../operations.js')
      const ops = contactAccountOperations('APPLICANT', 'APPLICANT_ORGANISATION',
        '2ca1677a-eb38-47ef-8759-d85b2b4b2e5c', '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c')
      await ops.setOrganisation(false)
      expect(mockCreateContact).toHaveBeenCalledWith('2ca1677a-eb38-47ef-8759-d85b2b4b2e5c', {
        contactDetails: { email: 'pinkfloyd@email.com' },
        cloneOf: '4ca1677a-eb38-47ef-8759-d85b2b4b2e5c',
        fullName: 'Roger Walters',
        address: 'Address'
      })
      expect(mockUnLinkAccount).toHaveBeenCalledWith('2ca1677a-eb38-47ef-8759-d85b2b4b2e5c', '668ee1f0-073d-480c-a802-59db362897e6')
    })
  })
})
