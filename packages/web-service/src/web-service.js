import { init, createServer } from './server.js'

createServer().then(s =>
  init(s).catch(e => {
    console.error(e)
    process.exit(1)
  })
)
