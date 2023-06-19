import * as https from 'https'
import { checkResponseOkElseThrow, httpFetch } from './fetch-helper.js'
import Config from './config.js'
import { AWS } from './aws.js'

const addressUrl = search => {
  const url = new URL(Config.address.url)
  url.searchParams.append('postcode', search)
  return url.href
}

let keyAndCertsBuffers = {}

export const ADDRESS = ({
  initialize: async () => {
    console.log('Initializing the address lookup...')
    const { getSecret } = AWS.SecretsManager()
    const certificate = await getSecret(Config.address.certificateParam)
    const key = await getSecret(Config.address.keyParam)
    keyAndCertsBuffers = {
      key: Buffer.from(key, 'utf8'),
      cert: Buffer.from(certificate, 'utf8')
    }
  },

  lookup: async search =>
    httpFetch(addressUrl(search),
      'GET',
      null,
      null,
      checkResponseOkElseThrow,
      Config.address.timeout,
      {
        agent: new https.Agent({
          key: keyAndCertsBuffers.key,
          cert: keyAndCertsBuffers.cert
        })
      }
    )
})
