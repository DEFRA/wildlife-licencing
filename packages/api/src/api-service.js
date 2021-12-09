import { init, createServer } from './server.js'
import { SEQUELIZE, REDIS } from '@defra/wls-connectors-lib'
import { createModels } from './model/sequentelize-model.js'

Promise.all([
  SEQUELIZE.initialiseConnection()
    .then(() => createModels()),
  REDIS.initialiseConnection()
]).then(() => createServer()
  .then(s => init(s)))
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
