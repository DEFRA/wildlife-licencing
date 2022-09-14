describe('The post ecologist experience endpoint', () => {
  beforeEach(() => jest.resetModules())

  describe('post ecologist experience', () => {
    it('posts the data if correct object is received', async () => {
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
            create: () => ecologistData
          },
          applications: {
            findByPk: () => true
          }
        }
      }))
      const postEcologistExperience = (await import('../post-ecologist-experience.js')).default
      await postEcologistExperience(context, req, h)
      expect(mockResponse).toHaveBeenCalledWith({
        previousLicense: true
      })
      expect(mockType).toHaveBeenCalledWith('application/json')
      expect(mockCode).toHaveBeenCalledWith(201)
    })
    it('throws an error if the database could not be reached', async () => {
      const mockResponse = jest.fn(() => {})
      const context = {
        request: {
          params: {
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc'
          }
        }
      }
      const req = {
        path: '/ecologist/26a3e94f-2280-4ea5-ad72-920d53c110fc/ecologist-experience',
        payload: {}
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
            create: () => { throw new Error('Couldnt reach database') }
          }
        }
      }))
      const postEcologistExperience = (await import('../post-ecologist-experience.js')).default
      await expect(() => postEcologistExperience(context, req, h)).rejects.toThrowError('Couldnt reach database')
    })
  })
})
