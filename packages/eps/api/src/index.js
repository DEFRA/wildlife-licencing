import SwaggerUI from 'swagger-ui'
import 'swagger-ui/dist/swagger-ui.css'
import spec from '../openapi/eps-licence.yaml'

SwaggerUI({ spec, dom_id: '#swagger' })
