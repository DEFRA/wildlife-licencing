import Nunjucks from 'nunjucks'
import filters from './filters.js'

const addFilters = (env) => {
    for (let key in filters) {
        env.addFilter(key, filters[key]);
    }

    return env;
};

const nunjucksEngine = {
    compile: (src, options) => {
        const template = Nunjucks.compile(src, options.environment);

        return (context) => {
            context.assetPath = '/public';
            return new Promise((resolve, reject) => {
                template.render(context, (err, str) => {
                    if (!err) {
                        return resolve(str);
                    }
                    reject(err);
                });
            });
        };
    },

    prepare: (options, next) => {
        const paths = [
            options.path,
            `${options.path}/common/`,
            `${options.path}/forms/`,
            'node_modules/govuk-frontend/'
        ];

        const config = {
            noCache: true
        };

        const env = Nunjucks.configure(paths, config);
        addFilters(env);

        options.compileOptions.environment = env;

        return next();
    }

};

const engine = {
    engines: {
        njk: nunjucksEngine
    },
    path: './views',
    isCached: process.env.NODE_ENV === 'production',
    defaultExtension: 'njk'
};

export default engine
