describe('the map of the site showing the mitigations after development page page handler', () => {
  beforeEach(() => jest.resetModules())

  it('getData', async () => {
    const mockClearPageData = jest.fn()
    jest.doMock('../../../../services/api-requests.js', () => ({
      tagStatus: {
        IN_PROGRESS: 'IN_PROGRESS',
        NOT_STARTED: 'not-started'
      },
      APIRequests: {
        APPLICATION: {
          tags: () => {
            return { get: jest.fn() }
          }
        }
      }
    }))
    const request = {
      cache: () => ({
        getData: () => ({ }),
        clearPageData: mockClearPageData
      })
    }

    const { uploadMapGetData } = await import('../site-map-upload.js')
    expect(await uploadMapGetData(request)).toBeNull()
    expect(mockClearPageData).toHaveBeenCalled()
  })

  it('should calls the s3 upload and redirects to the site national grid reference page', async () => {
    const mockSetData = jest.fn()
    const mockUpdate = jest.fn()
    const site = [
      {
        id: '8917f37b-fbf9-4dc7-8cd7-28c354b36781',
        createdAt: '2022-11-24T22:32:41.186Z',
        updatedAt: '2022-11-24T22:32:50.642Z',
        name: 'Kealan bravo',
        address: {
          town: 'BIRMINGHAM',
          uprn: '100070567486',
          street: 'WITTON LODGE ROAD',
          country: 'ENGLAND',
          postcode: 'B23 5LT',
          xCoordinate: 409884,
          yCoordinate: 293389,
          buildingNumber: '308'
        }
      }
    ]

    jest.doMock('../../../../services/api-requests.js', () => ({
      tagStatus: {
        NOT_STARTED: 'NOT_STARTED'
      },
      APIRequests: {
        SITE: {
          update: mockUpdate,
          findByApplicationId: () => {
            return site
          }
        },
        APPLICATION: {
          tags: () => {
            return { get: () => false }
          }
        }
      }
    }))

    const request = {
      cache: () => ({
        getData: () => ({
          fileUpload: { filename: 'site-after-development.shape', path: '/tmp/path' },
          applicationId: 123,
          siteData: { id: 45678, name: 'site-name', address: '123 site street, Birmingham, B1 4HY', siteMapFiles: { activity: 'site.pdf', mitigationsDuringDevelopment: 'demo.jpg' } }
        }),
        setData: mockSetData
      })
    }

    const mockS3FileUpload = jest.fn()
    const mockS3FileUploadWrapper = jest.fn().mockImplementation(() => mockS3FileUpload)
    jest.doMock('../../../../services/s3-upload.js', () => ({
      s3FileUpload: mockS3FileUploadWrapper
    }))
    const { uploadMapCompletion } = await import('../site-map-upload.js')
    let result

    result = await uploadMapCompletion('activity', { uri: '/next' })(request)
    expect(result).toEqual('/next')
    expect(mockUpdate).toHaveBeenCalledWith('8917f37b-fbf9-4dc7-8cd7-28c354b36781', {
      id: '8917f37b-fbf9-4dc7-8cd7-28c354b36781',
      createdAt: '2022-11-24T22:32:41.186Z',
      updatedAt: '2022-11-24T22:32:50.642Z',
      name: 'Kealan bravo',
      address: {
        town: 'BIRMINGHAM',
        uprn: '100070567486',
        street: 'WITTON LODGE ROAD',
        country: 'ENGLAND',
        postcode: 'B23 5LT',
        xCoordinate: 409884,
        yCoordinate: 293389,
        buildingNumber: '308'
      },
      siteMapFiles: {
        activity: 'site-after-development.shape'
      }
    })
    expect(mockS3FileUpload).toHaveBeenCalled()
    expect(mockSetData).toHaveBeenCalled()

    result = await uploadMapCompletion('mitigationsDuringDevelopment', { uri: '/next' })(request)
    expect(result).toEqual('/next')
    expect(mockUpdate).toHaveBeenCalledWith('8917f37b-fbf9-4dc7-8cd7-28c354b36781', {
      id: '8917f37b-fbf9-4dc7-8cd7-28c354b36781',
      createdAt: '2022-11-24T22:32:41.186Z',
      updatedAt: '2022-11-24T22:32:50.642Z',
      name: 'Kealan bravo',
      address: {
        town: 'BIRMINGHAM',
        uprn: '100070567486',
        street: 'WITTON LODGE ROAD',
        country: 'ENGLAND',
        postcode: 'B23 5LT',
        xCoordinate: 409884,
        yCoordinate: 293389,
        buildingNumber: '308'
      },
      siteMapFiles: {
        activity: 'site-after-development.shape',
        mitigationsDuringDevelopment: 'site-after-development.shape'
      }
    })
    expect(mockS3FileUpload).toHaveBeenCalled()
    expect(mockSetData).toHaveBeenCalled()

    result = await uploadMapCompletion('mitigationsAfterDevelopment', { uri: '/next' })(request)
    expect(result).toEqual('/next')
    expect(mockUpdate).toHaveBeenCalledWith('8917f37b-fbf9-4dc7-8cd7-28c354b36781', {
      id: '8917f37b-fbf9-4dc7-8cd7-28c354b36781',
      createdAt: '2022-11-24T22:32:41.186Z',
      updatedAt: '2022-11-24T22:32:50.642Z',
      name: 'Kealan bravo',
      address: {
        town: 'BIRMINGHAM',
        uprn: '100070567486',
        street: 'WITTON LODGE ROAD',
        country: 'ENGLAND',
        postcode: 'B23 5LT',
        xCoordinate: 409884,
        yCoordinate: 293389,
        buildingNumber: '308'
      },
      siteMapFiles: {
        activity: 'site-after-development.shape',
        mitigationsDuringDevelopment: 'site-after-development.shape',
        mitigationsAfterDevelopment: 'site-after-development.shape'
      }
    })
    expect(mockS3FileUploadWrapper).toHaveBeenCalledWith('APPLICATION', 'site-after-development.shape', '/tmp/path', { filetype: 'MAP', multiple: true, supportedFileTypes: ['ZIP', 'JPG', 'PNG', 'GEOJSON', 'KML', 'PDF', 'CPG', 'DBF', 'PRJ', 'SBN', 'SBX', 'SHP', 'SHP.XML', 'SHX'] })
    expect(mockS3FileUpload).toHaveBeenCalledWith(123)
    expect(mockSetData).toHaveBeenCalled()
  })

  it('should not calls the s3 upload when there is no file uploaded', async () => {
    const mockSetData = jest.fn()
    const mockS3FileUpload = jest.fn()
    const mockUpdate = jest.fn()

    jest.doMock('../../../../services/api-requests.js', () => ({
      tagStatus: {
        NOT_STARTED: 'NOT_STARTED'
      },
      APIRequests: {
        SITE: {
          update: mockUpdate
        },
        APPLICATION: {
          tags: () => {
            return { get: () => false }
          }
        }
      }
    }))

    const request = {
      cache: () => ({
        getData: () => ({
          applicationId: 123,
          siteData: { id: 45678, name: 'site-name', address: '123 site street, Birmingham, B1 4HY', siteMapFiles: { activity: 'site.pdf' } }
        }),
        setData: mockSetData
      })
    }

    jest.doMock('../../../../services/s3-upload.js', () => ({
      s3FileUpload: mockS3FileUpload
    }))
    const { uploadMapCompletion } = await import('../site-map-upload.js')
    const result = await uploadMapCompletion('site-after-development.shape', { uri: '/next' })(request)
    expect(result).toEqual('/next')
    expect(mockUpdate).not.toHaveBeenCalled()
    expect(mockS3FileUpload).not.toHaveBeenCalled()
    expect(mockSetData).not.toHaveBeenCalled()
  })

  it('should redirect user to the check site answers page, when the tag is complete', async () => {
    const mockSetData = jest.fn()
    const mockUpdate = jest.fn()

    jest.doMock('../../../../services/api-requests.js', () => ({
      tagStatus: {
        NOT_STARTED: 'NOT_STARTED',
        COMPLETE: 'complete'
      },
      APIRequests: {
        SITE: {
          update: mockUpdate,
          findByApplicationId: () => {
            return []
          }
        },
        APPLICATION: {
          tags: () => {
            return { get: jest.fn(() => 'complete') }
          }
        }
      }
    }))

    const request = {
      cache: () => ({
        getData: () => ({
          fileUpload: { filename: 'site-after-development.shape', path: '/tmp/path' },
          applicationId: 123,
          siteData: { id: 45678, name: 'site-name', address: '123 site street, Birmingham, B1 4HY', siteMapFiles: { activity: 'site.pdf', mitigationsDuringDevelopment: 'demo.jpg' } }
        }),
        setData: mockSetData
      })
    }

    const mockS3FileUpload = jest.fn()
    const mockS3FileUploadWrapper = jest.fn().mockImplementation(() => mockS3FileUpload)

    jest.doMock('../../../../services/s3-upload.js', () => ({
      s3FileUpload: mockS3FileUploadWrapper
    }))
    const { uploadMapCompletion } = await import('../site-map-upload.js')
    expect(await uploadMapCompletion('map-file', { uri: '/next' })(request)).toEqual('/check-site-answers')
  })
})
