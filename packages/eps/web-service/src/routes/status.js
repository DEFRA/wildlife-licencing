import {readFile} from 'fs/promises';

const pkg = JSON.parse(await readFile(new URL('../../package.json', import.meta.url)));


const routes = {
    serviceStatus: {
        method: 'GET',
        path: '/service-status',
        handler: (request, h) => {
            return h.view('service-status.njk')
        },
        config: {
            auth: false
        }
    },
    status: {
        method: 'GET',
        path: '/status',
        handler: () => ({
            version: pkg.version
        }),
        config: {
            auth: false
        }
    }
}

export default routes;
