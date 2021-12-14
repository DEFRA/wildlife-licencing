import SwaggerUI from 'swagger-ui'
import 'swagger-ui/dist/swagger-ui.css'
import spec from '../openapi/licence.yaml'

SwaggerUI({ spec, dom_id: '#swagger' })
