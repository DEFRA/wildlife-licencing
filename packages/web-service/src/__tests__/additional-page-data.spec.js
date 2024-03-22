describe('additional page data', () => {
  beforeEach(() => jest.resetModules())

  it('add cookie preferences - returns preferences for signed in user from database', async () => {
    const mockHeaders = jest.fn()
    jest.doMock('../services/api-requests.js', () => ({
      APIRequests: {
        USER: {
          getById: () => ({ cookiePrefs: { analytics: true } })
        }
      }
    }))
    const request = {
      method: 'get',
      auth: {
        credentials: 'credentials'
      },
      response: {
        variety: 'view',
        source: {
          context: {}
        },
        header: mockHeaders
      },
      cache: () => ({
        getData: () => ({
          userId: 'e8387a83-1165-42e6-afab-add01e77bc4c'
        })
      })
    }
    const { addCookiePrefs } = await import('../additional-page-data.js')
    await addCookiePrefs(request, { })
    expect(request.response.source.context).toEqual({
      cookiePrefs: {
        analytics: true
      }
    })
  })

  it('add cookie preferences - returns preferences for not-signed in user from cache', async () => {
    const mockHeaders = jest.fn()
    const request = {
      method: 'get',
      auth: {
        credentials: 'credentials'
      },
      response: {
        variety: 'view',
        source: {
          context: {}
        },
        header: mockHeaders
      },
      cache: () => ({
        getData: () => ({
          cookies: { analytics: false }
        })
      })
    }
    const { addCookiePrefs } = await import('../additional-page-data.js')
    await addCookiePrefs(request, { })
    expect(request.response.source.context).toEqual({
      cookiePrefs: {
        analytics: false
      }
    })
  })

  it('return response-toolkit continue', async () => {
    jest.doMock('@defra/wls-connectors-lib', () => ({
      DEFRA_ID: {
        getManagement: () => '/manage'
      }
    }))
    const mockHeaders = jest.fn()
    const request = {
      method: 'get',
      auth: {
        credentials: 'credentials'
      },
      response: {
        variety: 'view',
        source: {
          context: {}
        },
        header: mockHeaders
      },
      cache: () => ({
        getAuthData: () => ({ contactId: '6829ad54-bab7-4a78-8ca9-dcf722117a45', firstName: 'Graham', lastName: 'Willis' })
      })
    }

    const h = {
      continue: 'continue'
    }
    const { additionalPageData } = await import('../additional-page-data.js')
    const result = await additionalPageData(request, h)
    expect(result).toEqual('continue')
    expect(mockHeaders).toHaveBeenCalledWith('Content-Security-Policy', expect.stringContaining('script-src \'self\''))
    expect(request.response.source.context).toEqual({
      _uri: {
        applicantAddress: '/applicant-address',
        applicantEmail: '/licence-holder-email',
        applicantPhoneNumber: '/applicant-phone-number',
        applicantIsOrganisation: '/licence-holder-organisation',
        applicantName: '/licence-holder-name',
        applicantPostcode: '/licence-holder-postcode',
        applicationSummary: '/application-summary',
        applications: '/applications',
        applicationLicence: '/application-licence-summary',
        classMitigation: '/class-mitigation',
        classMitigationDetails: '/enter-class-mitigation-details',
        consent: '/consent',
        cookieInfo: '/cookie-info',
        consentGranted: '/consent-granted',
        ecologistAddress: '/ecologist-address',
        ecologistEmail: '/ecologist-email',
        ecologistIsOrganisation: '/ecologist-organisation',
        ecologistName: '/ecologist-name',
        ecologistPostcode: '/ecologist-postcode',
        experienceDetails: '/enter-experience',
        invoiceResponsible: '/invoice-responsible',
        invoiceAddress: '/invoice-address',
        invoiceEmail: '/invoice-email',
        invoiceIsOrganisation: '/invoice-organisation',
        invoiceName: '/invoice-name',
        invoicePostcode: '/invoice-postcode',
        landowner: '/landowner',
        landownerPermission: '/landowner-permission',
        licenceDetails: '/licence',
        idm: {
          management: '/manage',
          signIn: '/sign-in',
          signOut: '/sign-out'
        },
        magic: {
          ds: 'https://magic.defra.gov.uk/MagicMap.aspx?chosenLayers=sssiPIndex,sssiIndex,backdropDIndex,backdropIndex,europeIndex,vmlBWIndex,25kBWIndex,50kBWIndex,250kBWIndex,miniscaleBWIndex,baseIndex&box=-187122:5095:1034155:705095&useDefaultbackgroundMapping=false'
        },
        methodExperience: '/enter-methods',
        previousLicence: '/previous-licence',
        siteGridReference: '/site-grid-ref',
        siteMap: '/upload-map',
        siteMapThree: '/upload-map-of-mitigations-after-development',
        siteMapTwo: '/upload-map-of-mitigations-during-development',
        siteName: '/site-name',
        siteAddress: '/site-got-postcode',
        convictionDetails: '/conviction-details',
        onOrNextToDesignatedSite: '/on-or-next-to-designated-site',
        designatedSiteActivityAdvice: '/ne-activity-advice',
        designatedSiteNEAdvice: '/advice-from-natural-england',
        designatedSiteName: '/designated-site-name',
        designatedSiteOwnerPermission: '/designated-site-permission',
        designatedSitePermissionDetails: '/details-of-permission',
        designatedSiteProximity: '/designated-site-proximity',
        designatedSiteRemove: '/designated-site-remove',
        isAnyConviction: '/any-convictions',
        purchaseOrderReference: '/invoice-purchase-order',
        additionalApplicantAdd: '/add-additional-applicant',
        additionalApplicantName: '/additional-applicant-name',
        additionalApplicantEmail: '/additional-applicant-email',
        additionalEcologistAdd: '/add-additional-ecologist',
        additionalEcologistName: '/additional-ecologist-name',
        additionalEcologistEmail: '/additional-ecologist-email',
        species: '/which-species',
        taskList: '/tasklist',
        workCategory: '/development-type',
        workPayment: '/payment-exemption-check',
        workPaymentExemptReason: '/payment-exemption-reason',
        workProposal: '/development-description'
      },
      credentials: 'credentials',
      cspNonce: expect.any(String),
      user: {
        name: 'Graham Willis'
      }
    })
  })
})
