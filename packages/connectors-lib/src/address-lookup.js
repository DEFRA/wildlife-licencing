import * as fs from 'fs'
import * as https from 'https'
import { checkResponseOkElseThrow, httpFetch } from './fetch-helper.js'
import Config from './config.js'

const addressUrl = search => {
  const url = new URL(Config.address.url)
  url.searchParams.append('postcode', search)
  return url.href
}

export const ADDRESS = ({
  lookup: async search =>
    httpFetch(addressUrl(search),
      'GET',
      null,
      null,
      checkResponseOkElseThrow,
      Config.address.timeout,
      {
        agent: new https.Agent({
          pfx: fs.readFileSync(Config.address.certificatePath),
          passphrase: Config.address.passphrase
        })
      }
    )
})
