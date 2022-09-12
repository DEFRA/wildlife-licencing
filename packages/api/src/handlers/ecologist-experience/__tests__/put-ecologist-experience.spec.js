describe('The put ecologist experience endpoint', () => {
  beforeEach(() => jest.resetModules())

  describe('put ecologist experience', () => {
    it('returns a 404 if no application is found', async () => {
      const mockCode = jest.fn()
      const context = {
        request: {
          params: {
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc'
          }
        }
      }
      const req = {
        path: '/ecologist/26a3e94f-2280-4ea5-ad72-920d53c110fc/ecologist-experience'
      }
      const h = {
        response: () => ({
          code: mockCode
        })
      }
      jest.doMock('@defra/wls-database-model', () => ({
        models: {
          applications: {
            findByPk: () => null
          }
        }
      }))
      jest.doMock('@defra/wls-connectors-lib', () => ({
        REDIS: {
          cache: {
            delete: () => {}
          }
        }
      }))
      const putEcologistExperience = (await import('../put-ecologist-experience.js')).default
      await putEcologistExperience(context, req, h)
      expect(mockCode).toHaveBeenCalledWith(404)
    })
    it('posts the data if existing experience is not found', async () => {
      const mockCode = jest.fn()
      const mockType = jest.fn(() => ({ code: mockCode }))
      const mockResponse = jest.fn(() => ({ type: mockType }))
      const context = {
        request: {
          params: {
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc'
          }
        }
      }
      const req = {
        path: '/ecologist/26a3e94f-2280-4ea5-ad72-920d53c110fc/ecologist-experience',
        payload: {
          previousLicence: true
        }
      }
      jest.doMock('@defra/wls-connectors-lib', () => ({
        REDIS: {
          cache: {
            delete: () => {},
            save: () => {}
          }
        }
      }))
      const h = {
        response: mockResponse
      }
      const ecologistData = ({
        dataValues: {
          createdAt: new Date('11-05-22'),
          updatedAt: new Date('11-06-22'),
          experience: {
            previousLicense: true
          },
          applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc'
        }
      })
      jest.doMock('@defra/wls-database-model', () => ({
        models: {
          ecologistExperience: {
            findOrCreate: () => [ecologistData, true],
            findByPk: () => ecologistData
          },
          applications: {
            findByPk: () => true
          }
        }
      }))
      const putEcologistExperience = (await import('../put-ecologist-experience.js')).default
      await putEcologistExperience(context, req, h)
      expect(mockResponse).toHaveBeenCalledWith({
        previousLicense: true
      })
      expect(mockType).toHaveBeenCalledWith('application/json')
      expect(mockCode).toHaveBeenCalledWith(201)
    })
    it('puts the data if existing experience is found', async () => {
      const mockCode = jest.fn()
      const mockType = jest.fn(() => ({ code: mockCode }))
      const mockResponse = jest.fn(() => ({ type: mockType }))
      const context = {
        request: {
          params: {
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc'
          }
        }
      }
      const req = {
        path: '/ecologist/26a3e94f-2280-4ea5-ad72-920d53c110fc/ecologist-experience',
        payload: {
          previousLicence: true
        }
      }
      jest.doMock('@defra/wls-connectors-lib', () => ({
        REDIS: {
          cache: {
            delete: () => {},
            save: () => {}
          }
        }
      }))
      const h = {
        response: mockResponse
      }
      const ecologistData = ({
        dataValues: {
          createdAt: new Date('11-05-22'),
          updatedAt: new Date('11-06-22'),
          experience: {
            previousLicense: true
          },
          applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc'
        }
      })
      jest.doMock('@defra/wls-database-model', () => ({
        models: {
          ecologistExperience: {
            findOrCreate: () => [ecologistData, false],
            update: () => [null, [ecologistData]],
            findByPk: () => ecologistData
          },
          applications: {
            findByPk: () => true
          }
        }
      }))
      const putEcologistExperience = (await import('../put-ecologist-experience.js')).default
      await putEcologistExperience(context, req, h)
      expect(mockResponse).toHaveBeenCalledWith({
        previousLicense: true
      })
      expect(mockType).toHaveBeenCalledWith('application/json')
      expect(mockCode).toHaveBeenCalledWith(200)
    })
    it('throws an error if the database could not be reached', async () => {
      const mockCode = jest.fn()
      const mockType = jest.fn(() => ({ code: mockCode }))
      const mockResponse = jest.fn(() => ({ type: mockType }))
      const context = {
        request: {
          params: {
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc'
          }
        }
      }
      const req = {
        path: '/ecologist/26a3e94f-2280-4ea5-ad72-920d53c110fc/ecologist-experience'
      }
      jest.doMock('@defra/wls-connectors-lib', () => ({
        REDIS: {
          cache: {
            delete: () => {}
          }
        }
      }))
      const h = {
        response: mockResponse
      }
      jest.doMock('@defra/wls-database-model', () => ({
        models: {
          ecologistExperience: {
            findByPk: () => true
          },
          applications: {
            findByPk: () => { throw new Error('Couldnt reach database') }
          }
        }
      }))
      const putEcologistExperience = (await import('../put-ecologist-experience.js')).default
      await expect(() => putEcologistExperience(context, req, h)).rejects.toThrowError('Couldnt reach database')
    })
  })
})
