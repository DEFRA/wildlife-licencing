// import supertest from 'supertest'
// import { startServer } from '../../../api-service.js' // Replace with the path to your Hapi server file
// // const request = supertest(startServer)
// // import * as modllers from '@defra/wls-database-model'
// // import jest from 'jest'
//
// // jest.mock('@defra/wls-database-model')
//
// describe('API Endpoints', () => {
//   let server
//   let models
//   console.log('RUN TEST')
//   beforeAll(async () => {
//     // console.log('BEFORE EACH')
//     // server = await startServer()
//     // console.log('SEREVR: ', server);
//
//     // models = (await import('@defra/wls-database-model')).models
//   })
//
//   // afterAll(async () => {
//   //   // Close the server or perform cleanup if needed
//   //   await server.stop()
//   // })
//
//   // const request = supertest(server.listener)
//   it('should get a response from the / endpoint', async () => {
//     server = await startServer()
//     console.log('SEREVR: ', server);
//     const request = supertest(server.listener)
//     const response = await request.get('/openapi-ui');
//     expect(response.status).toEqual(200);
//     expect(response.text).toContain('Wildlife Licencing: European Protected Species. API Specification.'); // Adjust this expectation as per your application's response
//   });
//
//   it('should get a response from the /users', async () => {
//     server = await startServer()
//     console.log('SEREVR: ', server);
//     // modllers.models.users = {
//     //   findAll: jest.fn().mockResolvedValue({})
//     // }
//     const request = supertest(server.listener)
//     const response = await request.get('/users');
//     expect(response.status).toEqual(500);
//     expect(response.text).toContain('Wildlife Licencing: European Protected Species. API Specification.'); // Adjust this expectation as per your application's response
//   });
// });
