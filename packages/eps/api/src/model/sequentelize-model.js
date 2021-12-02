import { SEQUELIZE } from '@defra/wls-connectors-lib'
import pkg from 'sequelize'
const { DataTypes } = pkg

const models = {}

const createModels = async () => {
  const sequelize = SEQUELIZE.getSequelize()
  models.users = await sequelize.define('user', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true
    },
    sddsId: {
      type: DataTypes.UUID
    }
  }, {
    timestamps: true
  })

  models.applications = await sequelize.define('applications', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true
    },
    sddsId: {
      type: DataTypes.UUID
    },
    userId: {
      type: DataTypes.UUID,
      references: {
        model: models.users,
        key: 'id'
      }
    },
    application: {
      type: DataTypes.JSONB
    }
  }, {
    timestamps: true
  })

  await models.users.sync()
  await models.applications.sync()
}

export { models, createModels }
