import { init, createServer } from './server.js'
import { fetchSecrets } from './services/secrets.js'

fetchSecrets()
  .then(() => createServer()
    .then(s => init(s)
    ))
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
