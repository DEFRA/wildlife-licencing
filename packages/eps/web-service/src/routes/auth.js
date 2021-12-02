import {readFile} from 'fs/promises';

const pkg = JSON.parse(await readFile(new URL('../../package.json', import.meta.url)));


const routes = {
    status: {
        method: 'GET',
        path: '/login',
        handler: () => ({
            to: 'do'
        }),
        config: {
            auth: false
        }
    }
}

export default routes;
